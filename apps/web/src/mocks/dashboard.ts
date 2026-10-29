export interface DashboardOverview {
  todaySales: number;
  todayTransactions: number;
  todayGrossProfit: number;
  totalInventoryValue: number;
  lowStockCount: number;
  expiringStockCount: number;
  salesGrowthPct: number;
  profitMarginPct: number;
}

export const MOCK_DASHBOARD_OVERVIEW: DashboardOverview = {
  todaySales: 465800,
  todayTransactions: 4,
  todayGrossProfit: 71200,
  totalInventoryValue: 14850000,
  lowStockCount: 3,
  expiringStockCount: 2,
  salesGrowthPct: 14.8,
  profitMarginPct: 15.3,
};

export const MOCK_SALES_TREND = [
  { time: '08:00', sales: 0, transactions: 0 },
  { time: '09:00', sales: 48800, transactions: 1 },
  { time: '10:00', sales: 120000, transactions: 1 },
  { time: '11:00', sales: 266000, transactions: 2 },
  { time: '12:00', sales: 17000, transactions: 1 },
  { time: '13:00', sales: 14000, transactions: 1 },
  { time: '14:00', sales: 0, transactions: 0 },
];

export const MOCK_WEEKLY_SALES = [
  { day: 'Mon', revenue: 680000, profit: 112000 },
  { day: 'Tue', revenue: 920000, profit: 155000 },
  { day: 'Wed', revenue: 740000, profit: 128000 },
  { day: 'Thu', revenue: 890000, profit: 149000 },
  { day: 'Fri', revenue: 1240000, profit: 210000 },
  { day: 'Sat', revenue: 1680000, profit: 285000 },
  { day: 'Sun', revenue: 465800, profit: 71200 },
];

export const MOCK_PAYMENT_BREAKDOWN = [
  { method: 'Cash', value: 65800, percentage: 14.1, color: '#10B981' },
  { method: 'Bank Transfer', value: 266000, percentage: 57.1, color: '#3B82F6' },
  { method: 'POS Card', value: 134000, percentage: 28.8, color: '#6366F1' },
];

export const MOCK_TOP_PRODUCTS = [
  {
    id: 'prod-001',
    name: 'Mama Gold Premium Rice 50kg',
    category: 'Grains & Rice',
    soldCount: 14,
    revenue: 1190000,
    profit: 182000,
  },
  {
    id: 'prod-006',
    name: 'Indomie Super Pack Carton',
    category: 'Noodles & Pasta',
    soldCount: 28,
    revenue: 442400,
    profit: 64400,
  },
  {
    id: 'prod-015',
    name: 'Frozen Titus Fish Carton 20kg',
    category: 'Frozen Foods',
    soldCount: 8,
    revenue: 400000,
    profit: 64000,
  },
  {
    id: 'prod-009',
    name: 'Devon Kings Veg Oil 5L',
    category: 'Oils & Fats',
    soldCount: 16,
    revenue: 275200,
    profit: 43200,
  },
];

