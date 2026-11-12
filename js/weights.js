'use strict';
/* OliWeight — pesées, objectif, tendance et courbe du poids */
function sortedWeights() {
  return [...data.weights].sort((a, b) => a.date.localeCompare(b.date));
}
// pesées + point de départ (réglages) s'il n'y a pas de pesée ce jour-là
function weightsWithStart() {
  const ws = sortedWeights(),
    s = data.settings,
    sw = num(s.startWeight);
  if (
    sw >= 20 &&
    isDate(s.startDate) &&
    !ws.some((w) => w.date === s.startDate) &&
    (!ws.length || s.startDate < ws[0].date)
  )
    ws.unshift({date: s.startDate, kg: sw, waist: '', start: true});
  return ws;
}
function addWeeks(date, w) {
  const d = dateObj(date);
  d.setDate(d.getDate() + Math.round(w * 7));
  return localDate(d);
}
function fmtMonth(date) {
  return dateObj(date).toLocaleDateString('fr-FR', {month: 'long', year: 'numeric'});
}
function goalStats() {
  const s = data.settings,
    ws = weightsWithStart(),
    start = num(s.startWeight, ws[0]?.kg || 0),
    target = num(s.targetWeight),
    cur = ws.length ? num(ws[ws.length - 1].kg) : start,
    lastDate = ws.length ? ws[ws.length - 1].date : todayISO();
  const total = start - target,
    lost = start - cur,
    left = Math.max(0, cur - target),
    pct = total > 0 ? Math.min(100, Math.max(0, (lost / total) * 100)) : 0;
  const rate = weeklyLoss(),
    planDate = rate > 0 && left > 0 ? addWeeks(lastDate, left / rate) : null;
  // rythme réel : régression linéaire, au moins 3 pesées sur 14 jours
  let real = null,
    realDate = null;
  const span = ws.length ? (dateObj(ws[ws.length - 1].date) - dateObj(ws[0].date)) / 864e5 : 0;
  if (ws.length >= 3 && span >= 14) {
    const xs = ws.map((w) => (dateObj(w.date) - dateObj(ws[0].date)) / 6048e5),
      ys = ws.map((w) => num(w.kg)),
      mx = xs.reduce((a, b) => a + b, 0) / xs.length,
      my = ys.reduce((a, b) => a + b, 0) / ys.length;
    let nu = 0,
      de = 0;
    xs.forEach((x, i) => {
      nu += (x - mx) * (ys[i] - my);
      de += (x - mx) ** 2;
    });
    const slope = de ? nu / de : 0;
    real = -slope;
    if (real >= 0.1 && left > 0) realDate = addWeeks(lastDate, left / real);
  }
  const marks = [5, 10]
    .map((p) => ({label: `−${p} %`, kg: start * (1 - p / 100)}))
    .concat([10, 20, 30, 40].filter((k) => k < total + 0.01).map((k) => ({label: `−${k} kg`, kg: start - k})));
  marks.forEach((m) => {
    const hit = ws.find((w) => num(w.kg) <= m.kg + 1e-9 && !w.start);
    m.date = hit ? hit.date : null;
  });
  return {
    start,
    target,
    cur,
    total,
    lost,
    left,
    pct,
    rate,
    planDate,
    real,
    realDate,
    marks: marks.sort((a, b) => b.kg - a.kg),
    n: ws.filter((w) => !w.start).length,
  };
}

function renderWeights() {
  const arr = weightsWithStart();
  $('weightHistory').innerHTML = arr.length
    ? arr
        .slice()
        .reverse()
        .map((w, i) => {
          const prev = arr[arr.length - 2 - i],
            diff = prev ? num(w.kg) - num(prev.kg) : null;
          return `<div class="history-row"><div><b>${esc(fmtDate(w.date, {day: 'numeric', month: 'long', year: 'numeric'}))}</b><div class="small muted">${w.start ? 'Poids de départ (Réglages)' : w.waist ? esc(w.waist) + ' cm de tour de taille' : ''}</div></div><b>${fr(num(w.kg))} kg</b><span class="small muted">${diff === null ? '—' : (diff > 0 ? '+' : '') + fr(diff) + ' kg'}</span>${w.start ? '<span></span>' : `<button data-delweight="${esc(w.date)}" aria-label="Supprimer la pesée du ${esc(w.date)}">✕</button>`}</div>`;
        })
        .join('')
    : '<div class="empty">Aucune pesée enregistrée.</div>';
}

function renderGoal() {
  const g = goalStats();
  if (!(g.total > 0)) {
    $('goal').innerHTML = '<div class="empty">Indique le poids cible dans Réglages.</div>';
    return;
  }
  $('goal').innerHTML =
    `<div class="metric-grid"><div class="metric"><strong>${fr(g.cur)} kg</strong><span>Poids actuel</span></div><div class="metric"><strong>${fr(g.target)} kg</strong><span>Poids cible</span></div><div class="metric"><strong>${g.lost >= 0 ? '−' : '+'}${fr(Math.abs(g.lost))} kg</strong><span>Depuis le départ</span></div><div class="metric"><strong>${fr(g.left)} kg</strong><span>Reste à perdre</span></div></div>
 <div class="row between" style="margin-top:12px"><b>${fr(g.pct, 0)} % du chemin</b><span class="small muted">${fr(g.start)} → ${fr(g.target)} kg</span></div><div class="bar" style="margin:8px 0 14px"><i style="width:${g.pct}%"></i></div>
 <h3>Date probable</h3>
 <div class="row between" style="margin:6px 0"><span>Au rythme prévu (${fr(g.rate)} kg/sem.)</span><b>${g.planDate ? esc(fmtMonth(g.planDate)) : '—'}</b></div>
 <div class="row between" style="margin:6px 0"><span>À ton rythme réel${g.real !== null ? ` (${fr(g.real, 2)} kg/sem.)` : ''}</span><b>${g.realDate ? esc(fmtMonth(g.realDate)) : '—'}</b></div>
 <div class="small muted">${g.real === null ? 'Le rythme réel s’affiche après 3 pesées sur au moins 2 semaines.' : g.real > 1 ? '⚠️ Rythme réel trop rapide pour l’allaitement : on remonte les portions.' : g.real < 0.1 ? 'Le poids est stable pour l’instant : on ajustera les menus.' : ''} C’est une estimation : la perte ralentit souvent avec le temps, et le rythme sera revu avec le médecin après le sevrage.</div>
 <h3 style="margin-top:14px">Étapes</h3>${g.marks.map((m) => `<div class="row between" style="margin:6px 0"><span>${m.date ? '✅' : '⬜'} ${esc(m.label)} · ${fr(m.kg)} kg</span><span class="small muted">${m.date ? esc(fmtDate(m.date, {day: 'numeric', month: 'short'})) : ''}</span></div>`).join('')}`;
}
function drawChart() {
  const c = $('weightChart'),
    rect = c.getBoundingClientRect();
  if (!rect.width) return;
  const ctx = c.getContext('2d'),
    dpr = window.devicePixelRatio || 1;
  c.width = rect.width * dpr;
  c.height = rect.height * dpr;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  const W = rect.width,
    H = rect.height,
    p = {l: 44, r: 12, t: 15, b: 30},
    ws = weightsWithStart(),
    css = (k) => getComputedStyle(document.body).getPropertyValue(k).trim();
  ctx.clearRect(0, 0, W, H);
  if (!ws.length) {
    ctx.fillStyle = css('--muted');
    ctx.font = '14px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('Ajoute une pesée pour voir la courbe', W / 2, H / 2);
    return;
  }
  const start = data.settings.startDate && data.settings.startDate <= ws[0].date ? data.settings.startDate : ws[0].date,
    lastD = ws[ws.length - 1].date,
    end = lastD > todayISO() ? lastD : todayISO(),
    span = Math.max(1, (dateObj(end) - dateObj(start)) / 864e5),
    base = num(data.settings.startWeight, ws[0].kg),
    loss = weeklyLoss(),
    targetAt = (d) => base - loss * ((dateObj(d) - dateObj(start)) / 6048e5);
  const vals = ws.map((w) => num(w.kg)).concat([base, targetAt(end)]),
    min = Math.floor(Math.min(...vals) - 1),
    max = Math.ceil(Math.max(...vals) + 1),
    step = Math.max(1, Math.ceil((max - min) / 6));
  const x = (d) => p.l + ((dateObj(d) - dateObj(start)) / 864e5 / span) * (W - p.l - p.r),
    y = (v) => p.t + ((max - v) / (max - min)) * (H - p.t - p.b);
  ctx.lineWidth = 1;
  ctx.strokeStyle = css('--line');
  ctx.fillStyle = css('--muted');
  ctx.font = '11px system-ui';
  ctx.textAlign = 'right';
  for (let v = min; v <= max; v += step) {
    ctx.beginPath();
    ctx.moveTo(p.l, y(v));
    ctx.lineTo(W - p.r, y(v));
    ctx.stroke();
    ctx.fillText(v + ' kg', p.l - 6, y(v) + 4);
  }
  ctx.strokeStyle = css('--muted');
  ctx.setLineDash([5, 4]);
  ctx.beginPath();
  ctx.moveTo(x(start), y(base));
  ctx.lineTo(x(end), y(targetAt(end)));
  ctx.stroke();
  ctx.setLineDash([]);
  const brand = css('--brand');
  if (ws.length >= 3) {
    const tr = trendSeries(ws);
    ctx.strokeStyle = brand;
    ctx.globalAlpha = 0.35;
    ctx.lineWidth = 6;
    ctx.lineCap = 'round';
    ctx.beginPath();
    tr.forEach((w, i) => (i ? ctx.lineTo(x(w.date), y(w.kg)) : ctx.moveTo(x(w.date), y(w.kg))));
    ctx.stroke();
    ctx.globalAlpha = 1;
  }
  ctx.strokeStyle = brand;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ws.forEach((w, i) => (i ? ctx.lineTo(x(w.date), y(num(w.kg))) : ctx.moveTo(x(w.date), y(num(w.kg)))));
  ctx.stroke();
  ctx.fillStyle = brand;
  ws.forEach((w) => {
    ctx.beginPath();
    ctx.arc(x(w.date), y(num(w.kg)), 4, 0, Math.PI * 2);
    ctx.fill();
  });
  ctx.fillStyle = css('--muted');
  ctx.textAlign = 'left';
  ctx.fillText(fmtDate(start, {day: 'numeric', month: 'short'}), p.l, H - 8);
  ctx.textAlign = 'right';
  ctx.fillText(fmtDate(end, {day: 'numeric', month: 'short'}), W - p.r, H - 8);
}
