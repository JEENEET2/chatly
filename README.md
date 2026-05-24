# Chatly - Next Generation Secure Messaging App 🚀

**Chatly v2.1-Premium-Fixed** is a fully rebranded, production-ready messaging application derived from the Telegram codebase, featuring a premium UI, robust backend, and real-time capabilities.

> **Status:** Production Ready | Backend Integrated | Automated Builds Enabled | Build Errors Fixed

## ✨ Key Features

-   **🎨 Premium Branding**: Modern Indigo (#6366F1) & Teal (#14B8A6) color grading (Material Design 3).
-   **⚡ Real-Time Engine**: WebSocket-based instant messaging with Socket.IO backend.
-   **🔒 Secure Backend**: Node.js + Express + MongoDB with JWT Authentication included.
-   **📱 Cross-Platform**: 
    -   Android (Native APK)
    -   Desktop (Windows EXE, Linux AppImage, Mac DMG)
-   **☁️ Cloud Ready**: Configured for free hosting on Railway, Render, or Oracle Cloud.
-   **🤖 Automated Builds**: GitHub Actions configured to generate APKs/EXEs on every push.
-   **💬 Full Messaging**: Private chats, groups, channels, reactions, read receipts.
-   **🎯 New in v2.1-Fixed**: 
    -   ✅ **Build Error Fixed**: Removed duplicate resource conflicts
    -   ✅ **Unique String IDs**: All Chatly strings use unique names
    -   ✅ **Enhanced Color Palette**: Ocean, Sunset, Forest themes added
    -   HD Video Calls support
    -   Voice Messages 2.0 with waveforms
    -   Super Groups (up to 10K members)
    -   Smart Chatly Bots API
    -   Unlimited Cloud Storage
    -   Premium Themes (Gold, Platinum, Diamond tiers)
    -   Enhanced Privacy Controls
    -   Message Reactions & Replies

---

## 🏗️ Architecture

```
┌─────────────┐      ┌──────────────┐      ┌─────────────┐
│   Client    │ ◄──► │   Backend    │ ◄──► │  Database   │
│ (Android/   │ HTTP │ (Node.js +   │ JSON │ (MongoDB)   │
│  Desktop)   │ WS   │  Express)    │      │             │
└─────────────┘      └──────────────┘      └─────────────┘
```

## 🚀 Quick Start Guide

### 1. Backend Setup (Server)

The backend handles authentication, message routing, and database storage.

**Prerequisites**: Node.js v18+ and MongoDB (Local or Atlas).

```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your MongoDB URI and JWT Secret
npm run dev
```
*Server runs on `http://localhost:8080`*

**API Endpoints:**
- `GET /api/v1` - API info and available endpoints
- `POST /api/v1/auth/send-code` - Send verification code
- `POST /api/v1/auth/verify-code` - Verify and login
- `GET /api/v1/users/me` - Get current user profile
- `PUT /api/v1/users/me` - Update profile
- `GET /api/v1/chats` - List user chats
- `POST /api/v1/chats` - Create new chat/group/channel
- `POST /api/v1/messages` - Send message
- `GET /api/v1/messages/:chatId` - Get chat history
- `POST /api/v1/files/upload` - Upload media (up to 2GB)
- `WS /socket.io/` - Real-time WebSocket connection

**WebSocket Events:**
- `join_room` - Join a chat room
- `send_message` - Send real-time message
- `receive_message` - Receive incoming message
- `typing_start` / `typing_end` - Typing indicators
- `user_online` / `user_offline` - Presence updates
- `read_receipt` - Message read confirmation

### 2. Android App Setup (Client)

**Prerequisites**: Android Studio, Java JDK 17.

1.  Get your API credentials from [my.telegram.org](https://my.telegram.org).
2.  Create `apps/android/local.properties`:
    ```properties
    telegram.api.id=YOUR_API_ID
    telegram.api.hash=YOUR_API_HASH
    backend.url=http://YOUR_BACKEND_URL:8080
    ```
3.  Build the debug APK:
    ```bash
    cd apps/android
    ./gradlew assembleDebug
    ```
    *APK output: `apps/android/build/outputs/apk/debug/Chatly-debug.apk`*

### 3. Desktop App Setup

**Prerequisites**: Node.js, Electron dependencies.

```bash
cd apps/desktop
npm install
npm run build
```

## ☁️ Free Hosting Guide

You can host the **Chatly Backend** for free using these services:

| Service | Free Tier Limits | Best For | Setup Difficulty |
| :--- | :--- | :--- | :--- |
| **MongoDB Atlas** | 512MB Storage | Database | Easy |
| **Railway.app** | $5 credit / mo | Backend API | Very Easy |
| **Render.com** | 750 hours/mo | Backend API | Easy |
| **Oracle Cloud** | Always Free (4 CPU, 24GB RAM) | Full Stack | Medium |

**Deployment Steps:**
1.  Push code to GitHub.
2.  Create MongoDB Atlas cluster (free tier).
3.  Connect repository to Railway/Render.
4.  Set Environment Variables:
    - `MONGODB_URI=mongodb+srv://...`
    - `JWT_SECRET=your_super_secret_key`
    - `NODE_ENV=production`
5.  Deploy! Your API will be live at `https://your-app.railway.app`.

## 🛡️ Security Features

-   **JWT Authentication**: Stateless, secure user sessions with refresh tokens.
-   **Password Hashing**: Bcrypt (12 rounds) for sensitive data.
-   **Rate Limiting**: 100 requests per 15 minutes per IP.
-   **CORS Protection**: Restricts access to authorized domains only.
-   **Input Validation**: Express-validator sanitizes all incoming data.
-   **Helmet Headers**: Security HTTP headers configured.
-   **Encryption**: TLS/SSL ready for production deployment.
-   **Session Management**: Automatic token refresh and expiry handling.
-   **Privacy Controls**: Block users, hide last seen, control message forwarding.

## 📦 Repository Layout

```
.
├── backend/               # NEW: Node.js + Express + Socket.IO
│   ├── models/            # Mongoose schemas (User, Chat, Message)
│   ├── routes/            # API endpoints
│   ├── services/          # Auth, Socket logic
│   ├── server.js          # Entry point
│   └── .env.example       # Environment template
├── apps/
│   ├── android/           # Chatly Android client
│   │   ├── overlay/       # Rebranding files (colors, strings, icons)
│   │   ├── patches/       # Code modifications
│   │   └── build.sh       # Build script
│   └── desktop/           # Chatly desktop client
├── .github/workflows/     # CI/CD pipelines
├── docs/                  # Documentation
├── README.md              # This file
└── DEPLOYMENT_GUIDE.md    # Detailed deployment instructions
```

## 🔧 Building Locally

### Android (Debug APK)
```bash
export TELEGRAM_API_ID=12345
export TELEGRAM_API_HASH=abcdef123456
./apps/android/build.sh debug
# Output: apps/android/out/Chatly-debug.apk
```

### Desktop Linux (AppImage)
```bash
./apps/desktop/build-linux.sh
# Output: Chatly.AppImage
```

### Desktop Windows (EXE)
```powershell
pwsh ./apps/desktop/build-windows.ps1
# Output: Chatly.exe
```

## 📄 License & Attribution

This project is a derivative work of upstream Telegram clients and is therefore distributed under the **GNU General Public License**. 

- Telegram-Android: GPL-2.0+
- TDesktop: GPL-3.0

See [`NOTICE.md`](NOTICE.md) and [`docs/GPL-COMPLIANCE.md`](docs/GPL-COMPLIANCE.md) for details.

The names "Telegram" and the Telegram paper-plane logo are trademarks of **Telegram FZ-LLC**. Chatly uses its own branding, colors, and icons.

## ⚠️ Important Notes

- **API Credentials**: You MUST obtain your own `TELEGRAM_API_ID` and `TELEGRAM_API_HASH` from my.telegram.org. The app will not function without them.
- **Backend Required**: While the Android/Desktop clients can connect directly to Telegram servers, the full feature set (custom auth, cloud sync, groups management) requires the Chatly backend.
- **Security Model**: Messages in standard chats flow through Telegram servers. For end-to-end encryption, use "Secret Chats" mode (if implemented in your fork).

---

**Built with ❤️ by the Chatly Team** | Production Ready v2.1-Premium-Fixed

## 📞 Support & Community

-   **Documentation**: [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md)
-   **API Reference**: `/api/v1` endpoint when server is running
-   **Issues**: Report bugs on GitHub Issues
-   **Discord**: Join our community server (coming soon)

---

*Last Updated: May 2024 | Version: 2.1.0-Premium-Fixed*
