# Financial Analyzer - Alternative Credit Intelligence Platform

A Next.js application that analyzes bank statements to generate behavior-based credit profiles for users without traditional credit history.

## Features

- 📊 Bank statement parsing (XLSX, DOCX)
- 🤖 AI-powered financial analysis
- 💳 BNPL detection and burnout prediction
- 📈 Credit score calculation (300-850)
- 📱 Interactive dashboard with financial insights

## Tech Stack

- **Frontend**: Next.js 14, React, Tailwind CSS, Framer Motion
- **Backend**: Express.js, Node.js
- **AI**: OpenAI GPT-4.1
- **File Parsing**: xlsx, mammoth

## Setup

### Prerequisites

- Node.js 18+ and npm
- OpenAI API key

### Local Development

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   cd backend && npm install && cd ..
   ```

3. **Set up environment variables**

   Create `backend/.env`:
   ```env
   PORT=7860
   OPENAI_API_KEY=your_openai_api_key_here
   OPENAI_MODEL=gpt-4.1
   ```

4. **Start development servers**
   ```bash
   # Terminal 1: Backend
   cd backend && npm start
   
   # Terminal 2: Frontend
   npm run dev
   ```

5. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:7860

## Deployment

### Vercel (Frontend)

1. **Connect your GitHub repository to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Import your GitHub repository
   - Vercel will auto-detect Next.js

2. **Set environment variables in Vercel**
   - Go to Project Settings → Environment Variables
   - Add: `NEXT_PUBLIC_BACKEND_URL` = your backend URL (Hugging Face or other)

3. **Deploy**
   - Push to main branch or click "Deploy"

### Hugging Face Spaces (Backend)

1. **Create a new Space**
   - Go to [huggingface.co/spaces](https://huggingface.co/spaces)
   - Create new Space → Docker

2. **Add files to your Space**
   - Upload `backend/` folder contents
   - Create `Dockerfile` (see below)
   - Create `README.md` for the Space

3. **Set secrets in Hugging Face**
   - Go to Settings → Secrets
   - Add: `OPENAI_API_KEY` = your OpenAI API key
   - Add: `OPENAI_MODEL` = gpt-4.1

4. **Update frontend backend URL**
   - Update `NEXT_PUBLIC_BACKEND_URL` in Vercel to point to your HF Space URL

## Project Structure

```
frontend/
├── app/                 # Next.js app directory
│   ├── api/            # API routes
│   ├── loading/        # Loading page
│   ├── results/        # Results page
│   └── page.jsx        # Home page
├── backend/            # Express backend
│   ├── helpers/        # Parsing and analysis logic
│   └── server.js       # Express server
├── components/         # React components
├── lib/               # Utility functions
└── public/            # Static assets
```

## Environment Variables

### Frontend (Vercel)
- `NEXT_PUBLIC_BACKEND_URL` - Backend API URL

### Backend (Hugging Face / Local)
- `PORT` - Server port (default: 7860)
- `OPENAI_API_KEY` - OpenAI API key
- `OPENAI_MODEL` - Model name (default: gpt-4.1)

## API Endpoints

- `GET /` - Health check
- `POST /analyze` - Analyze bank statement file

## License

MIT

