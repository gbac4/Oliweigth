'use strict';
/* OliWeight — « Ma semaine type » (fiche #46).
   Combien de dîners et soupers par semaine pour chaque famille de protéines (14 repas principaux).
   Un plat cuisiné pour 2 jours compte pour 2 repas. Les règles servent au générateur de menus
   (menus créés depuis la banque) ; un cycle publié n'est jamais modifié, le compteur l'affiche seulement. */
const FAMILIES = [
  ['volaille', 'Volaille', /poulet|dindon|volaille/],
  ['boeuf', 'Bœuf', /boeuf|bifteck|viande hachee/],
  ['porc', 'Porc', /porc|jambon/],
  ['poisson', 'Poisson', /sardine|maquereau|tilapia|saumon|truite|thon|poisson|hareng/],
  ['mer', 'Fruits de mer', /crevette|ecrevisse|calmar|moule/],
  ['legumineuse', 'Légumineuses', /haricot|lentille|pois chiche|\bpois\b|tofu|niebe/],
  ['oeuf', 'Œuf', /\boeufs?\b|omelette/],
];
const FAMILY_LABEL = Object.fromEntries(FAMILIES.map(([k, l]) => [k, l]));
const MAIN_MEALS = 14;
// max : nombre, null = sans limite, 'mois' = environ une fois par mois
const SEMAINE_DEFAUT = {
  volaille: {min: 0, max: 4},
  boeuf: {min: 0, max: 2},
  porc: {min: 0, max: 1},
  poisson: {min: 2, max: 3},
  mer: {min: 0, max: 2},
  legumineuse: {min: 2, max: null},
  oeuf: {min: 0, max: 2},
};
// La famille se lit d'abord dans le nom du plat (« sauce gombo au bœuf » avec des crevettes séchées = bœuf),
// puis dans les ingrédients.
function familyOfText(name, all) {
  for (const src of [name, all]) {
    const f = FAMILIES.find(([, , re]) => re.test(src || ''));
    if (f) return f[0];
  }
  return null;
}
function familyOf(r) {
  return familyOfText(nrm(r.nom || ''), r.text || '');
}
function familyOfMeal(m) {
  const name = nrm(m?.nom || '');
  return familyOfText(name, name + ' | ' + (m?.ing || []).map((x) => nrm(String(x))).join(' | '));
}
function semaineRules() {
  const s = data?.profile?.semaine || {},
    out = {};
  for (const [k] of FAMILIES) {
    const r = {...SEMAINE_DEFAUT[k], ...(s[k] || {})};
    out[k] = {min: Math.max(0, num(r.min, 0)), max: r.max === 'mois' || r.max === null ? r.max : num(r.max, null)};
  }
  return out;
}
function semaineProblems(rules) {
  const pb = [],
    mins = FAMILIES.reduce((t, [k]) => t + rules[k].min, 0);
  if (mins > MAIN_MEALS) pb.push(`Les minimums font ${mins} repas : il n’y a que ${MAIN_MEALS} dîners et soupers.`);
  for (const [k, l] of FAMILIES) {
    const {min, max} = rules[k];
    if (typeof max === 'number' && min > max) pb.push(`${l} : le minimum (${min}) dépasse le maximum (${max}).`);
    if (max === 'mois' && min > 0) pb.push(`${l} : « environ 1 fois par mois » ne peut pas avoir de minimum.`);
  }
  return pb;
}
/* Quotas d'une semaine pour le générateur. key(r, w, wRem, date) renvoie [dépasse le maximum, empêche un minimum] :
   0 = permis. w = nombre de repas couverts par ce plat, wRem = repas encore à remplir (celui-ci compris). */
function makeWeekQuota(rules, famLast) {
  const count = {};
  const deficit = () => FAMILIES.reduce((t, [k]) => t + Math.max(0, rules[k].min - (count[k] || 0)), 0);
  return {
    key(r, w, wRem, date) {
      const f = familyOf(r),
        c = f ? count[f] || 0 : 0,
        rule = f ? rules[f] : null;
      let over = 0;
      if (rule && typeof rule.max === 'number' && c + w > rule.max) over = 1;
      if (rule && rule.max === 'mois' && (c > 0 || (famLast[f] && daysBetween(famLast[f], date) < 28))) over = 1;
      const fill = rule ? Math.min(w, Math.max(0, rule.min - c)) : 0,
        blocks = wRem - w < deficit() - fill ? 1 : 0;
      return [over, blocks];
    },
    add(r, w, date) {
      const f = familyOf(r);
      if (!f) return;
      count[f] = (count[f] || 0) + w;
      if (!famLast[f] || famLast[f] < date) famLast[f] = date;
    },
  };
}
// Dernière date connue de chaque famille (pour « environ 1 fois par mois »)
function familyLastDates(lastUsed, list) {
  const fam = Object.fromEntries(list.map((r) => [r.code, familyOf(r)])),
    out = {};
  for (const [code, d] of Object.entries(lastUsed || {})) {
    const f = fam[code];
    if (f && (!out[f] || out[f] < d)) out[f] = d;
  }
  return out;
}
function daysBetween(a, b) {
  return Math.round((new Date(b + 'T12:00:00') - new Date(a + 'T12:00:00')) / 86400000);
}
/* ---------- Compteur de la semaine (écran Menus) ---------- */
function weekFamilyCounts(plan, mealOf) {
  const c = {};
  for (let d = 1; d <= 7; d++)
    for (const j of [2, 4]) {
      const code = (plan[String(d)] || [])[j];
      if (!code) continue;
      const f = familyOfMeal(mealOf(code));
      if (f) c[f] = (c[f] || 0) + 1;
    }
  return c;
}
function ruleText(r) {
  if (r.max === 'mois') return 'env. 1 fois par mois';
  if (r.max === null) return r.min ? `au moins ${r.min}` : '';
  if (r.min && r.min === r.max) return `${r.min}`;
  if (r.min) return `${r.min} à ${r.max}`;
  return `${r.max} au plus`;
}
function weekFamiliesHTML(plan, mealOf) {
  const rules = semaineRules(),
    c = weekFamilyCounts(plan, mealOf),
    items = FAMILIES.filter(([k]) => c[k] || rules[k].min).map(([k, l]) => {
      const n = c[k] || 0,
        r = rules[k],
        ok = n >= r.min && (typeof r.max !== 'number' || n <= r.max) && (r.max !== 'mois' || n <= 1),
        rt = ruleText(r);
      return `<span class="pill ${ok ? '' : 'warn'}" title="${esc(rt ? 'Ma semaine type : ' + rt : '')}">${esc(l)} ${n}${rt ? ` <span class="muted">(${esc(rt)})</span>` : ''} ${ok ? '✓' : '⚠'}</span>`;
    });
  return items.length
    ? `<div class="small" style="margin-top:8px"><b>Repas principaux de la semaine</b><div class="row wrap" style="gap:6px;margin-top:4px">${items.join('')}</div></div>`
    : '';
}
/* ---------- Réglage « Ma semaine type » ---------- */
function maxOptions(v) {
  const opts = [
    ['', 'sans limite'],
    ['mois', '≈ 1 fois/mois'],
  ].concat(Array.from({length: 8}, (_, i) => [String(i), String(i)]));
  const cur = v === null ? '' : String(v);
  return opts.map(([k, l]) => `<option value="${k}" ${k === cur ? 'selected' : ''}>${l}</option>`).join('');
}
function minOptions(v) {
  return Array.from({length: 8}, (_, i) => `<option value="${i}" ${i === v ? 'selected' : ''}>${i}</option>`).join('');
}
function semaineFormHTML(rules = semaineRules()) {
  const rows = FAMILIES.map(
    ([k, l]) =>
      `<tr><td>${esc(l)}</td><td><select data-sem-min="${k}" aria-label="${esc(l)} minimum">${minOptions(rules[k].min)}</select></td><td><select data-sem-max="${k}" aria-label="${esc(l)} maximum">${maxOptions(rules[k].max)}</select></td></tr>`,
  ).join('');
  const odd = FAMILIES.filter(([k]) => rules[k].min % 2 === 1).length,
    oddHint =
      data?.profile?.deuxJours !== false && odd > 2
        ? `<p class="small">💡 Tu cuisines pour 2 jours : un plat compte 2 repas, et seuls les 2 repas du dimanche sont « seuls ». Avec ${odd} minimums impairs, tous ne pourront pas être respectés : préfère des nombres pairs (2, 4…).</p>`
        : '',
    legHint =
      rules.legumineuse.min === 0
        ? `<p class="small">💡 Et 1 repas de légumineuses par semaine ? Riches en fibres et en fer, et économiques.</p>`
        : '';
  const scope = canRegenerateMenus()
    ? 'Tes menus suivront ces règles à partir de lundi prochain.'
    : 'Tes menus sont préparés pour toi : ces règles servent au compteur, et serviront si tes menus sont un jour créés par l’app.';
  return `<p class="small muted">Nombre de dîners et soupers par semaine (14 en tout). Un plat cuisiné pour 2 jours compte pour 2 repas. ${scope}</p>
<table class="sem-table"><thead><tr><th>Famille</th><th>Au moins</th><th>Au plus</th></tr></thead><tbody>${rows}</tbody></table>
${oddHint}${legHint}<div id="semWarn"></div>
<div class="row wrap" style="margin-top:8px"><button class="primary grow" id="semSave">Enregistrer</button><button id="semReset">Valeurs conseillées</button></div>`;
}
function readSemaineForm() {
  const out = {};
  for (const [k] of FAMILIES) {
    const mx = document.querySelector(`[data-sem-max="${k}"]`).value;
    out[k] = {
      min: Number(document.querySelector(`[data-sem-min="${k}"]`).value),
      max: mx === '' ? null : mx === 'mois' ? 'mois' : Number(mx),
    };
  }
  return out;
}
function renderSemaine(rules) {
  const box = $('semaineBox');
  if (box) box.innerHTML = semaineFormHTML(rules);
}
document.addEventListener('click', (e) => {
  if (e.target.id === 'semReset') {
    renderSemaine(clone(SEMAINE_DEFAUT));
    $('semWarn').innerHTML =
      '<p class="small">Valeurs conseillées remises. Touche « Enregistrer » pour les appliquer.</p>';
    return;
  }
  if (e.target.id !== 'semSave') return;
  const rules = readSemaineForm(),
    pb = semaineProblems(rules);
  if (pb.length) {
    $('semWarn').innerHTML = pb.map((x) => `<div class="alert">${esc(x)}</div>`).join('');
    return;
  }
  data.profile.semaine = rules;
  save();
  if (canRegenerateMenus() && regenerateFromNextWeek()) {
    renderAll();
    toast('Enregistré : tes menus suivent ces règles à partir de lundi prochain.');
  } else {
    renderAll();
    toast('Ma semaine type enregistrée.');
  }
});
