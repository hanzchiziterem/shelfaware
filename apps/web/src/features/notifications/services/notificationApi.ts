import { loadMockDb, saveMockDb } from '@/mocks/mockDb';
import { API_CONFIG } from '@/services/api/apiConfig';
import { API_ENDPOINTS, type ApiResponse } from '@/services/api/apiTypes';
import { axiosInstance } from '@/services/api/axiosInstance';
import type { AppNotification } from '@/types/common';

export const notificationApi = {
  async getNotifications(): Promise<ApiResponse<AppNotification[]>> {
    if (!API_CONFIG.useMockApi) {
      const { data } = await axiosInstance.get<ApiResponse<AppNotification[]>>(
        API_ENDPOINTS.NOTIFICATIONS.BASE
      );
      return data;
    }

    const db = loadMockDb();
    return {
      success: true,
      data: [...db.notifications],
    };
  },

  async markAsRead(notificationId: string): Promise<ApiResponse<AppNotification>> {
    const db = loadMockDb();
    const notif = db.notifications.find((n) => n.id === notificationId);
    if (!notif) throw new Error('Notification not found.');

    notif.isRead = true;
    saveMockDb(db);
    return {
      success: true,
      data: { ...notif },
    };
  },

  async markAllAsRead(): Promise<ApiResponse<{ updated: boolean }>> {
    const db = loadMockDb();
    for (const n of db.notifications) {
      n.isRead = true;
    }
    saveMockDb(db);
    return {
      success: true,
      data: { updated: true },
    };
  },
};
