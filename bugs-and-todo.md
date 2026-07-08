# Bugs corrigés et points restants avant mise en production — v1.0.0

Ce document liste honnêtement ce qui a été trouvé, corrigé, et ce qui reste à faire. Il est destiné à être remis à un développeur qui reprend le projet.

## Méthode de vérification utilisée

Cet environnement n'a pas d'accès réseau sortant, donc `npm install` réel, l'exécution du serveur, et les tests contre une vraie base n'ont pas pu être effectués ici. La vérification a été faite par :
1. **Analyse statique TypeScript** (`tsc --noEmit`) sur l'ensemble du code backend et mobile, avec les modules externes neutralisés (stub `declare module '*'`) pour isoler les vraies erreurs de logique des erreurs "module introuvable" attendues sans `node_modules`.
2. **Audit manuel** de chaque fichier : cohérence des imports/exports entre modules, correspondance entités ↔ migrations SQL, revue du `docker-compose.yml` et des Dockerfiles.
3. Le code n'a **pas** été exécuté contre une vraie instance PostgreSQL ni testé end-to-end dans cet environnement. Les tests fournis (`scripts/test.sh`) sont conçus pour que vous validiez cela dans votre environnement, qui a l'accès réseau nécessaire.

---

## 🐛 Bugs réels trouvés et corrigés dans cette passe

1. **`PaymentProviderName` non exporté** — `payments.controller.ts` et `payments.service.ts` importaient ce type depuis `payment-provider.interface.ts`, où il n'existait pas (il était défini uniquement dans `transaction.entity.ts`). Le code ne compilait pas. **Corrigé** : le type est maintenant défini une seule fois dans `payment-provider.interface.ts` et réimporté par `transaction.entity.ts`.
2. **Incompatibilité de type sur `Listing.rejectionReason`** — le champ était typé `string` (non nullable) mais `adminApprove()` lui assignait `null` pour effacer un motif de rejet précédent. Le code ne compilait pas. **Corrigé** : le champ est maintenant typé `string | null`.
3. **Dépendance manquante `@types/bcrypt`** — utilisée implicitement par `auth.service.ts` (`import * as bcrypt from 'bcrypt'`) mais absente de `package.json`. **Corrigée**.
4. **Mobile : pas de `tsconfig.json` ni de types React déclarés** — le projet mobile utilisait TypeScript (`.ts`/`.tsx`) sans configuration explicite ni `@types/react` en devDependency. **Corrigé** : ajout de `mobile/tsconfig.json` et des devDependencies correspondantes.
5. **`docker-compose.yml` sans image de production adaptée** — le Dockerfile initial (`node:20-alpine`, mode `start:dev`) n'était pas adapté à un déploiement réel (rebuilds inutiles, risque de compilation native de `sharp` sur musl/Alpine). **Corrigé** : ajout de `backend/Dockerfile.prod` (build multi-étapes, `node:20-slim`) et de `docker-compose.prod.yml` dédié à la production.
6. **Pas de `.dockerignore`** — risquait de copier `node_modules`/`.env` de l'hôte dans l'image Docker. **Corrigé**.
7. **Pas de fichier `.env` racine** — `docker-compose.yml` référence `${DB_NAME}`, `${DB_USER}`, `${DB_PASSWORD}` sans fichier `.env` à la racine pour les renseigner explicitement (les valeurs par défaut inline masquaient le problème). **Corrigé** : ajout de `.env.example` à la racine.
8. **Index déclaré sur la mauvaise propriété** — `@Index(['status', 'category'])` sur l'entité `Listing` référençait la relation (`category`, l'objet `Category` complet) au lieu de la colonne scalaire réelle (`categoryId`). Sans effet aujourd'hui (le schéma est géré par migrations manuelles, `synchronize: false`), mais aurait pu produire un index dupliqué ou incohérent si `migration:generate` est utilisé plus tard pour faire évoluer le schéma. **Corrigé** : `@Index(['status', 'categoryId'])`.

## ⚠️ Points restants à corriger ou vérifier avant une mise en production réelle

### Doit être fait avant le premier déploiement public
- [ ] **`npm install` réel non exécuté** : les versions de packages dans les `package.json` sont cohérentes sur le papier mais n'ont pas été résolues par un vrai gestionnaire de paquets. Lancez `./scripts/install.sh` et corrigez toute incompatibilité de version que npm pourrait signaler.
- [ ] **Aucun test n'a tourné contre une vraie base de données.** Exécutez `./scripts/test.sh` avant tout déploiement.
- [ ] **`SmsService` en mode "console"** : aucun SMS n'est réellement envoyé tant qu'un vrai fournisseur (Twilio ou agrégateur camerounais) n'est branché dans `backend/src/auth/sms/sms.service.ts`.
- [ ] **`OrangeMoneyProvider` / `MtnMomoProvider` en mode simulation** : aucun paiement réel n'est traité tant que les vraies API (avec identifiants marchands) ne sont pas branchées. La vérification de signature des webhooks (`verifyWebhookSignature`) est un stub qui accepte tout — **ne pas exposer ces webhooks publiquement sans l'implémenter**.
- [ ] **Rate limiting absent** : `/auth/request-otp` n'a aucune protection contre le spam/abus. Ajoutez `@nestjs/throttler` avant mise en production (voir suggestion ci-dessous).
- [ ] **CORS ouvert à tous (`app.enableCors()`)** : à restreindre aux domaines/schemes réels de l'app en production (`app.enableCors({ origin: [...] })`).
- [ ] **Stockage des photos en local (disque du serveur)** : fonctionnel mais non résilient (perdu si le conteneur est recréé sans volume, ne scale pas sur plusieurs serveurs). Le volume Docker `mboa_uploads` protège contre la perte de données mais un provider S3/MinIO est recommandé dès que le trafic grandit (interface déjà prête dans `backend/src/uploads/storage/`).

### Recommandé, mais non bloquant pour un premier lancement limité
- [ ] Ajouter `@nestjs/throttler` : `npm i @nestjs/throttler`, puis `ThrottlerModule.forRoot([{ ttl: 60000, limit: 5 }])` sur `AuthController` au minimum.
- [ ] Remplacer le polling de la messagerie (toutes les 4s) par une connexion WebSocket pour réduire la charge serveur à mesure que le nombre d'utilisateurs augmente.
- [ ] Ajouter une pagination sur `GET /notifications` (actuellement limité à 100, sans `page`/`limit`).
- [ ] Ajouter des index supplémentaires si les volumes grandissent : `favorites(user_id)`, `messages(sender_id)`.
- [ ] Le remplacement d'`Alert.prompt` (iOS uniquement) dans `AdminScreen.tsx` par une vraie modale multiplateforme pour saisir un motif de rejet personnalisé (actuellement, le rejet utilise un motif fixe sur Android).
- [ ] Étendre la couverture de tests unitaires aux services non encore couverts (`PaymentsService`, `MessagesService`, `RecommendationsService`, `AdsService`) en suivant le même modèle que `listings.service.spec.ts`.
- [ ] Ajouter un test e2e du parcours complet OTP → complétion de profil → publication d'annonce → modération admin (nécessite de pouvoir lire le code OTP depuis les logs en environnement de test, ou un mode de test dédié qui renvoie le code dans la réponse HTTP quand `NODE_ENV=test`).

### Concernant le build Android
- [ ] Aucun `.apk`/`.aab` n'a pu être généré dans cet environnement (pas de SDK Android, pas de réseau). Voir `docs/android-build.md` pour la marche à suivre exacte via EAS Build (~15 minutes, aucune installation locale requise).
- [ ] La clé Google Maps dans `app.json` est un placeholder (`REPLACE_WITH_YOUR_GOOGLE_MAPS_API_KEY`) — la carte ne s'affichera pas tant qu'elle n'est pas renseignée.
- [ ] `extra.eas.projectId` dans `app.json` est un placeholder, rempli automatiquement par `eas init`.

### Dette technique mineure (sans impact fonctionnel immédiat)
- [ ] Pas de logger structuré (ex: Pino/Winston) — actuellement le `Logger` intégré de NestJS suffit pour le volume attendu au lancement, mais un logger structuré facilitera le débogage en production à plus grande échelle.
- [ ] Pas de CI/CD configuré (ex: GitHub Actions) pour lancer automatiquement `./scripts/test.sh` sur chaque pull request.
- [ ] Le format des réponses d'erreur de validation (`class-validator`) pourrait être affiné pour être plus lisible côté mobile (actuellement, NestJS renvoie un tableau de messages bruts).

---

## Ce qui a été vérifié et jugé correct

- Cohérence entre les 13 modules NestJS (imports, exports, injection de dépendances) — vérifiée par lecture croisée et compilation TypeScript isolée.
- Cohérence entre les entités TypeORM et les deux fichiers de migration SQL (`InitSchema` et `EvolutiveFeatures`) — chaque colonne d'entité a sa contrepartie SQL, y compris les nouvelles colonnes `isBoosted`/`boostExpiresAt`.
- Règles de propriété (un utilisateur ne peut modifier/supprimer que ses propres annonces) — couvertes par les tests unitaires de `ListingsService`.
- Guards globaux (JWT obligatoire par défaut, `@Public()` explicite pour les exceptions, `@Roles(Role.ADMIN)` pour la modération) — logique relue en détail, cohérente avec l'usage dans chaque contrôleur.
- Structure Docker : `docker-compose.yml` (dev) et `docker-compose.prod.yml` (production) sont syntaxiquement valides (YAML) et cohérents avec les Dockerfiles associés.
