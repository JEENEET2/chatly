# 🚀 Chatly - Complete Setup & Deployment Guide

## Table of Contents
- [Overview](#overview)
- [Features](#features)
- [Architecture](#architecture)
- [Quick Start](#quick-start)
- [Backend Setup](#backend-setup)
- [Android App Setup](#android-app-setup)
- [Desktop App Setup](#desktop-app-setup)
- [Free Hosting Options](#free-hosting-options)
- [Production Deployment](#production-deployment)
- [API Documentation](#api-documentation)
- [Troubleshooting](#troubleshooting)

---

## Overview

Chatly is a modern, production-ready messaging application rebranded from Telegram's open-source clients. It features:

- **Premium UI/UX** with modern indigo-teal color grading
- **End-to-end encrypted** secret chats
- **Cross-platform** support (Android, Linux, Windows)
- **Real-time messaging** via WebSocket
- **Scalable backend** with MongoDB

---

## Features

### Core Messaging
- ✅ Private chats, groups (up to 200K members), and channels
- ✅ Message reactions, replies, and forwarding
- ✅ File sharing up to 2GB per file
- ✅ Voice and video messages
- ✅ Scheduled messages
- ✅ Message editing and deletion

### Premium Features
- 🎨 Exclusive themes and custom color schemes
- ⚡ Priority message delivery
- 📊 Chat analytics
- 🔒 Advanced privacy controls
- 🎯 Custom stickers and emojis

### Security
- MTProto 2.0 encryption protocol
- Two-factor authentication (2FA)
- Self-destructing messages
- Passcode and biometric lock
- Privacy-focused design

---

## Architecture

```
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│   Chatly App    │────▶│   Backend API    │────▶│    MongoDB      │
│   (Android/     │     │   (Node.js +     │     │    Database     │
│    Desktop)     │     │    Express)      │     │                 │
└─────────────────┘     └──────────────────┘     └─────────────────┘
         │                       │
         │ WebSocket             │ Redis (optional cache)
         ▼                       ▼
┌─────────────────┐     ┌──────────────────┐
│  Real-time Msgs │     │  Session Storage │
└─────────────────┘     └──────────────────┘
```

---

## Quick Start

### Prerequisites
- Node.js 18+ 
- MongoDB 6.0+
- Git
- Docker (optional but recommended)

### 5-Minute Setup

```bash
# 1. Clone the repository
git clone https://github.com/your-org/chatly.git
cd chatly

# 2. Setup backend
cd backend
cp .env.example .env
npm install
npm run dev

# 3. Backend runs on http://localhost:8080
# Check health: curl http://localhost:8080/health
```

---

## Backend Setup

### Step 1: Install Dependencies

```bash
cd /workspace/backend
npm install
```

### Step 2: Configure Environment

```bash
# Copy environment template
cp .env.example .env

# Edit .env with your values
nano .env
```

**Required Variables:**
```env
NODE_ENV=development
PORT=8080
MONGODB_URI=mongodb://localhost:27017/chatly
JWT_SECRET=change-this-to-random-32-char-string
TELEGRAM_API_ID=your_api_id
TELEGRAM_API_HASH=your_api_hash
```

### Step 3: Get Telegram API Credentials

1. Visit https://my.telegram.org/apps
2. Log in with your phone number
3. Create a new application
4. Copy `API_ID` and `API_HASH` to `.env`

### Step 4: Start MongoDB

**Option A: Local MongoDB**
```bash
# Ubuntu/Debian
sudo systemctl start mongod

# macOS
brew services start mongodb-community

# Docker
docker run -d -p 27017:27017 --name chatly-mongo mongo:latest
```

**Option B: MongoDB Atlas (Free Tier)**
1. Visit https://www.mongodb.com/cloud/atlas
2. Create free cluster
3. Get connection string
4. Update `MONGODB_URI` in `.env`

### Step 5: Run the Server

```bash
# Development mode with hot reload
npm run dev

# Production mode
npm start

# Run tests
npm test
```

### Step 6: Verify Installation

```bash
# Health check
curl http://localhost:8080/health

# Expected response:
# {"status":"healthy","uptime":123.45,"timestamp":"2024-01-01T00:00:00.000Z"}
```

---

## Android App Setup

### Prerequisites
- JDK 17
- Android SDK (API 33+)
- Android NDK (r21+)
- 50GB free disk space

### Build Steps

```bash
cd /workspace/apps/android

# Set API credentials
export TELEGRAM_API_ID=your_api_id
export TELEGRAM_API_HASH=your_api_hash

# Build debug APK
./build.sh debug

# Output: apps/android/out/Chatly-debug.apk
```

### Install on Device

```bash
adb install apps/android/out/Chatly-debug.apk
```

---

## Desktop App Setup

### Linux

```bash
cd /workspace/apps/desktop

# Build using Docker
./build-linux.sh

# Output: apps/desktop/out/Chatly.AppImage
```

### Windows

```powershell
cd \workspace\apps\desktop

# Build executable
pwsh ./build-windows.ps1

# Output: apps/desktop/out/Chatly.exe
```

---

## Free Hosting Options

### Option 1: MongoDB Atlas + Railway.app (Recommended)

**MongoDB Atlas (Database - Free)**
- 512MB storage forever free
- No credit card required

**Railway.app (Backend - $5/month or free tier)**
- Easy deployment
- Auto-scaling
- Built-in monitoring

#### Deployment Steps:

1. **Setup MongoDB Atlas:**
```bash
# 1. Create account at https://mongodb.com/cloud/atlas
# 2. Create free cluster (M0)
# 3. Get connection string
# 4. Whitelist all IPs (0.0.0.0/0) for development
```

2. **Deploy to Railway:**
```bash
# 1. Install Railway CLI
npm i -g @railway/cli

# 2. Login
railway login

# 3. Initialize project
cd backend
railway init

# 4. Add environment variables
railway variables set MONGODB_URI="your_atlas_uri"
railway variables set JWT_SECRET="your_secret"
railway variables set TELEGRAM_API_ID="your_id"
railway variables set TELEGRAM_API_HASH="your_hash"

# 5. Deploy
railway up
```

### Option 2: Oracle Cloud Free Tier (Best Performance)

**Resources:** 4 ARM cores, 24GB RAM, 200GB storage (always free)

```bash
# SSH into instance
ssh ubuntu@your-instance-ip

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install MongoDB
wget -qO - https://www.mongodb.org/static/pgp/server-6.0.asc | sudo apt-key add -
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/6.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-6.0.list
sudo apt-get update
sudo apt-get install -y mongodb-org
sudo systemctl start mongod

# Deploy Chatly
git clone https://github.com/your-org/chatly.git
cd chatly/backend
npm install

# Create systemd service
sudo nano /etc/systemd/system/chatly.service
```

**Systemd Service Configuration:**
```ini
[Unit]
Description=Chatly Backend
After=network.target mongod.service

[Service]
Type=simple
User=ubuntu
WorkingDirectory=/home/ubuntu/chatly/backend
ExecStart=/usr/bin/node src/index.js
Restart=always
Environment=NODE_ENV=production
Environment=MONGODB_URI=mongodb://localhost:27017/chatly
Environment=JWT_SECRET=your_secret

[Install]
WantedBy=multi-user.target
```

```bash
# Enable and start
sudo systemctl daemon-reload
sudo systemctl enable chatly
sudo systemctl start chatly
sudo systemctl status chatly
```

### Option 3: Render.com (Simplest)

**Free Tier:** 750 hours/month, 512MB RAM

```bash
# 1. Push code to GitHub
# 2. Connect repo at https://render.com
# 3. Create Web Service
# 4. Set build command: npm install
# 5. Set start command: npm start
# 6. Add environment variables
```

### Option 4: Fly.io

**Free Tier:** 3 shared-cpu-1x VMs, 256MB RAM each

```bash
# Install Fly CLI
curl -L https://fly.io/install.sh | sh

# Login
fly auth login

# Deploy
cd backend
fly launch --name chatly-backend
fly secrets set MONGODB_URI="your_uri"
fly secrets set JWT_SECRET="your_secret"
fly deploy
```

---

## Production Deployment

### Pre-deployment Checklist

- [ ] Change JWT_SECRET to cryptographically random string
- [ ] Set NODE_ENV=production
- [ ] Configure HTTPS/TLS
- [ ] Set up database backups
- [ ] Configure log rotation
- [ ] Set up monitoring (Sentry, Prometheus)
- [ ] Configure rate limiting
- [ ] Enable CORS for specific domains only
- [ ] Set up CDN for static assets
- [ ] Configure firewall rules

### Docker Deployment

```dockerfile
# backend/Dockerfile
FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .

EXPOSE 8080

USER node

CMD ["node", "src/index.js"]
```

```yaml
# docker-compose.yml
version: '3.8'

services:
  backend:
    build: ./backend
    ports:
      - "8080:8080"
    environment:
      - NODE_ENV=production
      - MONGODB_URI=mongodb://mongo:27017/chatly
    depends_on:
      - mongo
    restart: unless-stopped

  mongo:
    image: mongo:6
    volumes:
      - mongo-data:/data/db
    restart: unless-stopped

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
      - ./ssl:/etc/nginx/ssl
    depends_on:
      - backend
    restart: unless-stopped

volumes:
  mongo-data:
```

### Nginx Configuration

```nginx
server {
    listen 80;
    server_name api.chatly.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name api.chatly.com;

    ssl_certificate /etc/nginx/ssl/fullchain.pem;
    ssl_certificate_key /etc/nginx/ssl/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;

    location / {
        proxy_pass http://backend:8080;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }

    location /uploads {
        alias /app/uploads;
        expires 30d;
        add_header Cache-Control "public, immutable";
    }
}
```

---

## API Documentation

### Authentication Endpoints

#### Send Verification Code
```http
POST /api/v1/auth/send-code
Content-Type: application/json

{
  "phoneNumber": "+1234567890"
}

Response:
{
  "success": true,
  "message": "Verification code sent",
  "phoneCodeHash": "base64encodedhash",
  "timeout": 300
}
```

#### Verify Code & Login
```http
POST /api/v1/auth/verify-code
Content-Type: application/json

{
  "phoneNumber": "+1234567890",
  "code": "12345",
  "phoneCodeHash": "base64encodedhash"
}

Response:
{
  "success": true,
  "user": { ... },
  "token": "jwt_token",
  "refreshToken": "refresh_token"
}
```

### Chat Endpoints

#### Get All Chats
```http
GET /api/v1/chats
Authorization: Bearer <token>

Response:
{
  "success": true,
  "chats": [...]
}
```

#### Create Group
```http
POST /api/v1/chats
Authorization: Bearer <token>
Content-Type: application/json

{
  "type": "group",
  "name": "My Group",
  "description": "Group description",
  "participantIds": ["user1", "user2"]
}
```

### Message Endpoints

#### Send Message
```http
POST /api/v1/messages
Authorization: Bearer <token>
Content-Type: application/json

{
  "chatId": "chat_id",
  "content": {
    "text": "Hello, World!"
  }
}
```

#### Get Messages
```http
GET /api/v1/messages/:chatId?limit=50&before=timestamp
Authorization: Bearer <token>
```

### WebSocket Events

```javascript
// Connect
const socket = io('https://api.chatly.com', {
  auth: { token: 'your_jwt_token' }
});

// Join user room
socket.emit('user:join', userId);

// Join chat
socket.emit('chat:join', { userId, chatId });

// Send message
socket.emit('message:send', { chatId, message });

// Listen for new messages
socket.on('message:new', (message) => {
  console.log('New message:', message);
});

// Typing indicators
socket.emit('typing:start', { chatId, userId });
socket.on('typing:start', (data) => {
  // Show typing indicator
});
```

---

## Troubleshooting

### Common Issues

#### 1. "Cannot connect to MongoDB"
```bash
# Check if MongoDB is running
sudo systemctl status mongod

# Check connection string
echo $MONGODB_URI

# Test connection
mongosh $MONGODB_URI
```

#### 2. "Invalid API credentials"
- Ensure TELEGRAM_API_ID and TELEGRAM_API_HASH are correct
- Check for extra spaces in .env file
- Restart server after changing .env

#### 3. "Token expired" errors
- Check JWT_EXPIRES_IN setting
- Implement token refresh logic in client
- Ensure server time is synchronized

#### 4. Build fails on Android
```bash
# Increase Gradle memory
export GRADLE_OPTS="-Xmx4g -XX:MaxMetaspaceSize=1g"

# Clean build
./gradlew clean
./build.sh debug
```

#### 5. WebSocket disconnects frequently
- Check firewall settings (port 8080)
- Increase WS_HEARTBEAT_INTERVAL
- Check load balancer timeout settings

### Logs Location

```bash
# Application logs
tail -f backend/logs/combined.log
tail -f backend/logs/error.log

# Systemd service logs
journalctl -u chatly -f

# Docker logs
docker logs chatly-backend -f
```

---

## Support & Resources

- **Documentation:** `/docs` folder
- **API Reference:** http://localhost:8080/api-docs (when enabled)
- **GitHub Issues:** Report bugs and feature requests
- **Community:** Join our Telegram channel for updates

---

## License

Chatly is licensed under GPL-3.0-or-later. See [LICENSE](LICENSE) for details.

---

## Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

**Built with ❤️ by the Chatly Team**
