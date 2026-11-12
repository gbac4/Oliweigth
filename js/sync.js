'use strict';
/* OliWeight — synchronisation avec le repo GitHub privé (suivi, menus, photos) */
/* ---------- Synchronisation avec le repo GitHub privé ----------
   La clé reste dans un stockage séparé (SYNC_KEY) : elle n'est jamais dans les sauvegardes ni envoyée ailleurs qu'à api.github.com. */

function syncCfg() {
  try {
    return JSON.parse(localStorage.getItem(SYNC_KEY) || '{}');
  } catch (e) {
    return {};
  }
}
function setSyncCfg(c) {
  try {
    localStorage.setItem(SYNC_KEY, JSON.stringify(c));
  } catch (e) {}
}
function syncOn() {
  const c = syncCfg();
  return !!(c.owner && c.repo && c.token);
}
function b64encode(str) {
  const bytes = new TextEncoder().encode(str);
  let bin = '';
  for (let i = 0; i < bytes.length; i += 8192) bin += String.fromCharCode.apply(null, bytes.subarray(i, i + 8192));
  return btoa(bin);
}
function b64decode(b64) {
  const bin = atob(String(b64).replace(/\s/g, ''));
  return new TextDecoder().decode(Uint8Array.from(bin, (c) => c.charCodeAt(0)));
}
async function gh(path, opts = {}) {
  const c = syncCfg();
  const res = await fetch(
    `https://api.github.com/repos/${encodeURIComponent(c.owner)}/${encodeURIComponent(c.repo)}${path}`,
    {
      ...opts,
      headers: {
        Authorization: 'Bearer ' + c.token,
        Accept: 'application/vnd.github+json',
        'X-GitHub-Api-Version': '2022-11-28',
        ...(opts.body ? {'Content-Type': 'application/json'} : {}),
      },
      cache: 'no-store',
    },
  );
  return res;
}
function ghError(res) {
  if (res.status === 401) return 'Clé refusée : elle est invalide ou expirée.';
  if (res.status === 403)
    return 'Accès refusé : vérifie que la clé a le droit « Contents : Read and write » sur ce repo.';
  if (res.status === 404) return 'Repo introuvable : vérifie le nom du compte, du repo et l’accès de la clé.';
  return 'Erreur GitHub (' + res.status + ').';
}

function syncStatus(msg, ok) {
  const el = $('syncStatus');
  if (!el) return;
  el.textContent = msg;
  el.className = 'small ' + (ok === true ? 'sync-ok' : ok === false ? 'sync-err' : 'muted');
}
function syncStamp() {
  const c = syncCfg();
  if (!syncOn()) {
    syncStatus('Non connectée : les données restent seulement sur ce téléphone.');
    return;
  }
  const f = (t) =>
    t ? new Date(t).toLocaleString('fr-FR', {weekday: 'short', hour: '2-digit', minute: '2-digit'}) : 'jamais';
  syncStatus(
    `✓ Connectée à ${c.owner}/${c.repo} · dernier envoi : ${f(c.lastPush)} · menus vérifiés : ${f(c.lastPull)}${c.dirty ? ' · envoi en attente' : ''}`,
    c.lastError ? false : true,
  );
  if (c.lastError) syncStatus('⚠️ ' + c.lastError, false);
}
function markDirty() {
  if (!syncOn()) return;
  const c = syncCfg();
  c.dirty = true;
  setSyncCfg(c);
  clearTimeout(syncTimer);
  syncTimer = setTimeout(() => pushData(), 120000);
}
async function pushData(keepalive) {
  if (!syncOn() || syncBusy) return false;
  const c = syncCfg();
  if (!c.dirty && c.lastPush) return true;
  syncBusy = true;
  try {
    const body = JSON.stringify({...data, syncedAt: new Date().toISOString(), appVersion: APP_VERSION}, null, 1);
    const put = async (sha) =>
      gh('/contents/' + DATA_PATH, {
        method: 'PUT',
        keepalive: !!keepalive && body.length < 60000,
        body: JSON.stringify({
          message: 'OliWeight : suivi du ' + todayISO(),
          content: b64encode(body),
          ...(sha ? {sha} : {}),
        }),
      });
    let res = await put(c.dataSha);
    if (res.status === 409 || res.status === 422 || (res.status === 404 && c.dataSha)) {
      const g = await gh('/contents/' + DATA_PATH);
      const sha = g.ok ? (await g.json()).sha : undefined;
      res = await put(sha);
    }
    if (!res.ok) throw Error(ghError(res));
    const j = await res.json(),
      n = syncCfg();
    n.dataSha = j.content?.sha;
    n.dirty = false;
    n.lastPush = Date.now();
    n.lastError = '';
    setSyncCfg(n);
    syncStamp();
    return true;
  } catch (e) {
    const n = syncCfg();
    n.lastError = e.message === 'Failed to fetch' ? 'Pas de connexion internet : nouvel essai plus tard.' : e.message;
    setSyncCfg(n);
    syncStamp();
    return false;
  } finally {
    syncBusy = false;
  }
}
async function pullMenus(force) {
  if (!syncOn()) return false;
  const c = syncCfg();
  if (!force && c.lastPull && Date.now() - c.lastPull < 3600e3) return false;
  try {
    const res = await gh('/contents/' + MENU_PATH);
    const n = syncCfg();
    n.lastPull = Date.now();
    if (res.status === 404) {
      n.lastError = '';
      setSyncCfg(n);
      syncStamp();
      return false;
    }
    if (!res.ok) throw Error(ghError(res));
    const j = await res.json();
    if (j.sha === c.menuSha) {
      n.lastError = '';
      setSyncCfg(n);
      syncStamp();
      return false;
    }
    const x = JSON.parse(b64decode(j.content)),
      list = Array.isArray(x.weeks) ? x.weeks : [x];
    const changed = mergeWeeks(data, list);
    applyDueWeeks();
    n.menuSha = j.sha;
    n.lastError = '';
    setSyncCfg(n);
    if (changed) {
      data.meta.menusReviewedAt = new Date().toISOString();
      save();
      renderAll();
      toast(`Nouveaux menus reçus (${changed} semaine${changed > 1 ? 's' : ''}).`);
    }
    syncStamp();
    return changed > 0;
  } catch (e) {
    const n = syncCfg();
    n.lastError = e.message === 'Failed to fetch' ? 'Pas de connexion internet : nouvel essai plus tard.' : e.message;
    setSyncCfg(n);
    syncStamp();
    return false;
  }
}
function blobToB64(b) {
  return new Promise((res, rej) => {
    const r = new FileReader();
    r.onload = () => res(String(r.result).split(',')[1]);
    r.onerror = () => rej(r.error);
    r.readAsDataURL(b);
  });
}
async function pushPhoto(slug, blob) {
  if (!syncOn()) return;
  try {
    const c = syncCfg(),
      path = '/contents/photos/' + slug + '.jpg';
    let sha = (c.photoShas || {})[slug];
    const put = (sh) =>
      blobToB64(blob).then((b64) =>
        gh(path, {
          method: 'PUT',
          body: JSON.stringify({message: 'OliWeight : photo ' + slug, content: b64, ...(sh ? {sha: sh} : {})}),
        }),
      );
    let r = await put(sha);
    if (r.status === 409 || r.status === 422) {
      const g = await gh(path);
      sha = g.ok ? (await g.json()).sha : undefined;
      r = await put(sha);
    }
    if (r.ok) {
      const j = await r.json(),
        n = syncCfg();
      n.photoShas = {...(n.photoShas || {}), [slug]: j.content?.sha};
      setSyncCfg(n);
    }
  } catch (e) {
    console.warn('Photo non envoyée', e);
  }
}
async function unpushPhoto(slug) {
  if (!syncOn()) return;
  try {
    const c = syncCfg(),
      path = '/contents/photos/' + slug + '.jpg';
    let sha = (c.photoShas || {})[slug];
    if (!sha) {
      const g = await gh(path);
      if (!g.ok) return;
      sha = (await g.json()).sha;
    }
    await gh(path, {method: 'DELETE', body: JSON.stringify({message: 'OliWeight : photo supprimée ' + slug, sha})});
    const n = syncCfg();
    if (n.photoShas) delete n.photoShas[slug];
    setSyncCfg(n);
  } catch (e) {}
}
async function pullPhotos() {
  if (!syncOn()) return;
  try {
    const r = await gh('/contents/photos');
    if (!r.ok) return;
    const list = await r.json(),
      c = syncCfg(),
      shas = {...(c.photoShas || {})};
    let got = 0;
    for (const f of list) {
      if (!/\.jpg$/.test(f.name)) continue;
      const sl = f.name.replace(/\.jpg$/, '');
      if (shas[sl] === f.sha && photoUrls[sl]) continue;
      const g = await gh('/contents/photos/' + encodeURIComponent(f.name));
      if (!g.ok) continue;
      const j = await g.json(),
        bin = atob(String(j.content).replace(/\s/g, '')),
        blob = new Blob([Uint8Array.from(bin, (ch) => ch.charCodeAt(0))], {type: 'image/jpeg'});
      await idbDo('readwrite', (st) => st.put(blob, sl));
      if (photoUrls[sl]) URL.revokeObjectURL(photoUrls[sl]);
      photoUrls[sl] = URL.createObjectURL(blob);
      shas[sl] = f.sha;
      got++;
    }
    const n = syncCfg();
    n.photoShas = shas;
    setSyncCfg(n);
    if (got) {
      renderToday();
      renderMenus();
    }
  } catch (e) {
    console.warn('Photos non reçues', e);
  }
}
async function syncAll(force) {
  await pullMenus(force);
  if (typeof flushFeedback === 'function') await flushFeedback();
  if (force || !syncCfg().lastPhotoPull || Date.now() - syncCfg().lastPhotoPull > 6 * 3600e3) {
    await pullPhotos();
    const n = syncCfg();
    n.lastPhotoPull = Date.now();
    setSyncCfg(n);
  }
  const c = syncCfg();
  if (force) {
    c.dirty = true;
    setSyncCfg(c);
  }
  await pushData();
}
function renderSync() {
  const c = syncCfg();
  $('syncOwner').value = c.owner || '';
  $('syncRepo').value = c.repo || 'oliweight-data';
  $('syncToken').value = c.token ? '••••••••••' : '';
  syncStamp();
}
$('syncSave').addEventListener('click', async () => {
  const c = syncCfg(),
    owner = $('syncOwner').value.trim(),
    repo = $('syncRepo').value.trim(),
    tk = $('syncToken').value.trim();
  if (!owner || !repo) {
    toast('Indique le compte et le repo.');
    return;
  }
  const token = tk && !/^•+$/.test(tk) ? tk : c.token;
  if (!token) {
    toast('Colle la clé d’accès.');
    return;
  }
  setSyncCfg({
    ...c,
    owner,
    repo,
    token,
    dataSha: c.owner === owner && c.repo === repo ? c.dataSha : undefined,
    menuSha: undefined,
    dirty: true,
    lastError: '',
  });
  syncStatus('Test de la connexion…');
  try {
    const r = await gh('');
    if (!r.ok) throw Error(ghError(r));
    const info = await r.json();
    if (!info.private) {
      const n = syncCfg();
      n.token = '';
      setSyncCfg(n);
      renderSync();
      syncStatus(
        '⚠️ Ce repo est PUBLIC : ses données de santé seraient visibles par tous. Rends-le privé avant de continuer.',
        false,
      );
      return;
    }
    syncStatus('Connexion réussie, premier envoi…');
    await syncAll(true);
    renderSync();
    toast('Synchronisation activée.');
  } catch (e) {
    syncStatus('⚠️ ' + (e.message === 'Failed to fetch' ? 'Pas de connexion internet.' : e.message), false);
  }
});
$('syncNow').addEventListener('click', async () => {
  if (!syncOn()) {
    toast('Configure d’abord la synchronisation.');
    return;
  }
  syncStatus('Synchronisation…');
  await syncAll(true);
  toast(syncCfg().lastError ? 'Échec de la synchronisation.' : 'Synchronisé.');
});
$('syncOff').addEventListener('click', () => {
  if (!confirm('Déconnecter ce téléphone du repo ? La clé sera effacée du téléphone.')) return;
  try {
    localStorage.removeItem(SYNC_KEY);
  } catch (e) {}
  renderSync();
  toast('Synchronisation désactivée.');
});
document.addEventListener('visibilitychange', () => {
  if (!syncOn()) return;
  if (document.hidden) {
    if (syncCfg().dirty) pushData(true);
  } else syncAll(false);
});
window.addEventListener('online', () => {
  if (syncOn()) syncAll(false);
});
