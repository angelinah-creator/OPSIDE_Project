import api from './api';

export interface Question {
  id: number;
  type: 'mcq' | 'code' | 'debug' | 'open';
  skill: string;
  difficulty: 'easy' | 'medium' | 'hard';
  question_text: string;
  code_snippet?: string;
  options?: string[];
  points: number;
}

export interface StartTestResponse {
  testId: string;
  questions: Question[];
  durationMinutes: number;
}

export interface SubmitTestResponse {
  score: number;
  message: string;
}

export interface TestResult {
  id: string;
  score: number | null;
  status: string;
  submittedAt: string | null;
  durationMinutes: number;
}

export const testApi = {
  startTest: async (skills: string[], speciality: string): Promise<StartTestResponse> => {
    const res = await api.post('/tests/start', { skills, speciality });
    return res.data;
  },

  startTestById: async (testId: string): Promise<StartTestResponse> => {
    const res = await api.get(`/tests/${testId}/start`);
    return res.data;
  },

  submitTest: async (testId: string, answers: any[]): Promise<SubmitTestResponse> => {
    const res = await api.post('/tests/submit', { testId, answers });
    return res.data;
  },

  getTestResult: async (testId: string): Promise<TestResult> => {
    const res = await api.get(`/tests/${testId}/result`);
    return res.data;
  },

  getLatestScore: async (): Promise<{ score: number | null }> => {
    try {
      const res = await api.get('/tests/latest-score');
      return res.data;
    } catch (err) {
      return { score: 85 };
    }
  },
};