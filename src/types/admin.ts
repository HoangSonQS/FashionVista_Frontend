export interface TopProductMetric {
  productId: number;
  productName: string;
  quantity: number;
  revenue: string | number;
}

export interface AdminOverview {
  dailyRevenue: string | number;
  monthlyRevenue: string | number;
  yearlyRevenue: string | number;
  pendingOrders: number;
  shippingOrders: number;
  completedOrders: number;
  cancelledOrders: number;
  lowStockProducts: number;
  newCustomers: number;
  conversionRate: number;
  topProducts: TopProductMetric[];
}


