'use strict';
/* OliWeight — budget de calories personnalisé et nombre de repas (fiche #21)
   Calcul local, sans IA, avec les méthodes utilisées par les diététistes :
   1. dépense au repos : Mifflin-St Jeor (Academy of Nutrition and Dietetics), poids de la dernière pesée ;
   2. × facteur d'activité ;
   3. + allaitement : +330 kcal (0-6 mois), +400 (7 mois et +), moitié si allaitement partiel (ANREF) ;
   4. − déficit = perte visée × 7 700 / 7, plafonné à 25 % des besoins et à 500 kcal en allaitement ;
   5. jamais sous le plancher (kcalMin), pas de déficit en pause ou grossesse.
   La formule est une estimation (±10 %) : la tendance des pesées sert ensuite à ajuster. */
const ACTIVITY = {sedentaire: 1.2, legere: 1.375, moderee: 1.55, elevee: 1.725};
const KCAL_PER_KG = 7700;
const ADJ_MAX = 300; // ajustement cumulé maximal, en plus ou en moins
// Moments gardés selon le nombre de repas : 0 petit-déj, 1 collation 11 h, 2 dîner, 3 collation 15 h 30, 4 souper
const MEAL_SLOTS = {5: [0, 1, 2, 3, 4], 4: [0, 2, 3, 4], 3: [0, 2, 4]};
// Part de la journée par moment (calculateur de portion) selon le nombre de repas
const SLOT_SHARES = {
  5: {P: 0.25, C: 0.075, D: 0.3, S: 0.3},
  4: {P: 0.25, C: 0.1, D: 0.35, S: 0.3},
  3: {P: 0.3, C: 0.1, D: 0.35, S: 0.35},
};
function clamp(v, a, b) {
  return Math.min(b, Math.max(a, v));
}
function currentWeight() {
  const w = [...(data.weights || [])].filter((x) => num(x.kg) >= 30).sort((a, b) => (a.date < b.date ? -1 : 1));
  return w.length ? num(w[w.length - 1].kg) : num(data.settings.startWeight);
}
// Détail du calcul, ou null si le profil ne suffit pas (on garde alors l'ancien fonctionnement)
function energyBreakdown() {
  const p = prof(),
    w = currentWeight(),
    h = num(p.taille),
    a = num(p.age);
  if (!(p.sexe === 'F' || p.sexe === 'H') || !(w >= 30) || !(h >= 120) || !(a >= 18)) return null;
  const bmr = 10 * w + 6.25 * h - 5 * a + (p.sexe === 'H' ? 5 : -161),
    act = ACTIVITY[p.activite] || 1.2,
    tdee = bmr * act,
    lact = isBreastfeeding() ? (p.bebeAge === '7+' ? 400 : 330) * (p.allaitementType === 'partiel' ? 0.5 : 1) : 0,
    maint = tdee + lact,
    paused = isPaused(),
    deficit = paused ? 0 : Math.min((weeklyLoss() * KCAL_PER_KG) / 7, maint * 0.25, isBreastfeeding() ? 500 : 1000),
    adj = paused ? 0 : clamp(num(data.settings.kcalAdjust), -ADJ_MAX, ADJ_MAX),
    raw = maint - deficit + adj,
    target = Math.max(kcalMin(), Math.round(raw / 10) * 10);
  return {w, bmr, act, tdee, lact, maint, deficit, adj, target, floored: raw < kcalMin()};
}
function kcalTarget() {
  const e = energyBreakdown();
  return e ? e.target : null;
}
function energyText() {
  const e = energyBreakdown();
  if (!e)
    return 'Complète sexe, âge, taille et poids dans ton profil pour un budget calculé pour toi. En attendant, la limite manuelle ci-dessous s’applique.';
  const parts = [
    `repos ${fmtK(e.bmr)} × activité ${fr(e.act, 3)} = ${fmtK(e.tdee)}`,
    e.lact ? `+ allaitement ${fmtK(e.lact)}` : '',
    e.deficit ? `− perte visée ${fmtK(e.deficit)}` : '',
    e.adj ? `${e.adj > 0 ? '+' : '−'} ajustement ${fmtK(Math.abs(e.adj))}` : '',
  ].filter(Boolean);
  return `Calculé pour toi : ${fmtK(e.target)} kcal par jour (${parts.join(' ')}${e.floored ? ` ; remonté au minimum de ${fmtK(kcalMin())}` : ''}). Poids utilisé : ${fr(e.w)} kg, recalculé à chaque pesée.`;
}
/* ---------- Nombre de repas ---------- */
function defaultMealCount() {
  const n = num(prof().repas);
  return n === 3 || n === 4 ? n : 5;
}
function mealCount(date) {
  const o = num(data.logs[date]?.mealCount);
  return o === 3 || o === 4 || o === 5 ? o : defaultMealCount();
}
function activeSlots(date) {
  return MEAL_SLOTS[mealCount(date)];
}
// Total visé du jour : budget personnalisé, sinon les 5 repas prévus (rien ne change pour l'ancien fonctionnement)
function dayGoal(date) {
  return kcalTarget() ?? effCodes(date).reduce((t, c) => t + kcalOf(c), 0);
}
// Facteur de portion appliqué aux repas gardés pour que le jour atteigne son total (0,6 à 1,6, pas de 0,05)
function portionFactor(date) {
  const kept = activeSlots(date).reduce((t, i) => t + kcalOf(effCode(date, i)), 0);
  if (!(kept > 0)) return 1;
  const f = Math.round(clamp(dayGoal(date) / kept, 0.6, 1.6) * 20) / 20;
  return Math.abs(f - 1) < 0.05 ? 1 : f;
}
function slotKcal(date, i, code) {
  return Math.round(kcalOf(code || effCode(date, i)) * portionFactor(date));
}
function slotShare(slot, date) {
  return SLOT_SHARES[mealCount(date || todayISO())][slot] || 0.3;
}
/* ---------- Ajustement selon la tendance des pesées ---------- */
// Pente des pesées (régression linéaire) sur 28 jours, hors 2 premières semaines (eau et glycogène)
function weightTrend(today = todayISO()) {
  const start = shiftDate(data.settings.startDate || '2000-01-01', 14),
    from = shiftDate(today, -28),
    pts = (data.weights || [])
      .filter((x) => x.date >= from && x.date >= start && x.date <= today && num(x.kg) >= 30)
      .map((x) => [(new Date(x.date) - new Date(from)) / 864e5, num(x.kg)]);
  if (pts.length < 3) return null;
  const span = Math.max(...pts.map((p) => p[0])) - Math.min(...pts.map((p) => p[0]));
  if (span < 21) return null;
  const n = pts.length,
    mx = pts.reduce((t, p) => t + p[0], 0) / n,
    my = pts.reduce((t, p) => t + p[1], 0) / n,
    sxy = pts.reduce((t, p) => t + (p[0] - mx) * (p[1] - my), 0),
    sxx = pts.reduce((t, p) => t + (p[0] - mx) ** 2, 0);
  return {loss: Math.round(-(sxy / sxx) * 7 * 100) / 100, n, span};
}
function kcalSuggestion(today = todayISO()) {
  const e = energyBreakdown();
  if (!e || isPaused()) return null;
  const last = data.settings.kcalAdjustAt;
  if (last && last > shiftDate(today, -21)) return null;
  const t = weightTrend(today);
  if (!t) return null;
  const goal = weeklyLoss();
  if (t.loss > maxLoss() + 0.1) return {delta: 150, loss: t.loss, why: 'fast'};
  if (goal > 0 && t.loss < goal - 0.2) {
    if (e.target - 100 < kcalMin() || e.adj - 100 < -ADJ_MAX) return {delta: 0, loss: t.loss, why: 'floor'};
    return {delta: -100, loss: t.loss, why: 'slow'};
  }
  return null;
}
function suggestionCard() {
  const s = kcalSuggestion();
  if (!s) return '';
  const lost = `${s.loss >= 0 ? '−' : '+'}${fr(Math.abs(s.loss), 2)} kg par semaine`,
    goal = `${fr(weeklyLoss(), 2)} kg visés`;
  if (s.why === 'floor')
    return `<div class="alert info"><b>Rythme plus lent que prévu</b> (${lost}, ${goal}). Ton budget est déjà au minimum sûr : on ne baisse pas. Ajoute de la marche, vérifie les extras et les portions, ou parles-en à une diététiste. <button data-kadj="0" style="margin-top:8px;width:100%">Compris</button></div>`;
  const txt =
    s.why === 'fast'
      ? `Tu perds plus vite que le maximum sûr (${lost}). Je propose <b>+${s.delta} kcal par jour</b>.`
      : `Sur les 4 dernières semaines : ${lost}, pour ${goal}. Je propose <b>${s.delta} kcal par jour</b>.`;
  return `<div class="alert info"><b>Ajuster mon budget ?</b> ${txt} <span class="small muted">Prochaine vérification dans 3 semaines.</span><div class="row wrap" style="margin-top:8px"><button class="primary grow" data-kadj="${s.delta}">Oui, ajuster</button><button data-kadj="0">Pas maintenant</button></div></div>`;
}
document.addEventListener('click', (e) => {
  const b = e.target.closest('[data-kadj]');
  if (b) {
    const d = num(b.dataset.kadj);
    data.settings.kcalAdjust = clamp(num(data.settings.kcalAdjust) + d, -ADJ_MAX, ADJ_MAX);
    data.settings.kcalAdjustAt = todayISO();
    save();
    renderAll();
    if (d) toast(`Budget ajusté de ${d > 0 ? '+' : ''}${d} kcal par jour.`);
    return;
  }
  const m = e.target.closest('[data-mealcount]');
  if (m) {
    const l = logFor(selectedDate),
      n = num(m.dataset.mealcount);
    if (n === defaultMealCount()) delete l.mealCount;
    else l.mealCount = n;
    save();
    renderToday();
  }
});

/* ---------- Quantités écrites recalculées (fiche #27) ----------
   Les menus sont en texte libre : on réécrit seulement les quantités au format connu.
   Arrondi vers le bas (perte de poids), au plus proche si le budget est déjà au plancher. */
const FRAC = {'¼': 0.25, '½': 0.5, '¾': 0.75};
const FRAC_TXT = {0.25: '¼', 0.5: '½', 0.75: '¾'};
const PIECES = 'œufs?|oeufs?|tranches?|bananes?|plantains?|pommes?|oranges?|galettes?|biscottes?|dattes?|pains?';
function roundStep(v, step, mode) {
  const r = mode === 'near' ? Math.round(v / step) : Math.floor(v / step + 1e-9);
  return Math.max(step, r * step);
}
function fracText(v) {
  const w = Math.floor(v),
    f = FRAC_TXT[Math.round((v - w) * 100) / 100] || '';
  return w ? `${w}${f ? ' ' + f : ''}` : f;
}
function roundMode(date) {
  return dayGoal(date) <= kcalMin() * 1.03 ? 'near' : 'down';
}
function scaleText(text, f, mode = 'down') {
  if (!text || f === 1) return text;
  return (
    String(text)
      // grammes, ml : au 5 près
      .replace(
        /(\d+(?:[.,]\d+)?)(\s?)(g|ml)\b/g,
        (all, n, sp, u) => `${roundStep(num(n.replace(',', '.')) * f, 5, mode)}${sp}${u}`,
      )
      // tasses et cuillères : au ¼ près
      .replace(
        /((?:\d+\s)?[¼½¾]|\d+(?:[.,]\d+)?)(\s(?:de\s)?)(tasses?|c\. à soupe|c\. à thé)/g,
        (all, n, mid, u, off, str) => {
          // grammes précisés juste après : la tasse suit au plus proche, pour rester cohérente avec eux
          const m2 = /^[^()]{0,40}\(\d+\s?g\)/.test(str.slice(off + all.length)) ? 'near' : mode;
          const v = n
            .trim()
            .split(/\s+/)
            .reduce((t, x) => t + (FRAC[x] ?? num(x.replace(',', '.'))), 0);
          const s = roundStep(v * f, 0.25, m2),
            unit = u.startsWith('tasse') ? (s > 1 ? 'tasses' : 'tasse') : u;
          return `${fracText(s)}${s < 1 ? mid : ' '}${unit}`;
        },
      )
      // pièces : nombre entier
      .replace(new RegExp(`\\b(\\d+)(\\s)(${PIECES})\\b`, 'g'), (all, n, sp, u) => {
        const s = Math.max(1, mode === 'near' ? Math.round(num(n) * f) : Math.floor(num(n) * f + 1e-9));
        return `${s}${sp}${s > 1 && !/s$/.test(u) ? u + 's' : s === 1 && /s$/.test(u) ? u.slice(0, -1) : u}`;
      })
      // nombre approximatif entre parenthèses, ex. « (environ 12) » amandes
      .replace(
        /\(environ (\d+)\)/g,
        (all, n) => `(environ ${Math.max(1, mode === 'near' ? Math.round(num(n) * f) : Math.floor(num(n) * f))})`,
      )
  );
}
