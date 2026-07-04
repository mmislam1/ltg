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
    return new Intl.DateTimeFormat(undefined, {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(timestamp);
  };

  return (
    <div className="card group flex items-center justify-between bg-brand-soft p-4 transition-shadow hover:shadow-md md:p-5">
      {/* Avatar */}
      <div className="h-12 w-12 flex-shrink-0 rounded-full bg-muted md:h-14 md:w-14"></div>

      {/* Content */}
      <div className="flex-1 mx-4 md:mx-5 min-w-0">
        <p className="truncate text-base font-medium text-ink md:text-lg">
          {notification.orderId} - {notification.message}
        </p>
        <p className="mt-1 text-sm font-medium text-brand md:text-base">
          {formatTime(notification.timestamp)}
        </p>
      </div>

      {/* Delete Button */}
      <button
        type="button"
        onClick={onDelete}
        className="btn btn-danger btn-icon flex-shrink-0"
        aria-label="Delete notification"
      >
        <Trash2 className="w-5 h-5 md:w-6 md:h-6" />
      </button>
    </div>
  );
}
