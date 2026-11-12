'use strict';
/* OliWeight — « Donner mon avis » (fiche #6, bêta fermée)
   L'avis est gardé dans les données (data.feedback) et, si la synchronisation est active,
   envoyé dans le repo PRIVÉ de la personne : feedback/<date>.json (+ capture .jpg facultative). */
let fbNote = 0,
  fbShot = null;
function renderFeedback() {
  if (!$('fbScale')) return;
  $('fbScale').innerHTML = [1, 2, 3, 4, 5]
    .map(
      (n) =>
        `<button type="button" data-fbnote="${n}" class="${fbNote === n ? 'active' : ''}" aria-pressed="${fbNote === n}">${n}</button>`,
    )
    .join('');
  const list = data.feedback || [],
    pending = list.filter((f) => !f.sent).length;
  $('fbInfo').textContent = list.length
    ? `${list.length} avis donné${list.length > 1 ? 's' : ''}${pending ? ` · ${pending} en attente d’envoi` : ''}. Merci !`
    : '';
  $('fbShotInfo').textContent = fbShot ? `Capture jointe (${Math.round(fbShot.size / 1024)} Ko)` : '';
}
async function pushFeedback(f) {
  if (!syncOn()) return false;
  try {
    const id = f.at.replace(/[:.]/g, '-'),
      put = (path, content, msg) =>
        gh('/contents/' + path, {method: 'PUT', body: JSON.stringify({message: msg, content})});
    if (f.shot) {
      const r = await put(`feedback/${id}.jpg`, f.shot, 'OliWeight : capture avis');
      if (!r.ok) return false;
    }
    const {shot, ...meta} = f;
    const r = await put(
      `feedback/${id}.json`,
      b64encode(JSON.stringify({...meta, capture: shot ? `${id}.jpg` : null}, null, 1)),
      'OliWeight : avis ' + f.at.slice(0, 10),
    );
    return r.ok || r.status === 422; // 422 : déjà envoyé
  } catch (e) {
    return false;
  }
}
async function flushFeedback() {
  const list = (data.feedback || []).filter((f) => !f.sent);
  let changed = false;
  for (const f of list)
    if (await pushFeedback(f)) {
      f.sent = true;
      delete f.shot; // la capture n'est gardée sur le téléphone que jusqu'à l'envoi
      changed = true;
    }
  if (changed) {
    save();
    renderFeedback();
  }
}
document.addEventListener('click', (e) => {
  const b = e.target.closest('[data-fbnote]');
  if (b) {
    fbNote = Number(b.dataset.fbnote);
    $('fbErr').classList.add('hidden');
    renderFeedback();
  }
});
$('fbShotBtn').addEventListener('click', () => $('fbShotInput').click());
$('fbShotInput').addEventListener('change', async () => {
  const f = $('fbShotInput').files[0];
  $('fbShotInput').value = '';
  if (!f) return;
  try {
    fbShot = await resizeImage(f);
  } catch (e) {
    toast('Image illisible.');
  }
  renderFeedback();
});
$('fbSend').addEventListener('click', async () => {
  const text = $('fbText').value.trim();
  if (!fbNote && !text) {
    $('fbErr').textContent = 'Choisis une note ou écris un commentaire.';
    $('fbErr').classList.remove('hidden');
    return;
  }
  const f = {
    at: new Date().toISOString(),
    note: fbNote || null,
    text: text.slice(0, 1000),
    screen: $('fbScreen').value,
    version: APP_VERSION,
    sent: false,
  };
  if (fbShot) f.shot = await blobToB64(fbShot);
  data.feedback = [...(data.feedback || []), f];
  save();
  fbNote = 0;
  fbShot = null;
  $('fbText').value = '';
  renderFeedback();
  await flushFeedback();
  toast(f.sent ? 'Avis envoyé. Merci !' : 'Avis enregistré : il partira à la prochaine synchronisation.');
});
