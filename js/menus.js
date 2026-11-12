'use strict';
/* OliWeight — semaines de menus, échanges de jours, liste de courses */
/* ---------- Menus et courses ---------- */
function weekStartOf(date) {
  const d = dateObj(date);
  d.setDate(d.getDate() - ((d.getDay() || 7) - 1));
  return localDate(d);
}
function weekKey() {
  return weekStartOf(todayISO());
}
function weekEnd(start) {
  return shiftDate(start, 6);
}

function swapPlan(plan, sw) {
  const p = clone(plan),
    g = (k) => p[String(k)] || [];
  if (sw.mode === 'bloc') {
    const A = BLOCS[sw.a],
      B = BLOCS[sw.b];
    if (!A || !B) return p;
    [0, 1].forEach((i) => {
      const t = p[A[i]];
      p[A[i]] = p[B[i]];
      p[B[i]] = t;
    });
  } else if (sw.mode === 'day') {
    const t = p[sw.a];
    p[sw.a] = p[sw.b];
    p[sw.b] = t;
  } else {
    const idx = sw.mode === 'souper' ? 4 : 2,
      a = g(sw.a).slice(),
      b = g(sw.b).slice();
    const t = a[idx];
    a[idx] = b[idx];
    b[idx] = t;
    p[sw.a] = a;
    p[sw.b] = b;
  }
  return p;
}
function effPlan(w) {
  return (w.swaps || []).reduce(swapPlan, clone(w.basePlan || {}));
}
function validWeek(w) {
  return (
    w &&
    isDate(w.startDate) &&
    w.plan &&
    typeof w.plan === 'object' &&
    Object.entries(w.plan).every(([k, v]) => /^[1-7]$/.test(k) && Array.isArray(v) && v.length === 5)
  );
}
function cleanMeals(m) {
  const out = {};
  Object.entries(m || {}).forEach(([k, v]) => {
    if (/^[\w-]{1,8}$/.test(k) && v && typeof (v.nom ?? v.name) === 'string')
      out[k] = {
        nom: String(v.nom ?? v.name).slice(0, 100),
        details: String(v.details || '').slice(0, 900),
        ing: Array.isArray(v.ing) ? v.ing.map(String).slice(0, 40) : [],
        ...(num(v.kcal, 0) > 0 ? {kcal: Math.round(num(v.kcal))} : {}),
      };
  });
  return out;
}
// Ajoute ou met à jour des semaines (fichier, repo ou cycle intégré). Une semaine n'est remplacée que si sa révision est plus récente ; les échanges de jours sont conservés.
function mergeWeeks(d, list) {
  let n = 0;
  const today = todayISO();
  (list || []).forEach((raw) => {
    const w = {...raw, plan: raw.plan || raw.basePlan};
    if (!validWeek(w)) return;
    const rev = num(w.rev, 1),
      meals = cleanMeals(w.meals);
    if (d.current && w.startDate === d.current.startDate) {
      if (rev > num(d.current.rev, 0)) {
        Object.assign(d.meals, meals);
        d.current.basePlan = {...d.current.basePlan, ...clone(w.plan)};
        d.current.rev = rev;
        if (w.label) {
          d.current.label = String(w.label).slice(0, 60);
          d.settings.menuLabel = d.current.label;
        }
        d.plan = effPlan(d.current);
        n++;
      }
      return;
    }
    if (weekEnd(w.startDate) < today) return;
    const ex = d.weeks.find((x) => x.startDate === w.startDate);
    if (!ex) {
      d.weeks.push({
        startDate: w.startDate,
        label: String(w.label || '').slice(0, 60),
        rev,
        meals,
        basePlan: clone(w.plan),
        swaps: [],
      });
      n++;
    } else if (rev > num(ex.rev, 0)) {
      ex.rev = rev;
      ex.meals = meals;
      ex.basePlan = clone(w.plan);
      if (w.label) ex.label = String(w.label).slice(0, 60);
      n++;
    }
  });
  d.weeks.sort((a, b) => a.startDate.localeCompare(b.startDate));
  return n;
}
// Le lundi, la semaine suivante devient la semaine en cours ; l'ancienne est archivée pour l'historique.
function applyDueWeeks() {
  let ch = false;
  const t = todayISO();
  while (data.weeks.length && data.weeks[0].startDate <= t) {
    const w = data.weeks.shift();
    if (data.current) data.history[data.current.startDate] = clone(data.plan);
    Object.assign(data.meals, w.meals || {});
    data.current = {startDate: w.startDate, label: w.label, rev: w.rev, basePlan: w.basePlan, swaps: w.swaps || []};
    data.plan = effPlan(data.current);
    if (w.label) data.settings.menuLabel = w.label;
    ch = true;
  }
  return ch;
}
let menuTab = 'week',
  viewWeek = 'cur';
function viewObj() {
  if (viewWeek === 'cur') return null;
  const w = data.weeks.find((x) => x.startDate === viewWeek);
  if (!w) {
    viewWeek = 'cur';
    return null;
  }
  return w;
}
function vPlan() {
  const w = viewObj();
  return w ? effPlan(w) : data.plan;
}
function vMeal(code) {
  const w = viewObj();
  return (w && w.meals[code]) || data.meals[code] || {nom: code, details: '', ing: []};
}
function vStart() {
  const w = viewObj();
  return w ? w.startDate : data.current?.startDate || weekKey();
}
function usedOn(code) {
  return Object.entries(vPlan())
    .filter(([, arr]) => arr.includes(code))
    .map(([d]) => DAYS[d]);
}
function setMenuTab(t) {
  menuTab = t;
  document.querySelectorAll('[data-menutab]').forEach((x) => x.classList.toggle('active', x.dataset.menutab === t));
  $('menuWeek').classList.toggle('hidden', t !== 'week');
  $('menuShop').classList.toggle('hidden', t !== 'shop');
  $('menuRecipes').classList.toggle('hidden', t !== 'recipes');
  $('weekChips').classList.toggle('hidden', t === 'recipes');
  if (t === 'recipes') renderRecipes();
  else renderMenus();
}
function renderChips() {
  const opts = [['cur', 'Cette semaine']].concat(
    data.weeks.map((w) => [w.startDate, 'Sem. du ' + fmtDate(w.startDate, {day: 'numeric', month: 'short'})]),
  );
  $('weekChips').innerHTML = opts
    .map(([k, l]) => `<button data-week="${esc(k)}" class="${viewWeek === k ? 'active' : ''}">${esc(l)}</button>`)
    .join('');
}
function renderSwapSelects() {
  const mode = $('swapMode').value,
    cur = viewWeek === 'cur',
    today = dayIndex(todayISO());
  let opts =
    mode === 'bloc'
      ? [
          ['1', 'Lundi-Mardi'],
          ['3', 'Mercredi-Jeudi'],
          ['5', 'Vendredi-Samedi'],
        ]
      : DAYS.slice(1).map((d, i) => [String(i + 1), d]);
  if (cur) opts = opts.filter(([k]) => Number(k) >= today);
  const html = opts.map(([k, l]) => `<option value="${k}">${esc(l)}</option>`).join('');
  const a = $('swapA').value,
    b = $('swapB').value;
  $('swapA').innerHTML = html;
  $('swapB').innerHTML = html;
  if (opts.some((o) => o[0] === a)) $('swapA').value = a;
  if (opts.some((o) => o[0] === b) && b !== $('swapA').value) $('swapB').value = b;
  else {
    const o = opts.find((o) => o[0] !== $('swapA').value);
    if (o) $('swapB').value = o[0];
  }
  $('swapDo').disabled = opts.length < 2;
  $('swapUndo').disabled = !((viewObj() || data.current)?.swaps || []).length;
}
function renderMenus() {
  renderChips();
  const w = viewObj(),
    plan = vPlan(),
    st = vStart();
  $('menuLabel').textContent = (w ? w.label : data.current?.label || data.settings.menuLabel) || '';
  $('weekInfo').textContent =
    `Du ${fmtDate(st, {weekday: 'long', day: 'numeric', month: 'long'})} au ${fmtDate(weekEnd(st), {weekday: 'long', day: 'numeric', month: 'long'})}.${w ? ' Ces menus remplaceront automatiquement ceux de la semaine en cours le lundi.' : ''} Tu peux modifier un repas ou échanger des jours.`;
  const today = String(dayIndex(todayISO()));
  $('menuDays').innerHTML = Array.from({length: 7}, (_, i) => {
    const day = String(i + 1),
      arr = plan[day] || [];
    return `<details class="day-panel" ${!w && day === today ? 'open' : ''}><summary>${DAYS[day]} <span class="muted small">· ${esc(vMeal(arr[4]).nom)} · ≈ ${fmtK(arr.reduce((t, c) => t + kcalOf(c, vMeal(c)), 0))} kcal</span></summary><div class="day-content">${SLOTS.map(
      (slot, j) => {
        const code = arr[j] || '';
        const m = vMeal(code);
        const others = usedOn(code).filter((d) => d !== DAYS[day]);
        return `<div class="meal-edit"><div class="small muted">${esc(slot)} · ${esc(code)} · ≈ ${fmtK(kcalOf(code, m))} kcal${others.length ? ' · aussi ' + esc(others.join(', ')) : ''}</div>${photoBlock(m)}<div class="field"><label>Nom du repas</label><input data-menu-name="${day}-${j}" value="${esc(m.nom)}" maxlength="100"></div><div class="field"><label>Détails et portions</label><textarea data-menu-details="${day}-${j}" maxlength="900">${esc(m.details)}</textarea></div></div>`;
      },
    ).join('')}</div></details>`;
  }).join('');
  renderSwapSelects();
  renderShop();
}
function shoppingItems() {
  const map = new Map();
  Object.values(vPlan()).forEach((arr) =>
    arr.forEach((code) => {
      (vMeal(code).ing || []).forEach((raw) => {
        const [c, name] = String(raw).includes(':') ? String(raw).split(/:(.*)/s) : ['E', String(raw)];
        const k = name.trim().toLowerCase();
        if (!k) return;
        if (!map.has(k)) map.set(k, {name: name.trim(), cat: CATS[c] ? c : 'E', codes: new Set()});
        map.get(k).codes.add(code);
      });
    }),
  );
  return [...map.values()].sort((a, b) => a.name.localeCompare(b.name, 'fr'));
}
function shopChecked() {
  const st = vStart();
  data.shopByWeek = data.shopByWeek || {};
  Object.keys(data.shopByWeek).forEach((k) => {
    if (weekEnd(k) < shiftDate(todayISO(), -14)) delete data.shopByWeek[k];
  });
  if (!data.shopByWeek[st]) data.shopByWeek[st] = {};
  return data.shopByWeek[st];
}
function renderShop() {
  const items = shoppingItems(),
    checked = shopChecked(),
    st = vStart();
  $('shopInfo').textContent =
    `Semaine du ${fmtDate(st, {day: 'numeric', month: 'long'})}. Coche au fur et à mesure. Les plats sont cuisinés pour 2 jours.`;
  $('shopCount').textContent = `${items.filter((i) => checked[i.name.toLowerCase()]).length}/${items.length}`;
  $('shopList').innerHTML =
    Object.entries(CATS)
      .map(([c, label]) => {
        const list = items.filter((i) => i.cat === c);
        if (!list.length) return '';
        return (
          `<div class="shop-cat">${esc(label)}</div>` +
          list
            .map((i) => {
              const k = i.name.toLowerCase(),
                on = !!checked[k];
              return `<label class="shop-item ${on ? 'done' : ''}"><input type="checkbox" data-shop="${esc(k)}" ${on ? 'checked' : ''}><span>${esc(i.name)}</span><small>${esc([...i.codes].join(' '))}</small></label>`;
            })
            .join('')
        );
      })
      .join('') || '<div class="empty">Ajoute des ingrédients aux menus pour générer la liste.</div>';
}
function shopText() {
  const items = shoppingItems(),
    checked = shopChecked();
  return [
    '🛒 OliWeight — courses semaine du ' + fmtDate(vStart(), {day: 'numeric', month: 'long'}),
    ...Object.entries(CATS).flatMap(([c, label]) => {
      const l = items.filter((i) => i.cat === c && !checked[i.name.toLowerCase()]);
      return l.length ? ['', label.toUpperCase(), ...l.map((i) => '- ' + i.name)] : [];
    }),
  ].join('\n');
}

/* ---------- Pesée ---------- */
