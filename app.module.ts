import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import configuration from './config/configuration';
import { validationSchema } from './config/validation.schema';

import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { CategoriesModule } from './categories/categories.module';
import { ListingsModule } from './listings/listings.module';
import { UploadsModule } from './uploads/uploads.module';
import { FavoritesModule } from './favorites/favorites.module';
import { NotificationsModule } from './notifications/notifications.module';
import { AdminModule } from './admin/admin.module';
import { PaymentsModule } from './payments/payments.module';
import { MessagesModule } from './messages/messages.module';
import { RecommendationsModule } from './recommendations/recommendations.module';
import { AdsModule } from './ads/ads.module';

@Module({
  imports: [
    // Configuration centralisée + validation des variables d'environnement au démarrage
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
      validationSchema,
    }),

    // Connexion PostgreSQL via TypeORM
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        host: config.get('database.host'),
        port: config.get('database.port'),
        username: config.get('database.user'),
        password: config.get('database.password'),
        database: config.get('database.name'),
        autoLoadEntities: true,
        // IMPORTANT : synchronize doit rester "false" en production.
        // Le schéma est géré par les migrations (npm run migration:run).
        synchronize: false,
        logging: config.get('app.nodeEnv') === 'development' ? ['error', 'warn'] : false,
      }),
    }),

    // Sert les photos uploadées en fichiers statiques (/uploads/...)
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', process.env.UPLOAD_DIR || 'uploads'),
      serveRoot: '/uploads',
    }),

    AuthModule,
    UsersModule,
    CategoriesModule,
    ListingsModule,
    UploadsModule,
    FavoritesModule,
    NotificationsModule,
    AdminModule,
    PaymentsModule,
    MessagesModule,
    RecommendationsModule,
    AdsModule,
  ],
})
export class AppModule {}
