# Registre des décisions

Chaque décision importante, sa date et sa raison. On ne supprime pas une décision : on en ajoute une nouvelle qui la remplace.

| Date | Décision | Raison |
|---|---|---|
| 2026-11-09 | Perte visée plafonnée à 0,5 kg/semaine ; alerte au-delà de 1 kg/semaine | Protéger la production de lait pendant l'allaitement. |
| 2026-11-09 | Les données restent sur le téléphone ; l'ancienne clé `oliweight.v1` n'est jamais effacée | Filet de sécurité en cas de migration ratée. |
| 2026-11-10 | Dîners et soupers cuisinés pour 2 jours (lun-mar, mer-jeu, ven-sam) | Organisation réelle de la cuisine à la maison. |
| 2026-11-10 | Pas de ndolé ni d'eru avant janvier 2027 | Demande de l'utilisateur (disponibilité des feuilles). |
| 2026-11-10 | Synchronisation via un repo GitHub **privé** + clé fine-grained limitée à ce repo (Contents : read/write) | Moindre privilège ; pas de serveur avant janvier. L'app refuse un repo public. |
| 2026-11-10 | La clé est stockée à part (`oliweight.sync`), jamais dans les sauvegardes ni dans le fichier envoyé | Une sauvegarde partagée ne doit pas donner accès au repo. |
| 2026-11-11 | Plancher de 1 800 kcal/jour pendant l'allaitement ; limite par défaut 2 300 | Repère usuel pour l'allaitement ; la semaine 1 (≈ 1 600-1 900) expliquait la faim. |
| 2026-11-12 | Les calories de la marche ne sont **pas** soustraites | Les bracelets surestiment la dépense (Shcherbina et al., 2017) ; les diététistes déconseillent de « remanger » les calories d'exercice ; compensation métabolique. |
| 2026-11-12 | Extras et ajouts rapides avec calories fixées d'avance plutôt qu'un recalcul au gramme | L'auto-surveillance compte plus que la précision (Burke et al., 2011) ; la sous-déclaration est la première source d'erreur. |
| 2026-11-12 | Photos stockées dans IndexedDB, 640 px JPEG, liées au nom du plat ; photo d'un plat similaire si même protéine, même féculent et ≥ 80 % d'ingrédients communs | localStorage limité à ~5 Mo ; éviter les doublons. |
| 2026-11-12 | Code découpé en modules, tests dans le repo, une pull request par changement | Traçabilité : rien ne part sur le téléphone sans revue et tests verts. |
- **2026-11-12 — Règles santé** : plancher 1 800 kcal en allaitement, 1 500 sinon ; perte max 0,5 kg/sem en allaitement, sinon 1 % du poids (≤ 1 kg) ; grossesse et maladie = pause sans déficit. Exclusions par étiquettes (sel, sucres, gluten) = précautions générales, à confirmer par un professionnel.
- **2026-11-13 — Ingrédient absent** : les calories d'un plat sont réparties entre ses ingrédients selon une portion type, remise à l'échelle du total du plat. Estimation suffisante pour suivre la tendance ; pas de quantités au gramme.
