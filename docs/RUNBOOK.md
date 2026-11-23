# Procédures — OliWeight

Chaque procédure doit pouvoir être suivie par quelqu'un d'autre que Bertrand. Aucun nom de personne ici : les noms vont dans le registre privé.

## 1. Publier une version

1. Une fiche (issue) → une branche → une PR. Dans la PR : `APP_VERSION` (`js/config.js`), `VERSION` (`sw.js`), entrée dans `CHANGELOG.md`, décision dans `docs/DECISIONS.md` si besoin.
2. Attendre la CI verte (ESLint, Prettier, tests).
3. Pousser la branche sur `beta` : `git push -f origin <branche>:beta`. Tester sur la bêta avec un profil fictif (1 à 2 jours si le changement touche aux calculs).
4. Bertrand fusionne la PR dans `main`. Pages republie en 1 à 2 minutes ; l'étiquette `vX.Y.Z` est créée par le workflow `tags.yml`.
5. Sur un téléphone : fermer et rouvrir l'app, vérifier la version dans Réglages.

## 2. Ajouter un testeur

1. Le testeur lit et accepte le consentement (`docs/CONSENTEMENT-modele.md`). Ranger la preuve dans le repo d'administration.
2. Créer son repo **privé** `oliweight-<code>` (un code, pas son nom complet), avec un fichier `README.md`.
3. Créer une clé *fine-grained* : un seul repo (le sien), « Contents : read/write », expiration 90 jours. Noter la date d'expiration dans le registre.
4. Envoyer le message d'installation (sans la clé). Transmettre la clé **à part**, puis supprimer ce message.
5. Vérifier dans Réglages › Synchronisation : « Connecté ». Inscrire le testeur dans le registre (code, appareil, date, version).

## 3. Incident : clé exposée, téléphone perdu, donnée publiée

1. **Contenir (tout de suite)** : GitHub › Settings › Developer settings › Fine-grained tokens › révoquer la clé. Si une donnée est dans le repo public : la retirer et contacter le support GitHub pour purger l'historique si nécessaire.
2. **Prévenir** la personne concernée le jour même : ce qui s'est passé, ce qui est touché, ce qui est fait.
3. **Rétablir** : nouvelle clé (procédure 2, étapes 3 et 4).
4. **Noter** dans le journal des incidents (repo d'administration) : date, cause, données touchées, mesure, prévention.
5. Si la cause est une faiblesse de l'app : fiche + PR + mise à jour de `docs/RISQUES.md`.

## 4. Renouveler une clé (tous les 90 jours)

GitHub prévient par courriel 7 jours avant. Créer la nouvelle clé (procédure 2, étape 3), la transmettre à part, vérifier « Connecté », révoquer l'ancienne, mettre à jour le registre.

## 5. Revenir en arrière

- Un seul changement fautif : bouton **Revert** sur la PR fusionnée → nouvelle PR → CI → fusion.
- Plusieurs versions : créer une branche depuis l'étiquette saine (`git checkout -b retour vX.Y.Z`), monter `APP_VERSION` et `VERSION` (le téléphone ne recharge que si la version change), PR, fusion.
- Les données des personnes sont dans leurs repos privés : un retour arrière du code ne les touche pas.

## 6. Diagnostiquer un problème signalé

1. Demander le diagnostic : Réglages › 🩺 Un problème ? › Copier le diagnostic (aucune donnée de santé).
2. Reproduire sur la bêta avec un profil fictif semblable (même objectif, allaitement oui/non, nombre de repas).
3. Écrire d'abord un test qui échoue, puis corriger (fiche + PR).
4. Ne lire les données réelles de la personne qu'avec son accord explicite.

## 7. Restaurer les données d'une personne

1. Sur son téléphone : Réglages › Sauvegarde › Restaurer, avec un fichier `.json`.
2. Sans sauvegarde locale : l'historique du repo privé (`data/oliweight.json`, onglet *History*) permet de récupérer une version antérieure.

## 8. Retrait d'un testeur

1. Révoquer sa clé.
2. Lui demander s'il veut garder ses données (export depuis Réglages) ; puis supprimer son repo privé s'il le demande.
3. Dans l'app : Réglages › Effacer les données.
4. Mettre à jour le registre (date de sortie, données supprimées oui/non).
