import { axiosClient } from './axiosClient';

export interface TopProductMetric {
    productId: number;
    productName: string;
    quantity: number;
    revenue: number;
    image?: string;
    price?: number;
    stock?: number;
}

export interface RevenueChartData {
    date: string;
    value: number;
}

export interface RecentActivity {
    id: string;
    user: string;
    action: string;
    time: string;
}

export interface AdminOverviewResponse {
    dailyRevenue: number;
    monthlyRevenue: number;
    yearlyRevenue: number;
    pendingOrders: number;
    shippingOrders: number;
    completedOrders: number;
    cancelledOrders: number;
    lowStockProducts: number;
    newCustomers: number;
    conversionRate: number;
    topProducts: TopProductMetric[];
    revenueChartData: RevenueChartData[];
    recentActivities: RecentActivity[];
}

const adminDashboardService = {
    getOverview: async (): Promise<any> => {
        const url = '/admin/overview';
        return await axiosClient.get(url);
    },
};

export default adminDashboardService;
