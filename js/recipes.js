'use strict';
/* OliWeight — banque de recettes, filtres et menus proposés selon le profil (fiche #3)
   La banque réunit toutes les recettes connues (menus de départ + cycle). Les métadonnées
   (moment, cuisine, temps, budget, étiquettes) sont déduites du nom et des ingrédients. */
const CUISINES = {cm: 'Camerounaise', ca: 'Canadienne', mo: 'Du monde', base: 'Classique'};
const CUISINE_OF = {
  cm: 'D1 D4 D7 S-A S-C S-D S2C D2D S3B D3C S4A S5B D4C D5C DCR',
  ca: 'P4 S2A S2D S5D S3A S3C D2B D3D S5A S4D D5B',
  mo: 'D3 D4A D5 D6 D5A S2B S5C S4B S4C D2C D3A D3B D4B',
};
const BUDGETS = {serre: 'Économique', moyen: 'Moyen', confortable: 'Plus cher'};
const TEMPS = {court: 'Rapide', moyen: 'Moyen', long: 'Long'};
const MOMENTS = {P: 'Petit-déjeuner', C: 'Collation', R: 'Repas (dîner ou souper)'};
const TAGS = {
  gluten: [/pain|pates|spaghetti|nouilles|couscous de ble|orge|tortilla|flourish|pita/, 'Gluten'],
  arachide: [/arachide/, 'Arachide'],
  poisson: [/sardine|maquereau|tilapia|saumon|truite|thon|poisson/, 'Poisson'],
  crustaces: [/crevette/, 'Crustacés'],
  lait: [/lait(?! de coco)|yaourt|fromage|feta|whey/, 'Produits laitiers'],
  oeuf: [/oeuf/, 'Œuf'],
  porc: [/jambon|porc/, 'Porc'],
  noix: [/amande|noix/, 'Noix'],
  sel: [/crevettes sechees|bouillon|jambon|feta/, 'Riche en sel'],
  sucre: [/miel|sirop|sucre|jus de fruit|chocolat/, 'Sucres ajoutés'],
  fer: [/epinard|lentille|haricot|boeuf|pois chiche|sardine|okok/, 'Riche en fer'],
};
// mots d'une allergie ou d'un refus → étiquette
const ALLERGY_WORDS = [
  [/arachide|cacahuete/, 'arachide'],
  [/lait|lactose|laitier/, 'lait'],
  [/gluten|ble/, 'gluten'],
  [/poisson/, 'poisson'],
  [/crevette|fruits de mer|crustace/, 'crustaces'],
  [/oeuf/, 'oeuf'],
  [/noix|amande/, 'noix'],
  [/porc|jambon/, 'porc'],
];
function nrm(x) {
  return String(x || '')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/œ/g, 'oe')
    .toLowerCase();
}
function momentOf(code) {
  return code[0] === 'P' ? 'P' : code[0] === 'C' ? 'C' : 'R';
}
function recipeMeta(code, m) {
  const name = nrm(m.nom),
    ing = (m.ing || []).map((x) => nrm(String(x).replace(/^[A-Z]:/, ''))).join(' | '),
    all = name + ' | ' + ing,
    mom = momentOf(code);
  let cuisine = 'base';
  for (const [c, list] of Object.entries(CUISINE_OF)) if (list.split(' ').includes(code)) cuisine = c;
  const temps =
    mom !== 'R'
      ? 'court'
      : /soupe|ragout|chili|pate chinois|mijote|okok|gombo|dg|sauce/.test(name)
        ? 'long'
        : /salade|wrap|bol|oeufs|omelette|saute|grille|crevettes/.test(name)
          ? 'court'
          : 'moyen';
  const budget = /saumon|truite|crevette/.test(all)
    ? 'confortable'
    : /haricot|lentille|pois|sardine|oeuf|thon|gruau|avoine/.test(all)
      ? 'serre'
      : 'moyen';
  const tags = Object.keys(TAGS).filter((t) => TAGS[t][0].test(all));
  return {code, moment: mom, cuisine, temps, budget, tags, kcal: kcalOf(code, m), text: all};
}
// Une entrée par nom de plat ; la dernière version (portions révisées du cycle) l'emporte.
let RECIPE_CACHE = null;
function recipeBank() {
  if (RECIPE_CACHE) return RECIPE_CACHE;
  const byName = new Map();
  const add = (code, m) => {
    if (!m || !m.nom) return;
    byName.set(nrm(m.nom), {...m, ...recipeMeta(code, m)});
  };
  Object.entries(DEFAULT_MEALS).forEach(([k, m]) => add(k, m));
  DEFAULT_CYCLE.weeks.forEach((w) => Object.entries(w.meals || {}).forEach(([k, m]) => add(k, m)));
  RECIPE_CACHE = [...byName.values()].sort((a, b) => a.nom.localeCompare(b.nom, 'fr'));
  return RECIPE_CACHE;
}
/* ---------- Compatibilité avec le profil ---------- */
function profileExclusions(p) {
  const tags = new Set(),
    words = [];
  if (!p) return {tags, words};
  healthExcludedTags(p).forEach((t) => tags.add(t));
  const scan = (txt, isRefus) =>
    nrm(txt)
      .split(/[,;/]| et /)
      .map((w) => w.trim())
      .filter((w) => w.length >= 3)
      .forEach((w) => {
        let hit = false;
        ALLERGY_WORDS.forEach(([re, t]) => {
          if (re.test(w)) {
            tags.add(t);
            hit = true;
          }
        });
        if (isRefus || !hit) words.push(w.replace(/s$/, ''));
      });
  scan(p.allergies, false);
  scan(p.refuses, true);
  return {tags, words};
}
function isCompatible(r, ex) {
  if (r.tags.some((t) => ex.tags.has(t))) return false;
  return !ex.words.some((w) => r.text.includes(w));
}
function compatibleRecipes(p) {
  const ex = profileExclusions(p);
  return recipeBank().filter((r) => isCompatible(r, ex));
}
/* ---------- Menus proposés depuis la banque ---------- */
function scoreRecipe(r, p) {
  let s = 0;
  const likes = nrm(p?.aimes)
    .split(/[,;\n]/)
    .map((w) => w.trim())
    .filter((w) => w.length >= 3);
  if (likes.some((w) => r.text.includes(w))) s += 3;
  if (p?.budget === 'serre') s += r.budget === 'serre' ? 2 : r.budget === 'confortable' ? -2 : 0;
  if ((p?.sante || []).includes('anemie') && r.tags.includes('fer')) s += 2;
  if (p?.temps === 'court') s += r.temps === 'court' ? 2 : r.temps === 'long' ? -2 : 0;
  return s;
}
function rotate(list, n, offset) {
  const out = [];
  for (let i = 0; i < n && list.length; i++) out.push(list[(offset + i) % list.length]);
  return out;
}
function generateCycle(p, startMonday, nWeeks = 5) {
  const pool = compatibleRecipes(p),
    by = (m) =>
      pool
        .filter((r) => r.moment === m)
        .map((r, i) => ({r, s: scoreRecipe(r, p) - i * 0.001}))
        .sort((a, b) => b.s - a.s)
        .map((x) => x.r),
    P = by('P'),
    C = by('C'),
    R = by('R');
  const fallback = (l, m) => (l.length ? l : recipeBank().filter((r) => r.moment === m));
  const Pl = fallback(P, 'P'),
    Cl = fallback(C, 'C'),
    Rl = fallback(R, 'R');
  const twoDays = p?.deuxJours !== false;
  const weeks = [];
  for (let w = 0; w < nWeeks; w++) {
    const nMain = twoDays ? 4 : 7,
      main = rotate(Rl, nMain * 2, w * nMain * 2),
      lunch = main.slice(0, nMain),
      dinner = main.slice(nMain),
      day = (i) => (twoDays ? [0, 0, 1, 1, 2, 2, 3][i] : i);
    const plan = {};
    for (let i = 0; i < 7; i++) {
      plan[String(i + 1)] = [
        Pl[(w * 7 + i) % Pl.length].code,
        Cl[(w * 7 + i) % Cl.length].code,
        lunch[day(i) % lunch.length].code,
        Cl[(w * 7 + i + 1) % Cl.length].code,
        dinner[day(i) % dinner.length].code,
      ];
    }
    weeks.push({startDate: shiftDate(startMonday, w * 7), label: `Menus semaine ${w + 1} (proposés)`, rev: 1, plan});
  }
  return weeks;
}
function proposeMenusFromBank() {
  const p = data.profile,
    start = weekStartOf(todayISO()),
    weeks = generateCycle(p, start);
  data.meals = {};
  recipeBank().forEach((r) => {
    data.meals[r.code] = {nom: r.nom, details: r.details, ing: r.ing || [], kcal: r.kcal};
  });
  data.current = {startDate: start, label: weeks[0].label, rev: 1, basePlan: weeks[0].plan, swaps: []};
  data.plan = effPlan(data.current);
  data.settings.menuLabel = weeks[0].label;
  data.weeks = weeks.slice(1).map((w) => ({...w, meals: {}, basePlan: w.plan, swaps: []}));
  data.history = {};
  data.meta.menusFrom = 'banque';
  data.meta.menusReviewedAt = new Date().toISOString();
  save();
}
/* ---------- Écran « Recettes » ---------- */
let recipeFilter = {moment: '', cuisine: '', budget: '', temps: '', q: '', compat: true};
function filteredRecipes() {
  const f = recipeFilter,
    ex = profileExclusions(data.profile),
    q = nrm(f.q).trim();
  return recipeBank().filter(
    (r) =>
      (!f.moment || r.moment === f.moment) &&
      (!f.cuisine || r.cuisine === f.cuisine) &&
      (!f.budget || r.budget === f.budget) &&
      (!f.temps || r.temps === f.temps) &&
      (!q || r.text.includes(q)) &&
      (!f.compat || isCompatible(r, ex)),
  );
}
function selectHTML(id, label, opts, val) {
  return `<div class="field grow"><label for="${id}">${label}</label><select id="${id}" data-rf="${id.slice(3)}"><option value="">Tous</option>${Object.entries(
    opts,
  )
    .map(([k, l]) => `<option value="${k}" ${val === k ? 'selected' : ''}>${esc(l)}</option>`)
    .join('')}</select></div>`;
}
function renderRecipes() {
  if (!$('menuRecipes')) return;
  const f = recipeFilter;
  if (!$('rf-moment'))
    $('recipeFilters').innerHTML =
      `<div class="field"><label for="rf-q">Chercher</label><input id="rf-q" data-rf="q" type="search" placeholder="Ex. poulet, plantain, soupe"></div>
    <div class="row wrap">${selectHTML('rf-moment', 'Moment', MOMENTS, f.moment)}${selectHTML('rf-cuisine', 'Cuisine', CUISINES, f.cuisine)}</div>
    <div class="row wrap">${selectHTML('rf-budget', 'Budget', BUDGETS, f.budget)}${selectHTML('rf-temps', 'Préparation', TEMPS, f.temps)}</div>
    <label class="small"><input type="checkbox" id="rf-compat" data-rf="compat" ${f.compat ? 'checked' : ''}> Seulement les recettes compatibles avec mon profil</label>`;
  const list = filteredRecipes();
  $('recipeCount').textContent = `${list.length} recette${list.length > 1 ? 's' : ''}`;
  $('recipeList').innerHTML =
    list
      .map(
        (
          r,
        ) => `<details class="day-panel"><summary>${esc(r.nom)} <span class="muted small">· ≈ ${fmtK(r.kcal)} kcal</span></summary><div class="day-content">
        <div class="row wrap" style="gap:6px;margin-bottom:6px"><span class="pill">${esc(MOMENTS[r.moment])}</span><span class="pill">${esc(CUISINES[r.cuisine])}</span><span class="pill">${esc(BUDGETS[r.budget])}</span><span class="pill">${esc(TEMPS[r.temps])}</span></div>
        ${r.tags.length ? `<div class="small muted">Contient / repère : ${esc(r.tags.map((t) => TAGS[t][1]).join(', '))}</div>` : ''}
        ${photoBlock(r)}<div class="meal-detail">${esc(r.details || '')}</div></div></details>`,
      )
      .join('') || '<div class="empty">Aucune recette ne correspond à ces filtres.</div>';
}
document.addEventListener('input', (e) => {
  const k = e.target.dataset?.rf;
  if (!k) return;
  recipeFilter[k] = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
  renderRecipes();
});
/* ---------- Plats équivalents (fiche #4) ----------
   Même moment de la journée, calories à ±15 % du repas prévu, compatibles avec le profil. */
const SLOT_MOMENT = ['P', 'C', 'R', 'C', 'R'];
// options ajoutées à la demande, proposées même hors de la fourchette de calories
const PINNED = {0: ['P6'], 1: ['C5'], 2: ['DCR'], 3: ['C5'], 4: ['DCR']};
function equivalents(code, slot, max = 8) {
  const planned = data.meals[code],
    k0 = kcalOf(code),
    name0 = nrm(planned?.nom),
    ex = profileExclusions(data.profile);
  return recipeBank()
    .filter(
      (r) =>
        r.moment === SLOT_MOMENT[slot] &&
        nrm(r.nom) !== name0 &&
        isCompatible(r, ex) &&
        (!k0 || Math.abs(r.kcal - k0) <= k0 * 0.15),
    )
    .sort((a, b) => Math.abs(a.kcal - k0) - Math.abs(b.kcal - k0))
    .slice(0, max);
}
function pinnedOptions(slot) {
  const ex = profileExclusions(data.profile);
  return (PINNED[slot] || []).filter((c) => {
    const r = recipeBank().find((x) => x.code === c);
    return r && isCompatible(r, ex);
  });
}
// Garantit qu'une recette de la banque est disponible dans les repas de la personne.
function ensureMeal(code) {
  if (data.meals[code]) return;
  const r = recipeBank().find((x) => x.code === code);
  if (r) data.meals[code] = {nom: r.nom, details: r.details, ing: r.ing || [], kcal: r.kcal};
}
