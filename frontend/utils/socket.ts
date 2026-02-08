import { io, Socket } from 'socket.io-client';
import { getSocketBaseUrl } from './api';

let socket: Socket | null = null;

export const getSocket = (): Socket => {
  if (!socket) {
    socket = io(getSocketBaseUrl(), {
      autoConnect: true,
    });
  }
  return socket;
};

export const closeSocket = (): void => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};
