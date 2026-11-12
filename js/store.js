'use strict';
/* OliWeight — stockage local, reprise des anciennes versions, correctifs de données */
function fresh() {
  return {
    version: 2,
    settings: {
      startWeight: '',
      startDate: todayISO(),
      targetWeight: '',
      targetLoss: 0.5,
      waterGoal: 2500,
      stepsGoal: 5000,
      weighDay: 1,
      reminderTime: '20:00',
      cutoffTime: '21:00',
      kcalMax: 2300,
      menuLabel: 'Menus semaine 1',
    },
    meals: clone(DEFAULT_MEALS),
    plan: clone(DEFAULT_PLAN),
    logs: {},
    weights: [],
    shop: {},
    current: {
      startDate: weekStartOf(todayISO()),
      label: 'Menus semaine 1',
      rev: 0,
      basePlan: clone(DEFAULT_PLAN),
      swaps: [],
    },
    weeks: DEFAULT_CYCLE.weeks.map(cycleWeek),
    history: {},
    shopByWeek: {},
    meta: {lastBackup: null, migratedFrom: null},
  };
}
function cycleWeek(w) {
  return {
    startDate: w.startDate,
    label: String(w.label || ''),
    rev: num(w.rev, 1),
    meals: clone(w.meals || {}),
    basePlan: clone(w.plan || w.basePlan || {}),
    swaps: [],
  };
}

/* ---------- Reprise des anciennes données (v1 OliWeight ou ZEN) ---------- */
const STATUS_MAP = {
  ok: 'done',
  done: 'done',
  respecte: 'done',
  partiel: 'partial',
  partial: 'partial',
  remplace: 'replaced',
  replaced: 'replaced',
  saute: 'skipped',
  skipped: 'skipped',
};
function pick(o, keys) {
  for (const k of keys) if (o && o[k] !== undefined && o[k] !== null && o[k] !== '') return o[k];
  return undefined;
}
function migrateLog(date, l, plan, waterInGlasses) {
  const out = {meals: {}, water: 0, steps: '', sleep: '', feedsDay: 0, feedsNight: 0, energy: 0, hunger: 0, note: ''};
  if (!l || typeof l !== 'object') return out;
  const codes = plan[String(dayIndex(date))] || [];
  const src = l.meals || l.repas || {};
  Object.entries(src).forEach(([k, v]) => {
    let i = /^\d$/.test(k) ? Number(k) : codes.indexOf(k);
    if (i < 0) {
      const slotKeys = ['P', 'C1', 'D', 'C2', 'S'];
      i = slotKeys.indexOf(k);
    }
    if (i < 0 || i > 4) return;
    const raw = typeof v === 'string' ? v : pick(v, ['status', 's', 'statut', 'state']);
    const st = STATUS_MAP[String(raw || '').toLowerCase()];
    if (!st) return;
    const reasons = (typeof v === 'object' && (v.reasons || v.raisons || v.r)) || [];
    const repl =
      typeof v === 'object' ? pick(v, ['replacement', 'replaced', 'repl', 'remplacement', 'text', 'txt']) : '';
    out.meals[i] = {
      status: st,
      reasons: Array.isArray(reasons) ? reasons.map(String) : [],
      replacement: repl ? String(repl) : '',
    };
  });
  let w = num(pick(l, ['water', 'eau', 'glasses', 'verres']));
  if (waterInGlasses || (w > 0 && w <= 40)) w = w * 250;
  out.water = w;
  out.steps = pick(l, ['steps', 'pas']) ?? '';
  out.sleep = pick(l, ['sleep', 'sommeil']) ?? '';
  out.feedsDay = num(pick(l, ['feedsDay', 'feedDay', 'feeds_day', 'teteesJour', 'tetees_jour', 'day']));
  out.feedsNight = num(pick(l, ['feedsNight', 'feedNight', 'feeds_night', 'teteesNuit', 'tetees_nuit', 'night']));
  if (!out.feedsDay && !out.feedsNight && l.feeds) {
    if (typeof l.feeds === 'object') {
      out.feedsDay = num(l.feeds.day ?? l.feeds.jour);
      out.feedsNight = num(l.feeds.night ?? l.feeds.nuit);
    } else out.feedsDay = num(l.feeds);
  }
  out.energy = num(pick(l, ['energy', 'energie']));
  out.hunger = num(pick(l, ['hunger', 'faim']));
  out.note = String(pick(l, ['note', 'notes']) ?? '');
  return out;
}
function migrateLegacy(x, from) {
  const d = fresh(),
    s = x.settings || {};
  d.settings.startWeight = pick(s, ['startWeight']) ?? d.settings.startWeight;
  d.settings.startDate = isDate(s.startDate) ? s.startDate : d.settings.startDate;
  d.settings.targetLoss = Math.min(0.5, num(pick(s, ['targetLoss', 'rate']), 0.5));
  const wg = num(s.waterGoal, 0);
  const glasses = wg > 0 && wg <= 40;
  d.settings.waterGoal = wg ? (glasses ? wg * 250 : wg) : d.settings.waterGoal;
  d.settings.stepsGoal = num(s.stepsGoal, d.settings.stepsGoal);
  d.settings.weighDay = num(s.weighDay, 1);
  d.settings.reminderTime = pick(s, ['reminderTime', 'reminder']) || '20:00';
  if (s.menuLabel) d.settings.menuLabel = String(s.menuLabel);
  const keepMenus = from !== 'zen.v1'; // ZEN avait des menus génériques : on garde ceux de la semaine 1
  if (keepMenus && x.meals && typeof x.meals === 'object')
    Object.entries(x.meals).forEach(([k, v]) => {
      if (!v || typeof v !== 'object') return;
      const base = d.meals[k] || {ing: []};
      d.meals[k] = {
        nom: String(v.nom || v.name || base.nom || k),
        details: String(v.details || base.details || ''),
        ing: Array.isArray(v.ing) ? v.ing : base.ing || [],
      };
    });
  if (keepMenus && x.plan && typeof x.plan === 'object')
    Object.entries(x.plan).forEach(([k, v]) => {
      if (/^[1-7]$/.test(k) && Array.isArray(v) && v.length === 5) d.plan[k] = v.map(String);
    });
  const logs = x.logs || {};
  Object.entries(logs).forEach(([date, l]) => {
    if (isDate(date))
      d.logs[date] =
        from === 'zen.v1'
          ? {...migrateLog(date, {}, d.plan, false), ...l, meals: l.meals || {}}
          : migrateLog(date, l, d.plan, glasses);
  });
  (Array.isArray(x.weights) ? x.weights : []).forEach((w) => {
    const date = pick(w, ['date', 'd']),
      kg = num(pick(w, ['kg', 'weight', 'poids']));
    if (isDate(date) && kg >= 20) d.weights.push({date, kg, waist: pick(w, ['waist', 'taille', 'tour']) || ''});
  });
  d.meta.migratedFrom = from;
  return d;
}
function normalize(x) {
  const f = fresh();
  return {
    ...f,
    ...x,
    version: 2,
    settings: {...f.settings, ...(x.settings || {})},
    meals: {...clone(DEFAULT_MEALS), ...(x.meals || {})},
    plan: {...clone(DEFAULT_PLAN), ...(x.plan || {})},
    logs: x.logs || {},
    weights: Array.isArray(x.weights) ? x.weights : [],
    shop: x.shop || {},
    upcoming: x.upcoming || null,
    current: x.current || null,
    weeks: Array.isArray(x.weeks) ? x.weeks : [],
    history: x.history || {},
    shopByWeek: x.shopByWeek || {},
    meta: {...f.meta, ...(x.meta || {})},
  };
}
const QTY_CODES = ['P2', 'D1', 'D2', 'D3', 'D4', 'D5', 'D6', 'D7', 'S-A', 'S-B', 'S-C', 'S-D'];
const PATCHES = [
  {
    id: 'v23-options',
    run: (d) => {
      Object.entries(NEW_MEALS).forEach(([k, v]) => {
        d.meals[k] = clone(v);
      });
      mergeWeeks(d, DEFAULT_CYCLE.weeks);
    },
  },
  {
    id: 'cycle-1',
    run: (d) => {
      if (!d.current || !d.current.basePlan) {
        d.current = {
          startDate: '2026-11-09',
          label: d.settings.menuLabel || 'Menus semaine 1',
          rev: 0,
          basePlan: clone(d.plan),
          swaps: [],
        };
      }
      d.weeks = d.weeks || [];
      d.history = d.history || {};
      d.shopByWeek = d.shopByWeek || {};
      mergeWeeks(d, DEFAULT_CYCLE.weeks);
      if (d.upcoming) {
        mergeWeeks(d, [{...d.upcoming, rev: 1}]);
        d.upcoming = null;
      }
    },
  },
  {
    id: 'c2-21h',
    run: (d) => {
      if (d.meals.C2) d.meals.C2.details = DEFAULT_MEALS.C2.details;
      if (!d.settings.cutoffTime) d.settings.cutoffTime = '21:00';
    },
  },
  {
    id: 'quantites-1',
    run: (d) => {
      QTY_CODES.forEach((k) => {
        d.meals[k] = clone(DEFAULT_MEALS[k]);
      });
    },
  },
  {
    id: 'cible-40',
    run: (d) => {
      const sw = num(d.settings.startWeight);
      if (!d.meta.targetSet && sw >= 60) {
        d.settings.targetWeight = Math.round((sw - 40) * 10) / 10;
        d.meta.targetSet = true;
      }
    },
  },
  {
    id: 'legacy-weights',
    run: (d) => {
      LEGACY_KEYS.forEach((k) => {
        try {
          const x = JSON.parse(localStorage.getItem(k) || 'null');
          (x?.weights || []).forEach((w) => {
            const date = pick(w, ['date', 'd']),
              kg = num(pick(w, ['kg', 'weight', 'poids']));
            if (isDate(date) && kg >= 20 && !d.weights.some((v) => v.date === date))
              d.weights.push({date, kg, waist: pick(w, ['waist', 'taille', 'tour']) || ''});
          });
        } catch (e) {}
      });
    },
  },
  {
    id: 'chia-c3',
    run: (d) => {
      ['2', '4', '6'].forEach((k) => {
        if (d.plan[k] && d.plan[k][3] === 'C2') d.plan[k][3] = 'C3';
      });
      if (!d.meals.C3) d.meals.C3 = clone(DEFAULT_MEALS.C3);
    },
  },
];
function applyPatches(d) {
  d.meta.patches = d.meta.patches || [];
  let changed = false;
  PATCHES.forEach((p) => {
    if (!d.meta.patches.includes(p.id)) {
      p.run(d);
      d.meta.patches.push(p.id);
      changed = true;
    }
  });
  return changed;
}
function load() {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) return normalize(JSON.parse(raw));
    for (const k of LEGACY_KEYS) {
      const r = localStorage.getItem(k);
      if (r) {
        const m = migrateLegacy(JSON.parse(r), k);
        localStorage.setItem(KEY, JSON.stringify(m));
        return m;
      }
    }
    // l’ancienne clé n’est jamais effacée : elle reste comme filet de sécurité
  } catch (e) {
    console.warn('Lecture du stockage impossible', e);
  }
  const f = fresh();
  f.meta.patches = PATCHES.map((p) => p.id);
  return f; // nouveau téléphone : menus déjà à jour
}
// état global (initialisé dans app.js)
let data = null,
  selectedDate = null,
  memoryOnly = false;
function save() {
  try {
    localStorage.setItem(KEY, JSON.stringify(data));
    memoryOnly = false;
    if (typeof markDirty === 'function') markDirty();
    return true;
  } catch (e) {
    memoryOnly = true;
    toast('Stockage indisponible. Sauvegarde tes données.');
    return false;
  }
}
if (navigator.storage && navigator.storage.persist) navigator.storage.persist().catch(() => {});
function logFor(s) {
  if (!data.logs[s])
    data.logs[s] = {
      meals: {},
      water: 0,
      steps: '',
      sleep: '',
      feedsDay: 0,
      feedsNight: 0,
      energy: 0,
      hunger: 0,
      note: '',
    };
  const l = data.logs[s];
  l.meals = l.meals || {};
  return l;
}
