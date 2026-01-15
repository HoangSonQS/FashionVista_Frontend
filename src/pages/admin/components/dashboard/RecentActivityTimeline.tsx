import React, { memo } from 'react';
import { Activity as ActivityIcon, Clock, CheckCircle, Truck, User } from 'lucide-react';

interface Activity {
    id: string;
    user: string;
    action: string;
    time: string;
}

interface RecentActivityTimelineProps {
    activities: Activity[];
}

const getActivityIcon = (action: string) => {
    if (action.includes('đặt đơn')) return <ShoppingBagIcon className="text-blue-500" size={16} />;
    if (action.includes('tồn kho')) return <ActivityIcon className="text-orange-500" size={16} />;
    if (action.includes('đăng ký')) return <User className="text-green-500" size={16} />;
    if (action.includes('duyệt')) return <CheckCircle className="text-purple-500" size={16} />;
    if (action.includes('giao')) return <Truck className="text-indigo-500" size={16} />;
    return <Clock className="text-gray-400" size={16} />;
};

// Simple ShoppingBag icon wrapper since lucide-react exports it as ShoppingBag
const ShoppingBagIcon = ({ className, size }: { className?: string, size?: number }) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className}
    >
        <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" />
        <path d="M3 6h18" />
        <path d="M16 10a4 4 0 0 1-8 0" />
    </svg>
);


const RecentActivityTimeline: React.FC<RecentActivityTimelineProps> = ({ activities }) => {
    return (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 h-full">
            <h3 className="text-lg font-bold text-gray-800 mb-6">Hoạt động gần đây</h3>
            <div className="space-y-6">
                {activities.map((item, index) => (
                    <div key={item.id} className="relative flex gap-4">
                        {/* Timeline Line */}
                        {index !== activities.length - 1 && (
                            <div className="absolute left-[19px] top-8 bottom-[-24px] w-[2px] bg-gray-100"></div>
                        )}

                        <div className="relative z-10 w-10 h-10 rounded-full bg-gray-50 border border-gray-100 flex items-center justify-center flex-shrink-0">
                            {getActivityIcon(item.action)}
                        </div>

                        <div className="flex-1 pt-1">
                            <p className="text-sm text-gray-800 font-medium">
                                <span className="font-bold text-blue-600 cursor-pointer hover:underline">{item.user}</span> {item.action}
                            </p>
                            <span className="text-xs text-gray-400 mt-1 flex items-center gap-1">
                                <Clock size={12} />
                                {item.time}
                            </span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default memo(RecentActivityTimeline);
