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
function ingredientBlock(code, m, slot, baseCode) {
  const items = (m.ing || []).map(parseIng);
  if (!items.length) return '';
  const anyMissing = items.some((it) => isMissing(it.key));
  const subs = anyMissing ? substitutesFor(baseCode, slot) : [];
  subs.forEach((r) => ensureMeal(r.code));
  return `<div class="ing-box"><div class="small muted" style="margin-bottom:6px">Ingrédients — touche ceux que tu n’as pas :</div><div class="ing-list">${items
    .map(
      (it) =>
        `<button type="button" class="ing ${isMissing(it.key) ? 'miss' : ''}" data-miss="${esc(it.key)}" data-miss-name="${esc(it.name)}" data-miss-cat="${it.cat}" aria-pressed="${isMissing(it.key)}">${isMissing(it.key) ? '✕ ' : ''}${esc(it.name)}</button>`,
    )
    .join('')}</div>${
    anyMissing
      ? `<div class="small" style="margin-top:8px">Ajouté à tes courses (Manquants).${subs.length ? ' Pour aujourd’hui, sans cet ingrédient :' : ' Aucun plat équivalent sans cet ingrédient : garde le repas ou note « Remplacé ».'}</div>${subs
          .map(
            (r) =>
              `<button type="button" class="small-btn" data-take="${esc(r.code)}" style="margin:6px 6px 0 0">Prendre : ${esc(r.nom)} · ${fmtK(r.kcal)} kcal</button>`,
          )
          .join('')}`
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
