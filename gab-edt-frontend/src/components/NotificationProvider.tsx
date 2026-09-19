"use client";

import React, { createContext, useContext, useEffect, useState } from 'react';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { API_URL } from '@/lib/api';

interface NotificationContextType {
  notifications: any[];
}

const NotificationContext = createContext<NotificationContextType>({ notifications: [] });

export function useNotifications() {
  return useContext(NotificationContext);
}

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [toast, setToast] = useState<{title: string, message: string, type: string} | null>(null);

  useEffect(() => {
    let token = '';
    if (typeof window !== 'undefined') {
      token = localStorage.getItem('jwt_token') || '';
    }
    if (!token) return;

    // Remove /api/v1 from API_URL to get the base url
    const baseUrl = API_URL.replace('/api/v1', '');
    const socketUrl = `${baseUrl}/ws`;

    const client = new Client({
      webSocketFactory: () => new SockJS(socketUrl),
      connectHeaders: {
        Authorization: `Bearer ${token}`
      },
      onConnect: () => {
        console.log('Connected to WebSocket');
        client.subscribe('/topic/admin-alerts', (message) => {
          if (message.body) {
            const payload = JSON.parse(message.body);
            setNotifications(prev => [payload, ...prev]);
            setToast({ title: payload.title, message: payload.message, type: payload.type });
            setTimeout(() => setToast(null), 5000);
          }
        });
      },
      onStompError: (frame) => {
        console.error('Broker reported error: ' + frame.headers['message']);
        console.error('Additional details: ' + frame.body);
      },
    });

    client.activate();

    return () => {
      client.deactivate();
    };
  }, []);

  return (
    <NotificationContext.Provider value={{ notifications }}>
      {children}
      {toast && (
        <div className="ws-toast">
          <div className="ws-toast-icon">
            <span className="material-symbols-outlined">
              {toast.type === 'INFO' ? 'info' : toast.type === 'WARNING' ? 'warning' : 'notifications'}
            </span>
          </div>
          <div className="ws-toast-content">
            <strong>{toast.title}</strong>
            <p>{toast.message}</p>
          </div>
          <button onClick={() => setToast(null)} className="ws-toast-close">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>
      )}
    </NotificationContext.Provider>
  );
}
