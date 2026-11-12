'use strict';
/* OliWeight — photos des plats (IndexedDB) et photo d'un plat similaire */
/* ---------- Photos des plats ----------
   Stockées dans IndexedDB (pas dans localStorage, limité à ~5 Mo), redimensionnées à 640 px, JPEG ~60 Ko.
   Liées au nom du plat : le même plat dans une autre semaine garde sa photo. */
var photoUrls = {},
  photoDB = null;
function slugOf(nom) {
  return String(nom || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 60);
}
function idb() {
  if (photoDB) return Promise.resolve(photoDB);
  return new Promise((res, rej) => {
    if (!('indexedDB' in window)) return rej(Error('IndexedDB indisponible'));
    const r = indexedDB.open('oliweight-photos', 1);
    r.onupgradeneeded = () => r.result.createObjectStore('photos');
    r.onsuccess = () => {
      photoDB = r.result;
      res(photoDB);
    };
    r.onerror = () => rej(r.error);
  });
}
function idbDo(mode, fn) {
  return idb().then(
    (db) =>
      new Promise((res, rej) => {
        const tx = db.transaction('photos', mode),
          st = tx.objectStore('photos'),
          q = fn(st);
        tx.oncomplete = () => res(q && q.result);
        tx.onerror = () => rej(tx.error);
      }),
  );
}
async function loadPhotos() {
  try {
    const keys = await idbDo('readonly', (st) => st.getAllKeys());
    for (const k of keys || []) {
      const b = await idbDo('readonly', (st) => st.get(k));
      if (b) {
        if (photoUrls[k]) URL.revokeObjectURL(photoUrls[k]);
        photoUrls[k] = URL.createObjectURL(b);
      }
    }
    renderToday();
    if ($('menus').classList.contains('active')) renderMenus();
  } catch (e) {
    console.warn('Photos', e);
  }
}
function resizeImage(file) {
  return new Promise((res, rej) => {
    const img = new Image(),
      url = URL.createObjectURL(file);
    img.onload = () => {
      const max = 640,
        sc = Math.min(1, max / Math.max(img.width, img.height)),
        w = Math.round(img.width * sc),
        h = Math.round(img.height * sc),
        c = document.createElement('canvas');
      c.width = w;
      c.height = h;
      c.getContext('2d').drawImage(img, 0, 0, w, h);
      URL.revokeObjectURL(url);
      c.toBlob((b) => (b ? res(b) : rej(Error('Conversion impossible'))), 'image/jpeg', 0.72);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      rej(Error('Image illisible'));
    };
    img.src = url;
  });
}
async function savePhoto(slug, file) {
  const blob = await resizeImage(file);
  await idbDo('readwrite', (st) => st.put(blob, slug));
  if (photoUrls[slug]) URL.revokeObjectURL(photoUrls[slug]);
  photoUrls[slug] = URL.createObjectURL(blob);
  if (typeof pushPhoto === 'function') pushPhoto(slug, blob);
  return blob;
}
async function deletePhoto(slug) {
  await idbDo('readwrite', (st) => st.delete(slug));
  if (photoUrls[slug]) URL.revokeObjectURL(photoUrls[slug]);
  delete photoUrls[slug];
}
// Photo d'un plat similaire : même protéine, même féculent et au moins 80 % des autres ingrédients en commun.
// Les ingrédients présents partout (huile, ail, oignon, épices…) sont ignorés.
const ING_IGNORE =
  /^(huile|vinaigre|ail|oignons?( rouges)?|epices?|sel|poivre|thym|laurier|cumin|paprika|cannelle|aneth|curry|cari|chili en poudre|bouillon|citrons?|moutarde|sirop|miel|sucre)/;
function normIng(x) {
  return String(x).normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim();
}
function sig(meal) {
  const out = {P: new Set(), F: new Set(), O: new Set()};
  (meal?.ing || []).forEach((raw) => {
    const r = String(raw),
      [c, n] = r.includes(':') ? r.split(/:(.*)/s) : ['E', r],
      k = normIng(n);
    if (!k || ING_IGNORE.test(k)) return;
    if (c === 'P') out.P.add(k);
    else if (c === 'F') out.F.add(k);
    else out.O.add(k);
  });
  return out;
}
function sameSet(a, b) {
  return a.size === b.size && [...a].every((x) => b.has(x));
}
function jaccard(a, b) {
  if (!a.size && !b.size) return 1;
  const inter = [...a].filter((x) => b.has(x)).length;
  return inter / (a.size + b.size - inter);
}
function allMeals() {
  const list = Object.values(data.meals || {});
  (data.weeks || []).forEach((w) => Object.values(w.meals || {}).forEach((m) => list.push(m)));
  return list;
}
function similarPhoto(meal) {
  const s0 = sig(meal);
  if (!s0.P.size && !s0.F.size) return null;
  let best = null;
  const seen = new Set();
  for (const m of allMeals()) {
    const sl = slugOf(m.nom);
    if (!photoUrls[sl] || seen.has(sl) || sl === slugOf(meal.nom)) continue;
    seen.add(sl);
    const s1 = sig(m);
    if (!sameSet(s0.P, s1.P) || !sameSet(s0.F, s1.F)) continue;
    const j = jaccard(s0.O, s1.O);
    if (j >= 0.8 && (!best || j > best.j)) best = {url: photoUrls[sl], nom: m.nom, j};
  }
  return best;
}
function photoBlock(meal) {
  const nom = meal?.nom,
    sl = slugOf(nom);
  if (!sl) return '';
  const own = photoUrls[sl],
    sim = own ? null : similarPhoto(meal),
    u = own || sim?.url;
  return `${u ? `<img class="dish-photo" src="${u}" alt="Photo : ${esc(sim ? sim.nom : nom)}">` : ''}${sim ? `<div class="small muted">Photo d’un plat similaire : ${esc(sim.nom)}</div>` : ''}<div class="photo-row"><button type="button" data-photo-take="${esc(sl)}">📷 ${own ? 'Changer la photo' : sim ? 'Prendre la photo de ce plat' : 'Photo du plat'}</button>${own ? `<button type="button" data-photo-del="${esc(sl)}">Supprimer</button>` : ''}</div>`;
}
const photoInput = document.createElement('input');
photoInput.type = 'file';
photoInput.accept = 'image/*';
photoInput.setAttribute('capture', 'environment');
photoInput.style.display = 'none';
document.body.append(photoInput);
let photoTarget = null;
photoInput.addEventListener('change', async () => {
  const f = photoInput.files[0];
  photoInput.value = '';
  if (!f || !photoTarget) return;
  try {
    const b = await savePhoto(photoTarget, f);
    toast(`Photo enregistrée (${Math.round(b.size / 1024)} Ko).`);
    renderToday();
    renderMenus();
  } catch (e) {
    toast('Photo impossible : ' + e.message);
  }
});
document.addEventListener('click', async (e) => {
  const t = e.target.closest('[data-photo-take]');
  if (t) {
    photoTarget = t.dataset.photoTake;
    photoInput.click();
    return;
  }
  const d = e.target.closest('[data-photo-del]');
  if (d) {
    if (!confirm('Supprimer la photo de ce plat ?')) return;
    await deletePhoto(d.dataset.photoDel);
    if (typeof unpushPhoto === 'function') unpushPhoto(d.dataset.photoDel);
    renderToday();
    renderMenus();
  }
});
