'use strict';
/* OliWeight — réglages, navigation, sauvegarde */
/* ---------- Réglages ---------- */
function renderSettings() {
  const s = data.settings;
  [
    'startWeight',
    'startDate',
    'targetWeight',
    'targetLoss',
    'waterGoal',
    'stepsGoal',
    'weighDay',
    'reminderTime',
    'cutoffTime',
    'kcalMax',
  ].forEach((k) => ($(k).value = s[k] ?? ''));
  const lb = data.meta.lastBackup;
  $('backupInfo').textContent = lb
    ? 'Dernière sauvegarde : ' + new Date(lb).toLocaleDateString('fr-FR', {day: 'numeric', month: 'long'})
    : 'Aucune sauvegarde pour l’instant.';
  $('appVersion').textContent = 'Version ' + APP_VERSION + '.';
  if (typeof renderSync === 'function' && $('syncOwner')) renderSync();
  renderProfileCard();
  applyRulesToUI();
  if (typeof renderFeedback === 'function') renderFeedback();
}
function renderAll() {
  renderToday();
  renderMenus();
  renderWeights();
  renderSettings();
  if ($('progress').classList.contains('active')) renderProgress();
}
function goto(screen) {
  if (screen !== 'menus') viewWeek = 'cur';
  document.querySelectorAll('.nav button').forEach((x) => x.classList.toggle('active', x.dataset.screen === screen));
  document.querySelectorAll('.screen').forEach((x) => x.classList.toggle('active', x.id === screen));
  window.scrollTo(0, 0);
  if (screen === 'progress') renderProgress();
  if (screen === 'menus') renderMenus();
}
function backup() {
  data.meta.lastBackup = new Date().toISOString();
  save();
  download(`oliweight-sauvegarde-${todayISO()}.json`, JSON.stringify(data, null, 2), 'application/json');
  renderSettings();
  renderToday();
}
