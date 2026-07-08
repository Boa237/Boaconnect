import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Ajoute les 4 fonctionnalités évolutives : paiements mobile money,
 * messagerie interne, recommandations (journal d'interactions), publicité.
 * Exécution : npm run migration:run
 */
export class EvolutiveFeatures1710000100000 implements MigrationInterface {
  name = 'EvolutiveFeatures1710000100000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // --- Boost d'annonces (utilisé par le module Payments) ---
    await queryRunner.query(`ALTER TABLE "listings" ADD COLUMN "isBoosted" boolean NOT NULL DEFAULT false`);
    await queryRunner.query(`ALTER TABLE "listings" ADD COLUMN "boostExpiresAt" timestamptz`);

    // --- Paiements mobile money ---
    await queryRunner.query(`
      CREATE TABLE "transactions" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "user_id" uuid NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
        "listing_id" uuid REFERENCES "listings"("id") ON DELETE SET NULL,
        "type" varchar NOT NULL,
        "amount" numeric NOT NULL,
        "currency" varchar NOT NULL DEFAULT 'XAF',
        "provider" varchar NOT NULL,
        "providerReference" varchar,
        "status" varchar NOT NULL DEFAULT 'pending',
        "createdAt" timestamptz NOT NULL DEFAULT now(),
        "updatedAt" timestamptz NOT NULL DEFAULT now()
      );
    `);
    await queryRunner.query(`CREATE INDEX "idx_transactions_user" ON "transactions" ("user_id")`);

    // --- Messagerie interne ---
    await queryRunner.query(`
      CREATE TABLE "conversations" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "participant_one_id" uuid NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
        "participant_two_id" uuid NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
        "listing_id" uuid REFERENCES "listings"("id") ON DELETE SET NULL,
        "lastMessageAt" timestamptz,
        "createdAt" timestamptz NOT NULL DEFAULT now(),
        UNIQUE ("participant_one_id", "participant_two_id")
      );
    `);
    await queryRunner.query(`
      CREATE TABLE "messages" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "conversation_id" uuid NOT NULL REFERENCES "conversations"("id") ON DELETE CASCADE,
        "sender_id" uuid NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
        "body" text NOT NULL,
        "isRead" boolean NOT NULL DEFAULT false,
        "createdAt" timestamptz NOT NULL DEFAULT now()
      );
    `);
    await queryRunner.query(`CREATE INDEX "idx_messages_conversation" ON "messages" ("conversation_id")`);

    // --- Recommandations / IA ---
    await queryRunner.query(`
      CREATE TABLE "user_interactions" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "user_id" uuid REFERENCES "users"("id") ON DELETE SET NULL,
        "listing_id" uuid NOT NULL REFERENCES "listings"("id") ON DELETE CASCADE,
        "action" varchar NOT NULL,
        "createdAt" timestamptz NOT NULL DEFAULT now()
      );
    `);
    await queryRunner.query(`CREATE INDEX "idx_interactions_user" ON "user_interactions" ("user_id")`);
    await queryRunner.query(`CREATE INDEX "idx_interactions_listing" ON "user_interactions" ("listing_id")`);

    // --- Publicité ---
    await queryRunner.query(`
      CREATE TABLE "ads" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "advertiser_id" uuid REFERENCES "users"("id") ON DELETE SET NULL,
        "listing_id" uuid REFERENCES "listings"("id") ON DELETE SET NULL,
        "placement" varchar NOT NULL,
        "imageUrl" varchar NOT NULL,
        "targetUrl" varchar,
        "startsAt" timestamptz NOT NULL,
        "endsAt" timestamptz NOT NULL,
        "budget" numeric,
        "impressions" integer NOT NULL DEFAULT 0,
        "clicks" integer NOT NULL DEFAULT 0,
        "createdAt" timestamptz NOT NULL DEFAULT now()
      );
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "ads"`);
    await queryRunner.query(`DROP TABLE "user_interactions"`);
    await queryRunner.query(`DROP TABLE "messages"`);
    await queryRunner.query(`DROP TABLE "conversations"`);
    await queryRunner.query(`DROP TABLE "transactions"`);
    await queryRunner.query(`ALTER TABLE "listings" DROP COLUMN "boostExpiresAt"`);
    await queryRunner.query(`ALTER TABLE "listings" DROP COLUMN "isBoosted"`);
  }
}
