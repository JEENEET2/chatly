# Chatly - Complete Developer Guide

## 📱 Overview

Chatly is a fully-featured, production-ready messaging application built as a fork of Telegram's open-source clients. This guide covers everything from architecture to deployment.

---

## 🏗️ Architecture

### Client Applications

| Platform | Technology | Status |
|----------|------------|--------|
| Android | Kotlin/Java (Telegram-Android base) | ✅ Ready |
| Desktop Linux | C++/Qt (TDesktop base) | ✅ Ready |
| Desktop Windows | C++/Qt (TDesktop base) | ✅ Ready |
| Web | Next.js + React | 🔄 Planned |

### Backend Infrastructure

Chatly uses Telegram's MTProto protocol by default, but supports custom backends:

```
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│   Chatly App    │────▶│  TDLib Gateway   │────▶│  Custom Backend │
│   (Android/     │     │  (Optional)      │     │  (Matrix/       │
│    Desktop)     │     │                  │     │   XMPP/etc.)    │
└─────────────────┘     └──────────────────┘     └─────────────────┘
         │
         │ Direct MTProto
         ▼
┌─────────────────┐
│ Telegram Servers│
│ (Default Mode)  │
└─────────────────┘
```

---

## 🚀 Features

### Core Messaging (All Platforms)

- ✅ End-to-end encrypted Secret Chats
- ✅ Cloud-based chats with sync across devices
- ✅ Group chats (up to 200,000 members)
- ✅ Channels for broadcasting
- ✅ File sharing (up to 2GB per file)
- ✅ Voice and video calls
- ✅ Message reactions and replies
- ✅ Threads and topics in groups
- ✅ Scheduled messages
- ✅ Message editing and deletion

### Chatly Premium Features

- 🎨 Exclusive themes and color schemes
- ⚡ Faster download speeds
- 📢 Voice-to-text conversion
- 🔒 Advanced privacy settings
- 📊 Chat analytics
- 🎯 Priority support

### Security Features

- MTProto 2.0 encryption
- Two-factor authentication
- Passcode and biometric lock
- Self-destructing messages
- Screenshot prevention (Secret Chats)
- No phone number exposure option

---

## 🛠️ Building Locally

### Prerequisites

#### For Android

```bash
# Required
- JDK 17
- Android SDK (API 33)
- Android NDK (r21)
- Docker (for consistent builds)
- 50GB free disk space

# Get API credentials
Visit: https://my.telegram.org/apps
1. Log in with your phone number
2. Create a new application
3. Copy API_ID and API_HASH
```

#### For Desktop Linux

```bash
# Required
- Docker
- Git
- CMake 3.22+
- Ninja
- GCC 10+ or Clang 14+
- Qt 6.4+
- 100GB free disk space (first build)
```

#### For Desktop Windows

```bash
# Required
- Visual Studio 2022 (C++ workload)
- Python 3.10+
- Qt 6.4+
- CMake 3.22+
- 100GB free disk space
```

### Build Commands

#### Android (Debug APK)

```bash
export TELEGRAM_API_ID=your_api_id
export TELEGRAM_API_HASH=your_api_hash

cd /workspace
./apps/android/build.sh debug

# Output: apps/android/out/Chatly-debug.apk
```

#### Android (Release APK - Signed)

```bash
# First, generate a keystore
keytool -genkey -v -keystore chatly-release.keystore \
  -alias chatly -keyalg RSA -keysize 2048 -validity 10000

# Add to GitHub secrets:
# ANDROID_KEYSTORE_BASE64 (base64 encoded keystore)
# ANDROID_KEYSTORE_PASSWORD
# ANDROID_KEY_ALIAS
# ANDROID_KEY_PASSWORD

# Then run release build
./apps/android/build.sh release
```

#### Desktop Linux

```bash
export TELEGRAM_API_ID=your_api_id
export TELEGRAM_API_HASH=your_api_hash

./apps/desktop/build-linux.sh

# Output: apps/desktop/out/Chatly
```

#### Desktop Windows

```powershell
$env:TELEGRAM_API_ID="your_api_id"
$env:TELEGRAM_API_HASH="your_api_hash"

pwsh ./apps/desktop/build-windows.ps1

# Output: apps/desktop/out/Chatly.exe
```

---

## ☁️ Free Hosting Options for Backend

### Option 1: Oracle Cloud Free Tier (Recommended)

**Resources:** Up to 4 ARM cores, 24GB RAM, 200GB storage (always free)

```bash
# Deploy TDLib + Custom Server
ssh oracle@your-instance

# Install dependencies
sudo apt update && sudo apt install -y \
  git cmake g++ libssl-dev zlib1g-dev \
  libreadline-dev libffi-dev python3

# Clone and build TDLib
git clone --branch v1.8.0 https://github.com/tdlib/td.git
cd td
rm -rf build
mkdir build
cd build
cmake -DCMAKE_BUILD_TYPE=Release ..
cmake --build . --target install
```

### Option 2: Google Cloud Run (Serverless)

**Resources:** 2GB RAM, 1 CPU, pay-per-use (free tier: 2M requests/month)

```yaml
# cloudbuild.yaml
steps:
  - name: 'gcr.io/cloud-builders/docker'
    args: ['build', '-t', 'gcr.io/$PROJECT_ID/chatly-backend', '.']
  
  - name: 'gcr.io/cloud-builders/gcloud'
    args: ['run', 'deploy', 'chatly-backend',
           '--image', 'gcr.io/$PROJECT_ID/chatly-backend',
           '--region', 'us-central1',
           '--allow-unauthenticated',
           '--memory', '2Gi',
           '--cpu', '1']
```

### Option 3: Railway.app

**Resources:** 512MB RAM free, $5/month for 2GB

```bash
# One-click deploy
# Visit: https://railway.app/new
# Connect GitHub repo
# Add environment variables:
# - TELEGRAM_API_ID
# - TELEGRAM_API_HASH
# - DATABASE_URL
```

### Option 4: Fly.io

**Resources:** 256MB RAM free (3 VMs), shared CPU

```toml
# fly.toml
app = "chatly-backend"
primary_region = "sjc"

[build]
  dockerfile = "Dockerfile.backend"

[env]
  PORT = "8080"
  TELEGRAM_API_ID = "${TELEGRAM_API_ID}"
  TELEGRAM_API_HASH = "${TELEGRAM_API_HASH}"

[[vm]]
  cpu_kind = "shared"
  cpus = 1
  memory_mb = 256
```

---

## 📦 Deployment Guide

### GitHub Actions CI/CD

The repository includes automated builds:

1. **Android APK**: Triggered on push to any branch
2. **Desktop Linux AppImage**: Triggered on push
3. **Desktop Windows EXE**: Triggered on push

#### Setting Up Secrets

Go to: `GitHub Repo → Settings → Secrets and variables → Actions`

Add these secrets:

```
TELEGRAM_API_ID        = 12345678
TELEGRAM_API_HASH      = abcdef1234567890abcdef1234567890
ANDROID_KEYSTORE_BASE64 = (optional, for signed releases)
ANDROID_KEYSTORE_PASSWORD = (optional)
ANDROID_KEY_ALIAS      = (optional)
ANDROID_KEY_PASSWORD   = (optional)
```

### Downloading Build Artifacts

1. Go to GitHub Actions tab
2. Click on the latest successful workflow run
3. Scroll to "Artifacts" section
4. Download your platform's build

---

## 🔧 Custom Backend Setup

If you want to run your own messaging backend (not using Telegram servers):

### Using Matrix Protocol

```bash
# Install Synapse (Matrix homeserver)
git clone https://github.com/element-hq/synapse.git
cd synapse
python3 -m venv venv
source venv/bin/activate
pip install matrix-synapse

# Configure
python3 -m synapse.app.homeserver \
  --server-name chatly.local \
  --config-path homeserver.yaml

# Start server
synctl start
```

### Bridge to Telegram

```yaml
# mautrix-telegram config
homeserver:
  address: http://localhost:8008
  domain: chatly.local

telegram:
  api_id: YOUR_API_ID
  api_hash: YOUR_API_HASH
  bot_token: YOUR_BOT_TOKEN
```

---

## 📊 Monitoring & Analytics

### Self-hosted Sentry

```bash
# Docker Compose for Sentry
docker run -d \
  -p 9000:9000 \
  -e SENTRY_SECRET_KEY=$(openssl rand -base64 32) \
  sentry:latest
```

### Prometheus + Grafana

```yaml
# prometheus.yml
global:
  scrape_interval: 15s

scrape_configs:
  - job_name: 'chatly-backend'
    static_configs:
      - targets: ['localhost:8080']
```

---

## 🔐 Security Best Practices

1. **Never commit API credentials** - Use environment variables or secret managers
2. **Enable 2FA** on all admin accounts
3. **Regular security updates** - Sync with upstream weekly
4. **Audit logs** - Enable logging for all admin actions
5. **Rate limiting** - Protect against abuse
6. **HTTPS everywhere** - Use Let's Encrypt for TLS

---

## 📝 Troubleshooting

### Build Fails with "API_ID invalid"

**Solution:** Ensure TELEGRAM_API_ID and TELEGRAM_API_HASH are set correctly:

```bash
echo $TELEGRAM_API_ID
echo $TELEGRAM_API_HASH
# Should show actual values, not empty
```

### Android Build Runs Out of Memory

**Solution:** Increase Docker memory limit:

```bash
# Edit Docker Desktop settings or use:
export GRADLE_OPTS="-Xmx4g -XX:MaxMetaspaceSize=1g"
```

### Desktop Build Missing Dependencies

**Solution:** Install required packages:

```bash
# Ubuntu/Debian
sudo apt install \
  qtbase5-dev qtdeclarative5-dev \
  libqt5x11extras5-dev libxcb1-dev \
  libxcb-keysyms1-dev libxcb-image0-dev
```

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📞 Support

- **Documentation**: `/docs` folder
- **Issues**: GitHub Issues tab
- **Discussions**: GitHub Discussions tab
- **Security**: See `docs/SECURITY-REVIEW.md`

---

## 📄 License

This project is licensed under the GNU General Public License v3.0 or later.

See [LICENSE](LICENSE) and [NOTICE.md](NOTICE.md) for details.

---

## 🙏 Attribution

Chatly is a derivative work of:
- [Telegram-Android](https://github.com/DrKLO/Telegram) (GPL-2.0+)
- [TDesktop](https://github.com/telegramdesktop/tdesktop) (GPL-3.0)

The names "Telegram" and the Telegram paper-plane logo are trademarks of Telegram FZ-LLC.
Chatly does not use those names or marks in distributed builds.
