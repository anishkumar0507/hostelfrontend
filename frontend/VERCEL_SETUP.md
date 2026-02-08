# Vercel Deployment Setup Guide

## Quick Setup for Vercel

### 1. Import Project to Vercel

1. Go to https://vercel.com/new
2. Select "Import Git Repository" and choose your GitHub repo
3. Click "Import"

### 2. Set Environment Variables (CRITICAL)

This is the most important step. The frontend MUST have the API base URL configured.

**In Vercel Dashboard:**
1. Go to your project settings
2. Navigate to "Environment Variables"
3. Add the following variable:

```
VITE_API_BASE_URL = https://hostelbackend-98mc.onrender.com/api
```

**Important Notes:**
- The variable name MUST start with `VITE_` (Vite requirement)
- Do NOT include a trailing slash
- Make sure you're pointing to the production backend
- This variable will be embedded during the build process

### 3. Configure Build Settings (Optional, Usually Auto-Detected)

- **Framework**: Vite
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Install Command**: `npm install`

### 4. Deploy

1. Click "Deploy"
2. Vercel will automatically build and deploy when you push to your repository

## Troubleshooting

### Issue: Frontend still calls localhost:5001

**Solution:**
- Check that `VITE_API_BASE_URL` is set in Vercel Environment Variables
- Redeploy the project after setting the variable (just trigger a new deployment)
- Clear browser cache and local storage (browser DevTools)

### Issue: API calls are failing with CORS errors

**Solution:**
1. Verify the backend `FRONTEND_URL` environment variable on Render is set to your Vercel URL
2. Example: `FRONTEND_URL=https://your-app.vercel.app`
3. Ensure CORS is properly configured on the backend

### Issue: Login/API endpoints return 404

**Solution:**
- Ensure your backend on Render is running
- Check that all routes are prefixed with `/api` on the backend
- Verify the Render backend URL is correct in `VITE_API_BASE_URL`

## Environment Variable Reference

| Variable | Value | Where |
|----------|-------|-------|
| `VITE_API_BASE_URL` | `https://hostelbackend-98mc.onrender.com/api` | Vercel Environment Variables |

## Local Testing Before Deployment

### Test with production URL locally:

```bash
# Create/Update .env.production file
VITE_API_BASE_URL=https://hostelbackend-98mc.onrender.com/api

# Build
npm run build

# Preview the build (requires npm)
npm run preview
```

### Test with local backend:

```bash
# Create/Update .env.local file
VITE_API_BASE_URL=https://hostelbackend-98mc.onrender.com/api

# Run dev server
npm run dev
```

## File Structure

```
/
â”œâ”€â”€ .env                    # Development (local)
â”œâ”€â”€ .env.local             # Local overrides (git ignored)
â”œâ”€â”€ .env.production        # Production template
â”œâ”€â”€ env.example            # Documentation
â”œâ”€â”€ vite.config.ts         # Vite configuration
â”œâ”€â”€ package.json           # Build commands
â””â”€â”€ ...
```

## How Environment Variables Work

1. **Build Time**: Vite replaces `import.meta.env.VITE_*` variables with their actual values during the build
2. **Vercel Dashboard**: Variables set in Vercel override local `.env` files
3. **Deployment**: The build process uses variables from Vercel's environment

## Next Steps

1. Add the environment variable in Vercel dashboard
2. Trigger a new deployment (or push to main)
3. Test login with wrong credentials (should show error toast)
4. Test creating complaints/outings (should appear in warden panel)
5. Verify fees and payments load correctly

## Support

If issues persist:
1. Check browser DevTools Network tab to see actual API URLs being called
2. Check Vercel build logs for environment variable issues
3. Ensure Render backend is running and accessible
4. Verify CORS configuration on both frontend and backend

