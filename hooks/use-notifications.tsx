// hooks/use-notifications.tsx
'use client';

import { useState, useCallback } from 'react';
import { Notification, NotificationType } from '@/components/ui/notification';

export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const addNotification = useCallback((
    type: NotificationType,
    title: string,
    message?: string,
    duration?: number
  ) => {
    const id = `notification-${Date.now()}-${Math.random()}`;
    const notification: Notification = {
      id,
      type,
      title,
      message,
      duration,
    };

    setNotifications((prev) => [...prev, notification]);
    return id;
  }, []);

  const removeNotification = useCallback((id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }, []);

  const success = useCallback((title: string, message?: string) => {
    return addNotification('success', title, message);
  }, [addNotification]);

  const error = useCallback((title: string, message?: string) => {
    return addNotification('error', title, message);
  }, [addNotification]);

  const info = useCallback((title: string, message?: string) => {
    return addNotification('info', title, message);
  }, [addNotification]);

  const warning = useCallback((title: string, message?: string) => {
    return addNotification('warning', title, message);
  }, [addNotification]);

  return {
    notifications,
    addNotification,
    removeNotification,
    success,
    error,
    info,
    warning,
  };
}
