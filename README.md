<img width="1636" height="921" alt="Screenshot 2026-01-22 at 15 32 02" src="https://github.com/user-attachments/assets/a226f739-95d2-4122-94b6-34c5dcc9dda9" />

# Restaurant/Takeaway Ordering System

Full-stack web application for restaurant ordering and takeaway services with real-time order tracking, deployed on WSO2 Choreo with Asgardeo identity management.

## Features

- Browse restaurants and menus
- Shopping cart functionality
- Real-time order tracking with WebSockets
- Live delivery tracking
- Restaurant reviews and ratings
- Asgardeo-powered authentication with role-based access control
- Multi-user support (Customer, Staff, Driver, Owner, Admin)

## Tech Stack

**Frontend:**
- React 19 + Vite
- React Router v7
- Axios
- Socket.io Client
- Asgardeo React SDK (`@asgardeo/react`)

**Backend:**
- Node.js + Express.js
- MongoDB + Mongoose (MongoDB Atlas)
- Socket.io for real-time features
- Asgardeo / WSO2 Identity Server (RS256 JWT via JWKS)
- `jwks-rsa` for token verification

**Deployment:**
- WSO2 Choreo (backend + frontend components)
- MongoDB Atlas (database)

## Authentication

Authentication is handled by [Asgardeo by WSO2](https://wso2.com/asgardeo/). Clicking **Login** redirects to Asgardeo's hosted login page. On sign-in, the Asgardeo access token is stored in `localStorage` and attached to all API requests. The backend verifies tokens using Asgardeo's JWKS endpoint — no passwords are stored in the application database.

User roles are read from the `http://wso2.org/claims/groups` claim in the JWT.

## Local Development Setup

### Prerequisites

- Node.js (v18+)
- MongoDB Atlas account (or local MongoDB)

### Backend

```bash
cd server
npm install
cp .env.example .env
# Fill in your values in .env
npm run dev
```

Server runs on `http://localhost:5001`

### Frontend

```bash
cd client
npm install
# Create client/.env.local with your Asgardeo config (see below)
npm run dev
```

Frontend runs on `http://localhost:5173`

### Environment Variables

**`server/.env`**
```
PORT=5001
NODE_ENV=development
MONGODB_URI=your-mongodb-atlas-uri
JWT_SECRET=your-jwt-secret
JWT_EXPIRE=7d
CLIENT_URL=http://localhost:5173
ASGARDEO_ORG_NAME=your-asgardeo-org-name
```

**`client/.env.local`**
```
VITE_ASGARDEO_CLIENT_ID=your-asgardeo-client-id
VITE_ASGARDEO_ORG_NAME=your-asgardeo-org-name
VITE_SIGN_IN_REDIRECT_URL=http://localhost:5173
VITE_SIGN_OUT_REDIRECT_URL=http://localhost:5173
# Uncomment for Choreo deployment:
# VITE_API_BASE_URL=https://your-choreo-api-url/api
```

### Seed the Database

Run once to populate restaurants, menu items, and sample users:

```bash
cd server
npm run seed
```

Data persists in MongoDB Atlas — only re-run if you want to reset to defaults (this wipes existing data).

## Deployment (WSO2 Choreo)

1. Push this repo to GitHub
2. Connect the repo in [Choreo Console](https://console.choreo.dev)
3. Create two components: one for `server/` (NodeJS), one for `client/` (React)
4. Set environment variables in Choreo for each component (same as above)
5. The `server/.choreo/component.yaml` configures the backend REST endpoint automatically

## Docker Setup

```bash
# Build and start all services
docker-compose up --build

# Run in background
docker-compose up -d

# Seed database via Docker
docker-compose exec server npm run seed

# Stop all services
docker-compose down
```

📘 See [DOCKER_GUIDE.md](./DOCKER_GUIDE.md) for full Docker documentation.

## API Endpoints

All protected endpoints require an Asgardeo Bearer token.

### Restaurants
- `GET /api/restaurants` — List all restaurants (public)
- `GET /api/restaurants/:id` — Restaurant details (public)
- `POST /api/restaurants` — Create restaurant (owner/admin)
- `PUT /api/restaurants/:id` — Update restaurant (owner/admin)
- `DELETE /api/restaurants/:id` — Delete restaurant (owner/admin)

### Menu
- `GET /api/menu` — Get menu items (public)
- `POST /api/menu` — Create menu item (staff/owner/admin)
- `PUT /api/menu/:id` — Update menu item (staff/owner/admin)
- `DELETE /api/menu/:id` — Delete menu item (staff/owner/admin)

### Orders
- `GET /api/orders` — Get user orders
- `POST /api/orders` — Create order (customer)
- `GET /api/orders/:id` — Order details
- `PATCH /api/orders/:id/status` — Update status (staff/admin)
- `DELETE /api/orders/:id` — Cancel order

### Cart
- `GET /api/cart` — Get cart
- `POST /api/cart/items` — Add item
- `PUT /api/cart/items/:itemId` — Update item
- `DELETE /api/cart/items/:itemId` — Remove item
- `DELETE /api/cart` — Clear cart

### Deliveries
- `GET /api/deliveries` — Get deliveries
- `POST /api/deliveries` — Create delivery (staff/admin)
- `PATCH /api/deliveries/:id/status` — Update status (driver/staff/admin)
- `PATCH /api/deliveries/:id/location` — Update driver location (driver)

### Reviews
- `GET /api/reviews` — Get reviews (public)
- `POST /api/reviews` — Create review
- `PUT /api/reviews/:id` — Update review
- `DELETE /api/reviews/:id` — Delete review

## WebSocket Events

### Order Events
- `order:track` / `order:stop_track` — Subscribe/unsubscribe to order updates
- `order:new` — New order notification (restaurant)
- `order:status_update` — Status change (customer)

### Delivery Events
- `delivery:track` / `delivery:stop_track` — Subscribe/unsubscribe to delivery updates
- `delivery:location_update` — Real-time driver location
- `delivery:status_update` — Delivery status change

## Testing

```bash
cd server

# Run unit tests with coverage
npm test

# Watch mode
npm run test:watch
```

## Project Structure

```
├── client/                  # React frontend (Vite)
│   ├── src/
│   │   ├── context/         # AuthContext (Asgardeo), SocketContext
│   │   ├── pages/           # Route-level components
│   │   ├── components/      # Shared UI components
│   │   ├── services/        # Axios API layer
│   │   └── asgardeoConfig.js
│   └── .choreo/
└── server/                  # Express backend
    ├── src/
    │   ├── controllers/
    │   ├── middleware/       # asgardeo.middleware.js, auth.middleware.js
    │   ├── models/          # 8 Mongoose schemas
    │   ├── routes/
    │   ├── sockets/
    │   └── config/
    ├── tests/
    ├── seed.js
    └── .choreo/component.yaml
```
