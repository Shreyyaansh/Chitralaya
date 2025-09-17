# Chitralaya - Simple Deployment Guide

## 🚀 **Deploy Backend First, Then Frontend (Same Directory)**

This guide uses your current directory structure without creating separate folders.

---

## 📋 **Prerequisites**
- MongoDB Atlas account (free)
- Razorpay account (free) 
- Vercel account (free)
- GitHub account (free)

---

## 🎯 **Step 1: Deploy Backend First**

### 1.1 Create Backend Repository
```bash
# In your current Chitralaya directory
git init
git add .
git commit -m "Initial commit"

# Create new GitHub repository named 'chitralaya-backend'
# Then push:
git remote add origin https://github.com/yourusername/chitralaya-backend.git
git branch -M main
git push -u origin main
```

### 1.2 Deploy Backend on Vercel
1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click "New Project"
3. Import your `chitralaya-backend` repository
4. **Important Settings:**
   - Root Directory: `/` (keep as root)
   - Build Command: Leave empty
   - Output Directory: Leave empty
   - Install Command: `cd server && npm install`

### 1.3 Configure Backend Environment Variables
In Vercel project settings, add these environment variables:

```env
MONGODB_URI=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/chitralaya
JWT_SECRET=your_super_secret_jwt_key_32_characters_minimum
NODE_ENV=production
PORT=3000
FRONTEND_URL=https://your-frontend-app.vercel.app
RAZORPAY_KEY_ID=rzp_test_your_key_id_here
RAZORPAY_KEY_SECRET=your_razorpay_secret_here
```

**Note:** For `FRONTEND_URL`, use a placeholder like `https://placeholder.vercel.app` for now.

### 1.4 Deploy Backend
- Click "Deploy"
- Wait for deployment to complete
- **Save your backend URL:** `https://your-backend-app.vercel.app`

---

## 🎨 **Step 2: Deploy Frontend**

### 2.1 Update Frontend Configuration
Update your `config.js` file:

```javascript
// API Configuration for different environments
const API_CONFIG = {
  development: 'http://localhost:3000/api',
  production: 'https://your-backend-app.vercel.app/api' // Replace with your actual backend URL
};

// Get current environment
const isDevelopment = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
const API_BASE_URL = isDevelopment ? API_CONFIG.development : API_CONFIG.production;

// Export for use in other files
window.API_BASE_URL = API_BASE_URL;
```

### 2.2 Create Frontend Repository
```bash
# In your current Chitralaya directory
git add .
git commit -m "Updated frontend config"
git push origin main

# Create new GitHub repository named 'chitralaya-frontend'
# Then change remote:
git remote set-url origin https://github.com/yourusername/chitralaya-frontend.git
git push -u origin main
```

### 2.3 Deploy Frontend on Vercel
1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click "New Project"
3. Import your `chitralaya-frontend` repository
4. **Important Settings:**
   - Root Directory: `/` (keep as root)
   - Build Command: Leave empty
   - Output Directory: Leave empty
   - Install Command: Leave empty

### 2.4 Deploy Frontend
- Click "Deploy"
- Wait for deployment to complete
- **Save your frontend URL:** `https://your-frontend-app.vercel.app`

---

## 🔗 **Step 3: Connect Backend & Frontend**

### 3.1 Update Backend CORS
1. Go to your backend Vercel project
2. Go to Settings > Environment Variables
3. Update `FRONTEND_URL` to your actual frontend URL:
   ```
   FRONTEND_URL=https://your-frontend-app.vercel.app
   ```
4. Backend will auto-redeploy

### 3.2 Test Everything
1. Open your frontend URL
2. Test registration/login
3. Test product browsing
4. Test checkout process

---

## 🎉 **You're Done!**

**Your URLs:**
- **Frontend:** `https://your-frontend-app.vercel.app`
- **Backend API:** `https://your-backend-app.vercel.app/api`
- **Health Check:** `https://your-backend-app.vercel.app/health`

---

## 🔧 **Quick Commands Summary**

```bash
# Backend deployment
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/yourusername/chitralaya-backend.git
git push -u origin main
# Deploy on Vercel with server folder as root

# Frontend deployment  
# Update config.js with backend URL
git add .
git commit -m "Updated frontend config"
git remote set-url origin https://github.com/yourusername/chitralaya-frontend.git
git push -u origin main
# Deploy on Vercel with root as root
```

**That's it! Your Chitralaya art gallery is now live! 🎨✨**
