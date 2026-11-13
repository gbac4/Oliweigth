'use strict';
/* OliWeight — règles automatiques selon la situation (fiche #5)
   Précautions générales seulement : toute liste d'aliments liée à une maladie doit être
   confirmée par le médecin ou une diététiste (message affiché dans l'app). */
function prof() {
  return data.profile || {};
}
// Allaitement seulement s'il est déclaré (fiche #21 : on ne le suppose plus sans réponse).
function isBreastfeeding() {
  return prof().allaitement === true && prof().sexe !== 'H';
}
function isPaused() {
  return !!(prof().pause || prof().grossesse);
}
function pauseReason() {
  if (prof().grossesse) return 'grossesse : pas de perte de poids visée';
  if (prof().pause) return 'pause (maladie ou autre) : alimentation normale, pas de déficit';
  return '';
}
// Plancher de calories : 1 800 pendant l'allaitement, 1 500 sinon.
function kcalMin() {
  return isBreastfeeding() ? KCAL_MIN : 1500;
}
// Perte maximale par semaine : 0,5 kg en allaitement ; sinon 1 % du poids, plafonné à 1 kg ; 0 en pause.
function maxLoss() {
  if (isPaused()) return 0;
  if (isBreastfeeding()) return 0.5;
  const w = num(data.settings.startWeight);
  return Math.round(Math.min(1, w > 0 ? w * 0.01 : 0.5) * 10) / 10;
}
function weeklyLoss() {
  return Math.min(maxLoss(), Math.max(0, num(data.settings.targetLoss, 0.5)));
}
// Étiquettes exclues selon la santé (en plus des allergies et refus du profil).
const HEALTH_EXCLUDE = {coeliaque: ['gluten'], hypertension: ['sel'], rein: ['sel'], diabete: ['sucre']};
function healthExcludedTags(p) {
  const t = new Set();
  (p?.sante || []).forEach((s) => (HEALTH_EXCLUDE[s] || []).forEach((x) => t.add(x)));
  return t;
}
function menusToReview() {
  const m = data.meta || {};
  return !!m.profileChangedAt && (!m.menusReviewedAt || m.profileChangedAt > m.menusReviewedAt);
}
function ruleBanners() {
  const b = [];
  if (isPaused())
    b.push(
      `<div class="alert info">⏸️ Mode ${esc(pauseReason())}. Le compteur de calories sert seulement de repère. En cas de maladie, suis les conseils de ton médecin.</div>`,
    );
  if (menusToReview())
    b.push(
      '<div class="alert">📝 Profil modifié : les menus des prochaines semaines vont être révisés. En attendant, utilise « Changer pour un plat équivalent » si un plat ne te convient plus.</div>',
    );
  return b;
}
function applyRulesToUI() {
  const card = $('feedsCard');
  if (card) card.classList.toggle('hidden', !isBreastfeeding());
  const lab = document.querySelector('label[for="targetLoss"]');
  if (lab) lab.textContent = `Perte visée (kg/semaine, maximum ${fr(maxLoss())})`;
  const tl = $('targetLoss');
  if (tl) tl.max = String(maxLoss());
  const km = $('kcalMax');
  if (km) km.min = String(kcalMin());
  const kc = $('kcalCalc');
  if (kc) kc.textContent = energyText();
}
