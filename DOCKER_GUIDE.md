# 🐳 Docker & CI/CD Setup Guide

## What is Docker?

**Docker** packages your application and all its dependencies into "containers" - think of them as lightweight, portable virtual machines.

### Why We Use Docker:

1. **Consistency**: Works the same on every machine (your laptop, teammate's machine, production server)
2. **Easy Setup**: Instead of 15 installation steps, just run `docker-compose up`
3. **Isolation**: MongoDB, Backend, and Frontend each run in their own container
4. **No Conflicts**: Your project won't interfere with other projects on your machine

---

## 🚀 Quick Start with Docker

### Prerequisites
- Install [Docker Desktop](https://www.docker.com/products/docker-desktop/)
- That's it! No need for Node.js or MongoDB!

### Start the Application

```bash
# 1. Clone the repository (if you haven't)
git clone https://github.com/Plymouth-University/coursework-group-88-1.git
cd coursework-group-88-1

# 2. Start everything with one command!
docker-compose up

# That's it! Your app is running:
# Frontend: http://localhost
# Backend API: http://localhost:5001
# MongoDB: Running in the background
```

### Docker Commands You'll Use

```bash
# Start in background (detached mode)
docker-compose up -d

# Stop all services
docker-compose down

# View logs
docker-compose logs -f

# See what's running
docker-compose ps

# Restart after code changes (rebuilds images)
docker-compose up --build

# Nuclear option: Stop and delete everything (including database data)
docker-compose down -v
```

---

## 📁 What Did We Create?

### 1. `server/Dockerfile`
Builds a Docker image for the Node.js backend:
- Uses Node.js 18 Alpine (lightweight Linux)
- Installs dependencies
- Runs the server on port 5001

### 2. `client/Dockerfile`
Builds a Docker image for the React frontend:
- **Stage 1**: Builds the React app with Vite
- **Stage 2**: Serves it with Nginx web server
- Nginx proxies API requests to the backend

### 3. `client/nginx.conf`
Nginx configuration that:
- Serves the React app
- Routes `/api/*` requests to the backend
- Handles WebSocket connections for Socket.io
- Supports React Router (SPA routing)

### 4. `docker-compose.yml`
Orchestrates all 3 services:
```yaml
services:
  mongodb:     # Database
  backend:     # Node.js API
  frontend:    # React + Nginx
```

All services are connected via a Docker network called `app-network`.

---

## 🔄 What is CI/CD?

**CI/CD** = Continuous Integration / Continuous Deployment

It's automation that runs every time you push code to GitHub:

### How It Works:

```
1. You push code to GitHub
     ↓
2. GitHub Actions automatically:
   - Runs tests
   - Checks code quality (ESLint)
   - Builds Docker images
     ↓
3. If tests pass:
   - Deploys to staging (develop branch)
   - Deploys to production (main branch)
```

### Benefits:
- 🐛 Catches bugs before they reach production
- ✅ Ensures code quality
- 🚀 Automatic deployment (no manual steps!)
- 📊 Build history and logs

---

## 📝 `.github/workflows/ci-cd.yml`

**What it does:**

### Job 1: Test
- Starts a MongoDB database
- Installs backend dependencies
- Runs ESLint (code quality check)
- Runs unit tests
- **Runs on**: Every push or pull request

### Job 2: Build
- Builds Docker images for backend and frontend
- Caches build artifacts (faster next time)
- **Runs on**: Successful test completion

### Job 3: Deploy
- Deploys to staging (develop branch)
- Deploys to production (main branch)
- **Runs on**: Successful build

---

## 🎯 How to See CI/CD in Action

1. **Push code to GitHub:**
   ```bash
   git add .
   git commit -m "Add awesome feature"
   git push origin main
   ```

2. **Watch it run:**
   - Go to your GitHub repository
   - Click the "Actions" tab
   - See your workflow running!

3. **View results:**
   - ✅ Green checkmark = All tests passed
   - ❌ Red X = Something failed (click to see why)

---

## 🔧 Docker vs Manual Development

### Without Docker:
```bash
# Terminal 1: Start MongoDB
mongod --dbpath ~/data/db

# Terminal 2: Start Backend
cd server
npm install
npm run dev

# Terminal 3: Start Frontend
cd client
npm install
npm run dev
```
**Problem**: Different Node/MongoDB versions on each machine → bugs!

### With Docker:
```bash
docker-compose up
```
**All 3 services start automatically, same version everywhere!**

---

## 📊 Architecture Diagram

```
┌─────────────────────────────────────────┐
│          Docker Compose                  │
├─────────────────────────────────────────┤
│                                          │
│  ┌──────────┐  ┌──────────┐  ┌────────┐│
│  │ MongoDB  │  │ Backend  │  │Frontend││
│  │  Port:   │  │  Port:   │  │ Port:  ││
│  │  27017   │  │  5001    │  │  80    ││
│  └─────┬────┘  └────┬─────┘  └───┬────┘│
│        │            │             │     │
│        └────────────┴─────────────┘     │
│           app-network (bridge)          │
└─────────────────────────────────────────┘
```

User accesses: `http://localhost` → Nginx → React App
API calls: `http://localhost/api/*` → Nginx → Backend
Database: Backend → MongoDB

---

## 💡 Tips & Troubleshooting

### Port Already in Use?
```bash
# Find what's using port 80
lsof -i :80

# Kill it
kill -9 <PID>

# Or change docker-compose.yml ports:
ports:
  - "8080:80"  # Now use http://localhost:8080
```

### Database Data Persists
Docker volumes save your MongoDB data even after `docker-compose down`.
To completely reset:
```bash
docker-compose down -v  # -v removes volumes
```

### View Container Logs
```bash
# All logs
docker-compose logs

# Just backend
docker-compose logs backend

# Follow logs (like tail -f)
docker-compose logs -f backend
```

### Exec into a Container
```bash
# Open shell in backend container
docker-compose exec backend sh

# Check MongoDB
docker-compose exec mongodb mongosh
```

---

## 📚 Further Reading

- [Docker Documentation](https://docs.docker.com/)
- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Nginx Documentation](https://nginx.org/en/docs/)

---

## Summary for Assessment Report

**Docker Benefits:**
- Eliminates "works on my machine" problems
- Simplifies setup for markers/assessors
- Demonstrates industry-standard DevOps practices
- Makes the project more professional

**CI/CD Benefits:**
- Automated testing on every commit
- Ensures code quality
- Prevents bugs from reaching production
- Shows understanding of modern software development practices

**Implementation Effort:**
- Docker: ~2-3 hours
- CI/CD: ~1 hour
- **Total**: 3-4 hours well spent for professional presentation!
