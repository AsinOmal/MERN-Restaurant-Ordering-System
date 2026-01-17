const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const helmet = require('helmet');
const connectDB = require('./config/database');
const errorHandler = require('./middleware/error.middleware');

// Load env vars
dotenv.config();

// Connect to database
connectDB();

const app = express();

// Body parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Enable CORS
app.use(cors({
  origin: true,
  credentials: true,
}));

// Security headers
app.use(helmet());

// Mount routers
app.use('/api/auth', require('./routes/auth.routes'));
app.use('/api/restaurants', require('./routes/restaurant.routes'));
app.use('/api/menu', require('./routes/menu.routes'));
app.use('/api/orders', require('./routes/order.routes'));
app.use('/api/cart', require('./routes/cart.routes'));
app.use('/api/deliveries', require('./routes/delivery.routes'));
app.use('/api/reviews', require('./routes/review.routes'));
app.use('/api/users', require('./routes/user.routes'));

// Health check
app.get('/api/health', (req, res) => {
  res.status(200).json({ success: true, message: 'Server is running' });
});

// Error handler
app.use(errorHandler);

module.exports = app;
