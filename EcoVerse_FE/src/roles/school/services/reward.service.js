import axios from '@/utils/axios.customize';

export const rewardService = {
  getRewards: () => {
    return axios.get('/school/rewards');
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
  }
};
