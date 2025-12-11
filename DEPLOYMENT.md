# Deployment Guide

This guide will help you deploy the Financial Analyzer to GitHub, Vercel (frontend), and Hugging Face Spaces (backend).

## Prerequisites

- GitHub account
- Vercel account (free tier available)
- Hugging Face account (free tier available)
- OpenAI API key

## Step 1: Prepare Repository

### 1.1 Remove Sensitive Files

Ensure these files are NOT committed:
- `backend/.env` (contains API keys)
- `node_modules/` (already in .gitignore)
- Any `.bat` files (optional, already in .gitignore)

### 1.2 Verify .gitignore

The `.gitignore` file should exclude:
- `.env` files
- `node_modules/`
- `.next/`
- Build artifacts

## Step 2: Deploy to GitHub

### 2.1 Create GitHub Repository

1. Go to [github.com](https://github.com) and create a new repository
2. Name it: `financial-analyzer` (or your preferred name)
3. Set it to **Public** or **Private** (your choice)

### 2.2 Push Code to GitHub

```bash
# Initialize git (if not already done)
git init

# Add all files
git add .

# Commit
git commit -m "Initial commit: Financial Analyzer"

# Add remote
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git

# Push to GitHub
git branch -M main
git push -u origin main
```

## Step 3: Deploy Backend to Hugging Face Spaces

### 3.1 Create Hugging Face Space

1. Go to [huggingface.co/spaces](https://huggingface.co/spaces)
2. Click "Create new Space"
3. Fill in:
   - **Space name**: `financial-analyzer-backend`
   - **SDK**: Select **Docker**
   - **Visibility**: Public or Private
4. Click "Create Space"

### 3.2 Upload Backend Files

In your HF Space, upload these files from the `backend/` folder:

**Required files:**
- `server.js`
- `package.json`
- `Dockerfile` (already created)
- `README.md` (already created)
- `helpers/` folder (all files inside)
- `utils.js`

**How to upload:**
- Use the web interface: Click "Files and versions" → "Add file" → Upload each file/folder
- Or use Git: Clone the HF Space repo and push files

### 3.3 Set Secrets in Hugging Face

1. Go to your Space → **Settings** → **Secrets**
2. Add these secrets:
   - `OPENAI_API_KEY` = your OpenAI API key (starts with `sk-`)
   - `OPENAI_MODEL` = `gpt-4.1` (optional, defaults to gpt-4.1)
   - `PORT` = `7860` (optional, defaults to 7860)

### 3.4 Update Dockerfile (if needed)

The Dockerfile is already created. Make sure it's in the root of your HF Space (not in a subfolder).

### 3.5 Wait for Build

HF will automatically build and deploy. Check the "Logs" tab for build status.

### 3.6 Get Your Backend URL

Once deployed, your backend URL will be:
```
https://YOUR_USERNAME-financial-analyzer-backend.hf.space
```

**Important:** Note this URL - you'll need it for Vercel!

## Step 4: Deploy Frontend to Vercel

### 4.1 Connect GitHub to Vercel

1. Go to [vercel.com](https://vercel.com)
2. Sign in with GitHub
3. Click "Add New Project"
4. Import your GitHub repository
5. Vercel will auto-detect Next.js

### 4.2 Configure Build Settings

Vercel should auto-detect:
- **Framework Preset**: Next.js
- **Root Directory**: `./` (root)
- **Build Command**: `npm run build`
- **Output Directory**: `.next`

### 4.3 Set Environment Variables

In Vercel project settings → **Environment Variables**, add:

```
NEXT_PUBLIC_BACKEND_URL = https://YOUR_USERNAME-financial-analyzer-backend.hf.space
```

Replace `YOUR_USERNAME` with your Hugging Face username.

### 4.4 Deploy

1. Click "Deploy"
2. Wait for build to complete
3. Your app will be live at: `https://YOUR_PROJECT.vercel.app`

## Step 5: Update CORS in Backend (if needed)

If you get CORS errors, update `backend/server.js`:

```javascript
app.use(cors({
  origin: [
    'http://localhost:3000',
    'https://YOUR_PROJECT.vercel.app',
    'https://*.vercel.app' // Allow all Vercel deployments
  ],
  credentials: true
}));
```

Then redeploy to Hugging Face.

## Step 6: Test Deployment

1. **Test Backend**: Visit `https://YOUR_USERNAME-financial-analyzer-backend.hf.space/`
   - Should return: `{"status":"ok","message":"QuantDevs financial analyzer backend running"}`

2. **Test Frontend**: Visit `https://YOUR_PROJECT.vercel.app`
   - Upload a test bank statement
   - Verify it connects to the backend

## Troubleshooting

### Backend not accessible from Vercel

- Check HF Space logs for errors
- Verify CORS settings in `server.js`
- Check that `PORT` is set correctly (HF uses port 7860)

### Frontend can't connect to backend

- Verify `NEXT_PUBLIC_BACKEND_URL` is set correctly in Vercel
- Check browser console for CORS errors
- Ensure backend URL doesn't have trailing slash

### Build fails

- Check build logs in Vercel/HF
- Ensure all dependencies are in `package.json`
- Verify Node.js version compatibility

## Environment Variables Summary

### Hugging Face (Backend)
- `OPENAI_API_KEY` (required)
- `OPENAI_MODEL` (optional, default: gpt-4.1)
- `PORT` (optional, default: 7860)

### Vercel (Frontend)
- `NEXT_PUBLIC_BACKEND_URL` (required) - Your HF Space URL

## Post-Deployment Checklist

- [ ] Backend health check works
- [ ] Frontend loads correctly
- [ ] File upload works
- [ ] Analysis completes successfully
- [ ] Results display correctly
- [ ] No console errors
- [ ] CORS configured properly

## Updating After Deployment

### Update Backend
1. Make changes locally
2. Push to GitHub
3. Upload updated files to HF Space (or use Git)
4. HF will auto-rebuild

### Update Frontend
1. Make changes locally
2. Push to GitHub
3. Vercel will auto-deploy

## Support

For issues:
1. Check deployment logs
2. Verify environment variables
3. Test locally first
4. Check browser console for errors

