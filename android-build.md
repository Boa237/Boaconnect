# Générer l'APK / AAB Android — Mboa Connect

## Pourquoi il n'y a pas de fichier .apk dans cette archive

Construire un binaire Android nécessite un SDK Android, Gradle, et un accès réseau pour télécharger les outils de build (~2-4 Go). L'environnement qui a généré ce projet n'a ni SDK Android, ni Gradle, ni accès réseau sortant — il est donc techniquement impossible d'y produire un `.apk` ou `.aab` réel. Ce document vous donne la marche à suivre exacte pour en générer un vous-même en quelques minutes, sans avoir besoin d'installer Android Studio.

## Méthode recommandée : EAS Build (cloud, aucun SDK local requis)

EAS (Expo Application Services) est le service officiel d'Expo pour compiler des apps React Native dans le cloud. C'est la méthode la plus simple et la plus fiable.

### 1. Prérequis

```bash
cd mboa-connect/mobile
npm install -g eas-cli
eas login   # créez un compte gratuit sur expo.dev si besoin
```

### 2. Lier le projet à Expo

```bash
eas init
```
Cela remplit automatiquement `extra.eas.projectId` dans `app.json`.

### 3. Configurer la clé Google Maps et l'URL de l'API de production

Avant de builder, éditez `mobile/app.json` :
- `expo.android.config.googleMaps.apiKey` → votre vraie clé Google Maps (Maps SDK for Android activé sur Google Cloud Console)
- Dans `eas.json`, ajustez `build.preview.env.API_URL` / `build.production.env.API_URL` vers l'URL réelle de votre backend déployé (voir `docs/deployment-ubuntu.md`)

### 4. Générer un APK de démonstration/test (installable directement sur un téléphone)

```bash
eas build --platform android --profile preview
```

Le build se déroule sur les serveurs Expo (5-15 minutes). À la fin, EAS fournit un lien de téléchargement direct du fichier `.apk`, installable sur n'importe quel téléphone Android (activez "Sources inconnues" dans les paramètres du téléphone pour l'installer manuellement, ou scannez le QR code fourni par EAS).

### 5. Générer l'AAB de production (format requis par Google Play)

```bash
eas build --platform android --profile production
```

Cela génère un `.aab` (Android App Bundle), signé automatiquement par EAS (il génère et gère un keystore pour vous — répondez "Yes" quand il propose d'en créer un, et **conservez précieusement les identifiants affichés**, notamment si vous gérez le keystore vous-même par la suite).

### 6. Publier sur Google Play

```bash
eas submit --platform android
```

Ou manuellement : téléchargez le `.aab` depuis le lien fourni par `eas build`, puis uploadez-le dans la [Google Play Console](https://play.google.com/console) (nécessite un compte développeur Google Play, 25 USD à vie).

Avant publication, Google Play exige :
- une politique de confidentialité (URL publique) — obligatoire car l'app demande la géolocalisation et l'accès aux photos
- une fiche store complète (captures d'écran, description, catégorie)
- de répondre au questionnaire de classification du contenu

## Méthode alternative : build local avec Gradle (sans passer par EAS)

Si vous préférez ne pas dépendre du cloud Expo :

```bash
cd mboa-connect/mobile
npx expo prebuild --platform android   # génère le dossier android/ natif
cd android
./gradlew assembleRelease              # produit un .apk dans android/app/build/outputs/apk/release/
# ou :
./gradlew bundleRelease                # produit un .aab dans android/app/build/outputs/bundle/release/
```

Prérequis pour cette méthode : Android Studio + Android SDK installés localement, un JDK 17, et la génération manuelle d'un keystore de signature (`keytool -genkeypair -v -keystore mboa-connect.keystore -alias mboa-connect -keyalg RSA -keysize 2048 -validity 10000`), à référencer dans `android/gradle.properties` et `android/app/build.gradle`. Cette méthode est plus longue à mettre en place mais ne dépend d'aucun service externe.

## Recommandation

Pour un premier APK de démonstration à faire tester à des utilisateurs, la commande `eas build --platform android --profile preview` (méthode 1) est de loin la plus rapide : aucune installation d'Android Studio, résultat en moins de 15 minutes.
