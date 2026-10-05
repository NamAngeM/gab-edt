"use client";

import React, { createContext, useContext, useEffect, useState } from 'react';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { getStoredUser } from '@/lib/api';

/** Point d'entrée WebSocket de l'API (même site que l'application pour que le cookie de session soit envoyé). */
const WS_URL = process.env.NEXT_PUBLIC_WS_URL || 'http://localhost:8080/ws';

interface NotificationContextType {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  notifications: any[];
}

const NotificationContext = createContext<NotificationContextType>({ notifications: [] });

export function useNotifications() {
  return useContext(NotificationContext);
}

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [notifications, setNotifications] = useState<any[]>([]);
  const [toast, setToast] = useState<{title: string, message: string, type: string} | null>(null);

  useEffect(() => {
    // Les alertes sont propres à l'établissement ; l'authentification de la connexion
    // WebSocket se fait par le cookie de session (aucun jeton manipulé en JavaScript)
    const institutionId = getStoredUser().institutionId;
    if (!institutionId) return;

    const client = new Client({
      webSocketFactory: () => new SockJS(WS_URL),
      onConnect: () => {
        console.log('Connected to WebSocket');
        client.subscribe(`/topic/admin-alerts/${institutionId}`, (message) => {
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
