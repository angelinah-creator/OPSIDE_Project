import api from './api';

export const jobOfferApi = {
  // Pour les candidats
  getJobOffers: async () => {
    return api.get('/job-offers/candidate');
  },

  // Pour les clients
  getClientJobOffers: async () => {
    return api.get('/job-offers/client');
  },

  createJobOffer: async (data: any) => {
    return api.post('/job-offers', data);
  },

  updateJobOffer: async (id: string, data: any) => {
    return api.patch(`/job-offers/${id}`, data);
  },

  deleteJobOffer: async (id: string) => {
    return api.delete(`/job-offers/${id}`);
  },
};
