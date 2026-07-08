import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import helmet from 'helmet';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Sécurité HTTP de base (headers)
  app.use(helmet());

  // CORS ouvert pour l'app mobile (à restreindre en production à vos domaines/app schemes)
  app.enableCors();

  // Validation automatique des DTO sur toutes les routes
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // supprime les champs non déclarés dans les DTO
      forbidNonWhitelisted: true,
      transform: true, // convertit les payloads en instances de classes (types corrects)
    }),
  );

  // Format de réponse et gestion d'erreurs homogènes
  app.useGlobalInterceptors(new TransformInterceptor());
  app.useGlobalFilters(new HttpExceptionFilter());

  app.setGlobalPrefix('api/v1');

  // Documentation Swagger — disponible sur /api/docs
  const config = new DocumentBuilder()
    .setTitle('Mboa Connect API')
    .setDescription(
      "API de Mboa Connect : annonces immobilières, commerces et artisans à Yaoundé. " +
        "Authentification par OTP (téléphone) — utilisez /auth/verify-otp pour obtenir un token, " +
        "puis le bouton 'Authorize' ci-dessous avec 'Bearer <votre_token>'.",
    )
    .setVersion('1.0')
    .addBearerAuth()
    .addTag('auth', 'Inscription / connexion par OTP')
    .addTag('users', 'Profil utilisateur')
    .addTag('categories', 'Catégories d\'annonces')
    .addTag('listings', 'Annonces (CRUD, recherche, photos)')
    .addTag('uploads', 'Upload de photos')
    .addTag('favorites', 'Favoris')
    .addTag('notifications', 'Notifications in-app')
    .addTag('admin', 'Modération (réservé aux administrateurs)')
    .addTag('payments', 'Paiements mobile money (Orange Money / MTN MoMo)')
    .addTag('messages', 'Messagerie interne')
    .addTag('recommendations', 'Recommandations personnalisées')
    .addTag('ads', 'Publicité')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  const port = process.env.PORT || 3000;
  await app.listen(port);
  // eslint-disable-next-line no-console
  console.log(`🚀 Mboa Connect API démarrée sur http://localhost:${port}/api/v1`);
  // eslint-disable-next-line no-console
  console.log(`📚 Documentation Swagger sur http://localhost:${port}/api/docs`);
}
bootstrap();
