# Quick Deployment Checklist

## Before Pushing to GitHub

- [ ] Remove `backend/.env` file (contains API keys)
- [ ] Verify `.gitignore` includes `.env` and `node_modules/`
- [ ] Test locally to ensure everything works

## GitHub Setup

1. Create repository on GitHub
2. Push code:
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
   git push -u origin main
   ```

## Hugging Face (Backend)

1. Create Space → Docker
2. Upload `backend/` folder contents
3. Add secrets:
   - `OPENAI_API_KEY`
   - `OPENAI_MODEL` = `gpt-4.1`
4. Get URL: `https://YOUR_USERNAME-financial-analyzer-backend.hf.space`

## Vercel (Frontend)

1. Import GitHub repo
2. Add env var: `NEXT_PUBLIC_BACKEND_URL` = your HF Space URL
3. Deploy

## Done! 🚀

Your app is live at: `https://YOUR_PROJECT.vercel.app`

