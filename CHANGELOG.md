# Journal des versions

Format : une entrée par version publiée sur GitHub Pages. La version s'affiche dans Réglages, tout en bas.

## 3.0.0 — 2026-11-12
- Nouvelle interface « Aujourd'hui » (propositions A + B) : anneau des calories compact, boutons rapides (+ Eau, + Extra, + Tétée), repas en fil horaire avec coche d'un geste, prochain repas mis en avant, détails dépliables, « Cuisine fermée » à 21 h ; extras, eau, allaitement et humeur repliés.
- Nouveau tableau « Progrès » (proposition C) : 4 indicateurs (poids, rythme, jours complets, date probable), poids avec légende, calories, repas respectés en cases, détails repliés.

## 2.11.0 — 2026-11-12
- Règles selon la situation (#5) : fin d'allaitement (carte Tétées et alerte masquées, plancher 1 500 kcal, perte max 1 % du poids/semaine) ; grossesse ou maladie : mode pause sans déficit.
- Exclusions santé dans la banque et les équivalents : hypertension et reins (sel), diabète (sucres ajoutés), maladie cœliaque (gluten) ; anémie : plats riches en fer favorisés.
- Bandeau « Profil modifié : menus à réviser », effacé à la réception de nouveaux menus.

## 2.10.0 — 2026-11-12
- « Donner mon avis » dans Réglages : note 1-5, écran concerné, commentaire, capture facultative ; envoyé dans le repo privé (feedback/), gardé en attente si hors ligne (#6).

## 2.9.0 — 2026-11-12
- Changer un repas pour un plat équivalent de la banque : même moment, calories à ±15 %, compatible avec le profil (#4). Les crêpes Flourish et les épinards aux crevettes restent proposés.
- La liste de courses de la semaine en cours suit les plats changés.

## 2.8.0 — 2026-11-12
- Banque de recettes (onglet Menus → Recettes) : moment, cuisine, budget, temps, calories, étiquettes (gluten, arachide, poisson, lait…), recherche, filtre « compatible avec mon profil » (#3).
- Nouvelle personne : 5 semaines de menus proposées depuis la banque selon son profil (allergies, refus, maladie cœliaque, goûts, budget, temps, cuisine pour 2 jours).

## 2.7.0 — 2026-11-12
- Profil modifiable dans Réglages (santé, allaitement, grossesse, allergies, goûts, budget, temps, foyer) (#2).
- Écran de premier lancement pour une nouvelle personne ; réservé aux 18 ans et plus ; conseils de validation médicale selon la situation.
- Profil inclus dans le résumé de la semaine.

## 2.6.1 — 2026-11-12
- Valeurs par défaut neutres : un nouveau téléphone n'a plus de poids de départ ni de poids cible pré-remplis (#7).

## 2.6.0 — 2026-11-12
- Remise au propre : `index.html` découpé en `css/app.css` et 13 modules dans `js/` (même comportement).
- Tests automatisés dans `tests/` (17 tests Playwright sur écran mobile) et exécution à chaque pull request (GitHub Actions).
- Correction : l'avertissement « repo PUBLIC » disparaissait aussitôt affiché.
- Documentation : README, CHANGELOG, registre des décisions.

## 2.5.1 — 2026-11-12
- Photo d'un plat similaire (même protéine, même féculent, ≥ 80 % des autres ingrédients).

## 2.5.0 — 2026-11-12
- Photos des plats (appareil photo, 640 px, IndexedDB, envoi dans le repo privé).
- Ajouts rapides sur un repas (huile, féculent, protéine, fruit, sucre).
- Extras hors menu avec 14 aliments chiffrés + saisie libre.

## 2.4.0 — 2026-11-11
- Anneau des calories du jour (mangées / limite, minimum 1 800 kcal) et barres sur 7 jours.
- Limite de calories réglable (plancher 1 800 pendant l'allaitement).

## 2.3.0 — 2026-11-11
- Calories estimées par repas et par jour ; options de remplacement par repas (crêpes Flourish, épinards aux crevettes).
- Menus semaines 2 à 5 révisés (portions augmentées : journées entre 1 800 et 2 090 kcal).

## 2.2.0 — 2026-11-10
- Cycle de 4 semaines de menus, échanges de jours (bloc, jour, souper, dîner), liste de courses par semaine.
- Synchronisation avec le repo GitHub privé (suivi, menus), refus des repos publics.

## 2.1.x — 2026-11-10
- Quantités en tasses et grammes, poids cible, date probable, historique incluant le poids de départ, menus de la semaine suivante, alarme « cuisine fermée » 21 h.

## 2.0.x — 2026-11-09
- Reprise de ZEN sous le nom OliWeight ; migration des données v1 ; liste de courses ; bilan de semaine ; tendance du poids ; résumé complet ; changement de jour automatique ; pouding de chia.
