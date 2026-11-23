'use strict';
/* OliWeight — journal d'erreurs et diagnostic.
   Chargé en premier pour attraper aussi les erreurs de chargement des autres fichiers.
   Ne garde AUCUNE donnée personnelle ni de santé : seulement le message technique tronqué,
   le fichier et la ligne, l'écran ouvert, la version et le navigateur. 20 erreurs au plus. */
const DIAG_MAX = 20;
// KEY vient de config.js (différente sur la bêta). Une erreur survenue avant son chargement
// reste en mémoire et sera écrite avec la suivante : la bêta n'écrit jamais chez la vraie app.
let diagEarly = [];
function diagKey() {
  return typeof KEY !== 'undefined' ? KEY + '.errors' : null;
}
function diagRead() {
  const k = diagKey();
  if (!k) return diagEarly.slice();
  try {
    const x = JSON.parse(localStorage.getItem(k) || '[]');
    return (Array.isArray(x) ? x : []).concat(diagEarly);
  } catch (e) {
    return diagEarly.slice();
  }
}
// Ne garde que « fichier.js:ligne:colonne », sans l'adresse du site.
function diagWhere(stack, file, line, col) {
  if (file) return String(file).split('/').pop().split('?')[0] + ':' + (line || 0) + ':' + (col || 0);
  const m = String(stack || '').match(/([\w.-]+\.js)(?:\?[^:]*)?:(\d+):(\d+)/);
  return m ? m[1] + ':' + m[2] + ':' + m[3] : '?';
}
function diagLog(message, where) {
  try {
    const screen = document.querySelector('.screen.active');
    const v = typeof APP_VERSION !== 'undefined' ? APP_VERSION : '?';
    const list = diagRead();
    const msg = String(message || 'Erreur inconnue').slice(0, 200);
    const last = list[list.length - 1];
    // La même erreur répétée en boucle ne remplit pas le journal : on compte.
    if (last && last.msg === msg && last.where === where) last.n = (last.n || 1) + 1;
    else list.push({t: new Date().toISOString(), v, screen: screen ? screen.id : '-', where, msg});
    const k = diagKey();
    if (!k) diagEarly = list.slice(-DIAG_MAX);
    else {
      localStorage.setItem(k, JSON.stringify(list.slice(-DIAG_MAX)));
      diagEarly = [];
    }
  } catch (e) {
    /* le journal ne doit jamais faire planter l'app */
  }
}
window.addEventListener('error', (e) => {
  if (!e.error && !e.message) return; // image ou fichier introuvable : pas une erreur de code
  diagLog(e.message, diagWhere(e.error && e.error.stack, e.filename, e.lineno, e.colno));
});
window.addEventListener('unhandledrejection', (e) => {
  const r = e.reason;
  diagLog('Promesse : ' + ((r && r.message) || r), diagWhere(r && r.stack));
});
function diagBrowser() {
  const ua = navigator.userAgent;
  const os = /iPhone|iPad/.test(ua) ? 'iOS' : /Android/.test(ua) ? 'Android' : /Windows/.test(ua) ? 'Windows' : 'autre';
  const br = /CriOS|Chrome/.test(ua)
    ? 'Chrome'
    : /Firefox|FxiOS/.test(ua)
      ? 'Firefox'
      : /Safari/.test(ua)
        ? 'Safari'
        : 'autre';
  const app = window.matchMedia && matchMedia('(display-mode: standalone)').matches ? 'installée' : 'navigateur';
  return os + ' · ' + br + ' · ' + app;
}
function diagText() {
  const list = diagRead();
  const v = typeof APP_VERSION !== 'undefined' ? APP_VERSION : '?';
  const head = [
    'Diagnostic OliWeight',
    'Version : ' + v,
    'Appareil : ' + diagBrowser(),
    'Date : ' + new Date().toISOString().slice(0, 16).replace('T', ' '),
    'Erreurs : ' + list.length,
  ];
  const lines = list.map(
    (x) =>
      `- ${x.t.slice(0, 16).replace('T', ' ')} · v${x.v} · ${x.screen} · ${x.where} · ${x.msg}${x.n > 1 ? ' (×' + x.n + ')' : ''}`,
  );
  return head.concat(lines.length ? lines : ['- aucune erreur enregistrée']).join('\n');
}
function diagClear() {
  diagEarly = [];
  try {
    if (diagKey()) localStorage.removeItem(diagKey());
  } catch (e) {
    /* rien */
  }
}
