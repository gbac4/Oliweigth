# OliWeight

Application web installable (PWA) de suivi d'un programme alimentaire : menus avec portions, repas respectés ou non, calories estimées, eau, allaitement, pesées, objectif et date probable. Fonctionne hors ligne ; les données restent sur le téléphone et se synchronisent dans un repo GitHub **privé**.

Version en ligne : GitHub Pages de ce repo. La version installée s'affiche dans Réglages, tout en bas.

## Architecture

```
index.html            structure des 5 écrans (Aujourd'hui, Menus, Pesée, Progrès, Réglages)
css/app.css           styles (mode sombre automatique)
js/config.js          constantes, repas de base, calories par repas, options, extras
js/cycle.js           cycle de menus intégré (semaines 2 à 5)
js/util.js            dates, formats, échappement HTML, toast, téléchargement
js/store.js           stockage local, reprise des anciennes versions, correctifs de données (PATCHES)
js/kcal.js            plan du jour, calories par repas, ajouts et extras
js/weights.js         pesées, objectif, tendance, courbe
js/photos.js          photos des plats (IndexedDB), plat similaire
js/menus.js           semaines à venir, échanges de jours, liste de courses
js/today.js           écran Aujourd'hui (anneau des calories, repas, extras)
js/progress.js        écran Progrès, barres de calories, résumé hebdomadaire
js/settings.js        réglages, navigation, sauvegarde
js/sync.js            synchronisation GitHub (suivi, menus, photos)
js/app.js             événements et démarrage
sw.js                 service worker (cache, mises à jour)
tests/                tests Playwright sur écran mobile (pytest)
docs/DECISIONS.md     registre des décisions
```

Les scripts sont chargés dans cet ordre, sans bundler : chaque fichier expose ses fonctions aux suivants.

## Données

- `localStorage` clé `oliweight.v2` : réglages, menus, journal par date, pesées, semaines à venir, historique.
- `localStorage` clé `oliweight.sync` : configuration de synchronisation et **clé d'accès** (jamais exportée).
- IndexedDB `oliweight-photos` : photos des plats.
- Repo privé : `data/oliweight.json` (écrit par l'app), `menus/cycle.json` (lu par l'app), `photos/*.jpg`.

Une mise à jour ne supprime jamais de données : les changements de structure passent par `PATCHES` (`js/store.js`), appliqués une seule fois et tracés dans `meta.patches`.

## Sécurité

- Le code est public, les données de santé ne le sont jamais : l'app refuse de se connecter à un repo public.
- Clé GitHub fine-grained limitée au seul repo de données, permission « Contents : read/write », expiration 90 jours.
- Toute saisie utilisateur est échappée avant affichage ; les fichiers importés sont validés.

## Développement

```bash
pip install -r tests/requirements.txt && python -m playwright install chromium
cd tests && python -m pytest -q          # 17 tests, ~30 s
npx prettier@3 --check "js/*.js" sw.js css/app.css
```

Règles : une demande = une issue ; un changement = une branche et une pull request ; tests verts obligatoires ; nouvelle version = `APP_VERSION` (`js/config.js`), `VERSION` (`sw.js`) et une entrée dans `CHANGELOG.md`.

## Mise en ligne

Fusionner dans `main` : GitHub Pages republie en 1 à 2 minutes. Sur le téléphone, fermer et rouvrir l'app ; le message « OliWeight a été mis à jour » confirme.
