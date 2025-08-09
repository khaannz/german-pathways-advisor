# 🚀 Lovable Deployment Guide

## Quick Setup for Lovable

### 1. **Connect Your GitHub Repository**
- In Lovable, click "Import from GitHub" 
- Select your repository: `khaannz/german-pathways-advisor`
- Lovable will automatically detect it's a Vite + React project

### 2. **Set Environment Variables in Lovable**
Go to your Lovable project settings and add these environment variables:

```env
VITE_SUPABASE_URL=https://scjzawibacootyibfvgp.supabase.co
VITE_SUPABASE_ANON_KEY=your_actual_supabase_anon_key_here
VITE_APP_NAME=German Pathways Advisor
VITE_ENVIRONMENT=production
```

### 3. **Get Your Supabase Anon Key**
1. Go to [Supabase Dashboard](https://supabase.com/dashboard/projects)
2. Select your project: `scjzawibacootyibfvgp`
3. Go to Settings → API
4. Copy the "anon public" key
5. Replace `your_actual_supabase_anon_key_here` in Lovable environment variables

### 4. **Deploy**
- Lovable will automatically build and deploy
- Your app will be available at: `https://your-project-id.lovableproject.com`

## 🔧 Alternative: Auto-sync Configuration

### Option A: Environment Files (Current Setup)
- `.env.production` - Production environment variables
- `lovable.config.yml` - Lovable-specific configuration
- `vercel.json` - Alternative deployment configuration

### Option B: GitHub Actions (Advanced)
Create `.github/workflows/deploy.yml` for automatic deployment on push.

## 🛠️ Build Configuration

The project is configured for:
- **Framework**: Vite + React + TypeScript
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Node Version**: 18+

## 📋 Required Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `VITE_SUPABASE_URL` | Your Supabase project URL | `https://scjzawibacootyibfvgp.supabase.co` |
| `VITE_SUPABASE_ANON_KEY` | Supabase anonymous key | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` |
| `VITE_APP_NAME` | Application name | `German Pathways Advisor` |
| `VITE_ENVIRONMENT` | Environment type | `production` |

## 🔄 Automatic Updates

Once connected to GitHub:
1. Push changes to main branch
2. Lovable automatically detects changes
3. Rebuilds and redeploys
4. Environment variables persist across deployments

## 🚨 Important Notes

- Never commit real API keys to `.env` files in public repos
- Use Lovable's environment variable settings for sensitive data
- The `.env.production` file contains placeholder values only
- Update `VITE_SUPABASE_ANON_KEY` in Lovable dashboard with real key

## 🎯 Next Steps

1. **Push this configuration** to GitHub
2. **Import repository** in Lovable
3. **Set environment variables** in Lovable dashboard
4. **Deploy and test** your application

Your German Pathways Advisor platform will be live and automatically update with each GitHub push! 🚀
