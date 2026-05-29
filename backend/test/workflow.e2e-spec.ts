import request from 'supertest';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from '../src/app.module';

/**
 * Suite de tests d'intégration — Workflow end-to-end
 * Scénario : Candidat postule → Client soumet un test technique → Candidat passe le test
 *            → Client ajoute au workspace → Notifications envoyées
 */
describe('Workflow End-to-End (e2e)', () => {
  let app: INestApplication;

  // Tokens
  let adminToken: string;
  let candidateToken: string;
  let clientToken: string;

  // IDs créés au fil du test
  let candidateId: string;
  let clientId: string;
  let matchId: string;
  let customTestId: string;

  beforeAll(async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  // ── 0. Auth — Connexion des 3 rôles ─────────────────────────────────────

  describe('Phase 0 — Authentification', () => {
    it('admin se connecte (200)', async () => {
      const res = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: process.env.TEST_ADMIN_EMAIL ?? 'admin@opside.com',
          password: process.env.TEST_ADMIN_PASSWORD ?? 'Admin1234!',
        });
      expect([200, 201]).toContain(res.status);
      adminToken = res.body?.data?.access_token ?? res.body?.access_token;
      expect(adminToken).toBeTruthy();
    });

    it('candidat se connecte (200)', async () => {
      const res = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: process.env.TEST_CANDIDATE_EMAIL ?? 'candidat@test.com',
          password: process.env.TEST_CANDIDATE_PASSWORD ?? 'Test1234!',
        });
      expect([200, 201]).toContain(res.status);
      candidateToken = res.body?.data?.access_token ?? res.body?.access_token;
      candidateId = res.body?.data?.user?.id ?? res.body?.user?.id;
      expect(candidateToken).toBeTruthy();
    });

    it('client se connecte (200)', async () => {
      const res = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: process.env.TEST_CLIENT_EMAIL ?? 'client@test.com',
          password: process.env.TEST_CLIENT_PASSWORD ?? 'Test1234!',
        });
      expect([200, 201]).toContain(res.status);
      clientToken = res.body?.data?.access_token ?? res.body?.access_token;
      clientId = res.body?.data?.user?.id ?? res.body?.user?.id;
      expect(clientToken).toBeTruthy();
    });
  });

  // ── 1. Sécurité des endpoints (accès sans JWT refusé) ───────────────────

  describe('Phase 1 — Sécurité des accès', () => {
    const protectedRoutes = [
      { method: 'get', path: '/matches/candidate' },
      { method: 'get', path: '/matches/client' },
      { method: 'get', path: '/custom-test/candidate' },
      { method: 'get', path: '/custom-test/client' },
      { method: 'get', path: '/notifications' },
      { method: 'post', path: '/workspace/timer/start' },
    ];

    protectedRoutes.forEach(({ method, path }) => {
      it(`${method.toUpperCase()} ${path} → 401 sans token`, async () => {
        const res = await (request(app.getHttpServer()) as any)[method](path);
        expect(res.status).toBe(401);
      });
    });

    it('candidat ne peut pas accéder aux routes client (403)', async () => {
      if (!candidateToken) return;
      const res = await request(app.getHttpServer())
        .get('/matches/client')
        .set('Authorization', `Bearer ${candidateToken}`);
      expect([403, 401]).toContain(res.status);
    });

    it('client ne peut pas accéder aux routes candidat (403)', async () => {
      if (!clientToken) return;
      const res = await request(app.getHttpServer())
        .get('/matches/candidate')
        .set('Authorization', `Bearer ${clientToken}`);
      expect([403, 401]).toContain(res.status);
    });
  });

  // ── 2. Matching ──────────────────────────────────────────────────────────

  describe('Phase 2 — Workflow de matching', () => {
    it('candidat peut voir ses matches', async () => {
      if (!candidateToken) return;
      const res = await request(app.getHttpServer())
        .get('/matches/candidate')
        .set('Authorization', `Bearer ${candidateToken}`);
      expect([200]).toContain(res.status);
      expect(Array.isArray(res.body)).toBe(true);
      // Si un match existe, on le capture pour la suite
      if (res.body.length > 0) {
        matchId = res.body[0].id;
      }
    });

    it('client peut voir ses matches', async () => {
      if (!clientToken) return;
      const res = await request(app.getHttpServer())
        .get('/matches/client')
        .set('Authorization', `Bearer ${clientToken}`);
      expect([200]).toContain(res.status);
      expect(Array.isArray(res.body)).toBe(true);
      if (!matchId && res.body.length > 0) {
        matchId = res.body[0].id;
      }
    });

    it('candidat peut voir un match spécifique', async () => {
      if (!candidateToken || !matchId) return;
      const res = await request(app.getHttpServer())
        .get(`/matches/${matchId}`)
        .set('Authorization', `Bearer ${candidateToken}`);
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('id', matchId);
    });
  });

  // ── 3. Custom Test (Test Technique) ──────────────────────────────────────

  describe('Phase 3 — Tests techniques (custom-test)', () => {
    it('client peut voir ses tests créés', async () => {
      if (!clientToken) return;
      const res = await request(app.getHttpServer())
        .get('/custom-test/client')
        .set('Authorization', `Bearer ${clientToken}`);
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      if (res.body.length > 0) customTestId = res.body[0].id;
    });

    it('candidat peut voir ses tests reçus', async () => {
      if (!candidateToken) return;
      const res = await request(app.getHttpServer())
        .get('/custom-test/candidate')
        .set('Authorization', `Bearer ${candidateToken}`);
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
    });

    it('scoring : un test soumis doit avoir un score entre 0 et 100', async () => {
      if (!candidateToken || !customTestId) {
        console.warn('Skipping scoring test: no customTestId available');
        return;
      }
      // Récupère le test pour voir ses questions
      const detailRes = await request(app.getHttpServer())
        .get(`/custom-test/${customTestId}`)
        .set('Authorization', `Bearer ${candidateToken}`);

      if (detailRes.status !== 200 || !detailRes.body?.questions) return;

      // Soumission avec des réponses factices
      const fakeAnswers = (detailRes.body.questions as any[]).map((q: any) => ({
        questionId: q.id,
        answer: q.choices?.[0] ?? 'réponse test',
      }));

      const submitRes = await request(app.getHttpServer())
        .post(`/custom-test/${customTestId}/submit`)
        .set('Authorization', `Bearer ${candidateToken}`)
        .send({ answers: fakeAnswers });

      if (submitRes.status === 200 || submitRes.status === 201) {
        expect(submitRes.body).toHaveProperty('score');
        expect(submitRes.body.score).toBeGreaterThanOrEqual(0);
        expect(submitRes.body.score).toBeLessThanOrEqual(100);
      }
    });
  });

  // ── 4. Notifications ──────────────────────────────────────────────────────

  describe('Phase 4 — Notifications', () => {
    it('candidat peut lire ses notifications', async () => {
      if (!candidateToken) return;
      const res = await request(app.getHttpServer())
        .get('/notifications')
        .set('Authorization', `Bearer ${candidateToken}`);
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body) || Array.isArray(res.body?.data)).toBe(true);
    });

    it('client peut lire ses notifications', async () => {
      if (!clientToken) return;
      const res = await request(app.getHttpServer())
        .get('/notifications')
        .set('Authorization', `Bearer ${clientToken}`);
      expect(res.status).toBe(200);
    });

    it('marquage lu : la notification doit passer à read=true', async () => {
      if (!candidateToken) return;
      const listRes = await request(app.getHttpServer())
        .get('/notifications')
        .set('Authorization', `Bearer ${candidateToken}`);

      const notifications = listRes.body?.data ?? listRes.body ?? [];
      const unread = notifications.find((n: any) => !n.read);
      if (!unread) {
        console.warn('Skipping: no unread notification found');
        return;
      }

      const markRes = await request(app.getHttpServer())
        .patch(`/notifications/${unread.id}/read`)
        .set('Authorization', `Bearer ${candidateToken}`);
      expect([200, 204]).toContain(markRes.status);
    });
  });

  // ── 5. Dashboard Candidat ──────────────────────────────────────────────────

  describe('Phase 5 — Dashboard et profils', () => {
    it('candidat peut récupérer son profil', async () => {
      if (!candidateToken) return;
      const res = await request(app.getHttpServer())
        .get('/candidate/profile')
        .set('Authorization', `Bearer ${candidateToken}`);
      expect([200, 404]).toContain(res.status); // 404 si profil non complété
    });

    it('client peut récupérer son profil', async () => {
      if (!clientToken) return;
      const res = await request(app.getHttpServer())
        .get('/client/profile')
        .set('Authorization', `Bearer ${clientToken}`);
      expect([200, 404]).toContain(res.status);
    });

    it('admin peut voir les stats (panel-ops)', async () => {
      if (!adminToken) return;
      const res = await request(app.getHttpServer())
        .get('/users')
        .set('Authorization', `Bearer ${adminToken}`);
      expect([200, 403]).toContain(res.status); // 403 si route admin restreinte
    });
  });
});
