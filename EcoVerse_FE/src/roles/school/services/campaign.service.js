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
  }
};
