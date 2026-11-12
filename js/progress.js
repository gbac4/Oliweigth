'use strict';
/* OliWeight — écran Progrès et résumé hebdomadaire pour l'analyse */
function renderKcalBars() {
  const svg = $('kcalBars'),
    dates = last7(),
    lim = kcalLimit(),
    vals = dates.map((d) => eatenKcal(d).k),
    W = 340,
    H = 190,
    p = {l: 36, r: 8, t: 12, b: 26},
    max = Math.max(lim * 1.15, ...vals),
    y = (v) => p.t + (1 - v / max) * (H - p.t - p.b),
    bw = (W - p.l - p.r) / 7;
  svg.setAttribute('viewBox', `0 0 ${W} ${H}`);
  const band = `<rect x="${p.l}" y="${y(lim)}" width="${W - p.l - p.r}" height="${y(kcalMin()) - y(lim)}" fill="var(--brand2)" opacity=".7"/>`;
  const bars = vals
    .map((v, i) => {
      const x = p.l + i * bw + bw * 0.18,
        w = bw * 0.64,
        col =
          v > lim
            ? 'var(--warn)'
            : v >= kcalMin()
              ? 'var(--brand)'
              : 'color-mix(in srgb,var(--brand) 45%,var(--surface2))';
      return `<rect x="${x}" y="${y(v)}" width="${w}" height="${Math.max(0, y(0) - y(v))}" rx="4" fill="${col}"><title>${fmtDate(dates[i], {weekday: 'long', day: 'numeric'})} : ${fmtK(v)} kcal</title></rect><text x="${x + w / 2}" y="${H - 8}" text-anchor="middle" font-size="11" fill="var(--muted)">${fmtDate(dates[i], {weekday: 'short'}).slice(0, 3)}</text>`;
    })
    .join('');
  const line = `<line x1="${p.l}" x2="${W - p.r}" y1="${y(lim)}" y2="${y(lim)}" stroke="var(--warn)" stroke-width="1.5" stroke-dasharray="5 4"/><text x="${p.l - 4}" y="${y(lim) + 4}" text-anchor="end" font-size="10" fill="var(--muted)">${fmtK(lim)}</text><text x="${p.l - 4}" y="${y(kcalMin()) + 4}" text-anchor="end" font-size="10" fill="var(--muted)">${fmtK(kcalMin())}</text>`;
  svg.innerHTML = band + bars + line;
  const logged = vals.filter((v) => v > 0),
    avg = logged.length ? logged.reduce((a, b) => a + b, 0) / logged.length : 0;
  $('kcalBarsText').textContent = logged.length
    ? `Moyenne : ${fmtK(avg)} kcal par jour noté. Bande verte = zone visée (${fmtK(kcalMin())} à ${fmtK(lim)}), pointillés = limite à ne pas dépasser. Les jours en cours ne sont pas terminés.`
    : 'Les barres apparaissent dès que des repas sont notés.';
}
/* ---------- Progrès ---------- */
function last7() {
  return Array.from({length: 7}, (_, i) => shiftDate(todayISO(), i - 6));
}
function trendSeries(ws) {
  let t = null;
  return ws.map((w) => {
    t = t === null ? num(w.kg) : t + 0.5 * (num(w.kg) - t);
    return {date: w.date, kg: t};
  });
}
function weekStats() {
  const dates = last7(),
    logs = dates.map((d) => data.logs[d]);
  const tracked = logs.flatMap((l) => Object.values(l?.meals || {}).filter((m) => m.status));
  const done = tracked.filter((m) => m.status === 'done').length;
  const complete = dates.filter((d, i) => logs[i] && isComplete(logs[i], d)).length;
  let streak = 0;
  for (let i = 0; i < 60; i++) {
    const d = shiftDate(todayISO(), -i),
      l = data.logs[d];
    if (l && isComplete(l, d)) streak++;
    else if (i > 0 || !l) break;
  }
  const slot = SLOTS.map((_, j) => dates.map((d, i) => logs[i]?.meals?.[j]?.status || ''));
  return {dates, logs, tracked: tracked.length, done, complete, streak, slot};
}
function renderProgress() {
  const st = weekStats(),
    {logs} = st;
  $('weekMetrics').innerHTML =
    `<div class="metric"><strong>${st.tracked ? Math.round((st.done / st.tracked) * 100) : 0} %</strong><span>Repas respectés</span></div><div class="metric"><strong>${st.complete}/7</strong><span>Jours complets</span></div><div class="metric"><strong>${st.streak}</strong><span>Jours complets d’affilée</span></div><div class="metric"><strong>${st.tracked}/35</strong><span>Repas notés</span></div>`;
  $('slotAdherence').innerHTML = st.slot
    .map((arr, j) => {
      const ok = arr.filter((s) => s === 'done').length;
      return `<div class="slot-row"><span>${esc(SLOT_SHORT[j])}</span><div class="dots">${arr.map((s, i) => `<i class="${s === 'done' ? 'full' : s === 'partial' || s === 'replaced' ? 'part' : ''}" title="${esc(fmtDate(st.dates[i], {weekday: 'short'}))} : ${esc(STATUS_LABEL[s] || 'non noté')}"></i>`).join('')}</div><b>${ok}/7</b></div>`;
    })
    .join('');
  const rc = {};
  logs.forEach((l) =>
    Object.values(l?.meals || {}).forEach((m) => (m.reasons || []).forEach((r) => (rc[r] = (rc[r] || 0) + 1))),
  );
  const reasons = Object.entries(rc)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);
  $('reasons').innerHTML = reasons.length
    ? reasons
        .map(([r, n]) => `<div class="row between" style="margin:8px 0"><span>${esc(r)}</span><b>${n}</b></div>`)
        .join('')
    : '<div class="empty">Pas encore de raisons notées.</div>';
  const avg = (k) => {
    const a = logs.map((l) => num(l?.[k])).filter((v) => v > 0);
    return a.length ? a.reduce((s, v) => s + v, 0) / a.length : null;
  };
  const fmtAvg = (v, d = 1) => (v === null ? '—' : fr(v, d));
  $('averages').innerHTML =
    `<div class="metric"><strong>${fmtAvg(avg('energy'))}/5</strong><span>Énergie</span></div><div class="metric"><strong>${fmtAvg(avg('hunger'))}/5</strong><span>Faim</span></div><div class="metric"><strong>${avg('water') === null ? '—' : Math.round(avg('water')).toLocaleString('fr-FR')} ml</strong><span>Eau</span></div><div class="metric"><strong>${fmtAvg(avg('sleep'))} h</strong><span>Sommeil</span></div>`;
  // alertes de sécurité
  const alerts = [],
    ws = sortedWeights();
  if (ws.length >= 2) {
    const a = ws[ws.length - 2],
      b = ws[ws.length - 1],
      weeks = (dateObj(b.date) - dateObj(a.date)) / 6048e5;
    if (weeks >= 0.5 && (num(a.kg) - num(b.kg)) / weeks > 1)
      alerts.push(
        'Perte de plus de 1 kg par semaine entre les deux dernières pesées. On augmente un peu les portions : préviens Bertrand.',
      );
  }
  const fl = st.dates.map((d) => data.logs[d]).filter((l) => l && num(l.feedsDay) + num(l.feedsNight) > 0);
  if (isBreastfeeding() && fl.length >= 4) {
    const mean = (a) => a.reduce((s, l) => s + num(l.feedsDay) + num(l.feedsNight), 0) / a.length;
    if (mean(fl.slice(0, 3)) - mean(fl.slice(-3)) >= 2)
      alerts.push(
        'Les tétées ont baissé d’au moins 2 par jour. Vérifie avec une infirmière, une sage-femme ou une consultante en lactation.',
      );
  }
  const e = avg('energy');
  if (e !== null && e <= 2)
    alerts.push('Ton énergie moyenne est basse (2/5 ou moins). Repose-toi et parles-en à ton médecin si ça continue.');
  const h = avg('hunger');
  if (h !== null && h >= 4.5)
    alerts.push(
      'Tu as très faim presque tous les jours : les portions sont peut-être trop petites pour l’allaitement. Préviens Bertrand.',
    );
  $('alerts').innerHTML = alerts.map((a) => `<div class="alert danger">⚠️ ${esc(a)}</div>`).join('');
  renderGoal();
  renderKcalBars();
  // tendance
  {
    const ws = weightsWithStart();
    if (ws.length) {
      const base = num(data.settings.startWeight, ws[0].kg),
        last = num(ws[ws.length - 1].kg),
        weeks = Math.max(
          0,
          (dateObj(ws[ws.length - 1].date) - dateObj(data.settings.startDate || ws[0].date)) / 6048e5,
        );
      $('weightTrendText').textContent =
        `Depuis le départ : ${last - base > 0 ? '+' : ''}${fr(last - base)} kg${weeks >= 1 ? ` en ${fr(weeks, 0)} semaine${weeks >= 1.5 ? 's' : ''} (${fr((last - base) / weeks, 2)} kg/sem.)` : ''}.`;
    } else $('weightTrendText').textContent = '';
  }
  drawChart();
}
/* ---------- Résumé pour l’analyse ---------- */
function summaryText() {
  const st = weekStats(),
    s = data.settings,
    ws = sortedWeights();
  const L = [
    `OliWeight — résumé du ${fmtDate(st.dates[0], {day: 'numeric', month: 'long'})} au ${fmtDate(st.dates[6], {day: 'numeric', month: 'long', year: 'numeric'})}`,
    `${s.menuLabel || ''} · départ ${fr(num(s.startWeight))} kg le ${s.startDate} · cible −${fr(num(s.targetLoss))} kg/sem.`,
    '',
  ];
  {
    const g = goalStats();
    if (g.total > 0)
      L.push(
        `OBJECTIF : ${fr(g.target)} kg · reste ${fr(g.left)} kg · ${fr(g.pct, 0)} % fait · date probable ${g.planDate ? fmtMonth(g.planDate) : '—'} (prévu) / ${g.realDate ? fmtMonth(g.realDate) : '—'} (réel${g.real !== null ? ` ${fr(g.real, 2)} kg/sem.` : ''})`,
        '',
      );
  }
  {
    const ks = st.dates.map((d) => eatenKcal(d).k).filter((v) => v > 0);
    if (ks.length)
      L.push(
        `CALORIES : moyenne ${fmtK(ks.reduce((a, b) => a + b, 0) / ks.length)} kcal/jour noté · limite ${fmtK(kcalLimit())} · minimum ${fmtK(kcalMin())}`,
        '',
      );
  }
  L.push(...profileSummary());
  if (isPaused()) L.push(`MODE PAUSE : ${pauseReason()}`, '');
  if (menusToReview()) L.push('⚠ PROFIL MODIFIÉ : menus à réviser', '');
  L.push('POIDS');
  if (ws.length)
    ws.slice(-4).forEach((w) => L.push(`- ${w.date} : ${fr(num(w.kg))} kg${w.waist ? ` · taille ${w.waist} cm` : ''}`));
  else L.push('- aucune pesée');
  L.push(
    '',
    `REPAS : ${st.tracked ? Math.round((st.done / st.tracked) * 100) : 0} % respectés (${st.done} sur ${st.tracked} repas notés · 35 prévus) · ${st.complete}/7 jours complets`,
  );
  st.slot.forEach((arr, j) =>
    L.push(
      `- ${SLOT_SHORT[j]} : ${arr.filter((x) => x === 'done').length} respectés, ${arr.filter((x) => x === 'partial').length} partiels, ${arr.filter((x) => x === 'replaced').length} remplacés, ${arr.filter((x) => x === 'skipped').length} sautés, ${arr.filter((x) => !x).length} non notés`,
    ),
  );
  L.push('', 'JOUR PAR JOUR');
  st.dates.forEach((d, i) => {
    const l = st.logs[i];
    if (!l) {
      L.push(`${fmtDate(d, {weekday: 'short', day: 'numeric'})} : rien de noté`);
      return;
    }
    const codes = effCodes(d),
      meals = codes
        .map((c, j) => {
          const m = l.meals?.[j];
          if (!m?.status) return `${c} ?`;
          let t = `${c} ${{done: '✓', partial: 'partiel', replaced: 'remplacé', skipped: 'sauté'}[m.status]}`;
          if (m.status === 'partial' && m.reasons?.length) t += ` (${m.reasons.join(', ')})`;
          if (m.status === 'replaced' && m.replacement)
            t += ` (${m.replacement}${num(m.kcal) > 0 ? ', ≈ ' + fmtK(m.kcal) + ' kcal' : ''})`;
          if (m.adds?.length) t += ` [+${m.adds.map((a) => a.label).join(', ')}]`;
          return t;
        })
        .join(' · ');
    if (l.extras?.length)
      L.push(
        `   extras : ${l.extras.map((x) => x.name + (num(x.kcal) > 0 ? ' ≈ ' + fmtK(x.kcal) + ' kcal' : ' (kcal ?)')).join(', ')}`,
      );
    L.push(`${fmtDate(d, {weekday: 'short', day: 'numeric'})} : ${meals}`);
    L.push(
      `   ≈ ${fmtK(eatenKcal(d).k)} kcal mangées / ${fmtK(dayKcal(d))} prévues · eau ${num(l.water)} ml · pas ${l.steps || '—'} · sommeil ${l.sleep || '—'} h · tétées ${num(l.feedsDay)}+${num(l.feedsNight)} · énergie ${l.energy || '—'}/5 · faim ${l.hunger || '—'}/5${l.note ? ` · note : ${l.note.replace(/\s+/g, ' ')}` : ''}`,
    );
  });
  return L.join('\n');
}
async function copySummary() {
  const t = summaryText();
  try {
    await navigator.clipboard.writeText(t);
    toast('Résumé copié : colle-le dans WhatsApp.');
  } catch (e) {
    download('oliweight-resume.txt', t, 'text/plain;charset=utf-8');
    toast('Résumé téléchargé (copie impossible).');
  }
}
async function shareText(title, text) {
  if (navigator.share) {
    try {
      await navigator.share({title, text});
      return;
    } catch (e) {
      if (e.name === 'AbortError') return;
    }
  }
  try {
    await navigator.clipboard.writeText(text);
    toast('Copié.');
  } catch (e) {
    download('oliweight.txt', text, 'text/plain;charset=utf-8');
  }
}
