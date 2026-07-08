# Passation développeur — Mboa Connect v1.0.0

Ce document est fait pour vous (le développeur qui reprend ce projet). Il résume en une page ce qu'il faut savoir avant de commencer.

## En une phrase

Marketplace mobile pour Yaoundé (maisons, boutiques, terrains, commerces, artisans) — backend NestJS/PostgreSQL complet, app React Native (Expo) fonctionnelle, générés par IA puis audités et corrigés, **jamais exécutés contre une vraie base de données** faute d'accès réseau dans l'environnement de génération.

## Ce qui a été fait

- Backend NestJS complet : 13 modules (auth OTP, users, categories, listings, uploads, favorites, notifications, admin, payments, messages, recommendations, ads), migrations SQL, Swagger, tests unitaires + e2e.
- App mobile React Native/Expo branchée sur l'API réelle (pas de données mockées) : auth OTP, navigation, CRUD annonces, upload photos, carte/géolocalisation, favoris, messagerie, admin.
- Vérification par analyse statique TypeScript complète (tous modules externes neutralisés pour isoler les vraies erreurs de logique) : **4 bugs réels trouvés et corrigés** (détail dans `docs/bugs-and-todo.md`), 2 dépendances manquantes ajoutées.
- Docker (dev + prod), scripts d'installation/démarrage/tests, guide de déploiement Ubuntu, guide de build Android.

## Ce qui n'a PAS été fait (important)

- **`npm install` réel n'a jamais tourné** — l'environnement de génération n'a pas d'accès réseau vers registry.npmjs.org. Les versions dans les `package.json` sont cohérentes sur le papier mais pas résolues par un vrai gestionnaire de paquets.
- **Le serveur n'a jamais démarré contre une vraie base PostgreSQL.** Aucune requête HTTP réelle n'a été exécutée.
- **Aucun test (unitaire ou e2e) n'a réellement tourné.** Ils sont écrits et devraient passer, mais ça n'a jamais été vérifié en pratique.
- **Aucun APK n'a été généré** (pas de SDK Android dans l'environnement de génération).

**Concrètement : votre première tâche n'est pas d'ajouter des fonctionnalités, c'est de faire tourner le projet une première fois et de corriger ce qui casse au premier `npm install` / premier démarrage.** C'est probablement rapide (versions de packages à ajuster, peut-être un import qui manque), mais c'est une étape non négociable avant toute chose.

## Par où commencer (ordre recommandé)

1. `./scripts/install.sh` — notez toute erreur `npm install` et corrigez les versions de packages en cause.
2. `./scripts/test.sh --unit` — tests unitaires, ne nécessitent pas de base de données. Doivent passer rapidement une fois l'install réussie.
3. `./scripts/test.sh --e2e` — tests end-to-end contre une vraie base PostgreSQL jetable (Docker requis).
4. `./scripts/start.sh` puis ouvrez `http://localhost:3000/api/docs` (Swagger) — testez manuellement `POST /auth/request-otp` et `POST /auth/verify-otp` pour valider le parcours d'authentification de bout en bout.
5. `./scripts/start.sh --mobile` — lancez l'app sur Expo Go ou un émulateur, vérifiez que l'écran d'accueil charge bien les catégories depuis l'API.
6. Une fois tout ça vert : ouvrez `docs/bugs-and-todo.md` et traitez la liste "Doit être fait avant le premier déploiement public" (fournisseur SMS réel, paiements réels, rate limiting, CORS).

## Documents à lire, dans l'ordre

1. `README.md` — vue d'ensemble, installation, arborescence
2. `docs/bugs-and-todo.md` — bugs déjà corrigés + ce qu'il reste à faire (le plus important à lire en premier)
3. `docs/architecture.md` — schéma de données complet, pensé pour l'évolutivité
4. `docs/deployment-ubuntu.md` — déploiement production (à lire quand le projet tourne en local)
5. `docs/android-build.md` — génération de l'APK/AAB via EAS Build

## Décisions d'architecture à connaître

- **Modules pluggables par interface** (pattern répété volontairement) : `SmsService` (SMS), `StorageProvider` (photos), `PaymentProvider` (Orange Money/MTN MoMo) sont tous en mode "simulation/console" par défaut, avec une interface claire à implémenter pour brancher le vrai service. Cherchez `TODO production` dans le code pour les repérer.
- **Toute nouvelle annonce (création ou modification) repasse au statut `pending`** — c'est voulu (modération systématique), pas un bug.
- **Modulaire mais pas microservices** : les 13 modules NestJS tournent dans un seul processus (monolithe modulaire). Architecture volontaire pour l'étape actuelle — voir `docs/architecture.md` pour la trajectoire vers des microservices si le trafic le justifie un jour.

## Contact / contexte

Ce projet a été spécifié et développé itérativement avec l'aide de Claude (Anthropic) à la demande du porteur de projet, pour une marketplace locale à Yaoundé, Cameroun. Le porteur de projet peut répondre aux questions fonctionnelles (priorités métier, comportement attendu) ; vous êtes responsable de la validation technique et de la mise en production.
