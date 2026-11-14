# Journal des versions

Format : une entrée par version publiée sur GitHub Pages. La version s'affiche dans Réglages, tout en bas.

## 3.4.3 — 2026-11-14
- Quantités recalculées (#27) : quand la portion du jour n'est pas ×1, le texte du repas affiche directement les quantités ajustées (g et ml au 5 g, tasses et cuillères au ¼, pièces entières). Arrondi vers le bas pour ne pas dépasser, au plus proche si le budget est déjà au minimum ; une tasse suivie de ses grammes suit les grammes. Le menu d'origine reste affiché en petit.
- Correction : le total « prévu » du jour déduit maintenant les ingrédients retirés ou remplacés, même avant de cocher le repas.

## 3.4.2 — 2026-11-13
- Recette maison (#25) : alerte « valeur inhabituelle » à l'enregistrement pour repérer une faute de frappe ou d'unité (moins de 0,4 ou plus de 3,5 kcal par gramme cuit, marmite cuite plus légère que la moitié des ingrédients, part de moins de 100 ou plus de 1 500 kcal). Rien n'est bloqué ni modifié : « Enregistrer quand même ». Un plat riche comme le kpwem ne déclenche rien.

## 3.4.1 — 2026-11-13
- Refaire mes menus (#23) : après un changement de profil (cuisine pour 2 jours, goûts, budget…), un bouton refait les menus à partir du lundi suivant. La semaine en cours et ses courses ne changent pas. Proposé seulement pour les menus créés par l'app, pas pour un cycle publié.

## 3.4.0 — 2026-11-13
- Calories personnalisées (#21), calculées dans le téléphone sans IA : Mifflin-St Jeor (poids de la dernière pesée, taille, âge, sexe) × activité + allaitement (+330 kcal de 0 à 6 mois, +400 ensuite, moitié si partiel) − déficit pour la perte visée (plafonné à 25 % et à 500 kcal en allaitement), jamais sous le minimum. Le détail du calcul s'affiche dans Réglages.
- Ajustement selon la balance : après au moins 3 semaines de pesées (hors 2 premières semaines), l'app compare la perte réelle à la perte visée et propose −100 kcal (trop lent) ou +150 kcal (trop rapide). La personne accepte ou non ; prochaine vérification 3 semaines plus tard.
- Nombre de repas : 3, 4 ou 5 au profil, et changement pour un seul jour dans « Ma journée ». Le total du jour est conservé : les portions des repas gardés sont mises à l'échelle (×0,6 à ×1,6).
- Profil : sexe, âge du bébé, allaitement exclusif ou partiel, repas par jour. Les questions d'allaitement et de grossesse n'apparaissent que pour une femme.
- Correction : sans réponse, l'app ne suppose plus que la personne allaite (le minimum passait à 1 800 kcal pour tout le monde).

## 3.3.0 — 2026-11-13
- Créer ma recette (#19) : dans Menus › Recettes, on entre les ingrédients comme on les met dans la marmite (en grammes ou en unités pratiques : paquet, boîte, c. à soupe…), avec la valeur d'étiquette si on l'a, puis le poids de la marmite cuite ou le nombre de parts. Table d'ingrédients pour 100 g (Santé Canada, FAO), y compris feuilles de manioc, crème de palme, hareng fumé, écrevisses. La recette va dans la banque et se synchronise.
- Calculateur de portion : la recette ne change pas, la portion s'adapte au budget du moment (petit-déjeuner 25 %, dîner et souper 30 %, collation 7,5 %). Deux options avec l'accompagnement choisi : riche en sauce ou riche en féculent, en grammes, en tasses et en fraction de marmite. Modèle « kpwem standard » prêt à ajuster.

## 3.2.0 — 2026-11-13
- Ingrédient absent (#17) : toucher un ingrédient → « Sans » (ses calories sont retirées) ou « Remplacé par… » (équivalent de la même famille, différence de calories). L'anneau, le repas, le résumé et l'analyse utilisent le total ajusté ; l'ingrédient part dans les Manquants. Changer de plat entier devient une option repliée.

## 3.1.0 — 2026-11-13
- Ingrédients manquants (#15) : sur chaque repas, toucher un ingrédient « Je ne l'ai pas » l'ajoute aux Manquants des courses et propose jusqu'à 3 plats équivalents sans cet ingrédient.
- Garde-manger : « J'en ai » / « À acheter » ; les produits de base restent cochés d'une semaine à l'autre, les produits frais repartent à zéro. La liste envoyée ne contient que ce qui est à acheter, manquants en premier.

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
