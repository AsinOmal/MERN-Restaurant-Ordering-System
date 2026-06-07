const http = require('http');
const express = require('express');
const dotenv = require('dotenv');
dotenv.config();
const morgan = require('morgan');
const colors = require('colors');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const helmet = require('helmet');
const { Server } = require('socket.io'); // Socket.io
const path = require('path');
const errorHandler = require('./middleware/error.middleware'); // Assuming this path for errorHandler
const connectDB = require('./config/database');

// Connect to database
connectDB();

const app = express();
const httpServer = http.createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: '*', // Allow all origins for development
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    credentials: true
  }
});

// Make io available in routes
app.set('io', io);

// Socket.io Connection Handler
io.on('connection', (socket) => {
  console.log(`[Socket] New connection: ${socket.id}`);

  // Join user room (for customers)
  socket.on('join:user', (userId) => {
    if (userId) {
      socket.join(`user:${userId}`);
      console.log(`[Socket] ${socket.id} joined user:${userId}`);
    }
  });

  // Join restaurant room (for staff/owners)
  socket.on('join:restaurant', (restaurantId) => {
    if (restaurantId) {
      socket.join(`restaurant:${restaurantId}`);
      console.log(`[Socket] ${socket.id} joined restaurant:${restaurantId}`);
    }
  });

  socket.on('disconnect', () => {
    console.log(`[Socket] Disconnected: ${socket.id}`);
  });
});

// Middleware
app.use(express.json());
app.use(cookieParser());
app.use(cors({
    origin: true,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept']
}));
app.use(helmet());
app.use(morgan('dev'));

// Static folder
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Routes

// Mount routes
app.use('/api/auth', require('./routes/auth.routes'));
app.use('/api/restaurants', require('./routes/restaurant.routes'));
app.use('/api/menu', require('./routes/menu.routes'));
app.use('/api/cart', require('./routes/cart.routes'));
app.use('/api/orders', require('./routes/order.routes'));
app.use('/api/reviews', require('./routes/review.routes'));
app.use('/api/favorites', require('./routes/favorites.routes'));
app.use('/api/analytics', require('./routes/analytics.routes'));
app.use('/api/upload', require('./routes/upload.routes'));

// Error handling middleware
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

// Use httpServer.listen instead of app.listen
httpServer.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
  console.log(`Error: ${err.message}`);
  // Close server & exit process
  httpServer.close(() => process.exit(1));
});
