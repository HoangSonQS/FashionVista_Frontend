import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

interface ChartData {
    name: string;
    value: number;
    [key: string]: any;
}

interface OrderStatusChartProps {
    data: ChartData[];
}

const COLORS = {
    Pending: '#F59E0B',     // Amber-500
    Confirmed: '#C4714E',   // Terracotta
    Shipping: '#8B5CF6',    // Violet-500
    Completed: '#10B981',   // Emerald-500
    Cancelled: '#EF4444',   // Red-500
    Refunded: '#6B7280',    // Gray-500
};

const OrderStatusChart: React.FC<OrderStatusChartProps> = ({ data }) => {
    return (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 h-full">
            <h3 className="text-lg font-bold text-gray-800 mb-4">Trạng thái đơn hàng</h3>
            <div className="h-[300px] w-full flex justify-center items-center">
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            data={data}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={100}
                            paddingAngle={5}
                            dataKey="value"
                        >
                            {data.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[entry.name as keyof typeof COLORS] || '#000'} stroke="none" />
                            ))}
                        </Pie>
                        <Tooltip
                            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                        />
                        <Legend layout="vertical" verticalAlign="middle" align="right" wrapperStyle={{ fontSize: '12px' }} />
                    </PieChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

export default OrderStatusChart;
