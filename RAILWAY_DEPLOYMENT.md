# 🚂 Deploy TTMall to Railway

This guide will help you deploy your TikTok-style video shopping app to Railway in just a few minutes!

## ✨ Why Railway?

- ✅ **Super Easy** - Deploy in 5 minutes
- ✅ **Free Tier** - $5 credit per month (enough for small apps)
- ✅ **Persistent Storage** - Uploaded videos won't disappear
- ✅ **Auto-Deploy** - Push to GitHub and it auto-deploys
- ✅ **Custom Domain** - Free subdomain or use your own

---

## 🚀 Quick Deploy (Recommended)

### Option 1: Deploy from GitHub (Easiest)

**Step 1: Push your code to GitHub**

```bash
# Initialize git (if not already done)
git init

# Add all files
git add .

# Commit
git commit -m "Ready for Railway deployment"

# Create a new repository on GitHub, then:
git remote add origin https://github.com/YOUR_USERNAME/TTMall-Standalone.git
git branch -M main
git push -u origin main
```

**Step 2: Deploy on Railway**

1. Go to [railway.app](https://railway.app)
2. Click **"Start a New Project"**
3. Choose **"Deploy from GitHub repo"**
4. Select your `TTMall-Standalone` repository
5. Railway will automatically detect it's a Node.js app and deploy it! 🎉

**Step 3: Add Persistent Storage (Important for Videos)**

1. In your Railway project, click on your service
2. Go to **"Variables"** tab
3. Railway automatically sets `PORT` - no need to change
4. Go to **"Settings"** tab
5. Scroll to **"Volumes"**
6. Click **"+ New Volume"**
7. Set:
   - **Mount Path**: `/app/public/uploads`
   - **Size**: 1GB (or more if you expect many videos)
8. Click **"Add"**

**Step 4: Get Your URL**

1. Go to **"Settings"** tab
2. Under **"Domains"**, you'll see your Railway URL (e.g., `https://ttmall-production.up.railway.app`)
3. Click **"Generate Domain"** if not already generated
4. Visit your URL - your app is live! 🎊

---

### Option 2: Deploy with Railway CLI (For Developers)

**Step 1: Install Railway CLI**

```bash
npm install -g @railway/cli
```

**Step 2: Login to Railway**

```bash
railway login
```

This will open a browser for authentication.

**Step 3: Initialize and Deploy**

```bash
# Initialize Railway project
railway init

# Link to Railway (if asked)
# Choose "Create new project"

# Deploy your app
railway up
```

**Step 4: Add Volume for Persistent Storage**

```bash
# Open Railway dashboard
railway open

# Then follow Step 3 from Option 1 above to add volume
```

**Step 5: Get Your Deployment URL**

```bash
railway domain
```

Or visit the Railway dashboard to see your URL.

---

## 🔧 Configuration

### Environment Variables (Optional)

Railway automatically sets `PORT`, but you can add custom variables:

1. In Railway dashboard → Your service → **"Variables"** tab
2. Add any environment variables you need:

```env
NODE_ENV=production
# Add more as needed
```

### Custom Domain (Optional)

Want to use your own domain (e.g., `shop.yourdomain.com`)?

1. Go to **"Settings"** → **"Domains"**
2. Click **"Custom Domain"**
3. Enter your domain
4. Add the CNAME record to your DNS provider as shown
5. Wait for DNS propagation (can take a few minutes to 24 hours)

---

## 📊 Monitor Your App

### View Logs

**In Dashboard:**
1. Go to your service
2. Click **"Deployments"** tab
3. Click on the latest deployment
4. View logs in real-time

**With CLI:**
```bash
railway logs
```

### View Metrics

Railway dashboard shows:
- CPU usage
- Memory usage
- Network traffic
- Deployment history

---

## 🔄 Auto-Deploy on Git Push

Once connected to GitHub, Railway automatically deploys when you push:

```bash
# Make changes to your code
git add .
git commit -m "Update feature"
git push

# Railway automatically deploys! 🚀
```

Watch the deployment progress in the Railway dashboard.

---

## 💾 Important: Persistent Storage

### What Gets Saved

With the volume mounted at `/app/public/uploads`:
- ✅ Uploaded videos persist across deployments
- ✅ Videos survive app restarts
- ✅ Storage scales with your volume size

### What Gets Reset

- ❌ Shopping cart (in-memory) - users lose cart on restart
- ❌ Orders (in-memory) - orders are lost on restart
- ❌ `videos-data.json` metadata - video info may be lost

**For Production:** Consider adding a database (see below)

---

## 🗄️ Optional: Add a Database

For production apps, add a database to persist cart, orders, and video metadata:

### Add PostgreSQL

1. In Railway dashboard, click **"+ New"**
2. Choose **"Database"** → **"PostgreSQL"**
3. Railway creates and connects it automatically
4. Connection string appears in your service's environment variables

### Add MongoDB

1. Click **"+ New"** → **"Database"** → **"MongoDB"**
2. Or use [MongoDB Atlas](https://www.mongodb.com/atlas) (free tier available)
3. Add connection string to environment variables:
   ```env
   MONGODB_URI=mongodb+srv://...
   ```

You'll need to update `server.js` to use the database.

---

## 💰 Pricing

### Free Tier
- $5 credit per month
- ~500 hours of usage (enough for hobby projects)
- Shared CPU and memory
- Perfect for testing and small projects

### Paid Plans
- Pay for what you use
- No hidden fees
- Starts around $5-10/month for small apps
- Check [railway.app/pricing](https://railway.app/pricing)

---

## 🐛 Troubleshooting

### App Not Starting

**Check logs:**
```bash
railway logs
```

**Common issues:**
- Missing dependencies: Run `npm install` locally first
- Port issues: Railway sets `PORT` automatically - make sure your `server.js` uses `process.env.PORT`

### Videos Not Persisting

**Solution:** Make sure you added a Volume (see Step 3 in Quick Deploy)

### 502 Bad Gateway

**Possible causes:**
- App crashed - check logs
- Not listening on correct port - verify `process.env.PORT` is used
- Build failed - check deployment logs

### Out of Memory

**Solution:** 
1. Go to **"Settings"** → **"Resources"**
2. Increase memory limit (may require paid plan)

---

## 🚀 Next Steps After Deployment

### 1. Test Your Deployed App

- Browse videos
- Upload a new video
- Test shopping cart
- Create a test order

### 2. Share Your App

Your Railway URL is public! Share it with:
- Friends and family
- Test users
- Social media

### 3. Monitor Performance

- Check logs regularly
- Monitor resource usage
- Watch for errors

### 4. Consider Upgrades

For production use:
- [ ] Add database (PostgreSQL/MongoDB)
- [ ] Add cloud storage (AWS S3, Cloudinary) for videos
- [ ] Add user authentication
- [ ] Add payment processing
- [ ] Set up custom domain
- [ ] Add monitoring/analytics

---

## 📚 Additional Resources

- [Railway Documentation](https://docs.railway.app)
- [Railway Discord](https://discord.gg/railway) - Get help from community
- [Railway Status](https://status.railway.app) - Check service status

---

## 🎉 You're Done!

Your TTMall app is now live on Railway! 

**Your deployment includes:**
- ✅ Full video shopping app
- ✅ Video upload functionality
- ✅ Persistent storage for videos
- ✅ Public URL to share
- ✅ Auto-deploy on git push

**Need help?** Check the Railway docs or their Discord community!

---

**Built with ❤️ - Deployed on Railway 🚂**

