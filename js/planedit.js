'use strict';
/* OliWeight — changer un plat des jours à venir (fiche #47) et « Pas aujourd'hui ».
   Un changement de plan est une opération dans w.swaps (comme les échanges de jours) :
   - {mode: 'repl', day, slot, code} : ce repas devient ce plat (courses et calories suivent) ;
   - {mode: 'slot', a, b, slot} : échange un repas entre deux jours (« Pas aujourd'hui »).
   « Annuler les échanges » retire aussi ces changements. Les jours passés et les repas déjà notés ne bougent pas. */
function dayDate(start, day) {
  return shiftDate(start, Number(day) - 1);
}
function slotLocked(date, slot) {
  return date < todayISO() || !!data.logs[date]?.meals?.[slot]?.status;
}
function replOptions(code, slot) {
  const opts = [code, ...equivalents(code, slot).map((r) => r.code), ...pinnedOptions(slot)].filter(
    (c, j, a) => a.indexOf(c) === j && !isCustomCode(c),
  );
  opts.forEach(ensureMeal);
  return {opts, mine: customOptions(slot)};
}
function replSelectHTML(start, day, slot, code) {
  if (!code || slotLocked(dayDate(start, day), slot)) return '';
  const {opts, mine} = replOptions(code, slot);
  if (opts.length < 2 && !mine.length) return '';
  const o = opts
    .map(
      (c) =>
        `<option value="${esc(c)}" ${c === code ? 'selected' : ''}>${c === code ? 'Prévu : ' : ''}${esc(vMeal(c).nom)} · ≈ ${fmtK(kcalOf(c, vMeal(c)))} kcal</option>`,
    )
    .join('');
  const m = mine.length
    ? `<optgroup label="Mes recettes">${mine.map((r) => `<option value="${esc(r.code)}">🍲 ${esc(r.nom)} · portion ajustée</option>`).join('')}</optgroup>`
    : '';
  return `<div class="field"><label>Changer de plat</label><select data-repl="${day}-${slot}"><optgroup label="Plats équivalents (calories proches)">${o}</optgroup>${m}</select></div>`;
}
// Cuisine pour 2 jours : le jour voisin du même bloc qui a le même plat change aussi.
function pairedDays(plan, day, slot, code) {
  const d = Number(day),
    out = [String(d)];
  for (const n of [d - 1, d + 1])
    if (n >= 1 && n <= 7 && (plan[String(n)] || [])[slot] === code && Math.ceil(n / 2) === Math.ceil(d / 2))
      out.push(String(n));
  return out;
}
function applyPlanOp(w, op) {
  w.swaps = w.swaps || [];
  w.swaps.push(op);
  if (w === data.current) data.plan = effPlan(data.current);
}
document.addEventListener('change', (e) => {
  const sel = e.target.closest('[data-repl]');
  if (!sel) return;
  const [day, slot] = sel.dataset.repl.split('-'),
    w = viewObj() || data.current,
    plan = vPlan(),
    old = (plan[day] || [])[slot],
    code = sel.value;
  if (!w || !old || code === old) return;
  ensureMeal(code);
  const start = vStart(),
    days = pairedDays(plan, day, Number(slot), old).filter((d) => !slotLocked(dayDate(start, d), Number(slot)));
  days.forEach((d) => applyPlanOp(w, {mode: 'repl', day: d, slot: Number(slot), code}));
  save();
  renderMenus();
  renderToday();
  toast(`${vMeal(code).nom} : ${days.map((d) => DAYS[d]).join(' et ')}. La liste de courses suit.`);
});
/* ---------- « Pas aujourd'hui » (écran Aujourd'hui) ---------- */
function laterOptions(date, slot) {
  if (date !== todayISO() || !data.current || weekStartOf(date) !== data.current.startDate) return [];
  const today = dayIndex(date),
    out = [];
  for (let d = today + 1; d <= 7; d++) {
    const dd = dayDate(data.current.startDate, d),
      code = (data.plan[String(d)] || [])[slot];
    if (code && !slotLocked(dd, slot) && !data.logs[dd]?.alt?.[slot]) out.push({day: String(d), code});
  }
  return out;
}
function laterHTML(date, slot) {
  const opts = laterOptions(date, slot);
  if (!opts.length || data.logs[date]?.alt?.[slot]) return '';
  return `<div class="field"><label class="small muted">Pas aujourd’hui ? Échanger avec un autre jour</label><select data-later="${slot}"><option value="">—</option>${opts
    .map((o) => `<option value="${o.day}">${DAYS[o.day]} : ${esc((data.meals[o.code] || {nom: o.code}).nom)}</option>`)
    .join('')}</select></div>`;
}
document.addEventListener('change', (e) => {
  const sel = e.target.closest('[data-later]');
  if (!sel || !sel.value) return;
  const slot = Number(sel.dataset.later),
    a = String(dayIndex(todayISO())),
    b = sel.value;
  applyPlanOp(data.current, {mode: 'slot', a, b, slot});
  save();
  renderToday();
  renderMenus();
  toast(`Échangé avec ${DAYS[b]} : le plat reviendra ce jour-là.`);
});
