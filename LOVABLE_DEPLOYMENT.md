# 🚀 Lovable Deployment Guide

## 🆘 **IMMEDIATE FIX for Current Error**

Your Lovable project needs environment variables. Follow these exact steps:

### Step 1: Set Environment Variables in Lovable
1. **Open your Lovable project dashboard**
2. **Click on "Settings" or "Environment Variables"**
3. **Add these EXACT variables:**

```
Variable Name: VITE_SUPABASE_URL
Value: https://scjzawibacootyibfvgp.supabase.co

Variable Name: VITE_SUPABASE_ANON_KEY  
Value: [GET FROM SUPABASE - see step 2]

Variable Name: VITE_APP_NAME
Value: German Pathways Advisor

Variable Name: NODE_ENV
Value: production
```

### Step 2: Get Your Supabase Anon Key
1. **Go to:** https://supabase.com/dashboard/projects
2. **Click on your project:** `scjzawibacootyibfvgp`
3. **Navigate to:** Settings → API
4. **Copy the "anon public" key** (starts with `eyJhbGciOiJIUzI1NiIs...`)
5. **Paste this key** as the value for `VITE_SUPABASE_ANON_KEY` in Lovable

### Step 3: Redeploy
1. **Save the environment variables** in Lovable
2. **Trigger a redeploy** (or push any change to GitHub)
3. **Check the deployment logs** for any remaining errors

## 🔧 **Alternative: Quick Fix**

If environment variables aren't working, here's the anon key you need:

**Project ID:** `scjzawibacootyibfvgp`  
**URL:** `https://scjzawibacootyibfvgp.supabase.co`  
**Anon Key:** You must get this from your Supabase dashboard

## 📋 **Lovable Environment Variables Setup**

| Variable | Value | Required |
|----------|--------|----------|
| `VITE_SUPABASE_URL` | `https://scjzawibacootyibfvgp.supabase.co` | ✅ YES |
| `VITE_SUPABASE_ANON_KEY` | Your actual Supabase anon key | ✅ YES |
| `VITE_APP_NAME` | `German Pathways Advisor` | ⚠️ Optional |
| `NODE_ENV` | `production` | ⚠️ Optional |

## � **Troubleshooting**

### Error: "Missing VITE_SUPABASE_URL"
- ✅ Add `VITE_SUPABASE_URL` in Lovable environment variables
- ✅ Value: `https://scjzawibacootyibfvgp.supabase.co`

### Error: "Missing VITE_SUPABASE_ANON_KEY"  
- ✅ Get anon key from Supabase dashboard
- ✅ Add `VITE_SUPABASE_ANON_KEY` in Lovable environment variables

### Still Not Working?
1. **Check Lovable build logs** for specific errors
2. **Verify environment variables** are saved in Lovable
3. **Try manual redeploy** in Lovable dashboard
4. **Check Supabase project** is active and accessible

## 🎯 **Success Checklist**

- [ ] Environment variables added in Lovable dashboard
- [ ] Real Supabase anon key obtained and set
- [ ] Project redeployed successfully  
- [ ] No runtime errors in browser console
- [ ] Application loads without blank screen

Your German Pathways Advisor should work perfectly after setting these environment variables! 🚀
