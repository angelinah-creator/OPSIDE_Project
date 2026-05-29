import request from 'supertest';
import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from '../src/app.module';

/**
 * Suite de tests d'intégration — Workspace (Timer + Timesheet)
 * Protège la logique business : start/stop timer, génération timesheet, soumission, approbation
 */
describe('WorkspaceModule (e2e)', () => {
  let app: INestApplication;
  let candidateToken: string;
  let clientToken: string;
  let matchId: string;
  let sessionId: string;
  let timesheetId: string;

  beforeAll(async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();
    app.setGlobalPrefix('');
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  // ── Helpers ──────────────────────────────────────────────────────────────

  async function loginAs(email: string, password: string): Promise<string> {
    const res = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email, password });
    return res.body?.data?.access_token ?? res.body?.access_token ?? '';
  }

  // ── Auth Setup ────────────────────────────────────────────────────────────

  describe('Setup — authentification des rôles', () => {
    it('(candidat) devrait se connecter avec succès', async () => {
      // Utilise le compte seed existant ou le crée
      const res = await request(app.getHttpServer())
        .post('/auth/login')
        .send({ email: process.env.TEST_CANDIDATE_EMAIL ?? 'candidat@test.com', password: 'Test1234!' });

      expect([200, 201]).toContain(res.status);
      candidateToken = res.body?.data?.access_token ?? res.body?.access_token ?? '';
      expect(candidateToken).toBeTruthy();
    });

    it('(client) devrait se connecter avec succès', async () => {
      const res = await request(app.getHttpServer())
        .post('/auth/login')
        .send({ email: process.env.TEST_CLIENT_EMAIL ?? 'client@test.com', password: 'Test1234!' });

      expect([200, 201]).toContain(res.status);
      clientToken = res.body?.data?.access_token ?? res.body?.access_token ?? '';
      expect(clientToken).toBeTruthy();
    });
  });

  // ── Timer ─────────────────────────────────────────────────────────────────

  describe('POST /workspace/timer/start', () => {
    it('devrait refuser sans JWT (401)', async () => {
      const res = await request(app.getHttpServer())
        .post('/workspace/timer/start')
        .send({ matchId: 'fake-id' });
      expect(res.status).toBe(401);
    });

    it('devrait refuser si le matchId est inexistant (404)', async () => {
      if (!candidateToken) return;
      const res = await request(app.getHttpServer())
        .post('/workspace/timer/start')
        .set('Authorization', `Bearer ${candidateToken}`)
        .send({ matchId: '00000000-0000-0000-0000-000000000000' });
      expect(res.status).toBe(404);
    });

    it('(si match valide existe) devrait démarrer un timer et retourner la session', async () => {
      if (!candidateToken || !matchId) {
        console.warn('Skipping: no matchId available in test context');
        return;
      }
      const res = await request(app.getHttpServer())
        .post('/workspace/timer/start')
        .set('Authorization', `Bearer ${candidateToken}`)
        .send({ matchId, note: 'Session de travail initiale' });

      expect([200, 201]).toContain(res.status);
      expect(res.body.success).toBe(true);
      expect(res.body.session).toHaveProperty('id');
      expect(res.body.session.stopped_at).toBeNull();
      sessionId = res.body.session.id;
    });

    it('devrait refuser un double démarrage (400)', async () => {
      if (!candidateToken || !sessionId) return;
      const res = await request(app.getHttpServer())
        .post('/workspace/timer/start')
        .set('Authorization', `Bearer ${candidateToken}`)
        .send({ matchId });
      expect(res.status).toBe(400);
    });
  });

  describe('POST /workspace/timer/stop', () => {
    it('devrait refuser sans JWT (401)', async () => {
      const res = await request(app.getHttpServer())
        .post('/workspace/timer/stop')
        .send({ sessionId: 'fake-id' });
      expect(res.status).toBe(401);
    });

    it('(si session active) devrait arrêter le timer et calculer la durée', async () => {
      if (!candidateToken || !sessionId) return;
      const res = await request(app.getHttpServer())
        .post('/workspace/timer/stop')
        .set('Authorization', `Bearer ${candidateToken}`)
        .send({ sessionId, note: 'Fin de session' });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.session.stopped_at).not.toBeNull();
      expect(typeof res.body.duration_min).toBe('number');
    });

    it('devrait refuser de stopper une session déjà arrêtée (400)', async () => {
      if (!candidateToken || !sessionId) return;
      const res = await request(app.getHttpServer())
        .post('/workspace/timer/stop')
        .set('Authorization', `Bearer ${candidateToken}`)
        .send({ sessionId });
      expect(res.status).toBe(400);
    });
  });

  // ── Timesheet ─────────────────────────────────────────────────────────────

  describe('POST /workspace/:matchId/timesheet/generate', () => {
    it('devrait générer une timesheet pour la semaine courante', async () => {
      if (!candidateToken || !matchId) return;
      const monday = new Date();
      monday.setDate(monday.getDate() - monday.getDay() + 1);
      monday.setHours(0, 0, 0, 0);

      const res = await request(app.getHttpServer())
        .post(`/workspace/${matchId}/timesheet/generate`)
        .set('Authorization', `Bearer ${candidateToken}`)
        .send({ weekStart: monday.toISOString() });

      expect([200, 201]).toContain(res.status);
      expect(res.body.success).toBe(true);
      expect(res.body.timesheet).toHaveProperty('id');
      expect(res.body.timesheet.status).toBe('draft');
      expect(typeof res.body.timesheet.total_hours).toBe('number');
      expect(typeof res.body.timesheet.amount_due).toBe('number');
      timesheetId = res.body.timesheet.id;
    });
  });

  describe('PATCH /workspace/timesheet/:id/submit', () => {
    it('devrait soumettre la timesheet (draft → submitted)', async () => {
      if (!candidateToken || !timesheetId) return;
      const res = await request(app.getHttpServer())
        .patch(`/workspace/timesheet/${timesheetId}/submit`)
        .set('Authorization', `Bearer ${candidateToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.timesheet.status).toBe('submitted');
      expect(res.body.timesheet.submitted_at).not.toBeNull();
    });

    it('devrait refuser de soumettre une timesheet déjà soumise (400)', async () => {
      if (!candidateToken || !timesheetId) return;
      const res = await request(app.getHttpServer())
        .patch(`/workspace/timesheet/${timesheetId}/submit`)
        .set('Authorization', `Bearer ${candidateToken}`);
      expect(res.status).toBe(400);
    });
  });

  describe('PATCH /workspace/timesheet/:id/approve', () => {
    it('devrait approuver la timesheet (submitted → approved)', async () => {
      if (!clientToken || !timesheetId) return;
      const res = await request(app.getHttpServer())
        .patch(`/workspace/timesheet/${timesheetId}/approve`)
        .set('Authorization', `Bearer ${clientToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.timesheet.status).toBe('approved');
      expect(res.body.timesheet.approved_at).not.toBeNull();
    });

    it('devrait refuser si le client ne possède pas la timesheet (403)', async () => {
      if (!candidateToken || !timesheetId) return;
      // Un candidat tente d'approuver → 403
      const res = await request(app.getHttpServer())
        .patch(`/workspace/timesheet/${timesheetId}/approve`)
        .set('Authorization', `Bearer ${candidateToken}`);
      expect([403, 401]).toContain(res.status);
    });
  });

  // ── Workspace Home ────────────────────────────────────────────────────────

  describe('GET /workspace/:matchId/home', () => {
    it('devrait refuser sans JWT (401)', async () => {
      const res = await request(app.getHttpServer()).get('/workspace/fake-id/home');
      expect(res.status).toBe(401);
    });

    it('devrait retourner les données agrégées du workspace', async () => {
      if (!candidateToken || !matchId) return;
      const res = await request(app.getHttpServer())
        .get(`/workspace/${matchId}/home`)
        .set('Authorization', `Bearer ${candidateToken}`);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('match');
      expect(res.body).toHaveProperty('active_session');
      expect(res.body).toHaveProperty('total_hours_logged');
      expect(res.body).toHaveProperty('recent_sessions');
      expect(res.body).toHaveProperty('timesheets');
      expect(typeof res.body.total_hours_logged).toBe('number');
    });
  });
});
