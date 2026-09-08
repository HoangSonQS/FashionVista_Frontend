import React from 'react';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';

interface KPICardProps {
    label: string;
    value: string | number;
    trend: number;
    trendType: 'up' | 'down';
    icon: React.ElementType;
}

const KPICard: React.FC<KPICardProps> = ({ label, value, trend, trendType, icon: Icon }) => {
    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col justify-between hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start">
                <div>
                    <p className="text-gray-500 text-sm font-medium uppercase tracking-wider">{label}</p>
                    <h3 className="text-2xl font-bold mt-2 text-gray-800">{value}</h3>
                </div>
                <div className={`p-3 rounded-lg ${trendType === 'up' ? 'bg-blue-50 text-blue-600' : 'bg-red-50 text-red-600'}`}>
                    <Icon size={24} />
                </div>
            </div>
            <div className="mt-4 flex items-center">
                <span className={`flex items-center text-sm font-semibold ${trendType === 'up' ? 'text-green-500' : 'text-red-500'}`}>
                    {trendType === 'up' ? <ArrowUpRight size={16} className="mr-1" /> : <ArrowDownRight size={16} className="mr-1" />}
                    {trend}%
                </span>
                <span className="text-gray-400 text-sm ml-2">so với tháng trước</span>
            </div>
        </div>
    );
};

export default KPICard;
