import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';

/**
 * Test end-to-end du parcours principal, contre une VRAIE base PostgreSQL
 * (voir .env.test). Nécessite que la base soit démarrée et migrée avant
 * l'exécution : voir scripts/test.sh, qui orchestre tout automatiquement.
 *
 * Parcours couvert :
 * 1. Demande d'un OTP
 * 2. Le code étant loggé en mode "console", on ne peut pas le lire ici
 *    automatiquement — ce test vérifie donc le contrat HTTP (status, forme
 *    de la réponse) plutôt que le contenu du SMS, qui est testé unitairement
 *    dans auth.service.spec.ts.
 * 3. Écran public : liste des catégories et des annonces approuvées.
 */
describe('Mboa Connect API (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
    app.setGlobalPrefix('api/v1');
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('GET /api/v1/categories renvoie la liste des catégories (endpoint public)', async () => {
    const res = await request(app.getHttpServer()).get('/api/v1/categories').expect(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  it('GET /api/v1/listings renvoie une page paginée d\'annonces approuvées', async () => {
    const res = await request(app.getHttpServer()).get('/api/v1/listings').expect(200);
    expect(res.body.data).toHaveProperty('items');
    expect(res.body.data).toHaveProperty('total');
    expect(res.body.data).toHaveProperty('page');
  });

  it('POST /api/v1/auth/request-otp avec un numéro invalide renvoie 400', async () => {
    await request(app.getHttpServer())
      .post('/api/v1/auth/request-otp')
      .send({ phoneNumber: 'pas-un-numero' })
      .expect(400);
  });

  it('POST /api/v1/auth/request-otp avec un numéro valide renvoie 201', async () => {
    const res = await request(app.getHttpServer())
      .post('/api/v1/auth/request-otp')
      .send({ phoneNumber: '+237690000099' })
      .expect(201);
    expect(res.body.data.message).toBeDefined();
  });

  it('Les routes protégées renvoient 401 sans token', async () => {
    await request(app.getHttpServer()).get('/api/v1/users/me').expect(401);
    await request(app.getHttpServer()).get('/api/v1/favorites').expect(401);
  });

  it("Les routes admin renvoient 401 sans token (avant même la vérification du rôle)", async () => {
    await request(app.getHttpServer()).get('/api/v1/admin/listings').expect(401);
  });
});
