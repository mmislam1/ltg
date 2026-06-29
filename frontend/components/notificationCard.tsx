'use client';

import { Trash2 } from 'lucide-react';



interface Notification {
  id: string;
  orderId: string;
  message: string;
  timestamp: number;
}


interface NotificationCardProps {
  notification: Notification;
  onDelete: () => void;
}

export default function NotificationCard({
  notification,
  onDelete,
}: NotificationCardProps) {
  const formatTime = (timestamp: number) => {
    const now = Date.now();
    const diff = now - timestamp;
    const hours = Math.floor(diff / (1000 * 60 * 60));
    
    if (hours > 0) return `${hours}h ago`;
    const minutes = Math.floor(diff / (1000 * 60));
    return `${minutes}m ago`;
  };

  return (
    <div className="bg-yellow-50 border border-yellow-100 rounded-xl p-4 md:p-5 flex items-center justify-between group hover:shadow-md transition-shadow">
      {/* Avatar */}
      <div className="w-12 h-12 md:w-14 md:h-14 rounded-full bg-gradient-to-br from-slate-400 to-slate-500 flex-shrink-0"></div>

      {/* Content */}
      <div className="flex-1 mx-4 md:mx-5 min-w-0">
        <p className="text-base md:text-lg font-medium text-slate-900 truncate">
          {notification.orderId} - {notification.message}
        </p>
        <p className="text-sm md:text-base text-amber-600 font-medium mt-1">
          {formatTime(notification.timestamp)}
        </p>
      </div>

      {/* Delete Button */}
      <button
        onClick={onDelete}
        className="p-2 md:p-2.5 text-red-400 hover:text-red-600 transition-colors flex-shrink-0"
        aria-label="Delete notification"
      >
        <Trash2 className="w-5 h-5 md:w-6 md:h-6" />
      </button>
    </div>
  );
}
