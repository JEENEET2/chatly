# Backend Service for Chatly

This directory contains the backend service code for Chatly messaging app.

## Architecture

The backend supports multiple modes:

1. **TDLib Gateway Mode** - Acts as a proxy between clients and Telegram servers
2. **Standalone Mode** - Full messaging server using Matrix protocol
3. **Hybrid Mode** - Combines both approaches

## Quick Start

### Using Docker (Recommended)

```bash
docker-compose up -d
```

### Local Development

```bash
cd backend
npm install
npm run dev
```

## Environment Variables

```env
# Required
NODE_ENV=production
PORT=8080
TELEGRAM_API_ID=your_api_id
TELEGRAM_API_HASH=your_api_hash

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/chatly

# Redis (for caching and sessions)
REDIS_URL=redis://localhost:6379

# JWT Secret
JWT_SECRET=your_super_secret_jwt_key

# File Storage (S3-compatible)
S3_ENDPOINT=https://storage.example.com
S3_BUCKET=chatly-files
S3_ACCESS_KEY=your_access_key
S3_SECRET_KEY=your_secret_key

# Push Notifications
FCM_SERVER_KEY=your_fcm_key
APNS_KEY_ID=your_apns_key_id
```

## API Endpoints

### Authentication

```
POST /api/v1/auth/send-code
POST /api/v1/auth/verify-code
POST /api/v1/auth/logout
```

### Users

```
GET  /api/v1/users/me
PUT  /api/v1/users/me
GET  /api/v1/users/:id
```

### Chats

```
GET  /api/v1/chats
POST /api/v1/chats
GET  /api/v1/chats/:id
DELETE /api/v1/chats/:id
POST /api/v1/chats/:id/messages
GET  /api/v1/chats/:id/messages
```

### Files

```
POST /api/v1/files/upload
GET  /api/v1/files/:id
DELETE /api/v1/files/:id
```

## Database Schema

```sql
-- Users table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    phone_number VARCHAR(20) UNIQUE NOT NULL,
    username VARCHAR(32) UNIQUE,
    first_name VARCHAR(64),
    last_name VARCHAR(64),
    avatar_url TEXT,
    status VARCHAR(32) DEFAULT 'offline',
    last_seen TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Chats table
CREATE TABLE chats (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    type VARCHAR(20) NOT NULL CHECK (type IN ('private', 'group', 'channel')),
    title VARCHAR(255),
    avatar_url TEXT,
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Messages table
CREATE TABLE messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    chat_id UUID NOT NULL REFERENCES chats(id) ON DELETE CASCADE,
    sender_id UUID NOT NULL REFERENCES users(id),
    content TEXT,
    message_type VARCHAR(20) DEFAULT 'text',
    reply_to UUID REFERENCES messages(id),
    edited_at TIMESTAMP WITH TIME ZONE,
    deleted_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_messages_chat_id ON messages(chat_id);
CREATE INDEX idx_messages_created_at ON messages(created_at DESC);
CREATE INDEX idx_users_phone ON users(phone_number);
```

## Deployment

### Docker Compose (Production)

```yaml
version: '3.8'

services:
  api:
    build: .
    ports:
      - "8080:8080"
    environment:
      - NODE_ENV=production
      - DATABASE_URL=postgresql://postgres:password@db:5432/chatly
      - REDIS_URL=redis://redis:6379
    depends_on:
      - db
      - redis

  db:
    image: postgres:15-alpine
    volumes:
      - postgres_data:/var/lib/postgresql/data
    environment:
      - POSTGRES_DB=chatly
      - POSTGRES_USER=postgres
      - POSTGRES_PASSWORD=password

  redis:
    image: redis:7-alpine
    volumes:
      - redis_data:/data

volumes:
  postgres_data:
  redis_data:
```

### Kubernetes

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: chatly-api
spec:
  replicas: 3
  selector:
    matchLabels:
      app: chatly-api
  template:
    metadata:
      labels:
        app: chatly-api
    spec:
      containers:
      - name: api
        image: chatly/backend:latest
        ports:
        - containerPort: 8080
        env:
        - name: DATABASE_URL
          valueFrom:
            secretKeyRef:
              name: chatly-secrets
              key: database-url
---
apiVersion: v1
kind: Service
metadata:
  name: chatly-api
spec:
  selector:
    app: chatly-api
  ports:
  - port: 80
    targetPort: 8080
  type: LoadBalancer
```

## Monitoring

### Health Check

```bash
curl http://localhost:8080/health
```

Response:
```json
{
  "status": "healthy",
  "uptime": 86400,
  "database": "connected",
  "redis": "connected"
}
```

### Metrics (Prometheus)

Available at `/metrics`:
- Request rate
- Error rate
- Response time percentiles
- Database connection pool stats
- Cache hit ratio

## Security

### Rate Limiting

```javascript
// Configured in middleware
{
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
}
```

### CORS

```javascript
{
  origin: ['https://chatly.app', 'https://app.chatly.app'],
  credentials: true
}
```

## Testing

```bash
# Unit tests
npm test

# Integration tests
npm run test:integration

# E2E tests
npm run test:e2e
```

## License

GPL-3.0 or later
