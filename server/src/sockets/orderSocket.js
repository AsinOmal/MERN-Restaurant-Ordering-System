module.exports = (io) => {
  io.on('connection', (socket) => {
    // Handle order-related events
    socket.on('order:track', (orderId) => {
      socket.join(`order:${orderId}`);
      console.log(`User tracking order: ${orderId}`);
    });

    socket.on('order:stop_track', (orderId) => {
      socket.leave(`order:${orderId}`);
      console.log(`User stopped tracking order: ${orderId}`);
    });
  });
};
