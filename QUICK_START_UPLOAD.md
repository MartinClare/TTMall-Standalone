# 🚀 Quick Start - Video Upload Feature

## What's New?

Your TTMall app now has **full video upload functionality**! Users can upload their own videos directly through the app.

## 📍 Access Points

1. **Main App**: http://localhost:3000
2. **Upload Page**: http://localhost:3000/upload.html
3. **Test Page**: Open `test-upload.html` directly in browser

## 🎯 How to Upload a Video

### Via Web Interface (Easiest)

1. Open http://localhost:3000
2. Click the **📤 upload button** in the top-right corner
3. Fill in the form:
   - **Video File**: Select a video file (max 100MB)
   - **Title**: Enter a descriptive title
   - **Description**: Add optional description
4. Click **"Upload Video"**
5. Watch the progress bar
6. Done! You'll be redirected to see your video in the feed

### Via API (For Developers)

```javascript
const formData = new FormData();
formData.append('video', videoFile);  // File object
formData.append('title', 'My Video');
formData.append('description', 'Description');

const response = await fetch('http://localhost:3000/api/videos/upload', {
  method: 'POST',
  body: formData
});

const result = await response.json();
console.log('Uploaded:', result.video);
```

### Via cURL (For Testing)

```bash
curl -X POST http://localhost:3000/api/videos/upload \
  -F "video=@myvideo.mp4" \
  -F "title=Test Video" \
  -F "description=This is a test"
```

## ✅ What Was Implemented

### Backend
- ✅ Multer middleware for file uploads
- ✅ POST `/api/videos/upload` endpoint
- ✅ DELETE `/api/videos/:id` endpoint
- ✅ File validation (type, size)
- ✅ Automatic filename generation
- ✅ Video storage in `public/uploads/videos/`

### Frontend
- ✅ Beautiful upload page with modern UI
- ✅ Upload button in main navigation
- ✅ Progress bar with percentage
- ✅ File validation
- ✅ Success/error messages
- ✅ Auto-redirect after upload

### Documentation
- ✅ Complete API documentation (API_UPLOAD_GUIDE.md)
- ✅ Feature summary (UPLOAD_FEATURE_SUMMARY.md)
- ✅ Updated README.md
- ✅ Test page (test-upload.html)

## 📋 File Specifications

- **Max Size**: 100MB per file
- **Accepted Formats**: MP4, WebM, MOV, AVI, and other video formats
- **Required Fields**: video file, title
- **Optional Fields**: description

## 🎨 Features

- 🎯 **Drag & Drop**: Easy file selection
- 📊 **Progress Tracking**: Real-time upload progress
- ✅ **Validation**: Automatic file type and size validation
- 💾 **Instant Access**: Videos available immediately after upload
- 📱 **Responsive**: Works on desktop and mobile
- 🎨 **Beautiful UI**: Modern gradient design

## 📂 Where Are Videos Stored?

- **Directory**: `public/uploads/videos/`
- **Naming**: `{timestamp}-{random}-{originalname}`
- **Access**: Via URL `/uploads/videos/{filename}`

## 🔧 Configuration

All settings are in `server.js`:

```javascript
// Change file size limit
limits: {
  fileSize: 100 * 1024 * 1024  // 100MB
}

// Change storage directory
destination: 'public/uploads/videos/'
```

## ⚠️ Important Notes

1. **In-Memory Storage**: Video metadata is stored in memory
   - Videos are added to the `videos` array
   - Restarting server will reset the list (but files remain on disk)
   - For production, use a database

2. **File Persistence**: Uploaded files stay on disk
   - Files in `public/uploads/videos/` persist after restart
   - You may want to clean old files periodically

3. **No Authentication**: Currently anyone can upload
   - Consider adding authentication for production
   - Implement rate limiting to prevent abuse

## 🐛 Troubleshooting

### "Upload failed"
- Check if `public/uploads/videos/` directory exists
- Verify file size is under 100MB
- Ensure server is running

### "Only video files are allowed"
- Make sure you're uploading a video file
- Accepted: MP4, WebM, MOV, AVI, etc.
- Not accepted: Images, documents, etc.

### Videos don't appear after upload
- Refresh the page
- Check console for errors
- Verify server is running

### Port already in use
```bash
PORT=3001 npm run dev
```

## 📖 Learn More

- **API Details**: See [API_UPLOAD_GUIDE.md](./API_UPLOAD_GUIDE.md)
- **Full Feature List**: See [UPLOAD_FEATURE_SUMMARY.md](./UPLOAD_FEATURE_SUMMARY.md)
- **Main README**: See [README.md](./README.md)

## 🎉 Try It Now!

1. Make sure server is running: `npm run dev`
2. Open http://localhost:3000
3. Click the upload button (📤)
4. Upload your first video!

## 💡 Tips

- Use short videos (under 50MB) for faster uploads
- Give descriptive titles for better organization
- Test with small files first
- Check the progress bar during upload
- Videos appear at the end of the feed

## 🚀 Next Steps

Now that you have video upload working, consider:

- [ ] Add user authentication
- [ ] Implement thumbnail generation
- [ ] Add video compression
- [ ] Use cloud storage (S3, GCS)
- [ ] Add video editing features
- [ ] Implement video categories/tags
- [ ] Add video analytics

---

**Enjoy uploading videos! 🎥**


