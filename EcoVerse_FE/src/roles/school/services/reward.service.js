import axios from '@/utils/axios.customize';

export const rewardService = {
  getRewards: () => {
    return axios.get('/school/rewards');
  },
  getRewardById: (id) => {
    return axios.get(`/school/rewards/${id}`);
  },
  createReward: (data) => {
    return axios.post('/school/rewards', data);
  },
  updateReward: (id, data) => {
    return axios.put(`/school/rewards/${id}`, data);
  },
  deleteReward: (id) => {
    return axios.delete(`/school/rewards/${id}`);
  },
  uploadImage: (formData) => {
    return axios.post('/files/upload/image', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
  },
  getRewardRequests: () => {
    return axios.get('/school/rewards/requests');
  },
  approveRewardRequest: (id, data) => {
    return axios.put(`/school/rewards/requests/${id}/approve`, data);
  },
  deliverRewardRequest: (id, data) => {
    return axios.put(`/school/rewards/requests/${id}/deliver`, data);
  },
  // Reward Deliveries
  getRewardDeliveries: (campaignId) => {
    return axios.get(`/school/campaigns/${campaignId}/reward-deliveries`);
  },

  markRewardArrived: (deliveryId) => {
    return axios.put(`/school/reward-deliveries/${deliveryId}/arrived`);
  },

  markRewardDelivered: (deliveryId, payload) => {
    return axios.put(`/school/reward-deliveries/${deliveryId}/deliver`, payload);
  },
  getRewardRequestStatusLogs: (requestId) => {
    return axios.get(`/rewards/requests/${requestId}/status-logs`);
  }
};
