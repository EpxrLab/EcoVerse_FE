import axios from '@/utils/axios.customize';

export const campaignService = {

  createCampaign: (payload) => {
    return axios.post('/school/campaigns', payload);
  },

  getCampaigns: () => {
    return axios.get('/school/campaigns');
  },

  updateCampaign: (id, payload) => {
    return axios.put(`/school/campaigns/${id}`, payload);
  },

  getCampaignById: (id) => {
    return axios.get(`/school/campaigns/${id}`);
  },

  bindQuizzesToRound: (roundId, quizIds) => {
    // Using PUT for both initial bind and update (Upsert pattern)
    const payload = quizIds.map(id => ({
      quizId: id,
      maxAttempts: 3,
      isRequired: true
    }));
    return axios.put(`/campaign-rounds/${roundId}/quizzes/bind`, payload);
  },

  deleteCampaign: (id) => {
    return axios.delete(`/school/campaigns/${id}`);
  }
};
