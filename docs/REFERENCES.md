# Références et choix de calcul — OliWeight

Chaque règle de l'app, sa valeur, d'où elle vient et où elle est appliquée dans le code.

- ✅ **Référence** : la valeur vient d'une publication publique reconnue.
- ⚠️ **Choix de l'app** : décision prise par nous (en s'inspirant de la pratique), **à faire valider par une diététiste**.

Toute modification d'une valeur ci-dessous passe par une PR qui met ce fichier à jour.

## 1. Budget calorique

| Règle | Valeur | Statut | Source | Code |
|---|---|---|---|---|
| Besoins au repos | Mifflin-St Jeor | ✅ | Mifflin et al., *Am J Clin Nutr* 1990 ; recommandée par l'Academy of Nutrition and Dietetics | `energy.js` `energyBreakdown` |
| Facteurs d'activité | 1,2 / 1,375 / 1,55 / 1,725 | ⚠️ | Usage courant, pas une norme officielle ; la personne choisit souvent un niveau trop haut | `energy.js` `ACTIVITY` |
| Supplément d'allaitement | +330 kcal (0-6 mois), +400 (7 mois et +) | ✅ | Apports nutritionnels de référence (ANREF / DRI, Institute of Medicine 2005), repris par Santé Canada | `energy.js` |
| Allaitement partiel | moitié du supplément | ⚠️ | Approximation de notre part | `energy.js` |
| Énergie d'un kg perdu | 7 700 kcal | ✅ | Règle classique ; Hall (NIH) montre qu'elle surestime la perte à long terme, d'où l'ajustement du §3 | `energy.js` `KCAL_PER_KG` |
| Déficit maximal | 25 % des besoins, 500 kcal en allaitement (1 000 sinon) | ⚠️ | Prudence | `energy.js` |
| Grossesse | aucun déficit | ✅ | Santé Canada : la grossesse n'est pas une période de perte de poids | `rules.js` `isPaused` |

## 2. Limites de sécurité

| Règle | Valeur | Statut | Source | Code |
|---|---|---|---|---|
| Plancher en allaitement | 1 800 kcal/jour | ⚠️ | Repère courant en pratique, pas de seuil officiel | `config.js` `KCAL_MIN` |
| Plancher hors allaitement | 1 500 kcal/jour | ⚠️ | Plus prudent que le repère courant (1 200 femmes / 1 500 hommes) | `rules.js` `kcalMin` |
| Perte maximale en allaitement | 0,5 kg/semaine | ⚠️ | S'appuie sur des études où ce rythme n'a pas nui à la croissance du bébé (Lovelady et al., *NEJM* 2000) | `rules.js` `maxLoss` |
| Perte maximale hors allaitement | 1 % du poids, au plus 1 kg/semaine | ⚠️ | Repère courant (0,5 à 1 kg/semaine) | `rules.js` `maxLoss` |
| Zone tolérée au-dessus du budget | +150 kcal | ⚠️ | Choix d'affichage | `kcal.js` `ZONE_MIN` |
| Calories de la marche | non ajoutées au budget | ⚠️ | Les montres surestiment la dépense (Shcherbina et al., 2017) | — |

## 3. Ajustements selon les pesées

| Règle | Valeur | Statut | Code |
|---|---|---|---|
| Tendance | régression sur 28 jours, au moins 3 pesées sur 21 jours | ⚠️ | `energy.js` `weightTrend` |
| Pas d'ajustement | −100 kcal (perte trop lente) / +150 (trop rapide) ; ±100 en stabilisation | ⚠️ | `energy.js` `kcalSuggestion` |
| Fréquence et cumul | au plus toutes les 3 semaines, total ±300 kcal, toujours validé par la personne | ⚠️ | `energy.js` `ADJ_MAX` |
| Stabiliser | fourchette ±1 kg ; réaction si la tendance dépasse ±0,25 kg/semaine | ⚠️ | `energy.js`, `rules.js` |

## 4. Repas et portions

| Règle | Valeur | Statut | Code |
|---|---|---|---|
| Répartition par repas (4 repas) | petit-déj. 25 %, collation 10 %, dîner 35 %, souper 30 % | ⚠️ | `energy.js` `SLOT_SHARES` |
| Mise à l'échelle des portions | facteur 0,6 à 1,6, arrondi vers le bas | ⚠️ | `energy.js` `portionFactor`, `scaleText` |
| Plat plus riche choisi | collation réduite d'abord, puis repas suivants −15 % au plus, puis étalé sur 3 jours (100 kcal/jour au plus) ; jamais de repas principal sauté | ⚠️ | `energy.js` `computeRebalance` |
| Protéines (prévu) | 1,3 g/kg en allaitement | ✅ | ANREF (Institute of Medicine) | à venir |
| Protéines hors allaitement (prévu) | 1,0 à 1,2 g/kg | ⚠️ | Au-dessus de l'ANREF (0,8 g/kg), choix pour une période de perte de poids | à venir |

## 5. Valeurs des aliments

| Règle | Statut | Source | Code |
|---|---|---|---|
| Table des aliments pour 100 g | ✅ | Fichier canadien sur les éléments nutritifs (Santé Canada) ; table FAO/INFOODS d'Afrique de l'Ouest | `foods.js` `FOODS` |
| Calories des plats de la banque | ⚠️ | **Estimations par plat**, pas encore calculées ingrédient par ingrédient (prévu : phase 1, étape 2) | `config.js`, `pantry.js` |
| Ajouts rapides et extras | ⚠️ | Valeurs fixes arrondies ; l'auto-surveillance compte plus que la précision (Burke et al., 2011) | `config.js` `ADDS` |

## 6. Allergies et restrictions

| Règle | Statut | Remarque | Code |
|---|---|---|---|
| Exclusion des plats par mots-clés (arachide, œuf, lait, gluten…) | ⚠️ | Reconnaissance de mots dans le nom et les ingrédients : un ingrédient caché ou mal écrit peut passer. **Ne remplace pas la lecture des étiquettes.** | `recipes.js` `ALLERGY_WORDS`, `TAGS` |

## À faire valider par une diététiste (par ordre de priorité)

1. Planchers : 1 800 kcal en allaitement, 1 500 kcal sinon.
2. Pertes maximales : 0,5 kg/semaine en allaitement ; 1 %, au plus 1 kg, sinon.
3. Déficit maximal (25 %, 500 kcal en allaitement) et allaitement partiel compté à moitié.
4. Ajustements selon les pesées : pas de −100 / +150, toutes les 3 semaines, ±300 au total.
5. Rééquilibrage d'un plat plus riche (collation, −15 %, étalement sur 3 jours).
6. Répartition des calories par repas et limites des portions (0,6 à 1,6).
7. Objectif de protéines hors allaitement (1,0 à 1,2 g/kg).
8. Facteurs d'activité et façon de poser la question à la personne.
9. Limites de la détection des allergies et formulation de l'avertissement.

Résultat de la validation : noté dans `docs/DECISIONS.md` (date, professionnelle, valeurs confirmées ou modifiées).
