import { apiClient } from '../../../services/api/axiosInstance';
import { API_CONFIG } from '../../../services/api/apiConfig';
import { AppNotification } from '../../../types/domain';
import { mockStorage } from '../../../mocks/mockStorage';

export const notificationApi = {
  async getNotifications(): Promise<AppNotification[]> {
    if (API_CONFIG.useMockApi) {
      await new Promise((r) => setTimeout(r, 100));
      return mockStorage.getNotifications();
    }
    const res = await apiClient.get<AppNotification[]>('/notifications');
    return res.data;
  },

  async markAsRead(id: string): Promise<void> {
    if (API_CONFIG.useMockApi) {
      const list = mockStorage.getNotifications();
      const idx = list.findIndex((n) => n.id === id);
      if (idx !== -1) {
        list[idx] = { ...list[idx], isRead: true };
        mockStorage.saveNotifications(list);
      }
      return;
    }
    await apiClient.patch(`/notifications/${id}/read`);
  },

  async markAllAsRead(): Promise<void> {
    if (API_CONFIG.useMockApi) {
      const list = mockStorage.getNotifications().map((n) => ({ ...n, isRead: true }));
      mockStorage.saveNotifications(list);
      return;
    }
    await apiClient.post('/notifications/read-all');
  },
};

