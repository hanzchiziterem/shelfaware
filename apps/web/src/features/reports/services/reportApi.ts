import { apiClient } from '../../../services/api/axiosInstance';
import { API_CONFIG } from '../../../services/api/apiConfig';
import { mockStorage } from '../../../mocks/mockStorage';

export const reportApi = {
  async getSalesReport() {
    if (API_CONFIG.useMockApi) {
      await new Promise((r) => setTimeout(r, 150));
      const sales = mockStorage.getSales().filter((s) => s.status === 'completed');
      const totalRevenue = sales.reduce((a, b) => a + b.totalAmount, 0);
      return {
        totalRevenue,
        orderCount: sales.length,
        averageOrderValue: sales.length > 0 ? Math.round(totalRevenue / sales.length) : 0,
        sales,
      };
    }
    const res = await apiClient.get('/reports/sales');
    return res.data;
  },

  async getInventoryValuation() {
    if (API_CONFIG.useMockApi) {
      const products = mockStorage.getProducts();
      const totalCostValue = products.reduce((acc, p) => acc + p.currentStock * p.costPrice, 0);
      const totalRetailValue = products.reduce((acc, p) => acc + p.currentStock * p.sellingPrice, 0);
      return {
        totalCostValue,
        totalRetailValue,
        potentialGrossProfit: totalRetailValue - totalCostValue,
        totalSkus: products.length,
      };
    }
    const res = await apiClient.get('/reports/inventory');
    return res.data;
  },
};

