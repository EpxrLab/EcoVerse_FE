import axios from '@/utils/axios.customize';

export const profileService = {
  getProfile: () => {
    return axios.get('/profile/school');
  },
  updateProfile: (data) => {
    return axios.put('/profile/school', data);
  },
};
