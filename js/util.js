'use strict';
/* OliWeight — utilitaires : dates, formats, échappement HTML, toast, téléchargement */
const DAYS = ['', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'];

const $ = (id) => document.getElementById(id);
const todayISO = () => localDate(new Date());
function localDate(d) {
  return [d.getFullYear(), String(d.getMonth() + 1).padStart(2, '0'), String(d.getDate()).padStart(2, '0')].join('-');
}
function dateObj(s) {
  return new Date(s + 'T12:00:00');
}
function shiftDate(s, n) {
  const d = dateObj(s);
  d.setDate(d.getDate() + n);
  return localDate(d);
}
function dayIndex(s) {
  return dateObj(s).getDay() || 7;
}
function fmtDate(s, opts = {weekday: 'long', day: 'numeric', month: 'long'}) {
  return dateObj(s).toLocaleDateString('fr-FR', opts);
}
function num(v, def = 0) {
  const x = Number(String(v ?? '').replace(',', '.'));
  return Number.isFinite(x) ? x : def;
}
function fr(n, d = 1) {
  return Number(n).toFixed(d).replace('.', ',');
}
function esc(s) {
  return String(s ?? '').replace(
    /[&<>"']/g,
    (c) => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'})[c],
  );
}
function clone(x) {
  return JSON.parse(JSON.stringify(x));
}
function isDate(s) {
  return typeof s === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(s);
}

function toast(t) {
  const el = $('toast');
  el.textContent = t;
  el.style.display = 'block';
  clearTimeout(toast.timer);
  toast.timer = setTimeout(() => (el.style.display = 'none'), 2600);
}
function download(name, content, type) {
  const a = document.createElement('a'),
    url = URL.createObjectURL(new Blob([content], {type}));
  a.href = url;
  a.download = name;
  document.body.append(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1500);
}
function fmtK(n) {
  return Math.round(n).toLocaleString('fr-FR');
}
