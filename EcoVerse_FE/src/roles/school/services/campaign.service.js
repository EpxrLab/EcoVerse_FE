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

  bindQuizzesToRound: (roundId, quizIds, maxAttempts = 1) => {
    const payload = [{
      quizIds: quizIds,
      maxAttempts: maxAttempts,
      displayOrder: 1,
      isRequired: true
    }];
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
      params: { gameTypeId, presetIds }
    });
  },

  saveGameConfig: (roundId, payload) => {
    return axios.put(`/campaign-rounds/${roundId}/game-config`, payload);
  },

  activateCampaign: (id) => {
    return axios.put(`/school/campaigns/${id}/activate`);
  },

  setDraft: (id) => {
    return axios.put(`/school/campaigns/${id}/set-draft`);
  },

  cancelCampaign: (id) => {
    return axios.put(`/school/campaigns/${id}/cancel`);
  },

  extendInviting: (id, payload) => {
    return axios.post(`/school/campaigns/${id}/extend-inviting`, payload);
  },

  deleteCampaign: (id) => {
    return axios.delete(`/school/campaigns/${id}`);
  },

  getPartnershipInvitations: () => {
    return axios.get('/school/partnership-invitations');
  },

  rejectPartnershipInvitation: (id) => {
    return axios.put(`/school/partnership-invitations/${id}/reject`);
  },

  acceptPartnershipInvitation: (id) => {
    return axios.put(`/school/partnership-invitations/${id}/accept`);
  },

  assignStudentsToPartnershipInvitation: (id, studentIds) => {
    return axios.put(`/school/partnership-invitations/${id}/assigned-students`, { studentIds });
  },

  getPartnershipInvitationDetail: (id) => {
    return axios.get(`/school/partnership-invitations/${id}`);
  },

  getAssignedStudentsForPartnershipInvitation: (id) => {
    return axios.get(`/school/partnership-invitations/${id}/assigned-students`);
  },

  // Leaderboard
  getCampaignLeaderboard: (id) => {
    return axios.get(`/school/campaigns/${id}/leaderboard`);
  }
};
