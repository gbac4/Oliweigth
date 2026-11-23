# Registre des risques — OliWeight

Gravité (G) et probabilité (P) de 1 à 3 ; criticité = G × P. Revu tous les 3 mois et après chaque incident. On ne supprime pas une ligne : on la marque « fermé » avec la date.

| # | Risque | G | P | Crit. | Mesure en place | À faire | Statut |
|---|---|---|---|---|---|---|---|
| R1 | Donnée de santé publiée dans le repo public | 3 | 1 | 3 | Règle « données fictives », relecture des PR, app refuse un repo public | Activer *secret scanning* + *push protection* | ouvert |
| R2 | Clé d'accès volée ou partagée | 3 | 2 | 6 | Clé limitée à 1 repo, 90 jours, stockée hors sauvegardes | Registre des dates d'expiration | ouvert |
| R3 | Calcul faux → budget trop bas (faim, baisse de lait) | 3 | 2 | 6 | Plancher 1 800 / 1 500 kcal, perte plafonnée, tests des calculs, ajustement selon la tendance | Suivre « faim » et notes des testeurs ; fiche sur la clarté de l'échelle de faim | ouvert |
| R4 | Mise à jour qui casse l'app ou les données | 2 | 2 | 4 | Tests, ESLint, bêta, `PATCHES` sans suppression, étiquettes, retour arrière | Protéger `main` (CI obligatoire) | ouvert |
| R5 | Bêta reliée à une vraie personne | 3 | 1 | 3 | Données isolées à la construction, bandeau BÊTA, règle écrite | — | maîtrisé |
| R6 | Bug invisible chez une testeuse | 2 | 2 | 4 | Journal d'erreurs + « Copier le diagnostic » | — | maîtrisé |
| R7 | Conseil perçu comme médical | 2 | 2 | 4 | Avertissement « pas un dispositif médical », renvoi vers diététiste ou médecin | Vérification juridique avant serveur ou version payante | ouvert |
| R8 | App trop lourde ou difficile à maintenir | 2 | 2 | 4 | 500 lignes max par fichier, calculs séparés, base d'aliments chargée à la demande | Découper `cycle.js` | ouvert |
| R9 | Perte du compte GitHub du responsable | 3 | 1 | 3 | 2FA | Codes de récupération rangés hors ligne | ouvert |
