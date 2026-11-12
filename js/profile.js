'use strict';
/* OliWeight — profil de la personne et écran de premier lancement (fiche #2) */
const HEALTH = [
  ['diabete', 'Diabète'],
  ['hypertension', 'Hypertension'],
  ['anemie', 'Anémie'],
  ['rein', 'Maladie des reins'],
  ['thyroide', 'Thyroïde'],
  ['coeliaque', 'Maladie cœliaque (gluten)'],
  ['tca', 'Antécédents de troubles alimentaires'],
];
const PROFILE_FIELDS = [
  {k: 'prenom', label: 'Prénom', type: 'text', max: 40, req: true},
  {k: 'age', label: 'Âge', type: 'number', min: 10, max: 110, req: true},
  {k: 'taille', label: 'Taille (cm)', type: 'number', min: 120, max: 230},
  {k: 'startWeight', label: 'Poids actuel (kg)', type: 'number', min: 30, max: 400, step: 0.1, set: true, req: true},
  {k: 'targetWeight', label: 'Poids visé (kg)', type: 'number', min: 30, max: 400, step: 0.1, set: true},
  {
    k: 'activite',
    label: 'Activité physique',
    type: 'select',
    opts: [
      ['sedentaire', 'Peu active (surtout assise)'],
      ['legere', 'Légère (marche quotidienne)'],
      ['moderee', 'Modérée (sport 2-3 fois/semaine)'],
      ['elevee', 'Élevée (sport presque tous les jours)'],
    ],
  },
  {k: 'allaitement', label: 'J’allaite', type: 'yesno'},
  {k: 'grossesse', label: 'Je suis enceinte', type: 'yesno'},
  {k: 'sante', label: 'Santé (coche ce qui s’applique)', type: 'checks', opts: HEALTH},
  {k: 'medicaments', label: 'Médicaments réguliers (facultatif)', type: 'text', max: 120},
  {k: 'allergies', label: 'Allergies ou intolérances', type: 'text', max: 120, ph: 'Ex. arachide, lactose'},
  {
    k: 'aimes',
    label: 'Plats et aliments que j’aime',
    type: 'textarea',
    max: 400,
    ph: 'Ex. ndolé, poulet DG, salade, poisson braisé',
  },
  {k: 'refuses', label: 'Aliments que je ne mange pas', type: 'text', max: 200, ph: 'Ex. porc, champignons'},
  {
    k: 'budget',
    label: 'Budget pour la nourriture',
    type: 'select',
    opts: [
      ['serre', 'Serré'],
      ['moyen', 'Moyen'],
      ['confortable', 'Confortable'],
    ],
  },
  {
    k: 'temps',
    label: 'Temps pour cuisiner',
    type: 'select',
    opts: [
      ['court', 'Moins de 20 min'],
      ['moyen', '20 à 45 min'],
      ['long', 'Plus de 45 min'],
    ],
  },
  {k: 'foyer', label: 'Personnes à la maison', type: 'number', min: 1, max: 15},
  {k: 'deuxJours', label: 'Je cuisine une fois pour 2 jours', type: 'yesno', def: true},
];
function profileFormHTML(prefix) {
  const p = data.profile || {},
    s = data.settings;
  return PROFILE_FIELDS.map((f) => {
    const id = prefix + f.k,
      v = f.set ? (s[f.k] ?? '') : (p[f.k] ?? f.def ?? ''),
      req = f.req ? ' <span class="muted">*</span>' : '';
    if (f.type === 'select')
      return `<div class="field"><label for="${id}">${esc(f.label)}</label><select id="${id}" data-pf="${f.k}"><option value="">—</option>${f.opts.map(([o, l]) => `<option value="${o}" ${v === o ? 'selected' : ''}>${esc(l)}</option>`).join('')}</select></div>`;
    if (f.type === 'yesno')
      return `<div class="field"><label for="${id}">${esc(f.label)}</label><select id="${id}" data-pf="${f.k}"><option value="non" ${v !== true ? 'selected' : ''}>Non</option><option value="oui" ${v === true ? 'selected' : ''}>Oui</option></select></div>`;
    if (f.type === 'checks')
      return `<div class="field"><label>${esc(f.label)}</label><div class="reason-list">${f.opts.map(([o, l]) => `<label><input type="checkbox" data-pf="${f.k}" value="${o}" ${(v || []).includes(o) ? 'checked' : ''}> ${esc(l)}</label>`).join('')}</div></div>`;
    if (f.type === 'textarea')
      return `<div class="field"><label for="${id}">${esc(f.label)}</label><textarea id="${id}" data-pf="${f.k}" maxlength="${f.max}" placeholder="${esc(f.ph || '')}">${esc(v)}</textarea></div>`;
    const extra =
      f.type === 'number'
        ? ` min="${f.min}" max="${f.max}" step="${f.step || 1}" inputmode="${f.step ? 'decimal' : 'numeric'}"`
        : ` maxlength="${f.max}"`;
    return `<div class="field"><label for="${id}">${esc(f.label)}${req}</label><input id="${id}" type="${f.type}" data-pf="${f.k}" value="${esc(v)}"${extra} placeholder="${esc(f.ph || '')}"></div>`;
  }).join('');
}
// Lit le formulaire ; renvoie {profile, settings, errors}
function readProfileForm(root) {
  const p = {...(data.profile || {})},
    s = {},
    errors = [];
  PROFILE_FIELDS.forEach((f) => {
    if (f.type === 'checks') {
      p[f.k] = [...root.querySelectorAll(`[data-pf="${f.k}"]:checked`)].map((x) => x.value);
      return;
    }
    const el = root.querySelector(`[data-pf="${f.k}"]`);
    if (!el) return;
    let v = el.value.trim();
    if (f.type === 'yesno') v = v === 'oui';
    else if (f.type === 'number') v = v === '' ? '' : num(v);
    if (f.req && (v === '' || v === 0)) errors.push(f.label);
    if (f.set) s[f.k] = v;
    else p[f.k] = v;
  });
  if (p.age !== '' && p.age < 18) errors.push('Âge : OliWeight est réservé aux adultes (18 ans et plus)');
  if (s.targetWeight !== '' && s.startWeight !== '' && s.targetWeight >= s.startWeight)
    errors.push('Poids visé : il doit être plus bas que le poids actuel');
  return {profile: p, settings: s, errors};
}
function profileWarnings(p) {
  const w = [];
  if (p.grossesse)
    w.push(
      'Pendant la grossesse, on ne cherche pas à perdre du poids : fais valider ton alimentation par ton médecin ou ta sage-femme.',
    );
  if ((p.sante || []).includes('tca'))
    w.push(
      'Avec des antécédents de troubles alimentaires, un programme de perte de poids doit être suivi par un professionnel de santé. Parles-en avant de commencer.',
    );
  if ((p.sante || []).some((x) => x !== 'tca') || p.medicaments)
    w.push(
      'Avec une maladie ou un traitement, fais valider le plan par ton médecin ou une diététiste (Santé811 au Canada).',
    );
  return w;
}
function applyProfile(res) {
  const before = JSON.stringify(data.profile || {});
  data.profile = {...res.profile, updatedAt: new Date().toISOString(), done: true};
  Object.assign(data.settings, res.settings);
  if (JSON.stringify({...data.profile, updatedAt: 0}) !== JSON.stringify({...JSON.parse(before), updatedAt: 0}))
    data.meta.profileChangedAt = data.profile.updatedAt;
  save();
}
/* ---------- Écran de premier lancement ---------- */
// L'écran « Aujourd'hui » crée un journal vide pour le jour : on ne compte que les journaux remplis.
function hasLoggedSomething() {
  return Object.values(data.logs).some(
    (l) =>
      Object.keys(l.meals || {}).length ||
      num(l.water) ||
      num(l.feedsDay) ||
      num(l.feedsNight) ||
      l.note ||
      l.steps ||
      (l.extras || []).length,
  );
}
function isNewUser() {
  return !data.profile && !data.meta.migratedFrom && !data.weights.length && !hasLoggedSomething();
}
function showOnboarding() {
  $('onboarding').innerHTML =
    `<div class="heading"><div><h1>Bienvenue 👋</h1><div class="muted small">Quelques questions pour adapter OliWeight à toi. Les réponses restent sur ton téléphone.</div></div></div>
  <div class="card" id="obForm">${profileFormHTML('ob-')}<div id="obErr" class="alert danger hidden"></div><div id="obWarn"></div><button class="primary" id="obSave" style="width:100%">Commencer</button></div>
  <p class="footer-note">OliWeight est un carnet de suivi, pas un avis médical. Les menus de départ sont proposés à partir de la banque de recettes ; ils seront ajustés à ton profil.</p>`;
  document.body.classList.add('onboarding');
  document.querySelectorAll('.screen').forEach((x) => x.classList.toggle('active', x.id === 'onboarding'));
  $('obSave').addEventListener('click', () => {
    const res = readProfileForm($('obForm'));
    if (res.errors.length) {
      $('obErr').textContent = 'À corriger : ' + res.errors.join(' · ');
      $('obErr').classList.remove('hidden');
      return;
    }
    applyProfile(res);
    data.settings.startDate = todayISO();
    proposeMenusFromBank();
    save();
    const warn = profileWarnings(data.profile);
    document.body.classList.remove('onboarding');
    goto('today');
    renderAll();
    toast(
      warn.length ? 'Profil enregistré. Lis les conseils en haut de l’écran.' : `Bienvenue ${data.profile.prenom} !`,
    );
  });
}
/* ---------- Profil dans Réglages ---------- */
function renderProfileCard() {
  if (!$('profileForm')) return;
  $('profileForm').innerHTML = profileFormHTML('pf-');
  const w = profileWarnings(data.profile || {});
  $('profileWarn').innerHTML = w.map((x) => `<div class="alert">${esc(x)}</div>`).join('');
}
function profileBanners() {
  const b = [],
    p = data.profile;
  if (!p || !p.done)
    b.push(
      '<div class="alert info">👤 Complète ton profil pour des menus adaptés. <button data-goto="settings" style="margin-top:8px;width:100%">Ouvrir mon profil</button></div>',
    );
  if (p) profileWarnings(p).forEach((x) => b.push(`<div class="alert">${esc(x)}</div>`));
  return b;
}
function profileSummary() {
  const p = data.profile;
  if (!p) return [];
  const lab = (f, v) => (f.opts?.find((o) => o[0] === v) || [, v])[1];
  const F = Object.fromEntries(PROFILE_FIELDS.map((f) => [f.k, f]));
  return [
    `PROFIL : ${p.prenom || '—'}, ${p.age || '?'} ans, ${p.taille || '?'} cm · activité ${lab(F.activite, p.activite) || '—'} · allaitement ${p.allaitement ? 'oui' : 'non'}${p.grossesse ? ' · ENCEINTE' : ''}`,
    `   santé : ${(p.sante || []).map((x) => lab(F.sante, x)).join(', ') || 'rien de signalé'}${p.medicaments ? ' · médicaments : ' + p.medicaments : ''}${p.allergies ? ' · allergies : ' + p.allergies : ''}`,
    `   aime : ${p.aimes || '—'} · refuse : ${p.refuses || '—'} · budget ${lab(F.budget, p.budget) || '—'} · temps ${lab(F.temps, p.temps) || '—'} · foyer ${p.foyer || '?'}${p.deuxJours ? ' · cuisine pour 2 jours' : ''}`,
    '',
  ];
}
