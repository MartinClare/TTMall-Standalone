# ✅ Railway Deployment Checklist

Use this quick checklist to deploy your TTMall app to Railway.

## 📋 Pre-Deployment Checklist

- [x] Node.js app with `package.json` ✅
- [x] `npm start` script configured ✅
- [x] Server uses `process.env.PORT` ✅
- [x] `.gitignore` excludes sensitive files ✅
- [x] Railway config files created ✅

## 🚀 Deployment Steps

### Quick Deploy (5 Minutes)

1. **Push to GitHub** (if not already done)
   ```bash
   git init
   git add .
   git commit -m "Deploy to Railway"
   git remote add origin https://github.com/YOUR_USERNAME/REPO_NAME.git
   git push -u origin main
   ```

2. **Deploy on Railway**
   - Go to [railway.app](https://railway.app)
   - Click "Start a New Project"
   - Choose "Deploy from GitHub repo"
   - Select your repository
   - Wait for deployment (2-3 minutes)

3. **Add Persistent Storage** (Important!)
   - Click on your service
   - Go to Settings → Volumes
   - Add volume:
     - Mount path: `/app/public/uploads`
     - Size: 1GB or more
   
4. **Get Your URL**
   - Settings → Domains
   - Click "Generate Domain"
   - Your app is live! 🎉

## 🔍 Post-Deployment Verification

- [ ] Visit your Railway URL
- [ ] Videos load and play correctly
- [ ] Upload a test video
- [ ] Check if uploaded video persists after refresh
- [ ] Test shopping cart functionality
- [ ] Check browser console for errors
- [ ] View Railway logs for any issues

## 📱 Share Your App

Your Railway URL will look like:
```
https://ttmall-production.up.railway.app
```

Share it with anyone - it's public and ready to use!

## 🔄 Future Updates

To update your deployed app:

```bash
# Make your changes
git add .
git commit -m "Your update message"
git push

# Railway auto-deploys! 🚀
```

## 💡 Pro Tips

1. **Monitor logs**: Use `railway logs` or check dashboard
2. **Custom domain**: Add your own domain in Settings → Domains
3. **Environment variables**: Add in Variables tab if needed
4. **Database**: Add PostgreSQL or MongoDB for production
5. **Backup**: Railway keeps your volume data safe, but backup important data

## 🆘 Need Help?

- 📖 [Full Deployment Guide](./RAILWAY_DEPLOYMENT.md)
- 🌐 [Railway Docs](https://docs.railway.app)
- 💬 [Railway Discord](https://discord.gg/railway)

---

**Your app is ready to deploy! Follow the steps above and you'll be live in 5 minutes! 🚂**

