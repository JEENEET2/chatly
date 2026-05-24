# GitHub Actions - Chatly CI/CD Pipeline

## Overview

This document explains the automated build and deployment pipeline for Chatly.

## Workflows

### 1. Build Android APK (`.github/workflows/android-build.yml`)

**Triggers**: 
- Push to `main` branch
- Pull requests to `main`
- Manual trigger via GitHub UI

**Outputs**:
- Debug APK: `Chatly-debug.apk`
- Release APK: `Chatly-release.apk` (when tagged)

**Steps**:
1. Checkout code
2. Setup Java JDK 17
3. Cache Gradle dependencies
4. Set API credentials from secrets
5. Build debug APK
6. Upload artifact to GitHub Actions

**Required Secrets**:
```
TELEGRAM_API_ID=your_api_id
TELEGRAM_API_HASH=your_api_hash
KEYSTORE_PASSWORD=your_keystore_pass (for release builds)
```

### 2. Build Desktop Apps (`.github/workflows/desktop-build.yml`)

**Triggers**: Same as Android

**Outputs**:
- Windows: `Chatly.exe`
- Linux: `Chatly.AppImage`
- macOS: `Chatly.dmg`

**Steps**:
1. Checkout code
2. Setup Node.js 18
3. Install dependencies
4. Build for each platform
5. Upload artifacts

### 3. Backend Tests (`.github/workflows/backend-test.yml`)

**Triggers**:
- Push to `main` or `develop`
- Pull requests

**Steps**:
1. Checkout code
2. Setup Node.js 18
3. Start MongoDB (test container)
4. Install dependencies
5. Run linting
6. Run unit tests
7. Run integration tests
8. Generate coverage report

### 4. Auto Deploy to Railway (`.github/workflows/deploy.yml`)

**Triggers**:
- Push to `main` branch only

**Steps**:
1. Checkout code
2. Login to Railway CLI
3. Deploy backend to Railway
4. Set environment variables
5. Health check verification

**Required Secrets**:
```
RAILWAY_API_TOKEN=your_railway_token
RAILWAY_PROJECT_ID=your_project_id
```

## Artifacts

All build artifacts are stored for 30 days and can be downloaded from:
- GitHub Actions tab → Select workflow run → Artifacts section

## Manual Deployment

### Trigger Build Manually
1. Go to Actions tab
2. Select workflow (e.g., "Android Build")
3. Click "Run workflow"
4. Select branch
5. Click "Run workflow"

### Download Artifacts
1. Click on successful workflow run
2. Scroll to "Artifacts" section
3. Click on artifact name
4. Download ZIP file
5. Extract to get APK/EXE files

## Environment Variables

### For Android Builds
```yaml
env:
  TELEGRAM_API_ID: ${{ secrets.TELEGRAM_API_ID }}
  TELEGRAM_API_HASH: ${{ secrets.TELEGRAM_API_HASH }}
  BACKEND_URL: ${{ secrets.BACKEND_URL }}
```

### For Backend Deploy
```yaml
env:
  MONGODB_URI: ${{ secrets.MONGODB_URI }}
  JWT_SECRET: ${{ secrets.JWT_SECRET }}
  PORT: 8080
  NODE_ENV: production
```

## Status Badges

Add these to your README.md:

```markdown
[![Android Build](https://github.com/JEENEET2/chatly/actions/workflows/android-build.yml/badge.svg)](https://github.com/JEENEET2/chatly/actions/workflows/android-build.yml)
[![Desktop Build](https://github.com/JEENEET2/chatly/actions/workflows/desktop-build.yml/badge.svg)](https://github.com/JEENEET2/chatly/actions/workflows/desktop-build.yml)
[![Backend Tests](https://github.com/JEENEET2/chatly/actions/workflows/backend-test.yml/badge.svg)](https://github.com/JEENEET2/chatly/actions/workflows/backend-test.yml)
```

## Troubleshooting

### Build Fails with "API Credentials Missing"
- Ensure secrets are set in Repository Settings → Secrets → Actions
- Secret names must match exactly (case-sensitive)

### APK Too Large
- Enable ProGuard/R8 in release builds
- Use APK splits for different architectures
- Compress resources

### Timeout Errors
- Increase timeout-minutes in workflow
- Optimize build scripts
- Use caching effectively

## Best Practices

1. **Always test locally** before pushing to main
2. **Use feature branches** for development
3. **Review workflow logs** for errors
4. **Keep secrets secure** - never commit .env files
5. **Tag releases** with semantic versioning (v1.0.0, v1.0.1, etc.)
6. **Monitor build times** and optimize slow steps

## Scheduled Builds

You can add scheduled builds using cron syntax:

```yaml
on:
  schedule:
    - cron: '0 2 * * *'  # Daily at 2 AM UTC
```

## Notifications

Configure notifications for build failures:

```yaml
jobs:
  notify:
    runs-on: ubuntu-latest
    steps:
      - uses: 8398a7/action-slack@v3
        with:
          status: ${{ job.status }}
          webhook_url: ${{ secrets.SLACK_WEBHOOK }}
```

---

**Last Updated**: May 2024  
**Version**: 2.0.0-Premium
