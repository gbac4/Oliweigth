'use strict';
/* OliWeight — événements de l'interface et démarrage */
/* ---------- Événements ---------- */
document.querySelectorAll('.nav button').forEach((b) => b.addEventListener('click', () => goto(b.dataset.screen)));
$('prevDay').addEventListener('click', () => {
  selectedDate = shiftDate(selectedDate, -1);
  renderToday();
});
$('nextDay').addEventListener('click', () => {
  if (selectedDate < todayISO()) {
    selectedDate = shiftDate(selectedDate, 1);
    renderToday();
  }
});
$('today').addEventListener('click', (e) => {
  const op = e.target.closest('[data-open]');
  if (op) {
    const i = Number(op.closest('[data-meal]').dataset.meal);
    openMeals.has(i) ? openMeals.delete(i) : openMeals.add(i);
    renderToday();
    return;
  }
  const ig = e.target.closest('[data-ing],[data-ing-sans],[data-ing-repl],[data-ing-undo]');
  if (ig) {
    const i = Number(ig.closest('[data-meal]').dataset.meal),
      code = effCode(selectedDate, i),
      meal = data.meals[code] || {},
      key = ig.dataset.ing || ig.dataset.ingSans || ig.dataset.ingKey || ig.dataset.ingUndo,
      it = (meal.ing || []).map(parseIng).find((x) => x.key === key);
    if (ig.dataset.ing !== undefined) {
      ingOpen = ingOpen && ingOpen.meal === i && ingOpen.key === key ? null : {meal: i, key};
      renderToday();
      return;
    }
    const l = logFor(selectedDate),
      m = (l.meals[i] = l.meals[i] || {});
    m.swapIng = m.swapIng || {};
    if (ig.dataset.ingUndo !== undefined) {
      delete m.swapIng[key];
      delete missingMap()[key];
    } else if (it) {
      const k0 = ingShares(code, meal)[key] || 0;
      m.swapIng[key] = {
        name: it.name,
        kcal: k0,
        repl: ig.dataset.ingRepl || null,
        replKcal: ig.dataset.ingRepl ? num(ig.dataset.ingK) : 0,
      };
      markMissing(it);
    }
    if (!Object.keys(m.swapIng).length) delete m.swapIng;
    if (!Object.keys(m).length) delete l.meals[i];
    ingOpen = null;
    save();
    renderToday();
    return;
  }
  const tk = e.target.closest('[data-take]');
  if (tk) {
    const i = tk.closest('[data-meal]').dataset.meal,
      l = logFor(selectedDate);
    ensureMeal(tk.dataset.take);
    l.alt = {...(l.alt || {}), [i]: tk.dataset.take};
    if (l.meals[i]) l.meals[i].code = tk.dataset.take;
    save();
    renderToday();
    toast('Plat changé pour aujourd’hui.');
    return;
  }
  const jp = e.target.closest('[data-jump]');
  if (jp) {
    const el = $(jp.dataset.jump);
    el.open = true;
    el.scrollIntoView({behavior: 'smooth', block: 'start'});
    return;
  }
  const st = e.target.closest('[data-status],[data-quick]');
  if (st) {
    const i = st.closest('[data-meal]').dataset.meal,
      l = logFor(selectedDate);
    const m = (l.meals[i] = l.meals[i] || {});
    const want = st.dataset.status || st.dataset.quick;
    m.status = m.status === want ? undefined : want;
    if (want === 'partial' || want === 'replaced') openMeals.add(Number(i));
    m.code = effCode(selectedDate, i);
    if (!m.status && !m.swapIng) delete l.meals[i];
    else if (!m.status) delete m.status;
    else {
      if (m.status !== 'partial') m.reasons = [];
      if (m.status !== 'replaced') m.replacement = '';
    }
    save();
    renderToday();
    return;
  }
  const sc = e.target.closest('[data-scale]');
  if (sc) {
    const l = logFor(selectedDate);
    l[sc.dataset.scale] = num(sc.dataset.value);
    save();
    renderToday();
    return;
  }
  const ad = e.target.closest('[data-add]');
  if (ad) {
    const i = ad.closest('[data-meal]').dataset.meal,
      l = logFor(selectedDate),
      m = (l.meals[i] = l.meals[i] || {});
    const [lab, k] = ADDS[Number(ad.dataset.add)];
    m.adds = [...(m.adds || []), {label: lab, kcal: k}];
    save();
    renderToday();
    toast(`${lab} : +${k} kcal`);
    return;
  }
  const au = e.target.closest('[data-add-undo]');
  if (au) {
    const i = au.closest('[data-meal]').dataset.meal,
      m = logFor(selectedDate).meals[i];
    if (m?.adds?.length) {
      m.adds.pop();
      save();
      renderToday();
    }
    return;
  }
  const ec = e.target.closest('[data-extra]');
  if (ec) {
    const [n, k] = EXTRAS[Number(ec.dataset.extra)],
      l = logFor(selectedDate);
    l.extras = [...(l.extras || []), {name: n, kcal: k}];
    save();
    renderToday();
    toast(`${n} : +${k} kcal`);
    return;
  }
  const ed = e.target.closest('[data-extra-del]');
  if (ed) {
    const l = logFor(selectedDate);
    l.extras.splice(Number(ed.dataset.extraDel), 1);
    save();
    renderToday();
    return;
  }
  const ct = e.target.closest('[data-counter]');
  if (ct) {
    const k = ct.dataset.counter,
      l = logFor(selectedDate);
    l[k] = Math.max(0, num(l[k]) + num(ct.dataset.delta));
    save();
    renderToday();
    return;
  }
  if (e.target.closest('[data-goto]')) {
    const g = e.target.closest('[data-goto]');
    goto(g.dataset.goto);
    if (g.dataset.week) {
      viewWeek = g.dataset.week;
      renderMenus();
    }
  }
  if (e.target.closest('[data-copy-summary]')) copySummary();
  if (e.target.closest('[data-backup]')) backup();
});
$('today').addEventListener('change', (e) => {
  const card = e.target.closest('[data-meal]');
  if (!card) return;
  if (e.target.hasAttribute('data-alt')) {
    const i = card.dataset.meal,
      l = logFor(selectedDate);
    l.alt = l.alt || {};
    ensureMeal(e.target.value);
    if (e.target.value === planFor(selectedDate)[i]) delete l.alt[i];
    else l.alt[i] = e.target.value;
    if (l.meals[i]) l.meals[i].code = e.target.value;
    save();
    renderToday();
    toast('Option changée pour aujourd’hui.');
    return;
  }
  const i = card.dataset.meal,
    l = logFor(selectedDate),
    m = l.meals[i] || {};
  if (e.target.dataset.reason !== undefined)
    m.reasons = [...card.querySelectorAll('[data-reason]:checked')].map((x) => x.dataset.reason);
  if (e.target.hasAttribute('data-replacement')) m.replacement = e.target.value.trim();
  if (e.target.hasAttribute('data-repl-kcal')) {
    const k = Math.round(num(e.target.value));
    if (k > 0) m.kcal = k;
    else delete m.kcal;
    l.meals[i] = m;
    save();
    renderRing();
    return;
  }
  l.meals[i] = m;
  save();
});
['steps', 'sleep', 'note'].forEach((id) =>
  $(id).addEventListener('input', () => {
    const l = logFor(selectedDate);
    l[id] = $(id).value;
    save();
    clearTimeout(renderToday.t);
    renderToday.t = setTimeout(() => {
      if (document.activeElement?.id !== id) renderToday();
    }, 800);
  }),
);
['steps', 'sleep'].forEach((id) => $(id).addEventListener('change', renderToday));
$('extraChips').innerHTML = EXTRAS.map(
  ([n, k], i) => `<button type="button" data-extra="${i}">${esc(n)} <span class="muted">${k}</span></button>`,
).join('');
$('extraAdd').addEventListener('click', () => {
  const n = $('extraName').value.trim(),
    k = Math.round(num($('extraKcal').value));
  if (!n) {
    toast('Écris le nom de l’aliment.');
    return;
  }
  const l = logFor(selectedDate);
  l.extras = [...(l.extras || []), {name: n.slice(0, 60), kcal: k > 0 ? k : 0}];
  $('extraName').value = '';
  $('extraKcal').value = '';
  save();
  renderToday();
  toast(k > 0 ? `${n} : +${k} kcal` : `${n} ajouté (calories à estimer).`);
});
$('allDone').addEventListener('click', () => {
  const l = logFor(selectedDate);
  activeSlots(selectedDate).forEach((i) => {
    if (!l.meals[i]?.status) l.meals[i] = {status: 'done', reasons: [], replacement: ''};
  });
  save();
  renderToday();
  toast('Repas restants notés comme respectés.');
});
document
  .querySelectorAll('[data-menutab]')
  .forEach((b) => b.addEventListener('click', () => setMenuTab(b.dataset.menutab)));

$('weekChips').addEventListener('click', (e) => {
  const b = e.target.closest('[data-week]');
  if (!b) return;
  viewWeek = b.dataset.week;
  renderMenus();
});
$('menuDays').addEventListener('change', (e) => {
  const key = e.target.dataset.menuName || e.target.dataset.menuDetails;
  if (!key) return;
  const [day, slot] = key.split('-'),
    code = (vPlan()[day] || [])[Number(slot)];
  if (!code) return;
  const w = viewObj(),
    store = w ? w.meals : data.meals;
  store[code] = {...vMeal(code), ...(store[code] || {})};
  if (e.target.dataset.menuName) store[code].nom = e.target.value;
  else store[code].details = e.target.value;
  save();
  toast('Repas ' + code + ' modifié.');
});
$('swapMode').addEventListener('change', renderSwapSelects);
$('swapA').addEventListener('change', renderSwapSelects);
$('swapDo').addEventListener('click', () => {
  const sw = {mode: $('swapMode').value, a: $('swapA').value, b: $('swapB').value};
  if (!sw.a || !sw.b || sw.a === sw.b) {
    toast('Choisis deux jours différents.');
    return;
  }
  const w = viewObj() || data.current;
  w.swaps = w.swaps || [];
  w.swaps.push(sw);
  if (!viewObj()) data.plan = effPlan(data.current);
  save();
  renderMenus();
  renderToday();
  toast('Échange fait.');
});
$('swapUndo').addEventListener('click', () => {
  const w = viewObj() || data.current;
  if (!confirm('Annuler tous les échanges de cette semaine ?')) return;
  w.swaps = [];
  if (!viewObj()) data.plan = effPlan(data.current);
  save();
  renderMenus();
  renderToday();
  toast('Échanges annulés.');
});

$('shopList').addEventListener('change', (e) => {
  const k = e.target.dataset.shop;
  if (k === undefined) return;
  setHave({key: k, name: e.target.dataset.shopName, cat: e.target.dataset.shopCat}, e.target.checked);
  save();
  renderShop();
});
$('shopReset').addEventListener('click', () => {
  data.shopByWeek[vStart()] = {};
  save();
  renderShop();
});
$('shopShare').addEventListener('click', () => shareText('Liste de courses', shopText()));
$('addWeight').addEventListener('click', () => {
  const date = $('weightDate').value,
    kg = num($('weightKg').value),
    waist = $('waist').value;
  if (!isDate(date) || kg < 20 || kg > 400) {
    toast('Vérifie la date et le poids.');
    return;
  }
  if (date > todayISO()) {
    toast('La date est dans le futur.');
    return;
  }
  data.weights = data.weights.filter((w) => w.date !== date);
  data.weights.push({date, kg, waist});
  save();
  renderWeights();
  $('weightKg').value = '';
  $('waist').value = '';
  toast('Pesée enregistrée.');
  renderToday();
});
$('weightHistory').addEventListener('click', (e) => {
  const b = e.target.closest('[data-delweight]');
  if (!b) return;
  if (confirm('Supprimer cette pesée ?')) {
    data.weights = data.weights.filter((w) => w.date !== b.dataset.delweight);
    save();
    renderWeights();
  }
});
$('saveSettings').addEventListener('click', () => {
  const s = data.settings;
  s.startWeight = $('startWeight').value;
  s.startDate = $('startDate').value || s.startDate;
  const tw = num($('targetWeight').value);
  if (tw >= 30 && tw < num(s.startWeight)) s.targetWeight = tw;
  else if ($('targetWeight').value) toast('Le poids cible doit être plus bas que le poids de départ.');
  s.targetLoss = Math.min(maxLoss(), Math.max(0, num($('targetLoss').value, 0.5)));
  s.waterGoal = Math.max(0, num($('waterGoal').value));
  s.stepsGoal = Math.max(0, num($('stepsGoal').value));
  s.weighDay = num($('weighDay').value);
  s.reminderTime = $('reminderTime').value || '20:00';
  s.cutoffTime = $('cutoffTime').value || '21:00';
  s.kcalMax = Math.max(kcalMin(), Math.round(num($('kcalMax').value, KCAL_MAX)));
  save();
  renderAll();
  toast('Réglages enregistrés.');
});
function csvCell(v) {
  return '"' + String(v ?? '').replace(/"/g, '""') + '"';
}
$('csvExport').addEventListener('click', () => {
  const dates = Object.keys(data.logs).sort(),
    head = [
      'date',
      'menu_codes',
      'eau_ml',
      'pas',
      'sommeil_h',
      'tetees_jour',
      'tetees_nuit',
      'energie',
      'faim',
      'note',
      ...SLOTS.map((_, i) => 'repas_' + (i + 1) + '_statut'),
      ...SLOTS.map((_, i) => 'repas_' + (i + 1) + '_raisons'),
      ...SLOTS.map((_, i) => 'repas_' + (i + 1) + '_remplacement'),
      'extras',
      'extras_kcal',
      'calories_mangees',
      'poids_kg',
      'tour_taille_cm',
    ];
  const rows = [
    head,
    ...dates.map((d) => {
      const l = data.logs[d],
        w = data.weights.find((x) => x.date === d);
      return [
        d,
        effCodes(d).join(' '),
        l.water,
        l.steps,
        l.sleep,
        l.feedsDay,
        l.feedsNight,
        l.energy,
        l.hunger,
        l.note,
        ...SLOTS.map((_, i) => l.meals?.[i]?.status || ''),
        ...SLOTS.map((_, i) => (l.meals?.[i]?.reasons || []).join('; ')),
        ...SLOTS.map((_, i) => l.meals?.[i]?.replacement || ''),
        (l.extras || []).map((x) => x.name).join('; '),
        extrasKcal(l),
        Math.round(eatenKcal(d).k),
        w ? w.kg : '',
        w ? w.waist : '',
      ];
    }),
  ];
  download(
    'oliweight-journal.csv',
    '﻿' + rows.map((r) => r.map(csvCell).join(';')).join('\r\n'),
    'text/csv;charset=utf-8',
  );
});
$('weeklyCopy').addEventListener('click', copySummary);
$('weeklyCopy2').addEventListener('click', copySummary);
$('weeklyShare').addEventListener('click', () => shareText('Résumé OliWeight', summaryText()));
function icsDaily(time, uid, summary, desc, file) {
  const [h, m] = String(time).split(':').map(Number),
    p = (n) => String(n).padStart(2, '0'),
    t = new Date(),
    day = `${t.getFullYear()}${p(t.getMonth() + 1)}${p(t.getDate())}`,
    stamp = new Date()
      .toISOString()
      .replace(/[-:]/g, '')
      .replace(/\.\d{3}/, ''),
    endM = h * 60 + m + 10,
    ics = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//OliWeight//FR',
      'BEGIN:VEVENT',
      `UID:oliweight-${uid}-${Date.now()}@oliweight`,
      `DTSTAMP:${stamp}`,
      `DTSTART:${day}T${p(h)}${p(m)}00`,
      `DTEND:${day}T${p(Math.floor(endM / 60) % 24)}${p(endM % 60)}00`,
      'RRULE:FREQ=DAILY',
      `SUMMARY:${summary}`,
      `DESCRIPTION:${desc}`,
      'BEGIN:VALARM',
      'ACTION:DISPLAY',
      `DESCRIPTION:${summary}`,
      'TRIGGER:PT0M',
      'END:VALARM',
      'END:VEVENT',
      'END:VCALENDAR',
      '',
    ].join('\r\n');
  download(file, ics, 'text/calendar;charset=utf-8');
}
$('icsExport').addEventListener('click', () =>
  icsDaily(
    data.settings.reminderTime || '20:00',
    'rappel',
    'OliWeight — noter ma journée',
    'Ouvre OliWeight et note tes repas\\, ton eau et tes tétées.',
    'oliweight-rappel.ics',
  ),
);
$('icsCutoff').addEventListener('click', () =>
  icsDaily(
    data.settings.cutoffTime || '21:00',
    'cuisine',
    'OliWeight — cuisine fermée 🌙',
    'Plus rien à manger ce soir : eau ou tisane sans sucre. Si vraie faim pendant les tétées de nuit : un verre de lait.',
    'oliweight-cuisine-fermee.ics',
  ),
);
$('jsonExport').addEventListener('click', backup);
$('restoreJson').addEventListener('click', async () => {
  const f = $('jsonImport').files[0];
  if (!f) {
    toast('Choisis un fichier de sauvegarde.');
    return;
  }
  try {
    const x = JSON.parse(await f.text());
    if (!x || typeof x !== 'object' || !x.settings || !x.logs) throw Error('format non reconnu');
    if (!confirm('Remplacer les données actuelles par cette sauvegarde ?')) return;
    data = x.version === 2 ? normalize(x) : migrateLegacy(x, 'sauvegarde');
    save();
    renderAll();
    toast('Sauvegarde restaurée.');
  } catch (e) {
    toast('Fichier invalide : ' + e.message);
  }
});
$('importMenu').addEventListener('click', async () => {
  const f = $('menuImport').files[0];
  if (!f) {
    toast('Choisis le fichier de menus.');
    return;
  }
  try {
    const x = JSON.parse(await f.text());
    let list = Array.isArray(x?.weeks) ? x.weeks : [x];
    if (!list.length || !list.every((w) => w && typeof w.meals === 'object' && typeof w.plan === 'object'))
      throw Error('il manque meals ou plan');
    list = list.map((w) => ({
      ...w,
      startDate: isDate(w.startDate) ? w.startDate : data.current?.startDate || weekKey(),
      rev: num(w.rev, 0) > 0 ? num(w.rev) : (Date.now() / 1000) | 0,
    }));
    const n = mergeWeeks(data, list);
    if (n) data.meta.menusReviewedAt = new Date().toISOString();
    applyDueWeeks();
    save();
    renderAll();
    toast(n ? `${n} semaine(s) de menus importée(s).` : 'Rien de nouveau dans ce fichier.');
  } catch (e) {
    toast('Fichier de menus invalide : ' + e.message);
  }
});
$('clearData').addEventListener('click', () => {
  if (
    confirm('Effacer définitivement toutes les données OliWeight de ce téléphone ?') &&
    confirm('Vraiment ? Pense à sauvegarder avant.')
  ) {
    data = fresh();
    data.meta.migratedFrom = 'effacé';
    data.meta.migrationShown = true;
    save();
    selectedDate = todayISO();
    renderAll();
    toast('Données effacées.');
  }
});
$('weightDate').value = todayISO();
window.addEventListener('resize', () => {
  if ($('progress').classList.contains('active')) drawChart();
});
let lastToday = todayISO();
function checkDay() {
  const t = todayISO();
  if (t !== lastToday) {
    if (applyDueWeeks()) save();
    if (selectedDate === lastToday) selectedDate = t;
    lastToday = t;
    $('weightDate').value = t;
    renderAll();
  } else if (selectedDate > t) {
    selectedDate = t;
    renderToday();
  }
}
document.addEventListener('visibilitychange', () => {
  if (!document.hidden) checkDay();
});
window.addEventListener('focus', checkDay);
setInterval(checkDay, 60000);
if ('serviceWorker' in navigator && location.protocol !== 'file:') {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('./sw.js')
      .then((r) => r.update())
      .catch((e) => console.warn('SW non enregistré', e));
  });
  let reloaded = false;
  const hadController = !!navigator.serviceWorker.controller;
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (reloaded || !hadController) return;
    reloaded = true;
    toast('OliWeight a été mis à jour.');
  });
}
/* ---------- Démarrage ---------- */
data = load();
selectedDate = todayISO();
if (applyPatches(data)) save();
if (applyDueWeeks()) save();

if (data.meta.migratedFrom && !data.meta.migrationShown) {
  data.meta.migrationShown = true;
  save();
  setTimeout(() => toast('Nouvelle version : tes données ont été reprises.'), 600);
}
$('profileSave').addEventListener('click', () => {
  const res = readProfileForm($('profileForm'));
  if (res.errors.length) {
    $('profileErr').textContent = 'À corriger : ' + res.errors.join(' · ');
    $('profileErr').classList.remove('hidden');
    return;
  }
  $('profileErr').classList.add('hidden');
  applyProfile(res);
  renderAll();
  toast('Profil enregistré.');
});
renderAll();
if (isNewUser()) showOnboarding();
loadPhotos();
if (syncOn()) setTimeout(() => syncAll(false), 1500);
