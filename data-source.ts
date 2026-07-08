import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';
dotenv.config();

/**
 * DataSource utilisé uniquement par la CLI TypeORM (génération/exécution des
 * migrations). L'application elle-même utilise TypeOrmModule.forRootAsync
 * dans app.module.ts.
 */
export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  username: process.env.DB_USER || 'mboa_user',
  password: process.env.DB_PASSWORD || 'mboa_password',
  database: process.env.DB_NAME || 'mboa_connect',
  entities: ['src/**/*.entity.ts'],
  migrations: ['src/database/migrations/*.ts'],
  synchronize: false,
});
