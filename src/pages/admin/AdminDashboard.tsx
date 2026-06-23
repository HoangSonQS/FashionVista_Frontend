import { useEffect, useMemo, useState } from 'react';
import { DollarSign, ShoppingBag, Package, Users } from 'lucide-react';
import KPICard from './components/dashboard/KPICard';
import RevenueChart from './components/dashboard/RevenueChart';
import OrderStatusChart from './components/dashboard/OrderStatusChart';
import TopProductsTable from './components/dashboard/TopProductsTable';
import RecentActivityTimeline from './components/dashboard/RecentActivityTimeline';
import adminDashboardService, { type AdminOverviewResponse } from '../../services/adminDashboardService';

const AdminDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<AdminOverviewResponse | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await adminDashboardService.getOverview();
        // Access .data because axios returns AxiosResponse
        // @ts-ignore
        setData(response.data ? response.data : response);
      } catch (error) {
        console.error("Failed to fetch dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const kpiItems = useMemo(() => {
    if (!data) return [];
    return [
      {
        key: 'revenue',
        label: 'Doanh thu tháng này',
        value: (data.monthlyRevenue || 0).toLocaleString('vi-VN') + ' ₫',
        trend: 0,
        trendType: 'up' as const,
        icon: DollarSign,
      },
      {
        key: 'newOrders',
        label: 'Đơn hàng mới',
        value: data.pendingOrders,
        trend: 0,
        trendType: 'up' as const,
        icon: ShoppingBag,
      },
      {
        key: 'productsSold',
        label: 'Đơn hoàn thành',
        value: data.completedOrders,
        trend: 0,
        trendType: 'up' as const,
        icon: Package,
      },
      {
        key: 'newCustomers',
        label: 'Khách hàng mới',
        value: data.newCustomers,
        trend: 0,
        trendType: 'up' as const,
        icon: Users,
      },
    ];
  }, [data]);

  const revenueChartData = useMemo(() => {
    if (!data?.revenueChartData) return [];
    return data.revenueChartData.map(d => ({
      name: d.date,
      value: d.value
    }));
  }, [data?.revenueChartData]);

  const orderStatusChartData = useMemo(() => {
    if (!data) return [];
    return [
      { name: 'Pending', value: data.pendingOrders },
      { name: 'Confirmed', value: 0 },
      { name: 'Shipping', value: data.shippingOrders },
      { name: 'Completed', value: data.completedOrders },
      { name: 'Cancelled', value: data.cancelledOrders },
    ].filter(d => d.value > 0);
  }, [data?.pendingOrders, data?.shippingOrders, data?.completedOrders, data?.cancelledOrders]);

  const topProducts = useMemo(() => {
    if (!data?.topProducts) return [];
    return data.topProducts.map(p => ({
      id: p.productId.toString(),
      name: p.productName,
      price: p.price || 0,
      sold: p.quantity,
      stock: p.stock || 0,
      image: p.image || 'https://via.placeholder.com/150'
    }));
  }, [data?.topProducts]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!data) {
    return <div className="p-6 text-center text-red-500">Không thể tải dữ liệu dashboard.</div>;
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen space-y-6">
      <div className="flex justify-between items-center mb-2">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
          <p className="text-gray-500 text-sm mt-1">Tổng quan số liệu kinh doanh hôm nay</p>
        </div>
        <div className="text-sm text-gray-500 bg-white px-3 py-1.5 rounded-md shadow-sm border border-gray-200">
          Cập nhật: {new Date().toLocaleTimeString('vi-VN')}
        </div>
      </div>

      {/* KPI Cards Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {kpiItems.map((item) => (
          <KPICard
            key={item.key}
            label={item.label}
            value={item.value}
            trend={item.trend}
            trendType={item.trendType}
            icon={item.icon}
          />
        ))}
      </div>

      {/* Main Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 h-[400px]">
          <RevenueChart data={revenueChartData} />
        </div>
        <div className="h-[400px]">
          <OrderStatusChart data={orderStatusChartData} />
        </div>
      </div>

      {/* Detail Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 min-h-[400px]">
          <TopProductsTable products={topProducts} />
        </div>
        <div className="min-h-[400px]">
          <RecentActivityTimeline activities={data.recentActivities} />
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
