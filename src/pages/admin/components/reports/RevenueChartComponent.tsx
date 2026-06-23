import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface RevenueChartProps {
  dataPoints: { label: string; value: number }[];
}

const RevenueChartComponent: React.FC<RevenueChartProps> = ({ dataPoints }) => {
  return (
    <div className="mt-6">
      <h4 className="text-lg font-bold text-gray-800 mb-4">Biểu đồ doanh thu theo thời gian</h4>
      <div className="h-[400px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={dataPoints} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#C4714E" stopOpacity={0.8} />
                <stop offset="95%" stopColor="#C4714E" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis dataKey="label" />
            <YAxis tickFormatter={(val) => `${val / 1000000}M`} />
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <Tooltip
              formatter={(value: any) => [`${parseInt(value).toLocaleString()} ₫`, 'Doanh thu']}
            />
            <Area type="monotone" dataKey="value" stroke="#C4714E" fillOpacity={1} fill="url(#colorRev)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default RevenueChartComponent;
