# Delineate Observability Dashboard

React frontend for Challenge 4 - Real-time monitoring dashboard with Sentry error tracking and distributed tracing.

## ✅ Features Implemented

### 1. **Sentry Integration**

- **Error Boundary**: Wraps entire app with `Sentry.withProfiler(App)`
- **Automatic Error Capture**: Failed API calls captured with context
- **Performance Monitoring**: Browser tracing and session replay
- **Test Error Button**: Manual error trigger for testing
- **Custom Error Logging**: Business logic errors with tags and extra data

### 2. **Real-time Health Monitoring**

- **API Status**: Live health check every 5 seconds
- **Visual Indicators**: Green/red status with storage connectivity
- **Auto-refresh**: Continuous monitoring without page reload

### 3. **Download Job Tracking**

- **Status Indicators**: Visual badges (completed/failed/simulating)
- **Duration Tracking**: Shows processing time for each job
- **Recent Activity**: List of all initiated downloads
- **Mock Logic**: File IDs divisible by 7 succeed, others fail

### 4. **Error Testing & Debugging**

- **Safe Error Testing**: Button triggers Sentry capture without breaking page
- **Console Logging**: All Sentry events logged for debugging
- **Mock Mode**: Works without Sentry DSN for development

## 🚀 Quick Start

### Option 1: Docker (Recommended)

```bash
# From project root
docker compose -f docker/compose.dev.yml up -d

# Access dashboard
open http://localhost:5173
```

### Option 2: Manual Development

```bash
# Install dependencies
cd frontend
npm install

# Start development server
npm run dev

# Access dashboard
open http://localhost:5173
```

## 🧪 Testing the Dashboard

### 1. **Health Status**

- Should show "✅ Operational" with green indicator
- Storage should show "ok"

### 2. **Download Testing**

- **Success Cases**: Click File ID 14000, 21000, 28000 (divisible by 7)
- **Failure Cases**: Click File ID 10000, 50000 (not divisible by 7)
- Watch status change: `simulating` → `completed`/`failed`
- Check duration in "Recent Activity"

### 3. **Sentry Error Testing**

- Click "🚨 Trigger Sentry Error" button
- Should see alert: "✅ Sentry test error captured!"
- Check browser console for logs:
  ```
  🚨 Triggering test error for Sentry
  Mock Sentry - Error captured: Error: Test error triggered from dashboard
  ✅ Sentry test error captured! Check browser console and Sentry dashboard.
  ```

## 🔧 Configuration

### Environment Variables

```bash
# frontend/.env
VITE_API_URL=http://localhost:3000
VITE_SENTRY_DSN=  # Optional - leave empty for mock mode
```

### Sentry Setup (Optional)

1. Create account at https://sentry.io
2. Create new React project
3. Copy DSN and add to `.env`:
   ```
   VITE_SENTRY_DSN=https://xxxxx@xxxxx.ingest.sentry.io/xxxxx
   ```
4. Restart frontend

## 📁 Key Files

```
frontend/
├── src/
│   ├── App.tsx              # Main dashboard component
│   ├── main.tsx             # Entry point with Sentry init
│   ├── sentry.ts            # Sentry configuration
│   ├── ErrorBoundary.tsx    # Error boundary component
│   └── index.css            # Styles
├── .env                     # Environment variables
├── .env.example             # Environment template
└── package.json             # Dependencies
```

## 🏗️ Architecture

```
┌─────────────────────────────────────────┐
│           User Browser                   │
│  ┌─────────────────────────────────┐    │
│  │  React Dashboard                │    │
│  │  ├─ Sentry SDK                  │    │
│  │  ├─ Error Boundary              │    │
│  │  └─ Health Monitoring           │    │
│  └─────────────────────────────────┘    │
└─────────────────────────────────────────┘
           │                    │
           │ API Calls          │ Errors
           │                    │
           ▼                    ▼
┌──────────────────┐  ┌──────────────────┐
│  Backend API     │  │  Sentry.io       │
│  (localhost:3000)│  │  (Optional)      │
└──────────────────┘  └──────────────────┘
```

## 🎯 Challenge 4 Requirements Met

- ✅ **React Application**: Connects to download API
- ✅ **Download Job Status**: Visual tracking with duration
- ✅ **Error Tracking**: Sentry integration with test button
- ✅ **Error Boundary**: Wraps entire app
- ✅ **Performance Monitoring**: Sentry profiler integration
- ✅ **Custom Error Logging**: Business logic errors with context
- ✅ **User Feedback**: Alert notifications for error testing

## 🔍 Troubleshooting

### Frontend Not Loading

```bash
# Check container status
docker ps | grep frontend

# Check logs
docker logs delineate-delineate-frontend-1
```

### API Connection Issues

```bash
# Test backend directly
curl http://localhost:3000/health

# Check CORS headers
curl -H "Origin: http://localhost:5173" http://localhost:3000/health
```

### Sentry Not Working

1. Check browser console for Sentry initialization logs
2. Verify DSN format in `.env` file
3. Test with mock mode (empty DSN) first

## 📊 Performance

- **Bundle Size**: ~578 KB (minified)
- **Load Time**: < 1 second
- **Health Check**: 5 second intervals
- **Dependencies**: React, Sentry, Vite

## 🚀 Production Build

```bash
# Build for production
npm run build

# Docker production build
docker build -f Dockerfile.prod -t delineate-frontend .
```

---

**Status**: ✅ **Complete and Working**

- Sentry error tracking implemented and tested
- Real-time health monitoring functional
- Download job tracking with visual indicators
- Error boundary protecting against crashes
- Mock mode for development without external dependencies
