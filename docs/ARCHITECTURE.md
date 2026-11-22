# Architecture — OliWeight

## Vue d'ensemble

```
            ┌──────────────── Téléphone de la personne ────────────────┐
            │  PWA OliWeight (HTML/CSS/JS, hors ligne, service worker)  │
            │  localStorage : oliweight.v2 (données) · oliweight.sync   │
            │  IndexedDB : photos                                       │
            └───────────────┬───────────────────────────────▲──────────┘
                            │ HTTPS, clé limitée à 1 repo   │ code de l'app
                            ▼                               │
            Repo PRIVÉ de la personne               GitHub Pages
            data/oliweight.json (écrit)             gbac4.github.io/oliweigth        ← main
            menus/cycle.json (lu)                   gbac4.github.io/oliweigth-beta   ← beta
            photos/, feedback/
```

Pas de serveur à nous : GitHub sert le code (Pages) et stocke les données (un repo privé par personne).

## Environnements

| Environnement | Source | Adresse | Données |
|---|---|---|---|
| Production | branche `main` | gbac4.github.io/oliweigth | réelles (repos privés) |
| Bêta | branche `beta` → repo `oliweigth-beta` (workflow `beta.yml`) | gbac4.github.io/oliweigth-beta | **fictives** uniquement |
| Local / CI | branche de PR | serveur de test Playwright | fixtures `tests/fixtures/` |

Sur la bêta, les clés de stockage, les photos et les caches sont renommés à la construction (`oliweight-beta.*`) pour ne jamais toucher aux données de l'app normale, qui est sur le même domaine.

## Code

Scripts classiques chargés dans l'ordre de `index.html`, sans bundler : chaque fichier expose ses fonctions aux suivants. ESLint (`tools/lint.mjs`) vérifie qu'aucun nom n'est déclaré deux fois.

| Fichier | Rôle |
|---|---|
| `js/diag.js` | journal d'erreurs (chargé en premier) |
| `js/config.js` | version, clés de stockage, repas de base, options |
| `js/cycle.js` | cycle de menus intégré |
| `js/util.js` | dates, formats, échappement HTML, toast |
| `js/store.js` | stockage, reprise des anciennes versions, correctifs de données (`PATCHES`) |
| `js/rules.js` | règles santé (objectif, allaitement, plancher) |
| `js/energy.js` | budget calorique (Mifflin-St Jeor), portions, rééquilibrage |
| `js/kcal.js` | calories du jour, zone, repas complets |
| `js/foods.js` · `js/pantry.js` | table des aliments, ingrédients absents |
| `js/recipes.js` · `js/creator.js` | banque de recettes, rotation, « Créer ma recette » |
| `js/menus.js` | semaines à venir, liste de courses |
| `js/today.js` · `js/progress.js` · `js/weights.js` | écrans |
| `js/settings.js` · `js/profile.js` · `js/feedback.js` | réglages, profil, avis |
| `js/sync.js` | synchronisation GitHub |
| `js/app.js` | événements et démarrage |
| `sw.js` | cache hors ligne et mises à jour |

## Principes

- **Calculs séparés de l'affichage**, couverts par des tests (`tests/`).
- **Une mise à jour ne supprime jamais de données** : les changements de structure passent par `PATCHES`, appliqués une fois et tracés dans `meta.patches`.
- **Légèreté** : 500 lignes au plus par fichier ; la future base d'aliments n'est jamais embarquée entière.
- Décisions et leurs raisons : `docs/DECISIONS.md`.
