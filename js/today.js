'use strict';
/* OliWeight — écran Aujourd'hui : anneau des calories, repas, extras */
function renderExtras() {
  const l = data.logs[selectedDate] || {},
    ex = l.extras || [];
  $('extrasList').innerHTML = ex.length
    ? ex
        .map(
          (x, i) =>
            `<div class="extra-row"><span>${esc(x.name)}</span><b class="small">${num(x.kcal) > 0 ? '≈ ' + fmtK(x.kcal) + ' kcal' : 'kcal ?'}</b><button data-extra-del="${i}" aria-label="Retirer ${esc(x.name)}">✕</button></div>`,
        )
        .join('')
    : '<div class="small muted">Rien en extra pour l’instant.</div>';
  $('extrasTotal').textContent = ex.length ? `Total extras : ≈ ${fmtK(extrasKcal(l))} kcal` : '';
}
function renderRing() {
  const d = selectedDate,
    {k, unknown} = eatenKcal(d),
    lim = kcalLimit(),
    plan = dayKcal(d),
    R = 88,
    C = 2 * Math.PI * R,
    frac = Math.min(1, k / lim),
    over = k > lim,
    minFrac = kcalMin() / lim;
  const t = todayISO(),
    now = new Date(),
    [ch, cm] = String(data.settings.cutoffTime || '21:00')
      .split(':')
      .map(Number),
    late = d < t || (d === t && (now.getHours() > ch || (now.getHours() === ch && now.getMinutes() >= cm)));
  let state, cls;
  if (isPaused()) {
    state = 'Mode pause : mange normalement';
    cls = 'var(--brand)';
  } else if (over) {
    state = `Limite dépassée de ${fmtK(k - lim)} kcal`;
    cls = 'var(--warn)';
  } else if (late && k < kcalMin()) {
    state = `Sous ${fmtK(kcalMin())} kcal : trop peu${isBreastfeeding() ? ' pour l’allaitement' : ''}`;
    cls = 'var(--danger)';
  } else if (k >= kcalMin()) {
    state = `Dans la zone · reste ${fmtK(lim - k)} kcal`;
    cls = 'var(--brand)';
  } else {
    state = `Reste ${fmtK(lim - k)} kcal avant la limite`;
    cls = 'var(--brand)';
  }
  const ang = (a) => {
    const r = a * 2 * Math.PI;
    return [100 + R * Math.cos(r), 100 + R * Math.sin(r)];
  };
  const [x1, y1] = ang(minFrac),
    [x2, y2] = ang(Math.min(minFrac, 1));
  $('kcalRing').innerHTML =
    `<div class="ring-wrap"><svg viewBox="0 0 200 200" aria-hidden="true"><circle cx="100" cy="100" r="${R}" fill="none" stroke="var(--surface2)" stroke-width="16"/><circle cx="100" cy="100" r="${R}" fill="none" stroke="${over ? 'var(--warn)' : 'var(--brand)'}" stroke-width="16" stroke-linecap="round" stroke-dasharray="${C}" stroke-dashoffset="${C * (1 - frac)}" style="transition:stroke-dashoffset .6s ease"/>${minFrac < 1 ? `<line x1="${100 + (R - 12) * Math.cos(minFrac * 2 * Math.PI)}" y1="${100 + (R - 12) * Math.sin(minFrac * 2 * Math.PI)}" x2="${100 + (R + 12) * Math.cos(minFrac * 2 * Math.PI)}" y2="${100 + (R + 12) * Math.sin(minFrac * 2 * Math.PI)}" stroke="var(--text)" stroke-width="2.5" stroke-linecap="round"/>` : ''}</svg><div class="ring-center"><strong>${fmtK(k)}</strong><span>/ ${fmtK(lim)} kcal</span><span>mangées</span></div></div>
 <div class="ring-state" style="color:${cls}">${esc(state)}</div>
 <div class="ring-legend"><span><i style="background:var(--brand)"></i>Mangées</span><span><i style="background:var(--text)"></i>Minimum ${fmtK(kcalMin())}</span><span>Prévu aujourd’hui ≈ ${fmtK(plan)}</span></div>${unknown ? `<div class="small muted" style="margin-top:6px">${unknown} repas remplacé${unknown > 1 ? 's' : ''} sans calories : ajoute une estimation pour un total juste.</div>` : ''}`;
  $('kcalRing').setAttribute('aria-label', `${fmtK(k)} calories mangées sur une limite de ${fmtK(lim)}. ${state}`);
}
function renderToday() {
  const l = logFor(selectedDate),
    s = data.settings,
    t = todayISO();
  $('headerDate').textContent = fmtDate(t, {day: 'numeric', month: 'short'});
  $('todayLabel').textContent = fmtDate(selectedDate) + ' · ' + (s.menuLabel || '');
  $('prevDay').disabled = selectedDate <= shiftDate(t, -60);
  $('nextDay').disabled = selectedDate >= t;
  $('waterGoalLabel').textContent = num(s.waterGoal).toLocaleString('fr-FR');
  $('waterValue').textContent = num(l.water).toLocaleString('fr-FR') + ' ml';
  $('feedsDayValue').textContent = num(l.feedsDay);
  $('feedsNightValue').textContent = num(l.feedsNight);
  if (document.activeElement?.id !== 'steps') $('steps').value = l.steps ?? '';
  if (document.activeElement?.id !== 'sleep') $('sleep').value = l.sleep ?? '';
  if (document.activeElement?.id !== 'note') $('note').value = l.note ?? '';
  $('todayMetrics').innerHTML =
    `<div class="metric"><strong>${mealsDone(l)}/5</strong><span>Repas respectés</span></div><div class="metric"><strong>${num(l.water).toLocaleString('fr-FR')} ml</strong><span>Eau / ${num(s.waterGoal).toLocaleString('fr-FR')}</span></div><div class="metric"><strong>${num(l.steps).toLocaleString('fr-FR')}</strong><span>Pas / ${num(s.stepsGoal).toLocaleString('fr-FR')}</span></div><div class="metric"><strong>${num(l.feedsDay) + num(l.feedsNight)}</strong><span>Tétées</span></div>`;
  renderRing();
  renderExtras();
  const slots = effCodes(selectedDate),
    base = planFor(selectedDate);
  $('todayMeals').innerHTML = slots
    .map((code, i) => {
      const m = data.meals[code] || {nom: code, details: ''},
        v = l.meals[i] || {};
      const opts = [
        base[i],
        ...(code !== base[i] ? [code] : []),
        ...equivalents(base[i], i).map((r) => r.code),
        ...pinnedOptions(i),
      ].filter((c, j, a) => a.indexOf(c) === j && (j < 2 || c !== code));
      opts.forEach(ensureMeal);
      return `<article class="card meal-card" data-meal="${i}"><div class="row between"><div><div class="pill">${esc(SLOTS[i])} · ${esc(code)} · ≈ ${fmtK(kcalOf(code))} kcal</div><div class="meal-title" style="margin-top:7px">${esc(m.nom)}</div></div><span class="pill ${v.status === 'done' ? 'ok' : ''}">${esc(STATUS_LABEL[v.status] || 'À faire')}</span></div>${photoBlock(m)}<div class="meal-detail">${esc(m.details)}</div>${opts.length > 1 ? `<div class="field" style="margin-top:-4px"><label class="small muted">Changer pour un plat équivalent (calories proches)</label><select data-alt>${opts.map((c) => `<option value="${esc(c)}" ${c === code ? 'selected' : ''}>${c === base[i] ? 'Prévu : ' : ''}${esc(data.meals[c].nom)} · ≈ ${fmtK(kcalOf(c))} kcal</option>`).join('')}</select></div>` : ''}<div class="statuses">${[
        ['done', '✅ Fait'],
        ['partial', '🟡 Partiel'],
        ['replaced', '🔄 Remplacé'],
        ['skipped', '❌ Sauté'],
      ]
        .map(
          ([st, label]) =>
            `<button data-status="${st}" class="${v.status === st ? 'active' : ''}" aria-pressed="${v.status === st}">${label}</button>`,
        )
        .join(
          '',
        )}</div><div class="${v.status === 'partial' ? '' : 'hidden'}"><div class="small muted" style="margin-top:10px">Pourquoi partiel ?</div><div class="reason-list">${REASONS.map((r) => `<label><input type="checkbox" data-reason="${esc(r)}" ${(v.reasons || []).includes(r) ? 'checked' : ''}> ${esc(r)}</label>`).join('')}</div></div><div class="${v.status === 'replaced' ? '' : 'hidden'} field"><label>Par quoi as-tu remplacé ce repas ?</label><input data-replacement type="text" maxlength="160" value="${esc(v.replacement || '')}" placeholder="Ex. 2 beignets + bouillie"><label class="small muted" style="margin-top:6px">Calories estimées (facultatif)</label><input data-repl-kcal type="number" min="0" max="3000" step="10" inputmode="numeric" value="${v.kcal || ''}" placeholder="Ex. 450"></div><div class="adds">${ADDS.map(([lab, k], j) => `<button type="button" data-add="${j}">+ ${esc(lab.split(' +')[0])} <span class="muted">${k}</span></button>`).join('')}</div>${(v.adds || []).length ? `<div class="adds-info">Ajouts : ${esc(v.adds.map((a) => a.label).join(', '))} · +${fmtK(addsKcal(v))} kcal <button type="button" data-add-undo style="min-height:30px;padding:2px 8px;font-size:.75rem">Annuler le dernier</button></div>` : ''}</article>`;
    })
    .join('');
  ['energy', 'hunger'].forEach((k) => {
    $(k + 'Scale').innerHTML = [1, 2, 3, 4, 5]
      .map(
        (n) =>
          `<button data-scale="${k}" data-value="${n}" class="${num(l[k]) === n ? 'active' : ''}" aria-pressed="${num(l[k]) === n}">${n}</button>`,
      )
      .join('');
  });
  $('allDone').classList.toggle('hidden', isComplete(l, selectedDate));
  // bandeaux
  const b = [];
  const now = new Date(),
    [hh, mm] = String(s.reminderTime || '20:00')
      .split(':')
      .map(Number);
  if (
    selectedDate === t &&
    !isComplete(l, t) &&
    (now.getHours() > hh || (now.getHours() === hh && now.getMinutes() >= mm))
  )
    b.push('<div class="alert">⏰ C’est l’heure de noter ta journée : il reste des repas sans statut.</div>');
  if (selectedDate === t && dateObj(t).getDay() === num(s.weighDay) && !data.weights.some((w) => w.date === t))
    b.push(
      '<div class="alert info">⚖️ C’est le jour de la pesée : le matin, à jeun, avant de manger. <button data-goto="weigh" style="margin-top:8px;width:100%">Aller à la pesée</button></div>',
    );
  if (selectedDate === t && dateObj(t).getDay() === 0)
    b.push(
      '<div class="alert info">📋 Dimanche : pense à envoyer ton résumé de la semaine à Bertrand. <button data-copy-summary style="margin-top:8px;width:100%">Copier le résumé</button></div>',
    );
  const daysLogged = Object.keys(data.logs).length,
    lb = data.meta.lastBackup;
  if (daysLogged >= 7 && (!lb || Date.now() - new Date(lb).getTime() > 7 * 864e5))
    b.push(
      '<div class="alert">💾 Pas de sauvegarde depuis plus de 7 jours. <button data-backup style="margin-top:8px;width:100%">Sauvegarder maintenant</button></div>',
    );
  {
    const [ch, cm] = String(s.cutoffTime || '21:00')
      .split(':')
      .map(Number);
    if (selectedDate === t && (now.getHours() > ch || (now.getHours() === ch && now.getMinutes() >= cm)))
      b.push(
        `<div class="alert info">🌙 Cuisine fermée depuis ${esc(s.cutoffTime || '21:00')} : eau ou tisane sans sucre. Si vraie faim pendant les tétées de nuit, un verre de lait.</div>`,
      );
  }
  if (selectedDate === t && data.weeks?.length && dayIndex(t) >= 4)
    b.push(
      `<div class="alert info">⏭️ Les menus de la semaine prochaine sont prêts (début le ${esc(fmtDate(data.weeks[0].startDate, {weekday: 'long', day: 'numeric'}))}). <button data-goto="menus" data-week="${esc(data.weeks[0].startDate)}" style="margin-top:8px;width:100%">Voir les menus et la liste de courses</button></div>`,
    );
  if (memoryOnly)
    b.push(
      '<div class="alert danger">Le stockage du téléphone est indisponible : tes saisies risquent d’être perdues. Sauvegarde tes données.</div>',
    );
  if (selectedDate === todayISO()) b.unshift(...profileBanners(), ...ruleBanners());
  applyRulesToUI();
  $('banners').innerHTML = b.join('');
}
