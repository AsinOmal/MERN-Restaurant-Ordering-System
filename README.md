<img width="1636" height="921" alt="Screenshot 2026-01-22 at 15 32 02" src="https://github.com/user-attachments/assets/a226f739-95d2-4122-94b6-34c5dcc9dda9" />

# Restaurant/Takeaway Ordering System

Full-stack web application for restaurant ordering and takeaway services with real-time order tracking.

## Features

- 🍕 Browse restaurants and menus
- 🛒 Shopping cart functionality
- 📦 Real-time order tracking with WebSockets
- 🚗 Live delivery tracking
- ⭐ Restaurant reviews and ratings
- 🔐 JWT authentication with role-based access control
- 👥 Multi-user support (Customer, Staff, Driver, Owner, Admin)

## Tech Stack

**Frontend:**

- HTML5, CSS3, JavaScript (ES6+)
- Socket.io Client

**Backend:**

- Node.js + Express.js
- MongoDB + Mongoose
- Socket.io for real-time features
- JWT for authentication
- bcrypt for password hashing

## Installation

### Prerequisites

- Node.js (v18+)
- MongoDB
- Docker & Docker Compose (optional, for containerized setup)

### Setup Options

You can run this application in two ways:

1. **Using Docker** (Recommended - fastest setup)
2. **Manual Setup** (Traditional development setup)

---

### Option 1: Docker Setup (Recommended)

The easiest way to run the application is using Docker Compose, which handles all dependencies automatically.

#### Quick Start with Docker

1. Clone the repository

```bash
git clone https://github.com/Plymouth-University/coursework-group-88-1.git
cd coursework-group-88-1
```

2. Build and start all services

```bash
docker-compose up --build
```

This single command will:

- Build the client and server Docker images
- Start MongoDB container
- Start the backend server on `http://localhost:5001`
- Start the frontend client on `http://localhost:5173`
- Set up networking between all services

#### Docker Commands

```bash
# Start services in detached mode (background)
docker-compose up -d

# Stop all services
docker-compose down

# View logs
docker-compose logs -f

# View logs for specific service
docker-compose logs -f server
docker-compose logs -f client

# Rebuild and restart after code changes
docker-compose up --build

# Stop and remove all containers, networks, and volumes
docker-compose down -v

# Run database seeding
docker-compose exec server npm run seed

# Access server container shell
docker-compose exec server sh

# Access MongoDB shell
docker-compose exec mongo mongosh
```

#### Environment Variables for Docker

Docker Compose uses the following default configuration:

- MongoDB: `mongodb://mongo:27017/restaurant-ordering`
- Backend Port: `5001`
- Frontend Port: `5173`

To customize, create a `.env` file in the root directory.

📘 **For detailed Docker documentation, see [DOCKER_GUIDE.md](./DOCKER_GUIDE.md) and [DOCKER_QUICKSTART.md](./DOCKER_QUICKSTART.md)**

---

### Option 2: Manual Setup

1. Clone the repository

```bash
git clone https://github.com/Plymouth-University/coursework-group-88-1.git
cd coursework-group-88-1
```

2. Install backend dependencies

```bash
cd server
npm install
```

3. Configure environment variables

```bash
cp .env.example .env
# Edit .env with your configuration
```

4. Start MongoDB

```bash
# macOS (using Homebrew)
brew services start mongodb-community

# Or manually
mongod --dbpath ~/data/db
```

5. Seed the database (optional)

```bash
npm run seed
```

6. Run the server

```bash
npm run dev
```

Server will run on http://localhost:5001

7. Install and run frontend (in a new terminal)

```bash
cd client
npm install
npm run dev
```

Frontend will run on http://localhost:5173

## API Endpoints

### Authentication

- POST `/api/auth/register` - Register new user
- POST `/api/auth/login` - User login
- GET `/api/auth/me` - Get current user
- PUT `/api/auth/profile` - Update profile

### Restaurants

- GET `/api/restaurants` - Get all restaurants
- GET `/api/restaurants/:id` - Get restaurant details
- POST `/api/restaurants` - Create restaurant (owner/admin)
- PUT `/api/restaurants/:id` - Update restaurant
- DELETE `/api/restaurants/:id` - Delete restaurant

### Menu

- GET `/api/menu` - Get menu items
- POST `/api/menu` - Create menu item (staff/owner/admin)
- PUT `/api/menu/:id` - Update menu item
- DELETE `/api/menu/:id` - Delete menu item

### Orders

- GET `/api/orders` - Get user orders
- POST `/api/orders` - Create new order
- GET `/api/orders/:id` - Get order details
- PATCH `/api/orders/:id/status` - Update order status (staff)
- DELETE `/api/orders/:id` - Cancel order

### Cart

- GET `/api/cart` - Get user's cart
- POST `/api/cart/items` - Add item to cart
- PUT `/api/cart/items/:itemId` - Update cart item
- DELETE `/api/cart/items/:itemId` - Remove from cart
- DELETE `/api/cart` - Clear cart

### Deliveries

- GET `/api/deliveries` - Get deliveries
- POST `/api/deliveries` - Create delivery (staff)
- PATCH `/api/deliveries/:id/status` - Update delivery status
- PATCH `/api/deliveries/:id/location` - Update driver location

### Reviews

- GET `/api/reviews` - Get reviews
- POST `/api/reviews` - Create review
- PUT `/api/reviews/:id` - Update review
- DELETE `/api/reviews/:id` - Delete review

## WebSocket Events

### Order Events

- `order:new` - New order notification (to restaurant)
- `order:status_update` - Order status change (to customer)
- `order:track` - Start tracking order
- `order:stop_track` - Stop tracking order

### Delivery Events

- `delivery:status_update` - Delivery status change
- `delivery:location_update` - Real-time driver location
- `delivery:track` - Start tracking delivery
- `delivery:stop_track` - Stop tracking delivery

## Project Structure

```
restaurant-ordering-system/
├── client/                 # Frontend application
│   └── public/
│       ├── index.html
│       ├── css/
│       └── js/
└── server/                 # Backend application
    ├── src/
    │   ├── config/        # Configuration files
    │   ├── models/        # Mongoose models (8 entities)
    │   ├── controllers/   # Route controllers
    │   ├── routes/        # API routes
    │   ├── middleware/    # Custom middleware
    │   ├── sockets/       # WebSocket handlers
    │   ├── app.js         # Express app setup
    │   └── server.js      # Server entry point
    └── tests/             # Test files
```

## Testing

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Generate coverage report
npm test -- --coverage
```
