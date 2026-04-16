import { useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuthStore } from '@/store/auth';

let socket: Socket | null = null;

export function getSocket(): Socket | null {
  return socket;
}

export function useSocket() {
  const { accessToken, user } = useAuthStore();
  const connected = useRef(false);

  useEffect(() => {
    if (!accessToken || !user || connected.current) return;

    socket = io(import.meta.env.VITE_API_URL as string, {
      auth: { token: accessToken },
      transports: ['websocket', 'polling'],
    });

    socket.on('connect', () => { connected.current = true; });
    socket.on('disconnect', () => { connected.current = false; });

    return () => {
      socket?.disconnect();
      socket = null;
      connected.current = false;
    };
  }, [accessToken, user]);

  return socket;
}