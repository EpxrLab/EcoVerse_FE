import axios from '@/utils/axios.customize';

export const notificationService = {
  
  getNotifications: () => {
    return axios.get('/notifications');
  },

  getUnreadCount: () => {
    return axios.get('/notifications/unread-count');
  },

  markAllAsRead: () => {
    return axios.patch('/notifications/read-all');
  },

  markAsRead: (id) => {
    return axios.patch(`/notifications/${id}/read`);
  }
};
