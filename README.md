# OliWeight

Application web installable (PWA) de suivi d'un programme alimentaire : menus avec portions, repas respectés ou non, calories estimées, eau, allaitement, pesées, objectif et date probable. Fonctionne hors ligne ; les données restent sur le téléphone et se synchronisent dans un repo GitHub **privé**.

Version en ligne : GitHub Pages de ce repo. La version installée s'affiche dans Réglages, tout en bas.

## Documents

| Document | Contenu |
|---|---|
| `docs/ARCHITECTURE.md` | schéma, environnements (production, bêta), rôle de chaque fichier |
| `SECURITY.md` | données, où elles vont, règles de sécurité, incident |
| `docs/RUNBOOK.md` | procédures : publier, ajouter un testeur, incident, clé, retour arrière |
| `docs/RISQUES.md` | registre des risques |
| `docs/REFERENCES.md` | sources de chaque calcul ; chiffres officiels et choix à valider |
| `docs/DECISIONS.md` | décisions et leurs raisons |
| `docs/CONSENTEMENT-modele.md` | accord des testeurs (modèle vide) |
| `CHANGELOG.md` | journal des versions |

Les documents nominatifs (registre des testeurs, consentements, incidents) sont dans un repo privé d'administration.

## Développement

```bash
pip install -r tests/requirements.txt && python -m playwright install chromium
cd tests && python -m pytest -q          # ~95 tests, ~2 min
npx prettier@3 --check "js/*.js" sw.js css/app.css
```

Règles (détail : `docs/RUNBOOK.md` §1) : une demande = une issue ; un changement = une branche et une pull request ; tests verts obligatoires ; nouvelle version = `APP_VERSION` (`js/config.js`), `VERSION` (`sw.js`) et une entrée dans `CHANGELOG.md`.

## Mise en ligne

Fusionner dans `main` : GitHub Pages republie en 1 à 2 minutes. Sur le téléphone, fermer et rouvrir l'app ; le message « OliWeight a été mis à jour » confirme.
