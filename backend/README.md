---
title: Financial Analyzer Backend
emoji: 💳
colorFrom: blue
colorTo: purple
sdk: docker
pinned: false
---

# Financial Analyzer Backend API

Backend API server for analyzing bank statements and generating credit scores.

## Setup

1. Add your OpenAI API key in Settings → Secrets as `OPENAI_API_KEY`
2. Optionally set `OPENAI_MODEL` secret (default: gpt-4.1)
3. The Space will automatically build and deploy

## API Endpoints

- `GET /` - Health check
- `POST /analyze` - Analyze bank statement (multipart/form-data with `file` field)

## Environment Variables

- `OPENAI_API_KEY` (required) - Your OpenAI API key
- `OPENAI_MODEL` (optional) - Model name, default: gpt-4.1
- `PORT` (optional) - Server port, default: 7860

## Usage

```bash
curl -X POST https://your-space.hf.space/analyze \
  -F "file=@statement.xlsx"
```

