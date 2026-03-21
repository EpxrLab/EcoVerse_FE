import axios from '@/utils/axios.customize';

export const subscriptionService = {
  getSubscriptionPlans: (params) => {
    return axios.get('/subscription-plans', { params });
  },
  createSubscription: (data) => {
    return axios.post('/subscriptions', data);
  },
  renewSubscription: (data) => {
    return axios.post('/subscriptions/renew', data);
  },
  getMySubscriptionHistory: (params) => {
    return axios.get('/subscriptions/my/history', { params });
  }
};
