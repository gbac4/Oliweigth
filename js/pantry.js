'use strict';
/* OliWeight — ingrédients manquants et garde-manger (fiche #15)
   - « Je ne l'ai pas » sur un ingrédient d'un repas → section Manquants des courses
     + plats équivalents qui n'en ont pas besoin.
   - Courses : « J'en ai » / « À acheter ». Les produits de base restent « J'en ai »
     d'une semaine à l'autre (data.pantry) ; les produits frais repartent à zéro chaque semaine. */
const STAPLE_RE =
  /riz|lentille|pates|spaghetti|nouilles|farine|flocons|quinoa|orge|couscous|pois casses|conserve|en boite|surgele|whey|melange/;
function ingKey(name) {
  return String(name || '')
    .trim()
    .toLowerCase();
}
function parseIng(raw) {
  const r = String(raw),
    [c, n] = r.includes(':') ? r.split(/:(.*)/s) : ['E', r];
  return {cat: CATS[c] ? c : 'E', name: n.trim(), key: ingKey(n)};
}
function isStaple(item) {
  return item.cat === 'E' || STAPLE_RE.test(nrm(item.name));
}
function missingMap() {
  data.missing = data.missing || {};
  return data.missing;
}
function isMissing(key) {
  return !!missingMap()[key];
}
function haveIt(item) {
  if (isMissing(item.key || ingKey(item.name))) return false;
  const k = item.key || ingKey(item.name);
  return isStaple(item) ? !!(data.pantry || {})[k] : !!shopChecked()[k];
}
function setHave(item, on) {
  const k = item.key || ingKey(item.name);
  data.pantry = data.pantry || {};
  if (isStaple(item)) on ? (data.pantry[k] = true) : delete data.pantry[k];
  else {
    const c = shopChecked();
    on ? (c[k] = true) : delete c[k];
  }
  if (on) delete missingMap()[k];
}
function markMissing(item) {
  setHave(item, false);
  missingMap()[item.key] = {name: item.name, cat: item.cat, at: todayISO()};
}
// Plats équivalents qui n'utilisent aucun ingrédient manquant.
function substitutesFor(baseCode, slot) {
  const miss = Object.keys(missingMap());
  return [...equivalents(baseCode, slot, 20), ...pinnedOptions(slot).map((c) => recipeBank().find((r) => r.code === c))]
    .filter((r, j, a) => r && a.findIndex((x) => x.code === r.code) === j)
    .filter((r) => !(r.ing || []).some((x) => miss.includes(parseIng(x).key)))
    .slice(0, 3);
}
/* ---------- Ingrédient absent : sans ou remplacé (fiche #17) ----------
   Le total du plat est réparti entre ses ingrédients selon une portion type, puis remis à l'échelle
   pour que la somme corresponde aux calories du plat. Estimation, pas une pesée. */
const ING_KCAL = [
  [/huile/, 120],
  [/avocat/, 80],
  [/petits fruits/, 35],
  [/banane/, 100],
  [/fruit/, 80],
  [/crevettes sechees/, 40],
  [/crevette/, 160],
  [/jambon/, 40],
  [/thon/, 130],
  [/oeuf/, 140],
  [/poulet|boeuf|dindon|porc|viande/, 240],
  [/sardine|maquereau|tilapia|saumon|truite|poisson/, 230],
  [/riz/, 205],
  [/pates|spaghetti|nouilles/, 200],
  [/plantain/, 180],
  [/taro/, 190],
  [/patate douce/, 170],
  [/pomme de terre|pommes de terre/, 160],
  [/pain|tortilla|pita/, 90],
  [/haricot|lentille|pois chiche|pois casses/, 200],
  [/couscous|quinoa|orge|farine/, 180],
  [/manioc/, 160],
  [/flocons|avoine/, 150],
  [/mais/, 70],
  [/petits pois/, 60],
  [/yaourt/, 130],
  [/fromage|feta/, 100],
  [/lait de coco/, 50],
  [/lait/, 80],
  [/chia/, 60],
  [/amande|noix/, 85],
  [/houmous/, 100],
  [/arachide/, 95],
  [/whey/, 120],
  [/flourish|melange/, 280],
  [/miel|sirop|sucre/, 20],
  [/vinaigre|epice|ail|curry|cari|cumin|paprika|thym|cannelle|aneth|moutarde|bouillon|citron|chili/, 3],
];
function typicalKcal(name) {
  const n = nrm(name);
  for (const [re, k] of ING_KCAL) if (re.test(n)) return k;
  return 20; // légume
}
// Calories estimées de chaque ingrédient du plat (clé → kcal)
function ingShares(code, meal) {
  const items = (meal?.ing || []).map(parseIng),
    raw = items.map((it) => typicalKcal(it.name)),
    sum = raw.reduce((a, b) => a + b, 0) || 1,
    f = kcalOf(code, meal) / sum,
    out = {};
  items.forEach((it, i) => (out[it.key] = Math.round(raw[i] * f)));
  return out;
}
const SUBS = {
  P: [
    ['Poisson', 230],
    ['Œufs (2)', 140],
    ['Haricots (¾ tasse)', 165],
    ['Thon en conserve', 130],
    ['Poulet', 240],
  ],
  F: [
    ['Riz (¾ tasse)', 155],
    ['Plantain (½)', 135],
    ['Pâtes (¾ tasse)', 150],
    ['Pomme de terre', 160],
    ['Pain complet (1 tranche)', 80],
    ['Taro', 150],
  ],
  O: [
    ['Yaourt nature', 100],
    ['Lait 1 % (1 verre)', 105],
    ['Fromage (30 g)', 110],
  ],
  L: [
    ['Un autre légume', 20],
    ['Un fruit', 80],
  ],
  E: [],
};
function swapDelta(m) {
  return Object.values(m?.swapIng || {}).reduce((t, s) => t + (num(s.replKcal) - num(s.kcal)), 0);
}
function mealKcal(code, m) {
  return kcalOf(code) + swapDelta(m);
}
let ingOpen = null; // {meal, key}
function ingredientBlock(code, m, slot, baseCode) {
  const items = (m.ing || []).map(parseIng);
  if (!items.length) return '';
  const v = (data.logs[selectedDate]?.meals || {})[slot] || {},
    sw = v.swapIng || {},
    shares = ingShares(code, m),
    openKey = ingOpen && ingOpen.meal === slot ? ingOpen.key : null;
  const chip = (it) => {
    const s = sw[it.key],
      label = s ? (s.repl ? `${it.name} → ${s.repl}` : `Sans ${it.name.toLowerCase()}`) : it.name;
    return `<button type="button" class="ing ${s ? 'miss' : ''}" data-ing="${esc(it.key)}" aria-expanded="${openKey === it.key}">${esc(label)}</button>`;
  };
  let panel = '';
  const it = items.find((x) => x.key === openKey);
  if (it) {
    const k0 = shares[it.key] || 0,
      d = (n) => `${n - k0 >= 0 ? '+' : '−'}${fmtK(Math.abs(n - k0))} kcal`;
    panel = `<div class="ing-panel"><div class="small"><b>${esc(it.name)}</b> ≈ ${fmtK(k0)} kcal dans ce plat. Tu ne l’as pas :</div><div class="ing-list" style="margin-top:6px">
      <button type="button" class="small-btn" data-ing-sans="${esc(it.key)}">Sans (${d(0)})</button>
      ${(SUBS[it.cat] || [])
        .filter(([n]) => !nrm(n).includes(nrm(it.name).split(' ')[0].replace(/s$/, '')))
        .map(
          ([n, k]) =>
            `<button type="button" class="small-btn" data-ing-repl="${esc(n)}" data-ing-k="${k}" data-ing-key="${esc(it.key)}">${esc(n)} (${d(k)})</button>`,
        )
        .join('')}
      ${sw[it.key] ? `<button type="button" class="small-btn" data-ing-undo="${esc(it.key)}">Annuler : je l’ai</button>` : ''}</div></div>`;
  }
  const anySw = Object.keys(sw).length,
    subs = anySw ? substitutesFor(baseCode, slot) : [];
  subs.forEach((r) => ensureMeal(r.code));
  return `<div class="ing-box"><div class="small muted" style="margin-bottom:6px">Ingrédients — touche celui que tu n’as pas :</div><div class="ing-list">${items.map(chip).join('')}</div>${panel}${
    anySw
      ? `<div class="small" style="margin-top:8px">Calories du repas ajustées : ${swapDelta(v) >= 0 ? '+' : '−'}${fmtK(Math.abs(swapDelta(v)))} kcal. Les ingrédients absents sont ajoutés à tes courses.</div>${
          subs.length
            ? `<details class="fold" style="margin-top:6px"><summary class="small">Ou changer de plat entier</summary>${subs.map((r) => `<button type="button" class="small-btn" data-take="${esc(r.code)}" style="margin:6px 6px 0 0">${esc(r.nom)} · ${fmtK(r.kcal)} kcal</button>`).join('')}</details>`
            : ''
        }`
      : ''
  }</div>`;
}
/* ---------- Liste de courses ---------- */
function shopRows() {
  const items = shoppingItems().map((i) => ({...i, key: ingKey(i.name)})),
    cur = !viewObj();
  if (cur)
    Object.entries(missingMap()).forEach(([k, v]) => {
      if (!items.some((i) => i.key === k)) items.push({name: v.name, cat: v.cat, key: k, codes: new Set()});
    });
  return items;
}
function renderShop() {
  const rows = shopRows(),
    st = vStart(),
    miss = rows.filter((i) => isMissing(i.key)),
    rest = rows.filter((i) => !isMissing(i.key)),
    toBuy = rows.filter((i) => !haveIt(i)).length;
  $('shopInfo').textContent =
    `Semaine du ${fmtDate(st, {day: 'numeric', month: 'long'})}. Coche ce que tu as déjà ou ce que tu viens d’acheter. Les produits de base (marqués « base ») restent cochés d’une semaine à l’autre.`;
  $('shopCount').textContent = `${toBuy} à acheter`;
  const row = (i) => {
    const on = haveIt(i);
    return `<label class="shop-item ${on ? 'done' : ''}"><input type="checkbox" data-shop="${esc(i.key)}" data-shop-name="${esc(i.name)}" data-shop-cat="${i.cat}" ${on ? 'checked' : ''}><span>${esc(i.name)}</span>${isStaple(i) ? '<em class="base-tag">base</em>' : ''}<small>${esc([...i.codes].join(' '))}</small></label>`;
  };
  $('shopList').innerHTML =
    (miss.length ? `<div class="shop-cat miss-cat">Manquants (${miss.length})</div>${miss.map(row).join('')}` : '') +
      Object.entries(CATS)
        .map(([c, label]) => {
          const list = rest.filter((i) => i.cat === c);
          return list.length ? `<div class="shop-cat">${esc(label)}</div>` + list.map(row).join('') : '';
        })
        .join('') || '<div class="empty">Ajoute des ingrédients aux menus pour générer la liste.</div>';
}
function shopText() {
  const rows = shopRows().filter((i) => !haveIt(i)),
    miss = rows.filter((i) => isMissing(i.key)),
    rest = rows.filter((i) => !isMissing(i.key));
  return [
    '🛒 OliWeight — courses semaine du ' + fmtDate(vStart(), {day: 'numeric', month: 'long'}),
    ...(miss.length ? ['', 'MANQUANTS', ...miss.map((i) => '- ' + i.name)] : []),
    ...Object.entries(CATS).flatMap(([c, label]) => {
      const l = rest.filter((i) => i.cat === c);
      return l.length ? ['', label.toUpperCase(), ...l.map((i) => '- ' + i.name)] : [];
    }),
  ].join('\n');
}
