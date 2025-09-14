# Vercel Deployment Guide

## 🚀 Deploy to Vercel

### Prerequisites
1. **GitHub account** (to connect repository)
2. **Vercel account** (free at vercel.com)
3. **Push code to GitHub** repository

### Step 1: Prepare Repository
```bash
# Initialize git (if not already done)
git init

# Add all files
git add .

# Commit changes
git commit -m "Initial commit - Township POS System"

# Add GitHub remote (replace with your repo URL)
git remote add origin https://github.com/yourusername/township-pos.git

# Push to GitHub
git push -u origin main
```

### Step 2: Deploy on Vercel
1. **Go to vercel.com** and sign up/login
2. **Click "New Project"**
3. **Import from GitHub** - select your repository
4. **Configure project**:
   - Framework Preset: **Other**
   - Root Directory: **/** (leave empty)
   - Build Command: `npm run vercel-build`
   - Output Directory: `src/frontend/build`
5. **Click "Deploy"**

### Step 3: Environment Variables (Optional)
If you want to add payment APIs later:
1. **Go to Project Settings** → Environment Variables
2. **Add variables**:
   - `PAYFAST_MERCHANT_ID`
   - `PAYFAST_MERCHANT_KEY`
   - `PAYFAST_PASSPHRASE`

### Step 4: Custom Domain (Optional)
1. **Go to Project Settings** → Domains
2. **Add your custom domain**
3. **Configure DNS** as instructed

## 📱 What Gets Deployed

### Frontend (React App)
- **POS Interface** - Category-based sales
- **Inventory Management** - Add/edit/delete items
- **Dashboard** - Analytics and credit scoring
- **Gamification** - Avatars, missions, badges

### Backend (Serverless Functions)
- **API endpoints** at `/api/*`
- **Inventory API** - Get/add inventory items
- **Credit Score API** - Calculate credit scores
- **Sales History API** - Transaction records

## 🔧 Limitations on Vercel

### Database
- **No persistent SQLite** (serverless environment)
- **Use external database**:
  - **Supabase** (PostgreSQL, free tier)
  - **PlanetScale** (MySQL, free tier)
  - **MongoDB Atlas** (free tier)

### File Storage
- **No local file storage**
- **Use cloud storage** for assets

### Real-time Features
- **No WebSocket support**
- **Use polling** or external services

## 🌐 Production Considerations

### Database Setup
For production, replace demo data with real database:

```javascript
// Example with Supabase
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
)

// Use in API functions
const { data, error } = await supabase
  .from('inventory')
  .select('*')
```

### Payment Integration
- **PayFast**: Works with Vercel (HTTPS required)
- **SnapScan**: API calls work fine
- **Mobile Money**: Requires webhook endpoints

### Security
- **Environment variables** for API keys
- **CORS configuration** for production domains
- **Input validation** on all endpoints

## 📊 Demo vs Production

### Demo Mode (Current)
- **Static data** in API functions
- **Simulated payments** (mobile money)
- **No persistent storage**
- **Perfect for showcasing**

### Production Mode
- **Real database** connection
- **Actual payment processing**
- **User authentication**
- **Data persistence**

## 🆘 Troubleshooting

### Build Errors
- Check **Node.js version** (16+)
- Verify **package.json** scripts
- Check **build logs** in Vercel dashboard

### API Errors
- Check **function logs** in Vercel
- Verify **CORS headers**
- Test **API endpoints** individually

### Payment Issues
- **HTTPS required** for PayFast
- **Webhook URLs** must be accessible
- **Test with sandbox** first

## 🎯 Next Steps After Deployment

1. **Test all features** on live site
2. **Set up real database** (Supabase recommended)
3. **Configure payment APIs** with production keys
4. **Add user authentication** if needed
5. **Monitor performance** and errors
6. **Set up analytics** (Google Analytics, etc.)

Your Township POS system will be live at: `https://your-project-name.vercel.app`