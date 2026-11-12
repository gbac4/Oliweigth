'use strict';
/* OliWeight — plan du jour, calories par repas, ajouts et extras */
function planFor(date) {
  const ws = weekStartOf(date),
    p = (data.current && ws !== data.current.startDate && data.history?.[ws]) || data.plan;
  return p[String(dayIndex(date))] || DEFAULT_PLAN['1'];
}
function kcalOf(code, meal) {
  const m = meal || data.meals[code];
  const k = num(m?.kcal, 0);
  return k > 0 ? k : KCAL[code] || 0;
}
function effCode(date, i) {
  const l = data.logs[date];
  return l?.alt?.[i] || planFor(date)[i];
}
function effCodes(date) {
  return planFor(date).map((_, i) => effCode(date, i));
}
function dayKcal(date, onlyDone) {
  const l = data.logs[date];
  return effCodes(date).reduce((t, c, i) => {
    const st = l?.meals?.[i]?.status;
    if (onlyDone && !(st === 'done' || st === 'partial')) return t;
    return t + kcalOf(c);
  }, 0);
}
function kcalLimit() {
  return Math.max(kcalMin(), num(data.settings.kcalMax, KCAL_MAX));
}
// mangées : fait ou partiel = la portion prévue ; remplacé = l'estimation saisie ; sauté = 0
function addsKcal(m) {
  return (m?.adds || []).reduce((t, a) => t + num(a.kcal), 0);
}
function extrasKcal(l) {
  return (l?.extras || []).reduce((t, x) => t + num(x.kcal), 0);
}
function eatenKcal(date) {
  const l = data.logs[date];
  if (!l) return {k: 0, unknown: 0};
  let k = extrasKcal(l),
    unknown = (l.extras || []).filter((x) => !(num(x.kcal) > 0)).length;
  effCodes(date).forEach((c, i) => {
    const m = l.meals?.[i];
    if (m && m.status !== 'skipped') k += addsKcal(m);
    if (!m?.status) return;
    if (m.status === 'done' || m.status === 'partial') k += kcalOf(c);
    else if (m.status === 'replaced') {
      if (num(m.kcal) > 0) k += num(m.kcal);
      else unknown++;
    }
  });
  return {k, unknown};
}
function mealsDone(l) {
  return Object.values(l?.meals || {}).filter((m) => m.status === 'done').length;
}
function isComplete(l, date) {
  return planFor(date).every((_, i) => l?.meals?.[i]?.status);
}
