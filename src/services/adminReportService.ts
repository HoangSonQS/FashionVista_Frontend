import { axiosClient } from './axiosClient';

export interface ReportParams {
    startDate?: string; // YYYY-MM-DD
    endDate?: string;   // YYYY-MM-DD
}

export interface ChartDataPoint {
    label: string;
    value: number;
}

export interface RevenueReport {
    totalRevenue: number;
    dataPoints: ChartDataPoint[];
}

export interface OrderStatusDistribution {
    status: string;
    count: number;
    [key: string]: any;
}

export interface OrderReport {
    totalOrders: number;
    cancelledOrders: number;
    cancellationRate: number;
    statusDistribution: OrderStatusDistribution[];
}

export interface TopCustomerMetric {
    userId: number;
    fullName: string;
    email: string;
    totalOrders: number;
    totalSpent: number;
}

export interface AdminReportResponse {
    revenueReport: RevenueReport;
    orderReport: OrderReport;
    topCustomers: TopCustomerMetric[];
}

const adminReportService = {
    getReports: async (params?: ReportParams): Promise<any> => {
        const url = '/admin/reports';
        return await axiosClient.get(url, { params });
    },
};

export default adminReportService;
