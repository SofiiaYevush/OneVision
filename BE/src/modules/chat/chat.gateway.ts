import { Server as SocketServer } from 'socket.io';
import { getIO } from '../../sockets/server';
import { bus, Events } from '../../shared/events/bus';
import { IMessage } from './message.model';

export function registerChatGateway(_io: SocketServer) {
  const io = getIO();

  io.on('connection', (socket) => {
    socket.on('chat:join', (conversationId: string) => {
      socket.join(`conv:${conversationId}`);
    });

    socket.on('chat:leave', (conversationId: string) => {
      socket.leave(`conv:${conversationId}`);
    });

    socket.on('chat:typing', (data: { conversationId: string; isTyping: boolean }) => {
      socket.to(`conv:${data.conversationId}`).emit('chat:typing', {
        userId: socket.data.user.sub,
        isTyping: data.isTyping,
      });
    });
  });

  bus.on<IMessage>(Events.MESSAGE_SENT, (msg) => {
    io.to(`conv:${msg.conversationId.toString()}`).emit('chat:message', msg);
    io.to(`user:${msg.senderId.toString()}`).emit('chat:message', msg);
  });
}