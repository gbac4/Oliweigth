# Sécurité et données — OliWeight

Responsable : Bertrand (propriétaire du compte GitHub `gbac4`). Revu à chaque version qui touche aux données, au minimum tous les 3 mois.

## 1. Signaler un problème de sécurité

Ne pas ouvrir d'issue publique. Écrire directement à Bertrand (message privé). Réponse sous 48 h.

## 2. Inventaire des données

| Donnée | Où | Qui y accède | Sensible |
|---|---|---|---|
| Profil (âge, taille, poids, sexe, allaitement, grossesse, allergies) | Téléphone (`localStorage`) + repo **privé** de la personne | La personne ; Bertrand **seulement avec son accord** | Santé |
| Journal (repas, calories, eau, sommeil, humeur, notes) | Idem | Idem | Santé |
| Pesées et photos des plats | Idem (photos : IndexedDB + `photos/`) | Idem | Santé |
| Avis (« Donner mon avis ») | Idem (`feedback/`) | Idem | Peut contenir du texte libre |
| Clé d'accès GitHub | Téléphone seulement (clé `oliweight.sync`) | La personne | **Secret** |
| Journal d'erreurs (diagnostic) | Téléphone seulement | Envoyé par la personne si elle le veut | Non (aucune donnée de santé) |
| Code, tests, données fictives | Repo **public** `Oliweigth` | Tout le monde | Non |

Rien n'est envoyé ailleurs qu'à `api.github.com`. Aucun outil de mesure d'audience, aucune publicité, aucun serveur à nous.

## 3. Règles (non négociables)

1. **Aucune donnée personnelle ou de santé dans le repo public**, ni dans une issue, une PR, un test ou une capture. Données de test fictives uniquement.
2. **Une clé par personne**, limitée à son seul repo privé, permission « Contents : read/write », expiration 90 jours. Jamais la clé d'une autre personne.
3. La clé est transmise **à part** du message d'installation, puis le message est supprimé. Elle n'est jamais envoyée à Bertrand ni à un assistant, et jamais écrite dans le repo.
4. L'app refuse un repo public (contrôle dans `js/sync.js`).
5. **Accord écrit** de la personne avant l'installation (modèle : `docs/CONSENTEMENT-modele.md`) et avant toute lecture de ses données par Bertrand.
6. La **bêta** n'utilise que des données fictives et n'est jamais reliée au repo d'une vraie personne.
7. Toute modification passe par une PR, la CI verte et un test sur la bêta ; seul Bertrand fusionne dans `main`.
8. Les documents nominatifs (registre des testeurs, consentements signés, incidents) vont dans un repo **privé** d'administration, jamais ici.

## 4. Menaces principales et mesures

Le détail et le suivi sont dans `docs/RISQUES.md`.

| Menace | Mesure |
|---|---|
| Clé volée ou publiée | Clé limitée à un seul repo, expiration 90 jours, détection de secrets GitHub, révocation immédiate (RUNBOOK §3) |
| Téléphone perdu | Révoquer la clé ; les données restent dans le repo privé |
| Donnée de santé publiée par erreur | Règle 1, relecture de chaque PR, données de test fictives |
| Mise à jour qui casse l'app ou les données | Tests, bêta, versions étiquetées, `PATCHES` qui ne suppriment jamais de données, retour arrière (RUNBOOK §5) |
| Code injecté par un texte saisi | Tout texte est échappé avant affichage (`esc()`), fichiers importés validés |
| Dépendance d'outillage compromise | Outils seulement en CI (`tools/`, `tests/`), versions figées, Dependabot |

## 5. Réglages GitHub attendus

- Authentification à deux facteurs sur le compte.
- Branche `main` protégée : PR obligatoire, CI « test » obligatoire, pas de force-push ni de suppression.
- *Secret scanning* + *push protection* activés.
- Dependabot (alertes) activé.
- Secret `BETA_TOKEN` limité au repo `oliweigth-beta`.

## 6. Incident

Procédure pas à pas : `docs/RUNBOOK.md` §3. En résumé : **contenir** (révoquer la clé), **prévenir** la personne concernée le jour même, **corriger**, **noter** l'incident (date, cause, données touchées, mesure) dans le repo d'administration.

## 7. Limites

OliWeight est un carnet de suivi, pas un dispositif médical (avertissement affiché dans l'app). Le cadre légal (LPRPDE, lois provinciales) est à faire vérifier par un professionnel avant toute version serveur ou payante.
