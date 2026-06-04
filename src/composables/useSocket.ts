import { ref, onUnmounted } from 'vue';
import { io, Socket } from 'socket.io-client';

const DEV_URL = 'http://localhost:3000';
const PROD_URL = 'https://your-domain.com';

export function useSocket() {
  const socket = ref<Socket | null>(null);
  const connected = ref(false);

  const connect = () => {
    const token = localStorage.getItem('token');
    if (!token) return;

    const url = import.meta.env.DEV ? DEV_URL : PROD_URL;
    socket.value = io(url, {
      path: '/socket.io',
      auth: { token },
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: Infinity,
    });

    socket.value.on('connect', () => { connected.value = true; });
    socket.value.on('disconnect', () => { connected.value = false; });
  };

  const disconnect = () => {
    socket.value?.disconnect();
    socket.value = null;
    connected.value = false;
  };

  const emit = (event: string, data?: any) => {
    socket.value?.emit(event, data);
  };

  const on = (event: string, handler: (...args: any[]) => void) => {
    socket.value?.on(event, handler);
  };

  const off = (event: string, handler?: (...args: any[]) => void) => {
    socket.value?.off(event, handler);
  };

  onUnmounted(() => {
    disconnect();
  });

  return { socket, connected, connect, disconnect, emit, on, off };
}
