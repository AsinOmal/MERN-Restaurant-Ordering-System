# 🚀 Quick Start - Docker Setup

**Want to run FoodFlow instantly? Follow these 4 steps!**

## Prerequisites
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) installed and running

## Steps

### 1. Start All Services
```bash
docker-compose up
```
Wait 30-60 seconds for initialization.

### 2. Seed Sample Data
```bash
docker-compose exec backend npm run seed
```

### 3. Open Application
- **Frontend:** http://localhost
- **API:** http://localhost:5001/api/health

### 4. Login & Test
**Customer:** `customer@example.com` / `password123`
**Owner:** `owner@example.com` / `password123`

---

## Quick Commands

```bash
# Start in background
docker-compose up -d

# Stop everything
docker-compose down

# View logs
docker-compose logs -f

# Fresh start (deletes data!)
docker-compose down -v && docker-compose up
```

---

## Troubleshooting

**Port 80 in use?** 
```bash
lsof -i :80  # Find process
sudo kill -9 <PID>  # Kill it
```

**White screen?** Clear cache (Cmd+Shift+R) and refresh.

**Empty database?** Run: `docker-compose exec backend npm run seed`

---

**Full Guide:** See `/Users/asinomal/.gemini/antigravity/brain/6718c5af-3175-42b3-8538-47946b2c53aa/docker_quick_start.md`
