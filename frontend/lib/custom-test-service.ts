import api from './api';

export interface CustomTest {
  id: string;
  client_id: string;
  candidate_id: string;
  match_id: string;
  skills_tested: string[];
  difficulty?: string;
  duration_minutes: number;
  custom_instructions?: string;
  threshold: number;
  questions?: any[];
  answers?: Record<string, any>;
  score?: number;
  score_details?: Record<string, any>;
  status: 'pending' | 'sent' | 'in_progress' | 'submitted' | 'scored' | 'expired';
  retest_allowed: boolean;
  retest_used: boolean;
  started_at?: string;
  submitted_at?: string;
  created_at: string;
  updated_at: string;
  match?: any;
  candidate?: any;
}

export interface CreateCustomTestPayload {
  candidate_id: string;
  match_id: string;
  skills_tested: string[];
  difficulty?: 'junior' | 'mid' | 'senior';
  duration_minutes: number;
  custom_instructions?: string;
}

export const customTestService = {
  createTest: async (payload: CreateCustomTestPayload): Promise<CustomTest> => {
    const res = await api.post('/custom-test', payload);
    return res.data;
  },

  sendCalendlyDirectly: async (matchId: string, calendlyUrl?: string): Promise<{ success: boolean; message: string }> => {
    const res = await api.post(`/custom-test/match/${matchId}/send-calendly`, { calendly_url: calendlyUrl });
    return res.data;
  },

  getClientTests: async (): Promise<CustomTest[]> => {
    const res = await api.get('/custom-test/client');
    return res.data;
  },

  requestRetest: async (testId: string): Promise<CustomTest> => {
    const res = await api.post(`/custom-test/${testId}/retest`);
    return res.data;
  },

  getCandidateTests: async (): Promise<CustomTest[]> => {
    const res = await api.get('/custom-test/candidate');
    return res.data;
  },

  getTestByMatch: async (matchId: string): Promise<CustomTest | null> => {
    const res = await api.get(`/custom-test/match/${matchId}`);
    return res.data;
  },

  getTest: async (testId: string): Promise<CustomTest> => {
    const res = await api.get(`/custom-test/${testId}`);
    return res.data;
  },

  startTest: async (testId: string): Promise<CustomTest> => {
    const res = await api.patch(`/custom-test/${testId}/start`);
    return res.data;
  },

  submitTest: async (testId: string, answers: Record<string, any>): Promise<{ score: number; passed: boolean; threshold: number }> => {
    const res = await api.post(`/custom-test/${testId}/submit`, { answers });
    return res.data;
  },
};
