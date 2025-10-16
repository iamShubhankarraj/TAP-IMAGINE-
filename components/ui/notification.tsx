// components/ui/notification.tsx
'use client';

import { useEffect, useState } from 'react';
import { CheckCircle, XCircle, Info, AlertCircle, X } from 'lucide-react';

export type NotificationType = 'success' | 'error' | 'info' | 'warning';

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message?: string;
  duration?: number;
}

interface NotificationProps extends Notification {
  onClose: (id: string) => void;
}

const icons = {
  success: CheckCircle,
  error: XCircle,
  info: Info,
  warning: AlertCircle,
};

const colors = {
  success: 'bg-green-500/20 border-green-500/30 text-green-400',
  error: 'bg-red-500/20 border-red-500/30 text-red-400',
  info: 'bg-blue-500/20 border-blue-500/30 text-blue-400',
  warning: 'bg-yellow-500/20 border-yellow-500/30 text-yellow-400',
};

export function NotificationItem({ id, type, title, message, duration = 5000, onClose }: NotificationProps) {
  const [isLeaving, setIsLeaving] = useState(false);
  const Icon = icons[type];

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLeaving(true);
      setTimeout(() => onClose(id), 300);
    }, duration);

    return () => clearTimeout(timer);
  }, [id, duration, onClose]);

  return (
    <div
      className={`
        flex items-start gap-3 p-4 rounded-lg border backdrop-blur-md
        ${colors[type]}
        transition-all duration-300
        ${isLeaving ? 'opacity-0 translate-x-full' : 'opacity-100 translate-x-0'}
      `}
    >
      <Icon className="h-5 w-5 flex-shrink-0 mt-0.5" />
      <div className="flex-1 min-w-0">
        <h4 className="font-semibold text-white">{title}</h4>
        {message && <p className="text-sm text-white/80 mt-1">{message}</p>}
      </div>
      <button
        onClick={() => {
          setIsLeaving(true);
          setTimeout(() => onClose(id), 300);
        }}
        className="p-1 hover:bg-white/10 rounded transition-colors"
      >
        <X className="h-4 w-4 text-white/70" />
      </button>
    </div>
  );
}

interface NotificationContainerProps {
  notifications: Notification[];
  onClose: (id: string) => void;
}

export function NotificationContainer({ notifications, onClose }: NotificationContainerProps) {
  if (notifications.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-[100] space-y-2 w-96 max-w-full pointer-events-none">
      <div className="space-y-2 pointer-events-auto">
        {notifications.map((notification) => (
          <NotificationItem key={notification.id} {...notification} onClose={onClose} />
        ))}
      </div>
    </div>
  );
}
