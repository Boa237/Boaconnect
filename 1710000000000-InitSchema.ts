import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Migration initiale : crée toutes les tables du MVP.
 * Exécution : npm run migration:run
 */
export class InitSchema1710000000000 implements MigrationInterface {
  name = 'InitSchema1710000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`);

    await queryRunner.query(`
      CREATE TYPE "users_role_enum" AS ENUM ('user', 'artisan', 'admin');
    `);
    await queryRunner.query(`
      CREATE TABLE "users" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "phoneNumber" varchar UNIQUE NOT NULL,
        "fullName" varchar,
        "email" varchar UNIQUE,
        "passwordHash" varchar,
        "role" "users_role_enum" NOT NULL DEFAULT 'user',
        "preferredLanguage" varchar NOT NULL DEFAULT 'fr',
        "city" varchar,
        "neighborhood" varchar,
        "profilePhotoUrl" varchar,
        "isPhoneVerified" boolean NOT NULL DEFAULT false,
        "isProfileComplete" boolean NOT NULL DEFAULT false,
        "createdAt" timestamptz NOT NULL DEFAULT now(),
        "updatedAt" timestamptz NOT NULL DEFAULT now()
      );
    `);

    await queryRunner.query(`
      CREATE TABLE "otp_codes" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "phoneNumber" varchar NOT NULL,
        "codeHash" varchar NOT NULL,
        "attempts" integer NOT NULL DEFAULT 0,
        "isUsed" boolean NOT NULL DEFAULT false,
        "expiresAt" timestamptz NOT NULL,
        "createdAt" timestamptz NOT NULL DEFAULT now()
      );
    `);
    await queryRunner.query(`CREATE INDEX "idx_otp_phone" ON "otp_codes" ("phoneNumber")`);

    await queryRunner.query(`
      CREATE TABLE "categories" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "slug" varchar UNIQUE NOT NULL,
        "nameFr" varchar NOT NULL,
        "nameEn" varchar NOT NULL,
        "icon" varchar
      );
    `);

    await queryRunner.query(`
      CREATE TYPE "listings_status_enum" AS ENUM ('pending', 'approved', 'rejected', 'archived');
    `);
    await queryRunner.query(`
      CREATE TABLE "listings" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "owner_id" uuid NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
        "category_id" uuid NOT NULL REFERENCES "categories"("id"),
        "title" varchar NOT NULL,
        "description" text NOT NULL,
        "price" numeric,
        "priceUnit" varchar NOT NULL DEFAULT 'on_request',
        "currency" varchar NOT NULL DEFAULT 'XAF',
        "city" varchar NOT NULL,
        "neighborhood" varchar NOT NULL,
        "latitude" double precision,
        "longitude" double precision,
        "status" "listings_status_enum" NOT NULL DEFAULT 'pending',
        "rejectionReason" varchar,
        "whatsappNumber" varchar,
        "contactPhone" varchar,
        "viewsCount" integer NOT NULL DEFAULT 0,
        "createdAt" timestamptz NOT NULL DEFAULT now(),
        "updatedAt" timestamptz NOT NULL DEFAULT now()
      );
    `);
    await queryRunner.query(`CREATE INDEX "idx_listings_status_category" ON "listings" ("status", "category_id")`);
    await queryRunner.query(`CREATE INDEX "idx_listings_city" ON "listings" ("city")`);

    await queryRunner.query(`
      CREATE TABLE "listing_photos" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "listing_id" uuid NOT NULL REFERENCES "listings"("id") ON DELETE CASCADE,
        "url" varchar NOT NULL,
        "position" integer NOT NULL DEFAULT 0
      );
    `);

    await queryRunner.query(`
      CREATE TABLE "favorites" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "user_id" uuid NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
        "listing_id" uuid NOT NULL REFERENCES "listings"("id") ON DELETE CASCADE,
        "createdAt" timestamptz NOT NULL DEFAULT now(),
        UNIQUE ("user_id", "listing_id")
      );
    `);

    await queryRunner.query(`
      CREATE TABLE "notifications" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "user_id" uuid NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
        "type" varchar NOT NULL,
        "title" varchar NOT NULL,
        "body" text NOT NULL,
        "listing_id" uuid,
        "isRead" boolean NOT NULL DEFAULT false,
        "createdAt" timestamptz NOT NULL DEFAULT now()
      );
    `);
    await queryRunner.query(`CREATE INDEX "idx_notifications_user_read" ON "notifications" ("user_id", "isRead")`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "notifications"`);
    await queryRunner.query(`DROP TABLE "favorites"`);
    await queryRunner.query(`DROP TABLE "listing_photos"`);
    await queryRunner.query(`DROP TABLE "listings"`);
    await queryRunner.query(`DROP TYPE "listings_status_enum"`);
    await queryRunner.query(`DROP TABLE "categories"`);
    await queryRunner.query(`DROP TABLE "otp_codes"`);
    await queryRunner.query(`DROP TABLE "users"`);
    await queryRunner.query(`DROP TYPE "users_role_enum"`);
  }
}
