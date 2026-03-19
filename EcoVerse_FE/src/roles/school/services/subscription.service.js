import axios from '@/utils/axios.customize';

export const subscriptionService = {
  getSubscriptionPlans: (params) => {
    return axios.get('/subscriptions/my', { params });
  }
};
