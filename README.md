# Mboa Connect — v1.0.0 (version stable)

> 👋 **Développeur qui reprend ce projet : lisez d'abord [`HANDOFF.md`](./HANDOFF.md)** (1 page, contexte + priorités).

Backend **NestJS + PostgreSQL** et application mobile **React Native (Expo)** pour Yaoundé, avec authentification par OTP, gestion complète des annonces (CRUD, photos, géolocalisation), favoris, notifications, paiements mobile money, messagerie interne, recommandations, publicité, et modération admin.

Cette version a été auditée et stabilisée : voir `docs/bugs-and-todo.md` pour le détail des bugs corrigés et des points restants avant une mise en production à grande échelle.

> ⚠️ Le code a été vérifié par analyse statique TypeScript complète (voir `docs/bugs-and-todo.md`), mais n'a pas pu être exécuté contre une vraie base de données ni testé end-to-end dans l'environnement qui l'a généré (pas d'accès réseau pour `npm install`). Utilisez `./scripts/install.sh` puis `./scripts/test.sh` pour valider le projet dans votre environnement avant toute mise en production.

---

## 1. Démarrage rapide

```bash
./scripts/install.sh    # installe tout (backend + mobile), démarre PostgreSQL, exécute les migrations
./scripts/start.sh       # démarre le backend (puis lancez ./scripts/start.sh --mobile dans un 2e terminal)
./scripts/test.sh        # lance les tests unitaires + end-to-end
```

Documentation Swagger interactive une fois le backend lancé : **http://localhost:3000/api/docs**

---

## 2. Arborescence du projet

```
mboa-connect/
├── docker-compose.yml         # Postgres + backend + Adminer (développement)
├── docker-compose.prod.yml    # Postgres + backend (production, sans bind mounts)
├── scripts/
│   ├── install.sh             # installation automatique complète
│   ├── start.sh                # démarrage backend et/ou mobile
│   └── test.sh                  # tests unitaires + e2e (avec base de test jetable)
├── docs/
│   ├── architecture.md         # schémas de données et architecture détaillée
│   ├── deployment-ubuntu.md    # guide de déploiement production pas à pas
│   ├── android-build.md        # génération de l'APK/AAB Android (EAS Build)
│   └── bugs-and-todo.md        # bugs corrigés + points restants avant production
├── backend/                    # API NestJS
│   ├── Dockerfile              # image de développement
│   ├── Dockerfile.prod         # image de production (multi-étapes)
│   ├── test/                   # tests end-to-end
│   └── src/
│       ├── auth/                # OTP, JWT, inscription/connexion par téléphone
│       ├── users/
│       ├── categories/
│       ├── listings/            # CRUD annonces + géolocalisation (+ tests unitaires)
│       ├── uploads/             # upload et compression des photos
│       ├── favorites/           # (+ tests unitaires)
│       ├── notifications/
│       ├── admin/               # modération (approuver/rejeter/supprimer)
│       ├── payments/            # Orange Money / MTN MoMo
│       ├── messages/            # messagerie interne
│       ├── recommendations/     # moteur de recommandations
│       ├── ads/                 # publicité
│       └── database/            # migrations + seed
└── mobile/                      # App Expo / React Native
    └── src/
        ├── api/                  # client Axios + appels par ressource
        ├── context/              # session utilisateur (JWT)
        ├── navigation/
        └── screens/
```

---

## 3. Prérequis

- Node.js 20+
- Docker + Docker Compose (pour PostgreSQL)
- Un téléphone Android (avec l'app **Expo Go**) ou un émulateur Android Studio
- Un compte Google Cloud avec une clé **Maps SDK for Android** activée (pour la carte — optionnel au tout début)

---

## 4. Installation manuelle (si vous préférez ne pas utiliser scripts/install.sh)

```bash
cd mboa-connect/backend

# 1. Installer les dépendances
npm install

# 2. Copier et ajuster les variables d'environnement si besoin
cp .env.example .env
# Ouvrez .env et changez au minimum JWT_ACCESS_SECRET / JWT_REFRESH_SECRET

# 3. Démarrer PostgreSQL (depuis la racine du projet, un niveau au-dessus)
cd ..
docker compose up -d postgres adminer

# 4. Revenir dans backend/, exécuter les migrations puis le seed des catégories
cd backend
npm run migration:run
npm run seed

# 5. Démarrer l'API en mode développement
npm run start:dev
```

L'API est disponible sur `http://localhost:3000/api/v1`.
Adminer (interface web PostgreSQL) est sur `http://localhost:8081` (système : PostgreSQL, serveur : `postgres`, utilisateur/mot de passe : voir `.env`).

### Tester l'inscription par OTP en ligne de commande

```bash
# Étape 1 : demander un code
curl -X POST http://localhost:3000/api/v1/auth/request-otp \
  -H "Content-Type: application/json" \
  -d '{"phoneNumber":"+237690000001"}'
# Le code s'affiche dans les logs du serveur (SMS_PROVIDER=console en dev)

# Étape 2 : vérifier le code reçu (remplacez 123456 par le code affiché dans les logs)
curl -X POST http://localhost:3000/api/v1/auth/verify-otp \
  -H "Content-Type: application/json" \
  -d '{"phoneNumber":"+237690000001","code":"123456"}'
```

### Créer le premier compte administrateur

Après avoir créé un compte via OTP, promouvez-le en admin directement en base (via Adminer ou `psql`) :

```sql
UPDATE users SET role = 'admin' WHERE "phoneNumber" = '+237690000001';
```

---

## 5. Lancer le mobile manuellement

```bash
cd mboa-connect/mobile
npm install
```

Avant de démarrer, ouvrez `app.json` et ajustez :
- `expo.extra.apiUrl` : `http://10.0.2.2:3000/api/v1` fonctionne pour l'émulateur Android. Sur un téléphone physique, remplacez `10.0.2.2` par l'adresse IP locale de votre ordinateur (ex: `http://192.168.1.20:3000/api/v1`), votre téléphone et votre ordinateur devant être sur le même réseau Wi-Fi.
- `expo.android.config.googleMaps.apiKey` : votre clé Google Maps (sinon la carte ne s'affichera pas sur Android — le reste de l'app fonctionne normalement).

Puis :

```bash
npx expo start
```

Scannez le QR code avec l'app **Expo Go** sur votre téléphone Android, ou appuyez sur `a` pour lancer l'émulateur Android.

---

## 6. Ce qui est réellement fonctionnel dans cette version

- ✅ Connexion PostgreSQL réelle via TypeORM, migrations versionnées (pas de `synchronize: true`)
- ✅ Inscription/connexion par téléphone avec OTP (hashé en base, expiration, limite de tentatives)
- ✅ JWT access + refresh token, guard global, rôles (`user` / `artisan` / `admin`)
- ✅ CRUD complet des annonces avec vérification de propriété (un utilisateur ne modifie que ses annonces)
- ✅ Upload de plusieurs photos par annonce, compression automatique (Sharp), stockage sur disque local (interface prête pour S3)
- ✅ Géolocalisation des biens (latitude/longitude) + affichage sur carte (`react-native-maps`) et capture de la position actuelle lors de la publication
- ✅ Favoris (ajout/retrait/liste)
- ✅ Notifications in-app persistées en base, avec un point d'extension clair pour brancher Firebase Cloud Messaging (push réel)
- ✅ Tableau de bord admin (lister les annonces en attente, approuver, rejeter avec motif, supprimer)
- ✅ Français / anglais côté mobile (fichiers `i18n/fr.json`, `i18n/en.json`)
- ✅ **Paiements mobile money** (`PaymentsModule`) : initiation de paiement Orange Money / MTN MoMo (en mode simulation tant que les identifiants marchands réels ne sont pas fournis), webhook de confirmation, boost automatique d'une annonce pendant 7 jours après paiement réussi
- ✅ **Messagerie interne** (`MessagesModule`) : conversations liées à une annonce, envoi/réception de messages, notification automatique au destinataire ; l'app mobile récupère les nouveaux messages par sondage (polling toutes les 4s)
- ✅ **Recommandations IA** (`RecommendationsModule`) : journal des interactions (vues authentifiées, favoris), moteur à base de règles qui priorise catégories/quartiers déjà consultés, avec repli sur les annonces populaires — conçu pour être remplacé par un vrai modèle sans changer le contrat de l'API
- ✅ **Publicité** (`AdsModule`) : bannières par emplacement (`home_banner` géré côté mobile), comptage impressions/clics, gestion CRUD réservée aux admins

- ✅ **Documentation Swagger complète** : tous les endpoints sont documentés avec tags, résumés et schémas de requête/réponse, disponible sur `/api/docs` une fois le serveur lancé
- ✅ **Tests automatisés** : tests unitaires (`AuthService`, `ListingsService`, `FavoritesService`) et tests end-to-end (routes publiques, validation, guards d'authentification) — voir `./scripts/test.sh`
- ✅ **Images Docker de développement et de production séparées**, `.dockerignore`, et `docker-compose.prod.yml` dédié au déploiement

## 7. Ce qui reste à faire avant une mise en production réelle

- Remplacer `SmsService` (actuellement en mode "console") par un vrai fournisseur SMS (Twilio ou un agrégateur camerounais) — le point d'extension est déjà préparé dans `backend/src/auth/sms/sms.service.ts`.
- Remplacer `LocalStorageProvider` par un provider S3/MinIO pour les photos en production (interface déjà prête dans `backend/src/uploads/storage/`).
- Brancher les vraies API Orange Money / MTN MoMo dans `OrangeMoneyProvider` / `MtnMomoProvider` (actuellement en mode simulation) et sécuriser la vérification de signature des webhooks (`verifyWebhookSignature`).
- Remplacer le sondage (polling) de la messagerie par une connexion WebSocket (`@nestjs/websockets`) pour du temps réel.
- Ajouter les tests automatisés (unitaires + e2e) — la structure NestJS s'y prête nativement (`@nestjs/testing`).
- Mettre en place HTTPS (reverse proxy Nginx/Caddy + certificat Let's Encrypt) devant l'API.
- Ajouter un rate-limiting global (ex: `@nestjs/throttler`) pour protéger `/auth/request-otp` contre les abus.
- Configurer Firebase Cloud Messaging pour le push natif (le point d'extension `pushToDevice()` est prêt dans `NotificationsService`).

## 8. Évolutions suivantes possibles

- Remplacer le moteur de recommandations par un vrai modèle de collaborative filtering entraîné sur `user_interactions`.
- Ajouter un système d'abonnement récurrent (comptes professionnels, artisans) en s'appuyant sur `Transaction.type = 'subscription'`, déjà prévu dans le schéma.
- Enrichir la messagerie avec l'envoi de photos et les accusés de lecture.
- Ciblage publicitaire plus fin (par catégorie/quartier) en utilisant les emplacements `category_top` et `search_top`, déjà définis dans `AdPlacement`.

Voir le document d'architecture (`docs/architecture.md`) pour le détail complet des schémas de données.

## 9. Tests

```bash
./scripts/test.sh --unit   # tests unitaires uniquement (rapide, pas de DB requise)
./scripts/test.sh --e2e    # tests end-to-end (démarre une base PostgreSQL de test jetable, la détruit à la fin)
./scripts/test.sh          # les deux
```

## 10. Documentation complète fournie

| Document | Contenu |
|---|---|
| `README.md` (ce fichier) | Vue d'ensemble, installation, fonctionnalités |
| `docs/architecture.md` | Schémas de base de données, architecture détaillée |
| `docs/deployment-ubuntu.md` | Déploiement production pas à pas (Docker, Nginx, HTTPS, sauvegardes) |
| `docs/android-build.md` | Génération de l'APK/AAB Android via EAS Build |
| `docs/bugs-and-todo.md` | Bugs corrigés dans cette version + checklist avant mise en production |
| Swagger (`/api/docs`) | Référence interactive de toutes les routes API |

## 11. Remise à un développeur

Pour transmettre ce projet à un développeur pour installation et tests :
1. Donnez-lui l'archive complète (ce dossier `mboa-connect/`).
2. Il exécute `./scripts/install.sh` (installe tout, démarre PostgreSQL, migrations, seed).
3. Il exécute `./scripts/test.sh` pour valider que tout fonctionne dans son environnement.
4. Il exécute `./scripts/start.sh` pour lancer le backend, puis `./scripts/start.sh --mobile` pour l'app.
5. Il consulte `docs/bugs-and-todo.md` pour connaître les points restants avant une mise en production réelle.
