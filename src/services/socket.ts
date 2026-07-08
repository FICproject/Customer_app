import { io, Socket } from 'socket.io-client';
import { Platform } from 'react-native';
import { SOCKET_URL_ANDROID, SOCKET_URL_IOS } from './env';

const SOCKET_URL = Platform.select({
  android: SOCKET_URL_ANDROID,
  ios: SOCKET_URL_IOS,
  default: SOCKET_URL_IOS
}) || 'http://localhost:5000';

class SocketServiceClient {
  private socket: any = null;
  private listeners = new Map<string, Set<(data: any) => void>>();

  connect(userId: string, role: string) {
    if (this.socket) {
      this.socket.disconnect();
    }

    try {
      this.socket = io(SOCKET_URL, {
        transports: ['websocket', 'polling'],
        reconnectionAttempts: 3,
        timeout: 5000
      });

      this.socket.on('connect', () => {
        console.log(`[Socket Client]: Connected to server. Socket ID: ${this.socket?.id}`);
        this.socket?.emit('register', { userId, role });
      });

      this.socket.on('connect_error', (err: any) => {
        console.warn('[Socket Client]: Connection to backend failed. Emulating Socket updates locally.', err.message);
      });

      this.listeners.forEach((callbacks, event) => {
        callbacks.forEach(callback => {
          this.socket?.on(event, callback);
        });
      });
    } catch (e) {
      console.warn('[Socket Client]: Socket connection failed. Operating in local emulation mode.', e);
    }
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      console.log('[Socket Client]: Disconnected from server.');
    }
  }

  joinOrder(orderId: string) {
    if (this.socket && this.socket.connected) {
      this.socket.emit('join_order', { orderId });
      console.log(`[Socket Client]: Joined order channel order:${orderId}`);
    }
  }

  leaveOrder(orderId: string) {
    if (this.socket && this.socket.connected) {
      this.socket.emit('leave_order', { orderId });
      console.log(`[Socket Client]: Left order channel order:${orderId}`);
    }
  }

  sendLocation(partnerId: string, orderId: string, latitude: number, longitude: number, speed = 0, batteryLevel = 100, address = '') {
    if (this.socket && this.socket.connected) {
      this.socket.emit('location_update', {
        partnerId,
        orderId,
        latitude,
        longitude,
        speed,
        batteryLevel,
        address
      });
    }
  }

  on(event: string, callback: (data: any) => void) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(callback);

    if (this.socket) {
      this.socket.on(event, callback);
    }
  }

  off(event: string, callback: (data: any) => void) {
    if (this.listeners.has(event)) {
      this.listeners.get(event)!.delete(callback);
      if (this.listeners.get(event)!.size === 0) {
        this.listeners.delete(event);
      }
    }

    if (this.socket) {
      this.socket.off(event, callback);
    }
  }

  triggerLocalEvent(event: string, data: any) {
    const callbacks = this.listeners.get(event);
    if (callbacks) {
      callbacks.forEach(callback => callback(data));
    }
  }
}

export const socketService = new SocketServiceClient();
export default socketService;
