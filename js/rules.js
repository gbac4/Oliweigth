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
// Fiche #34 : objectif choisi à l'inscription (perdre par défaut, pour les profils existants)
function goal() {
  const g = prof().objectif;
  return g === 'stabiliser' ? g : 'perdre';
}
function weeklyLoss() {
  if (goal() !== 'perdre') return 0;
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
  if (typeof stabBanner === 'function') {
    const sb = stabBanner();
    if (sb) b.push(sb);
  }
  const rl = typeof realisticLoss === 'function' ? realisticLoss() : null;
  if (rl !== null && !isPaused())
    b.push(
      rl > 0
        ? `<div class="alert">🐢 Ton objectif de perte est trop rapide pour ton profil. En mangeant au minimum sûr (${fmtK(kcalMin())} kcal), le rythme réaliste est d’environ <b>${fr(rl, 2)} kg par semaine</b>. Tu peux baisser l’objectif dans Réglages : ce n’est pas un échec, c’est ton rythme.</div>`
        : `<div class="alert">🐢 Ton corps dépense environ ${fmtK(energyBreakdown().maint)} kcal par jour, moins que le minimum sûr (${fmtK(kcalMin())}). On ne descend pas plus bas : la perte viendra surtout de l’activité (marche quotidienne). Parles-en à ton médecin ou à une diététiste si tu veux aller plus loin.</div>`,
    );
  if (menusToReview())
    b.push(
      canRegenerateMenus()
        ? `<div class="alert">📝 Profil modifié : tes menus peuvent être refaits selon tes nouvelles réponses.${regenButtonHTML()}</div>`
        : '<div class="alert">📝 Profil modifié : les menus des prochaines semaines vont être révisés. En attendant, utilise « Changer pour un plat équivalent » si un plat ne te convient plus.</div>',
    );
  return b;
}
function applyRulesToUI() {
  const card = $('feedsCard');
  if (card) card.classList.toggle('hidden', !isBreastfeeding());
  const fb = $('footBf');
  if (fb) fb.classList.toggle('hidden', !isBreastfeeding());
  const lab = document.querySelector('label[for="targetLoss"]');
  if (lab)
    lab.textContent =
      goal() === 'perdre'
        ? `Perte visée (kg/semaine, maximum ${fr(maxLoss())})`
        : 'Perte visée : sans objet (objectif « stabiliser »)';
  const tl = $('targetLoss');
  if (tl) {
    tl.max = String(maxLoss());
    tl.disabled = goal() !== 'perdre';
  }
  const km = $('kcalMax');
  if (km) km.min = String(kcalMin());
  const kc = $('kcalCalc');
  if (kc) kc.textContent = energyText();
}
