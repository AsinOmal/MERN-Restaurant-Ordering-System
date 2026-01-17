const socketIO = require('socket.io');

let io;

const initializeSocket = (server) => {
  io = socketIO(server, {
    cors: {
      origin: process.env.CLIENT_URL || 'http://localhost:3000',
      methods: ['GET', 'POST'],
      credentials: true,
    },
  });

  io.on('connection', (socket) => {
    console.log(`🔌 New client connected: ${socket.id}`);

    // Join room by user role
    socket.on('join:role', (role) => {
      socket.join(role);
      console.log(`User ${socket.id} joined ${role} room`);
    });

    // Join restaurant-specific room
    socket.on('join:restaurant', (restaurantId) => {
      socket.join(`restaurant:${restaurantId}`);
      console.log(`User ${socket.id} joined restaurant ${restaurantId}`);
    });

    // Join order-specific room
    socket.on('join:order', (orderId) => {
      socket.join(`order:${orderId}`);
      console.log(`User ${socket.id} joined order ${orderId}`);
    });

    socket.on('disconnect', () => {
      console.log(`🔌 Client disconnected: ${socket.id}`);
    });
  });

  return io;
};

const getIO = () => {
  if (!io) {
    throw new Error('Socket.io not initialized!');
  }
  return io;
};

module.exports = { initializeSocket, getIO };
