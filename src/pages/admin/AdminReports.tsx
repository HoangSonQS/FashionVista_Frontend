import React, { useEffect, useState, Suspense } from 'react';
import { Calendar, DollarSign, ShoppingBag, Users } from 'lucide-react';
import adminReportService, { type AdminReportResponse, type ReportParams } from '../../services/adminReportService';

const LazyRevenueChart = React.lazy(() => import('./components/reports/RevenueChartComponent'));
const LazyOrderCharts = React.lazy(() => import('./components/reports/OrderChartsComponent'));

const AdminReports = () => {
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState<AdminReportResponse | null>(null);
    const [activeTab, setActiveTab] = useState<'revenue' | 'orders' | 'customers'>('revenue');

    // Default range: Last 30 days
    const today = new Date();
    const last30Days = new Date(today);
    last30Days.setDate(today.getDate() - 30);

    const [startDate, setStartDate] = useState(last30Days.toISOString().split('T')[0]);
    const [endDate, setEndDate] = useState(today.toISOString().split('T')[0]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const params: ReportParams = { startDate, endDate };
            const response = await adminReportService.getReports(params);
            setData(response.data || response); // Adjusted for potentially nested data
        } catch (error) {
            console.error("Failed to fetch reports:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [startDate, endDate]);

    const COLORS = ['#C4714E', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#6B7280'];

    if (loading && !data) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--primary)]"></div>
            </div>
        );
    }

    if (!data) return <div className="p-6">Error loading data</div>;

    return (
        <div className="p-6 bg-gray-50 min-h-screen space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Báo cáo thống kê</h1>
                    <p className="text-gray-500 text-sm mt-1">Phân tích chi tiết hoạt động kinh doanh</p>
                </div>

                <div className="flex items-center gap-3 bg-white p-2 rounded-lg shadow-sm border border-gray-200">
                    <div className="flex items-center gap-2 px-2">
                        <Calendar size={18} className="text-gray-500" />
                        <span className="text-sm font-medium text-gray-700">Thời gian:</span>
                    </div>
                    <input
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        className="text-sm border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    />
                    <span className="text-gray-400">-</span>
                    <input
                        type="date"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        className="text-sm border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    />
                    <button
                        onClick={fetchData}
                        className="ml-2 px-3 py-1.5 bg-[var(--primary)] text-white text-sm font-medium rounded-md hover:bg-[var(--primary-hover)] transition"
                    >
                        Áp dụng
                    </button>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-gray-200 bg-white rounded-t-xl px-2">
                <button
                    onClick={() => setActiveTab('revenue')}
                    className={`flex items-center gap-2 px-6 py-4 text-sm font-medium border-b-2 transition-colors ${activeTab === 'revenue'
                        ? 'border-[var(--primary)] text-[var(--primary)]'
                        : 'border-transparent text-gray-500 hover:text-gray-700'
                        }`}
                >
                    <DollarSign size={18} />
                    Doanh thu
                </button>
                <button
                    onClick={() => setActiveTab('orders')}
                    className={`flex items-center gap-2 px-6 py-4 text-sm font-medium border-b-2 transition-colors ${activeTab === 'orders'
                        ? 'border-[var(--primary)] text-[var(--primary)]'
                        : 'border-transparent text-gray-500 hover:text-gray-700'
                        }`}
                >
                    <ShoppingBag size={18} />
                    Đơn hàng
                </button>
                <button
                    onClick={() => setActiveTab('customers')}
                    className={`flex items-center gap-2 px-6 py-4 text-sm font-medium border-b-2 transition-colors ${activeTab === 'customers'
                        ? 'border-[var(--primary)] text-[var(--primary)]'
                        : 'border-transparent text-gray-500 hover:text-gray-700'
                        }`}
                >
                    <Users size={18} />
                    Khách hàng
                </button>
            </div>

            {/* Content */}
            <div className="bg-white rounded-b-xl shadow-sm border border-gray-100 border-t-0 p-6 min-h-[500px]">

                {activeTab === 'revenue' && (
                    <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="bg-[var(--muted)] p-6 rounded-xl border border-[var(--border)]">
                                <p className="text-sm font-medium text-[var(--foreground)] uppercase">Tổng doanh thu (trong kỳ)</p>
                                <h3 className="text-3xl font-light text-[var(--foreground)] mt-2" style={{ fontFamily: 'var(--font-serif)' }}>
                                    {data.revenueReport.totalRevenue.toLocaleString('vi-VN')} ₫
                                </h3>
                            </div>
                        </div>

                        <Suspense fallback={<div>Loading Revenue Chart...</div>}>
                          <LazyRevenueChart dataPoints={data.revenueReport.dataPoints} />
                        </Suspense>
                    </div>
                )}

                {activeTab === 'orders' && (
                    <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="bg-orange-50 p-6 rounded-xl border border-orange-100">
                                <p className="text-sm font-medium text-orange-600 uppercase">Tổng đơn hàng</p>
                                <h3 className="text-3xl font-bold text-gray-800 mt-2">{data.orderReport.totalOrders}</h3>
                            </div>
                            <div className="bg-red-50 p-6 rounded-xl border border-red-100">
                                <p className="text-sm font-medium text-red-600 uppercase">Đơn hủy / Hoàn tiền</p>
                                <h3 className="text-3xl font-bold text-gray-800 mt-2">{data.orderReport.cancelledOrders}</h3>
                            </div>
                            <div className="bg-gray-50 p-6 rounded-xl border border-gray-200">
                                <p className="text-sm font-medium text-gray-600 uppercase">Tỷ lệ hủy</p>
                                <h3 className="text-3xl font-bold text-gray-800 mt-2">{data.orderReport.cancellationRate}%</h3>
                            </div>
                        </div>

                        <Suspense fallback={<div>Loading Order Charts...</div>}>
                          <LazyOrderCharts statusDistribution={data.orderReport.statusDistribution} COLORS={COLORS} />
                        </Suspense>
                    </div>
                )}

                {activeTab === 'customers' && (
                    <div className="space-y-6">
                        <h4 className="text-lg font-bold text-gray-800 mb-4">Top khách hàng chi tiêu nhiều nhất</h4>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="border-b border-gray-200 text-gray-500 font-medium bg-gray-50">
                                        <th className="p-4">Khách hàng</th>
                                        <th className="p-4">Email</th>
                                        <th className="p-4 text-center">Tổng đơn hàng</th>
                                        <th className="p-4 text-right">Tổng chi tiêu</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {data.topCustomers.map((customer, index) => (
                                        <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                                            <td className="p-4 font-medium text-gray-800">{customer.fullName}</td>
                                            <td className="p-4 text-gray-600">{customer.email}</td>
                                            <td className="p-4 text-center">
                                                <span className="inline-block px-3 py-1 bg-[var(--muted)] text-[var(--primary)] rounded-full text-xs font-bold">
                                                    {customer.totalOrders}
                                                </span>
                                            </td>
                                            <td className="p-4 text-right font-bold text-green-600">
                                                {customer.totalSpent.toLocaleString('vi-VN')} ₫
                                            </td>
                                        </tr>
                                    ))}
                                    {data.topCustomers.length === 0 && (
                                        <tr>
                                            <td colSpan={4} className="p-8 text-center text-gray-400">Không có dữ liệu trong khoảng thời gian này</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminReports;
