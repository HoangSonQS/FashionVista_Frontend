import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';

interface OrderChartsProps {
  statusDistribution: { status: string; count: number }[];
  COLORS: string[];
}

const OrderChartsComponent: React.FC<OrderChartsProps> = ({ statusDistribution, COLORS }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-6">
      <div>
        <h4 className="text-lg font-bold text-gray-800 mb-4">Phân bố trạng thái đơn hàng</h4>
        <div className="h-[600px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={statusDistribution}
                cx="50%"
                cy="50%"
                outerRadius={120}
                fill="#8884d8"
                dataKey="count"
                nameKey="status"
                label
              >
                {statusDistribution.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <RechartsTooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
      <div>
        <h4 className="text-lg font-bold text-gray-800 mb-4">Số lượng đơn theo trạng thái (Bar Chart)</h4>
        <div className="h-[600px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={statusDistribution}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="status" />
              <YAxis />
              <RechartsTooltip />
              <Bar dataKey="count" fill="#8B5CF6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default OrderChartsComponent;
