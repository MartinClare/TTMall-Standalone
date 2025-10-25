# 📤 Push Your Code to GitHub - Step by Step

Follow these exact commands in order:

## Step 1: Configure Git (First Time Only)

Open your terminal and run these commands with YOUR information:

```bash
git config --global user.name "Your Name"
git config --global user.email "your.email@example.com"
```

**Example:**
```bash
git config --global user.name "Alex Johnson"
git config --global user.email "alex.johnson@gmail.com"
```

✅ Use the same email as your GitHub account!

---

## Step 2: Create Repository on GitHub

1. Go to: https://github.com/new
2. Fill in:
   - **Repository name**: `TTMall-Standalone`
   - **Description**: `TikTok-style video shopping app`
   - **Visibility**: Public (or Private if you prefer)
   - ⚠️ **IMPORTANT**: Do NOT check any boxes (no README, no .gitignore, no license)
3. Click **"Create repository"**
4. Keep that page open - you'll need the URL!

---

## Step 3: Copy Your Repository URL

After creating the repository, GitHub will show you a URL that looks like:

```
https://github.com/YOUR_USERNAME/TTMall-Standalone.git
```

**Copy this URL!** You'll need it in the next step.

---

## Step 4: Run These Commands

Open your terminal in the project folder and run:

```bash
# 1. Commit your files
git commit -m "Initial commit - TTMall video shopping app ready for Railway deployment"

# 2. Add your GitHub repository (replace with YOUR URL from Step 3)
git remote add origin https://github.com/YOUR_USERNAME/TTMall-Standalone.git

# 3. Rename branch to main (if needed)
git branch -M main

# 4. Push to GitHub
git push -u origin main
```

**⚠️ IMPORTANT**: Replace `YOUR_USERNAME` with your actual GitHub username in step 2!

---

## Step 5: Authentication (If Asked)

When you run `git push`, GitHub might ask for credentials:

### Option A: Personal Access Token (Recommended)

1. Go to: https://github.com/settings/tokens
2. Click **"Generate new token"** → **"Generate new token (classic)"**
3. Give it a name: `TTMall-Deployment`
4. Check the **`repo`** scope (full control of private repositories)
5. Scroll down and click **"Generate token"**
6. **COPY THE TOKEN** (you won't see it again!)
7. When git asks for password, paste the token

### Option B: GitHub CLI (Easiest)

```bash
# Install GitHub CLI if you haven't
# Then run:
gh auth login
```

Follow the prompts to authenticate.

---

## ✅ Verification

After pushing, verify it worked:

```bash
# Check remote URL
git remote -v

# Should show:
# origin  https://github.com/YOUR_USERNAME/TTMall-Standalone.git (fetch)
# origin  https://github.com/YOUR_USERNAME/TTMall-Standalone.git (push)
```

Visit your GitHub repository in browser:
```
https://github.com/YOUR_USERNAME/TTMall-Standalone
```

You should see all your files! 🎉

---

## 🔄 Future Updates

After the initial push, updating is easy:

```bash
# Make your changes, then:
git add .
git commit -m "Your update message"
git push
```

That's it! No need to specify remote or branch again.

---

## 🐛 Common Issues & Solutions

### "Author identity unknown"
```bash
# Solution: Set your git config (Step 1)
git config --global user.name "Your Name"
git config --global user.email "your.email@example.com"
```

### "remote origin already exists"
```bash
# Solution: Update the URL instead
git remote set-url origin https://github.com/YOUR_USERNAME/TTMall-Standalone.git
```

### "Authentication failed"
- Use a Personal Access Token instead of password
- Or use GitHub CLI: `gh auth login`
- Or set up SSH keys

### "Updates were rejected"
```bash
# If you need to force push (be careful!)
git push -f origin main
```

---

## 📱 Quick Reference Card

```bash
# First Time Setup
git config --global user.name "Your Name"
git config --global user.email "your@email.com"

# Initial Push
git commit -m "Initial commit"
git remote add origin https://github.com/USERNAME/REPO.git
git branch -M main
git push -u origin main

# Future Updates
git add .
git commit -m "Update message"
git push
```

---

## 🎯 What's Next?

After pushing to GitHub:

1. ✅ Your code is safely backed up
2. ✅ You can now deploy to Railway
3. ✅ Others can see/collaborate on your project
4. ✅ Railway can auto-deploy on every push

**Ready to deploy?** See `RAILWAY_DEPLOYMENT.md` for next steps!

---

**Need help?** Open an issue or check GitHub's documentation:
- [GitHub Quick Start](https://docs.github.com/en/get-started/quickstart)
- [GitHub Authentication](https://docs.github.com/en/authentication)

🚀 **You've got this!**

