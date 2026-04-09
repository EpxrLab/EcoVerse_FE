import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import axios from '@/utils/axios.customize';

const API_URL = import.meta.env.VITE_API_BASE_URL;
const BASE_URL = API_URL.replace(/\/api$/, '');
const WS_ENDPOINT = `${BASE_URL}/ws`;

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
  },

  // WebSocket connection management (STOMP over SockJS)
  connectWebSocket: (onMessage) => {
    const token = sessionStorage.getItem("accessToken");
    if (!token) return null;

    const stompClient = new Client({
      webSocketFactory: () => new SockJS(`${WS_ENDPOINT}?token=${token}`),
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
    });

    stompClient.onConnect = (frame) => {
      console.log('Notification STOMP connected:', frame);
      
      // Subscribe to user-specific notification queue
      stompClient.subscribe('/user/queue/notifications', (message) => {
        try {
          const notification = JSON.parse(message.body);
          if (onMessage) onMessage(notification);
        } catch (error) {
          console.error('Error parsing STOMP message:', error);
        }
      });
    };

    stompClient.onStompError = (frame) => {
      console.error('STOMP Broker error:', frame.headers['message']);
      console.error('Details:', frame.body);
    };

    stompClient.onWebSocketClose = () => {
      console.log('Notification WebSocket closed');
    };

    stompClient.activate();

    return stompClient;
  }
};
