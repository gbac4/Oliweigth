'use strict';
/* OliWeight — « Créer ma recette » et calculateur de portion (fiche #19)
   La recette ne change pas : on cuisine comme d'habitude, la portion dans l'assiette s'adapte. */
const STANDARD_RECIPES = {
  kpwem: {
    nom: 'Kpwem (feuilles de manioc, arachide, palme)',
    moment: 'R',
    sauce: true,
    parts: 18,
    potG: 0,
    ing: [
      {food: 'feuilles-manioc', g: 1450},
      {food: 'creme-palme', g: 740, kcal100: 535},
      {food: 'beurre-arachide', g: 452},
      {food: 'hareng-fume', g: 47},
      {food: 'ecrevisses', g: 19},
      {food: 'assaisonnement', g: 10},
    ],
  },
};
function recipeTotals(r) {
  let kcal = 0,
    prot = 0;
  (r.ing || []).forEach((x) => {
    const f = FOODS[x.food];
    if (!f) return;
    const k100 = num(x.kcal100) > 0 ? num(x.kcal100) : f.kcal;
    kcal += (num(x.g) * k100) / 100;
    prot += (num(x.g) * f.prot) / 100;
  });
  const potG = num(r.potG),
    parts = num(r.parts);
  return {
    kcal: Math.round(kcal),
    prot: Math.round(prot),
    perG: potG > 0 ? kcal / potG : 0, // kcal par gramme cuit
    protPerG: potG > 0 ? prot / potG : 0,
    perPart: parts > 0 ? kcal / parts : 0,
    protPerPart: parts > 0 ? prot / parts : 0,
  };
}
// Portion pour un budget donné ; mix = part du budget pour la sauce (1 = plat seul)
function portionFor(r, budget, side, mix) {
  const t = recipeTotals(r),
    sf = side ? FOODS[side] : null,
    sauceK = sf ? budget * mix : budget,
    sideK = sf ? budget - sauceK : 0,
    out = {sauceK: Math.round(sauceK), sideK: Math.round(sideK)};
  if (t.perG > 0) {
    out.g = Math.round(sauceK / t.perG);
    out.cups = out.g / 225;
    out.frac = Math.max(1, Math.round(t.kcal / sauceK));
    out.prot = Math.round(out.g * t.protPerG);
  } else if (t.perPart > 0) {
    out.parts = sauceK / t.perPart;
    out.frac = Math.max(1, Math.round(t.kcal / sauceK));
    out.prot = Math.round(out.parts * t.protPerPart);
  }
  if (sf) {
    out.sideG = Math.round((sideK / sf.kcal) * 100);
    out.sideUnit = sf.units[1];
    out.prot = (out.prot || 0) + Math.round((out.sideG * sf.prot) / 100);
  }
  return out;
}
function fmtCups(c) {
  const q = Math.round(c * 4) / 4,
    w = Math.floor(q),
    f = {0: '', 0.25: '¼', 0.5: '½', 0.75: '¾'}[q - w];
  return q <= 0 ? '' : `${w || ''}${w && f ? ' ' : ''}${f} tasse${q > 1 ? 's' : ''}`;
}
function portionText(r, p, side) {
  const sf = side ? FOODS[side] : null,
    a = [];
  if (p.g)
    a.push(
      `${p.g} g de ${r.nom.split(' (')[0].toLowerCase()} (≈ ${fmtCups(p.cups) || 'moins de ¼ tasse'}, 1/${p.frac} de la marmite)`,
    );
  else if (p.parts)
    a.push(`${fr(p.parts, 1)} part de ${r.nom.split(' (')[0].toLowerCase()} (1/${p.frac} de la marmite)`);
  if (sf) a.push(`${p.sideG} g de ${sf.nom.toLowerCase()} (≈ ${fr(p.sideG / sf.units[1][1], 1)} ${sf.units[1][0]})`);
  return a.join(' + ');
}
var portionState = {};
/* ---------- Banque : recettes créées par la personne ---------- */
function customRecipes() {
  data.customRecipes = data.customRecipes || {};
  return data.customRecipes;
}
// Entrée de banque : la portion standard vise le budget d'un dîner ; les détails donnent la portion.
function customAsMeal(code, r) {
  const budget = r.moment === 'P' ? slotBudget('P') : r.moment === 'C' ? slotBudget('C') : slotBudget('D'),
    side = r.sauce ? r.side || 'taro' : null,
    p = portionFor(r, budget, side, side ? 2 / 3 : 1),
    t = recipeTotals(r);
  return {
    nom: r.nom,
    details: `Recette maison. Pour ≈ ${fmtK(budget)} kcal : ${portionText(r, p, side)}.\nMarmite entière ≈ ${fmtK(t.kcal)} kcal, ${t.prot} g de protéines.`,
    ing: (r.ing || []).map((x) => `${FOODS[x.food]?.cat || 'E'}:${FOODS[x.food]?.nom || x.food}`),
    kcal: budget,
    custom: true,
  };
}
/* ---------- Écran « Créer ma recette » ---------- */
let draft = null;
function newDraft(tpl) {
  draft = JSON.parse(
    JSON.stringify(tpl || {nom: '', moment: 'R', sauce: true, parts: '', potG: '', ing: [{food: '', g: ''}]}),
  );
  draft.ing.forEach((x) => (x.unit = 'g'));
  renderCreator();
}
function foodOptions(sel) {
  const groups = {
    P: 'Viandes, poissons, œufs',
    F: 'Féculents',
    O: 'Laitiers',
    L: 'Légumes, feuilles, fruits',
    E: 'Matières grasses, épicerie',
  };
  return (
    `<option value="">— choisir —</option>` +
    Object.entries(groups)
      .map(
        ([c, lab]) =>
          `<optgroup label="${esc(lab)}">${Object.values(FOODS)
            .filter((f) => f.cat === c)
            .map((f) => `<option value="${f.k}" ${sel === f.k ? 'selected' : ''}>${esc(f.nom)}</option>`)
            .join('')}</optgroup>`,
      )
      .join('')
  );
}
function renderCreator() {
  const box = $('creator');
  if (!box) return;
  if (!draft) {
    box.innerHTML = '';
    return;
  }
  const t = recipeTotals(draft);
  box.innerHTML = `<div class="card"><h2>Créer ma recette</h2><p class="small muted">Entre les quantités que tu mets d’habitude : la recette ne change pas, c’est la portion qui s’adapte. Tu ne connais pas une quantité ? Choisis une unité (paquet, boîte, c. à soupe…).</p>
  <div class="row wrap"><button type="button" class="small-btn" data-tpl="kpwem">Partir du kpwem standard</button></div>
  <div class="field"><label for="crNom">Nom du plat</label><input id="crNom" data-cr="nom" value="${esc(draft.nom)}" maxlength="80" placeholder="Ex. Ndolé de maman"></div>
  <div class="row wrap"><div class="field grow"><label for="crMoment">Moment</label><select id="crMoment" data-cr="moment"><option value="R" ${draft.moment === 'R' ? 'selected' : ''}>Dîner ou souper</option><option value="P" ${draft.moment === 'P' ? 'selected' : ''}>Petit-déjeuner</option><option value="C" ${draft.moment === 'C' ? 'selected' : ''}>Collation</option></select></div>
  <div class="field grow"><label for="crSauce">Se mange avec un accompagnement</label><select id="crSauce" data-cr="sauce"><option value="1" ${draft.sauce ? 'selected' : ''}>Oui (sauce)</option><option value="0" ${!draft.sauce ? 'selected' : ''}>Non (plat complet)</option></select></div></div>
  <h3>Ingrédients (crus, comme tu les mets dans la marmite)</h3>
  ${draft.ing
    .map((x, i) => {
      const f = FOODS[x.food],
        units = f ? f.units : [['g', 1]],
        u = units.find((v) => v[0] === x.unit) || units[0],
        qty = x.qty ?? (x.g ? x.g / u[1] : '');
      return `<div class="cr-row"><select data-cri="${i}" data-crk="food" aria-label="Ingrédient ${i + 1}">${foodOptions(x.food)}</select>
      <input data-cri="${i}" data-crk="qty" type="number" min="0" step="any" inputmode="decimal" value="${qty === '' ? '' : Math.round(qty * 100) / 100}" aria-label="Quantité" placeholder="Qté">
      <select data-cri="${i}" data-crk="unit" aria-label="Unité">${units.map(([l, g]) => `<option value="${esc(l)}" ${u[0] === l ? 'selected' : ''}>${esc(l)}${g > 1 ? ` (${g} g)` : ''}</option>`).join('')}</select>
      <button type="button" data-crdel="${i}" aria-label="Retirer cet ingrédient">✕</button>
      ${f ? `<label class="small muted cr-label">Étiquette : <input data-cri="${i}" data-crk="kcal100" type="number" min="0" step="any" value="${x.kcal100 || ''}" placeholder="${f.kcal}"> kcal / 100 g</label>` : ''}</div>`;
    })
    .join('')}
  <button type="button" id="crAdd" class="small-btn">+ Ingrédient</button>
  <h3 style="margin-top:14px">Après cuisson</h3>
  <div class="row wrap"><div class="field grow"><label for="crPot">Poids de la marmite cuite (g, sans la marmite)</label><input id="crPot" data-cr="potG" type="number" min="0" inputmode="numeric" value="${draft.potG || ''}" placeholder="Ex. 2700"></div>
  <div class="field grow"><label for="crParts">Ou nombre de parts égales</label><input id="crParts" data-cr="parts" type="number" min="1" inputmode="numeric" value="${draft.parts || ''}" placeholder="Ex. 18"></div></div>
  <div class="alert info" id="crTotals">Marmite ≈ <b>${fmtK(t.kcal)} kcal</b> · ${t.prot} g de protéines${t.perG ? ` · ${fr(t.perG, 2)} kcal/g` : t.perPart ? ` · ${fmtK(t.perPart)} kcal la part` : ' · indique le poids cuit ou le nombre de parts'}</div>
  <div id="crErr" class="alert danger hidden"></div>
  <div class="row wrap"><button class="primary grow" id="crSave">Enregistrer la recette</button><button id="crCancel">Annuler</button></div></div>`;
}
function readDraftField(el) {
  if (el.dataset.cr) {
    const k = el.dataset.cr;
    draft[k] = k === 'sauce' ? el.value === '1' : k === 'potG' || k === 'parts' ? num(el.value) || '' : el.value;
    return;
  }
  const i = Number(el.dataset.cri),
    k = el.dataset.crk,
    x = draft.ing[i];
  if (k === 'food') {
    x.food = el.value;
    x.unit = 'g';
    x.qty = x.g || '';
    delete x.kcal100;
    renderCreator();
    return;
  }
  if (k === 'kcal100') x.kcal100 = num(el.value) || undefined;
  if (k === 'unit') x.unit = el.value;
  if (k === 'qty') x.qty = el.value === '' ? '' : num(el.value);
  const f = FOODS[x.food],
    u = (f ? f.units : [['g', 1]]).find((v) => v[0] === x.unit) || ['g', 1];
  x.g = x.qty === '' ? '' : Math.round(num(x.qty) * u[1] * 10) / 10;
  if (k === 'unit') renderCreator();
}
document.addEventListener('change', (e) => {
  if (!draft || !(e.target.dataset.cr || e.target.dataset.cri)) return;
  readDraftField(e.target);
  const t = recipeTotals(draft);
  if ($('crTotals'))
    $('crTotals').innerHTML =
      `Marmite ≈ <b>${fmtK(t.kcal)} kcal</b> · ${t.prot} g de protéines${t.perG ? ` · ${fr(t.perG, 2)} kcal/g` : t.perPart ? ` · ${fmtK(t.perPart)} kcal la part` : ' · indique le poids cuit ou le nombre de parts'}`;
});
document.addEventListener('click', (e) => {
  if (e.target.closest('#crNew')) return newDraft();
  if (!draft) return;
  const tp = e.target.closest('[data-tpl]');
  if (tp) return newDraft(STANDARD_RECIPES[tp.dataset.tpl]);
  if (e.target.closest('#crAdd')) {
    draft.ing.push({food: '', g: '', unit: 'g'});
    return renderCreator();
  }
  const d = e.target.closest('[data-crdel]');
  if (d) {
    draft.ing.splice(Number(d.dataset.crdel), 1);
    return renderCreator();
  }
  if (e.target.closest('#crCancel')) {
    draft = null;
    return renderCreator();
  }
  if (e.target.closest('#crSave')) {
    const ing = draft.ing.filter((x) => FOODS[x.food] && num(x.g) > 0),
      err = [];
    if (!draft.nom.trim()) err.push('le nom du plat');
    if (!ing.length) err.push('au moins un ingrédient avec sa quantité');
    if (!(num(draft.potG) > 0) && !(num(draft.parts) > 0)) err.push('le poids cuit ou le nombre de parts');
    if (err.length) {
      $('crErr').textContent = 'Il manque : ' + err.join(', ') + '.';
      $('crErr').classList.remove('hidden');
      return;
    }
    const code = draft.code || draft.moment + 'U' + Date.now().toString(36).slice(-5).toUpperCase();
    customRecipes()[code] = {
      nom: draft.nom.trim().slice(0, 80),
      moment: draft.moment,
      sauce: !!draft.sauce,
      potG: num(draft.potG) || 0,
      parts: num(draft.parts) || 0,
      ing: ing.map((x) => ({food: x.food, g: num(x.g), ...(x.kcal100 ? {kcal100: x.kcal100} : {})})),
      createdAt: new Date().toISOString(),
    };
    RECIPE_CACHE = null;
    draft = null;
    save();
    renderCreator();
    renderRecipes();
    toast('Recette enregistrée dans la banque.');
  }
});
/* ---------- Calculateur de portion (dans la fiche d'une recette maison) ---------- */
function portionCalcHTML(code) {
  const r = customRecipes()[code];
  if (!r) return '';
  const st = (portionState[code] = portionState[code] || {
      slot: r.moment === 'P' ? 'P' : r.moment === 'C' ? 'C' : 'D',
      side: r.sauce ? 'taro' : '',
    }),
    budget = slotBudget(st.slot),
    t = recipeTotals(r),
    opts = st.side
      ? [
          ['Riche en sauce', portionFor(r, budget, st.side, 2 / 3)],
          ['Riche en féculent', portionFor(r, budget, st.side, 1 / 2)],
        ]
      : [['Portion', portionFor(r, budget, '', 1)]];
  return `<div class="ing-panel" data-pcbox="${code}"><b>Combien manger ?</b>
  <div class="row wrap"><div class="field grow"><label>Moment</label><select data-pc="${code}" data-pck="slot"><option value="P" ${st.slot === 'P' ? 'selected' : ''}>Petit-déjeuner</option><option value="D" ${st.slot === 'D' ? 'selected' : ''}>Dîner</option><option value="S" ${st.slot === 'S' ? 'selected' : ''}>Souper</option><option value="C" ${st.slot === 'C' ? 'selected' : ''}>Collation</option></select></div>
  <div class="field grow"><label>Accompagnement</label><select data-pc="${code}" data-pck="side"><option value="">Aucun</option>${SIDES.map((k) => `<option value="${k}" ${st.side === k ? 'selected' : ''}>${esc(FOODS[k].nom)}</option>`).join('')}</select></div></div>
  <div class="small muted">Budget du moment ≈ ${fmtK(budget)} kcal (journée visée ≈ ${fmtK(dayTarget())} kcal).</div>
  ${opts.map(([lab, p]) => `<div class="portion-opt"><b>${lab}</b><div>${esc(portionText(r, p, st.side))}</div><div class="small muted">≈ ${fmtK(p.sauceK)} + ${fmtK(p.sideK)} kcal · ${p.prot || 0} g de protéines</div></div>`).join('')}
  <div class="small muted">Marmite ≈ ${fmtK(t.kcal)} kcal · ${t.prot} g de protéines. Valeurs estimées.</div>
  <div class="row wrap" style="margin-top:6px"><button type="button" class="small-btn" data-cr-edit="${code}">Modifier la recette</button><button type="button" class="small-btn danger" data-cr-del="${code}">Supprimer</button></div></div>`;
}
document.addEventListener('change', (e) => {
  const c = e.target.dataset.pc;
  if (!c) return;
  portionState[c][e.target.dataset.pck] = e.target.value;
  const box = document.querySelector(`[data-pcbox="${c}"]`);
  if (box) box.outerHTML = portionCalcHTML(c);
});
document.addEventListener('click', (e) => {
  const ed = e.target.closest('[data-cr-edit]');
  if (ed) {
    const r = customRecipes()[ed.dataset.crEdit];
    newDraft({...r, code: ed.dataset.crEdit});
    $('creator').scrollIntoView({behavior: 'smooth'});
    return;
  }
  const dl = e.target.closest('[data-cr-del]');
  if (dl && confirm('Supprimer cette recette de la banque ?')) {
    delete customRecipes()[dl.dataset.crDel];
    RECIPE_CACHE = null;
    save();
    renderRecipes();
  }
});
