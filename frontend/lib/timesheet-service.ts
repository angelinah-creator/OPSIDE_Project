import api from './api';

export enum TimerStatus {
  RUNNING = 'running',
  PAUSED = 'paused',
  STOPPED = 'stopped',
}

export interface Timesheet {
  id: string;
  user_id: string;
  match_id: string;
  description?: string;
  start_time: string;
  end_time?: string;
  duration: number;
  status: TimerStatus;
  paused_at?: string[];
  resumed_at?: string[];
  date: string;
  created_at: string;
  updated_at: string;
}

export interface ReportData {
  period: {
    start: string;
    end: string;
  };
  totalDuration: number;
  totalHours: number;
  entriesCount: number;
  byDescription: Array<{
    description: string;
    duration: number;
    hours: number;
    percentage: number;
  }>;
  byDay: Array<{
    day: string;
    duration: number;
    hours: number;
  }>;
  entries: Array<{
    id: string;
    matchId: string;
    clientName: string;
    description?: string;
    startTime: string;
    endTime?: string;
    duration: number;
    hours: number;
    date: string;
  }>;
}

export const timesheetService = {
  start: async (data: { match_id: string; description?: string }): Promise<Timesheet> => {
    const response = await api.post('/timesheets/timer/start', data);
    return response.data;
  },

  pause: async (): Promise<Timesheet> => {
    const response = await api.post('/timesheets/timer/pause');
    return response.data;
  },

  resume: async (): Promise<Timesheet> => {
    const response = await api.post('/timesheets/timer/resume');
    return response.data;
  },

  stop: async (): Promise<Timesheet> => {
    const response = await api.post('/timesheets/timer/stop');
    return response.data;
  },

  getActive: async (): Promise<Timesheet> => {
    const response = await api.get('/timesheets/timer/active');
    return response.data;
  },

  createEntry: async (data: Partial<Timesheet>): Promise<Timesheet> => {
    const payload = {
      match_id: data.match_id,
      description: data.description,
      start_time: data.start_time,
      end_time: data.end_time,
      duration: data.duration,
      status: data.status,
    };
    const cleanPayload = Object.fromEntries(
      Object.entries(payload).filter(([_, value]) => value !== undefined)
    );
    const response = await api.post('/timesheets', cleanPayload);
    return response.data;
  },

  updateEntry: async (id: string, data: Partial<Timesheet>): Promise<Timesheet> => {
    const payload = {
      description: data.description,
      start_time: data.start_time,
      end_time: data.end_time,
      duration: data.duration,
      status: data.status,
    };
    const cleanPayload = Object.fromEntries(
      Object.entries(payload).filter(([_, value]) => value !== undefined)
    );
    const response = await api.put(`/timesheets/${id}`, cleanPayload);
    return response.data;
  },

  deleteEntry: async (id: string): Promise<void> => {
    await api.delete(`/timesheets/${id}`);
  },

  getEntries: async (matchId?: string, startDate?: string, endDate?: string): Promise<Timesheet[]> => {
    const params = new URLSearchParams();
    if (matchId) params.append('matchId', matchId);
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    
    const response = await api.get(`/timesheets?${params.toString()}`);
    return response.data;
  },

  getReport: async (params: { startDate?: string; endDate?: string; match_id?: string; user_id?: string }): Promise<ReportData> => {
    const queryParams = new URLSearchParams();
    if (params.startDate) queryParams.append('start_date', params.startDate);
    if (params.endDate) queryParams.append('end_date', params.endDate);
    if (params.match_id) queryParams.append('match_id', params.match_id);
    if (params.user_id) queryParams.append('user_id', params.user_id);
    
    const response = await api.get(`/timesheets/report?${queryParams.toString()}`);
    return response.data;
  },
};
