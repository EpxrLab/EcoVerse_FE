import axios from "../../../utils/axios.customize";

export const partnershipCampaignService = {
  getCampaigns: () => {
    return axios.get('/partnership/campaigns');
  },
  getCampaignById: (id) => {
    return axios.get(`/partnership/campaigns/${id}`);
  },
  createCampaign: (data) => {
    return axios.post('/partnership/campaigns', data);
  },
  getEligibleSchools: () => {
    return axios.get('/partnership/campaigns/eligible-schools');
  },
  uploadImage: (formData) => {
    return axios.post('/files/upload/image', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
  },
  getCampaignRewards: (id) => {
    return axios.get(`/partnership/campaigns/${id}/rewards`);
  },
  updateCampaign: (id, data) => {
    return axios.put(`/partnership/campaigns/${id}`, data);
  },
  deleteCampaign: (id) => {
    return axios.delete(`/partnership/campaigns/${id}`);
  },
  bindQuizzesToRound: (roundId, payload) => {
    return axios.put(`/campaign-rounds/${roundId}/quizzes/bind`, payload);
  },

  // Game Config
  getGameTypes: () => {
    return axios.get('/admin/game-types');
  },

  getGameTypePresets: (gameTypeId) => {
    return axios.get(`/admin/game-types/${gameTypeId}/presets`);
  },

  getAvailableSubCategories: (roundId, gameTypeId, presetIds) => {
    return axios.get(`/campaign-rounds/${roundId}/game-config/available-sub-categories`, {
      params: { gameTypeId, presetIds: Array.isArray(presetIds) ? presetIds.join(',') : presetIds }
    });
  },

  saveGameConfig: (roundId, payload) => {
    return axios.put(`/campaign-rounds/${roundId}/game-config`, payload);
  },

  activateCampaign: (id) => {
    return axios.put(`/partnership/campaigns/${id}/activate`);
  },

  setDraftCampaign: (id) => {
    return axios.put(`/partnership/campaigns/${id}/set-draft`);
  },
  cancelCampaign: (id) => {
    return axios.put(`/partnership/campaigns/${id}/cancel`);
  },

  // Reward Deliveries
  getRewardDeliveries: (campaignId) => {
    return axios.get(`/partnership/campaigns/${campaignId}/reward-deliveries`);
  },

  markRewardShipped: (deliveryId, payload) => {
    return axios.put(`/partnership/reward-deliveries/${deliveryId}/ship`, payload);
  },

  // Leaderboard
  getRoundLeaderboard: (id, roundId) => {
    return axios.get(`/partnership/campaigns/${id}/rounds/${roundId}/leaderboard`);
  },

  getStudentHistory: (id, roundId, studentId) => {
    return axios.get(`/partnership/campaigns/${id}/rounds/${roundId}/students/${studentId}/history`);
  }
};
