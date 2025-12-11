# Backend Integration Guide

This document explains how the frontend and backend are integrated.

## Architecture

- **Frontend**: Next.js application running on port 3000
- **Backend**: Express.js API server running on port 7860
- **Communication**: Frontend Next.js API route (`/api/analyze`) proxies requests to the backend Express server

## Setup

### 1. Install Dependencies

```bash
# Install frontend dependencies
npm install

# Install backend dependencies
cd backend
npm install
cd ..
```

Or use the convenience script:
```bash
npm run install:all
```

### 2. Configure Backend Environment

Create `backend/.env` file:

```env
PORT=7860
OPENAI_API_KEY=your_openai_api_key_here
OPENAI_MODEL=gpt-4o-mini
```

You can copy `backend/.env.example` as a template.

### 3. Start the Servers

**Option A: Start both servers together (Recommended)**
```bash
npm run dev:all
```

Or on Windows, double-click `start-all.bat`

**Option B: Start servers separately**

Terminal 1 (Frontend):
```bash
npm run dev
```

Terminal 2 (Backend):
```bash
npm run dev:backend
```

## How It Works

1. User uploads a file on the frontend (`app/page.jsx`)
2. File is sent to Next.js API route (`app/api/analyze/route.js`)
3. Next.js API route forwards the file to backend Express server (`backend/server.js`)
4. Backend processes the file:
   - Parses XLSX or DOCX files
   - Extracts financial data using GPT
   - Computes features and credit score
5. Backend returns analysis results
6. Next.js API route transforms the response to match frontend format
7. Frontend displays results (`app/results/page.jsx`)

## API Endpoints

### Frontend (Next.js)
- `POST /api/analyze` - Proxies to backend, transforms response

### Backend (Express)
- `GET /` - Health check
- `POST /analyze` - Analyze financial documents

## Response Format

Backend returns:
```json
{
  "metadata": {...},
  "transactions": [...],
  "features": {...},
  "score": 720,
  "insights": {...},
  "summary": "..."
}
```

Frontend expects:
```json
{
  "features": {
    "totalIncome": 45000,
    "totalSpent": 32000,
    "savingsRatio": 0.29,
    "bnplDepth": 0.18,
    "monthlyIncome": [...],
    "monthlySpending": [...],
    "bnplBreakdown": {...},
    ...
  },
  "score": 720,
  "summary": "..."
}
```

The Next.js API route handles the transformation automatically.

## Troubleshooting

### Backend not running
- Error: "Backend server is not running"
- Solution: Start the backend server with `npm run dev:backend`

### Port conflicts
- Backend default port: 7860
- Frontend default port: 3000
- Change ports in `backend/.env` (PORT) or `package.json` (dev script)

### Missing OpenAI API key
- Create `backend/.env` with your `OPENAI_API_KEY`
- Get your key from https://platform.openai.com/api-keys

