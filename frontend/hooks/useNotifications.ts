  'use client';

import { useEffect, useState, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { getToken } from '@/lib/auth-service';
import { notificationService } from '@/lib/notification-service';

const SOCKET_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

// Hook pour notifications
export const useNotifications = () => {
  const [unreadCount, setUnreadCount] = useState(0);
  const [socket, setSocket] = useState<Socket | null>(null);

  const fetchUnreadCount = useCallback(async () => {
    try {
      const count = await notificationService.getUnreadCount();
      setUnreadCount(count);
    } catch (err) {
      console.error('Error fetching unread count:', err);
    }
  }, []);

  useEffect(() => {
    fetchUnreadCount();

    const token = getToken();
    if (!token) return;

    const newSocket = io(`${SOCKET_URL}/notifications`, {
      auth: { token },
      transports: ['websocket'],
    });

    newSocket.on('connect', () => {
      console.log('Connected to notifications socket');
    });

    newSocket.on('newNotification', (notification) => {
      console.log('New notification received:', notification);
      fetchUnreadCount();
    });

    newSocket.on('unreadCountUpdate', () => {
      fetchUnreadCount();
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, [fetchUnreadCount]);

  return { unreadCount, fetchUnreadCount };
};
