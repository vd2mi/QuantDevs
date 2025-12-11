# Vercel Deployment - Quick Setup

## Your Backend URL
```
https://vd2mi-financial-analyzer-backend.hf.space
```

## Steps to Deploy Frontend

1. **Go to Vercel**: https://vercel.com
2. **Sign in** with GitHub
3. **Click "Add New Project"**
4. **Import** your repository: `vd2mi/QuantDevs`
5. **Configure Project**:
   - Framework Preset: **Next.js** (auto-detected)
   - Root Directory: `./` (root)
   - Build Command: `npm run build` (auto-detected)
   - Output Directory: `.next` (auto-detected)

6. **Add Environment Variable**:
   - Click "Environment Variables"
   - Add new variable:
     - **Name**: `NEXT_PUBLIC_BACKEND_URL`
     - **Value**: `https://vd2mi-financial-analyzer-backend.hf.space`
     - **Environment**: Production, Preview, Development (select all)

7. **Click "Deploy"**

8. **Wait for build** (usually 2-3 minutes)

9. **Your app will be live at**: `https://your-project.vercel.app`

## After Deployment

1. Test the app by uploading a bank statement
2. Verify it connects to your HF backend
3. Check browser console for any errors

## Troubleshooting

**If backend connection fails:**
- Verify `NEXT_PUBLIC_BACKEND_URL` is set correctly in Vercel
- Check HF Space is running (visit the backend URL directly)
- Check browser console for CORS errors
- May need to update CORS in `backend/server.js` to include your Vercel domain

