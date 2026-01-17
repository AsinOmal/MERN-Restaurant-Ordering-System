# Deployment Guide

## Prerequisites

- Node.js 18+ installed
- MongoDB 6.0+ running
- Git installed
- npm or yarn package manager

---

## Environment Variables

Create `.env` files in both `server/` and `client/` directories:

### Server Environment (`server/.env`)
```bash
# Database
MONGODB_URI=mongodb://localhost:27017/restaurant-ordering-system

# Authentication
JWT_SECRET=your-super-secret-jwt-key-here-replace-in-production
JWT_EXPIRE=24h

# Server Configuration
PORT=5001
NODE_ENV=development

# Client URL (for CORS)
CLIENT_URL=http://localhost:5173
```

### Client Environment (`client/.env`)
```bash
VITE_API_URL=http://localhost:5001/api
VITE_SOCKET_URL=http://localhost:5001
```

---

## Local Development Setup

### 1. Clone Repository
```bash
git clone https://github.com/Plymouth-University/coursework-group-88-1.git
cd coursework-group-88-1
```

### 2. Install Dependencies
```bash
# Backend
cd server
npm install

# Frontend
cd ../client
npm install
```

### 3. Start MongoDB
```bash
# macOS (Homebrew)
brew services start mongodb-community

# Linux (systemd)
sudo systemctl start mongod

# Windows
mongod --dbpath C:\data\db
```

### 4. Seed Database (Optional)
```bash
cd server
node seed.js
```

This creates:
- 3 test users (customer, owner, staff)
- 3 restaurants with menus
- Sample menu items

**Login Credentials:**
- Customer: `customer@example.com` / `password123`
- Owner: `owner@example.com` / `password123`
- Staff: `staff@example.com` / `password123`

### 5. Run Development Servers
```bash
# Terminal 1 - Backend
cd server
npm run dev

# Terminal 2 - Frontend
cd client
npm run dev
```

**Access:**
- Frontend: http://localhost:5173
- Backend API: http://localhost:5001/api

---

## Production Deployment

### Option 1: Docker Deployment

#### Build and Run with Docker
```bash
# Build images
docker build -t foodflow-server ./server
docker build -t foodflow-client ./client

# Run MongoDB container
docker run -d \
  --name foodflow-mongo \
  -p 27017:27017 \
  -v foodflow-data:/data/db \
  mongo:6.0

# Run backend container
docker run -d \
  --name foodflow-server \
  --link foodflow-mongo:mongo \
  -p 5001:5001 \
  -e MONGODB_URI=mongodb://mongo:27017/restaurant-ordering-system \
  -e JWT_SECRET=production-secret-key \
  foodflow-server

# Run frontend container
docker run -d \
  --name foodflow-client \
  -p 80:80 \
  foodflow-client
```

#### Docker Compose (Recommended)
Create `docker-compose.yml`:
```yaml
version: '3.8'

services:
  mongodb:
    image: mongo:6.0
    volumes:
      - mongo-data:/data/db
    ports:
      - "27017:27017"

  backend:
    build: ./server
    ports:
      - "5001:5001"
    environment:
      - MONGODB_URI=mongodb://mongodb:27017/restaurant-ordering-system
      - JWT_SECRET=${JWT_SECRET}
      - NODE_ENV=production
    depends_on:
      - mongodb

  frontend:
    build: ./client
    ports:
      - "80:80"
    depends_on:
      - backend

volumes:
  mongo-data:
```

Run with:
```bash
docker-compose up -d
```

---

### Option 2: Traditional VPS Deployment

#### 1. Prepare Server
```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js 18
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Install MongoDB
wget -qO - https://www.mongodb.org/static/pgp/server-6.0.asc | sudo apt-key add -
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/6.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-6.0.list
sudo apt update
sudo apt install -y mongodb-org

# Start MongoDB
sudo systemctl start mongod
sudo systemctl enable mongod
```

#### 2. Deploy Backend
```bash
cd server
npm ci --production
npm start
```

Use **PM2** for process management:
```bash
npm install -g pm2
pm2 start src/server.js --name foodflow-server
pm2 save
pm2 startup
```

#### 3. Build and Deploy Frontend
```bash
cd client
npm ci
npm run build

# Serve with nginx
sudo apt install nginx
sudo cp -r dist/* /var/www/html/
```

#### 4. Configure Nginx
```nginx
server {
    listen 80;
    server_name your-domain.com;

    # Frontend
    location / {
        root /var/www/html;
        try_files $uri $uri/ /index.html;
    }

    # Backend API
    location /api {
        proxy_pass http://localhost:5001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    # WebSocket
    location /socket.io {
        proxy_pass http://localhost:5001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }
}
```

Restart nginx:
```bash
sudo nginx -t
sudo systemctl restart nginx
```

---

## Production Checklist

### Security
- [ ] Change `JWT_SECRET` to strong random string
- [ ] Enable HTTPS with Let's Encrypt
- [ ] Configure firewall (allow ports 80, 443, 22 only)
- [ ] Set `NODE_ENV=production`
- [ ] Enable MongoDB authentication
- [ ] Configure CORS for production domain

### Performance
- [ ] Enable gzip compression in nginx
- [ ] Set up CDN for static assets
- [ ] Configure MongoDB indexes
- [ ] Enable connection pooling
- [ ] Set up caching headers

### Monitoring
- [ ] Configure log rotation
- [ ] Set up uptime monitoring
- [ ] Enable error tracking (Sentry)
- [ ] Configure backup strategy for MongoDB
- [ ] Set up alerts for critical errors

---

## Database Backup

### Manual Backup
```bash
mongodump --db restaurant-ordering-system --out /backup/$(date +%Y%m%d)
```

### Automated Daily Backup (Cron)
```bash
# Add to crontab
0 2 * * * mongodump --db restaurant-ordering-system --out /backup/$(date +\%Y\%m\%d)
```

### Restore from Backup
```bash
mongorestore --db restaurant-ordering-system /backup/20260122
```

---

## Continuous Deployment

### GitHub Actions Workflow
The project includes `.github/workflows/ci.yml` that:
- Runs tests on every push
- Checks code quality with ESLint
- Builds production artifacts

### Deploy on Merge to Main
Add to workflow:
```yaml
  deploy:
    runs-on: ubuntu-latest
    needs: test
    if: github.ref == 'refs/heads/main'
    steps:
      - name: Deploy to Production
        run: |
          ssh user@server 'cd /app && git pull && npm ci && pm2 restart all'
```

---

## Troubleshooting

### Backend won't start
```bash
# Check MongoDB is running
sudo systemctl status mongod

# Check port availability
lsof -i :5001

# View logs
pm2 logs foodflow-server
```

### Frontend build fails
```bash
# Clear cache and rebuild
rm -rf node_modules dist
npm install
npm run build
```

### Database connection errors
```bash
# Check MongoDB connection
mongo --eval "db.version()"

# Verify connection string in .env
echo $MONGODB_URI
```

---

## Scaling Strategies

### Horizontal Scaling
1. Deploy multiple backend instances
2. Use nginx for load balancing
3. Configure Redis adapter for Socket.io
4. Use MongoDB replica set

### Vertical Scaling
1. Increase server resources (CPU, RAM)
2. Optimize database queries with indexes
3. Enable connection pooling
4. Implement caching layer

---

## Support

For deployment issues, check:
- Server logs in `pm2 logs`
- MongoDB logs in `/var/log/mongodb/mongod.log`
- Nginx logs in `/var/log/nginx/error.log`
