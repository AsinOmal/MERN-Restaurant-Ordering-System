module.exports = (io) => {
  io.on('connection', (socket) => {
    // Handle delivery-related events
    socket.on('delivery:track', (deliveryId) => {
      socket.join(`delivery:${deliveryId}`);
      console.log(`User tracking delivery: ${deliveryId}`);
    });

    socket.on('delivery:stop_track', (deliveryId) => {
      socket.leave(`delivery:${deliveryId}`);
      console.log(`User stopped tracking delivery: ${deliveryId}`);
    });
  });
};
