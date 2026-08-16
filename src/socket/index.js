import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';

let io;

export const initSocket = (httpServer) => {
  io = new Server(httpServer, {
    cors: {
      origin: process.env.CLIENT_URL || 'http://localhost:5173',
      credentials: true,
    },
  });

  io.on('connection', (socket) => {
    console.log(`Socket connected: ${socket.id}`);

    socket.on('board:join', (boardId) => {
      socket.join(boardId);
      socket.boardId = boardId;

      socket.to(boardId).emit('user:joined', {
        socketId: socket.id,
        message: 'A user joined the board',
      });
    });

    socket.on('board:leave', (boardId) => {
      socket.leave(boardId);

      socket.to(boardId).emit('user:left', {
        socketId: socket.id,
        message: 'A user left the board',
      });
    });

    socket.on('disconnect', () => {
      if (socket.boardId) {
        socket.to(socket.boardId).emit('user:left', {
          socketId: socket.id,
          message: 'A user left the board',
        });
      }
    });
  });

  return io;
};

export const getIO = () => {
  if (!io) {
    throw new Error('Socket.io not initialized');
  }
  return io;
};

export const emitToBoard = (boardId, event, data) => {
  if (io) {
    io.to(boardId).emit(event, data);
  }
};
