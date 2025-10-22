# Video Upload API Guide

## Overview

The TTMall application now supports video file uploads through a RESTful API endpoint.

## Upload Video Endpoint

### `POST /api/videos/upload`

Upload a video file with metadata.

**Headers:**
- `Content-Type: multipart/form-data`

**Form Data Parameters:**
- `video` (file, required): The video file to upload
- `title` (string, required): Title of the video
- `description` (string, optional): Description of the video

**File Constraints:**
- Maximum file size: 100MB
- Accepted formats: MP4, WebM, MOV, AVI, and other standard video formats
- Only video MIME types are allowed (video/*)

**Response (Success - 200):**
```json
{
  "success": true,
  "video": {
    "id": "video_1729445678901",
    "title": "My Awesome Video",
    "description": "This is a great video",
    "videoUrl": "/uploads/videos/1729445678901-123456789-myvideo.mp4",
    "thumbnailUrl": "https://via.placeholder.com/400x600/6C63FF/white?text=Uploaded",
    "viewCount": 0,
    "likeCount": 0,
    "isLive": false,
    "uploadedAt": "2024-10-20T12:34:56.789Z"
  },
  "message": "Video uploaded successfully"
}
```

**Response (Error - 400):**
```json
{
  "error": "No video file uploaded"
}
```

**Response (Error - 500):**
```json
{
  "error": "Failed to upload video"
}
```

## Delete Video Endpoint

### `DELETE /api/videos/:id`

Delete a video by ID.

**Parameters:**
- `id` (string): The video ID

**Response (Success - 200):**
```json
{
  "success": true,
  "message": "Video deleted successfully"
}
```

**Response (Error - 404):**
```json
{
  "error": "Video not found"
}
```

## Usage Examples

### Using cURL

```bash
# Upload a video
curl -X POST http://localhost:3000/api/videos/upload \
  -F "video=@/path/to/your/video.mp4" \
  -F "title=My Video Title" \
  -F "description=This is my video description"

# Delete a video
curl -X DELETE http://localhost:3000/api/videos/video_1729445678901
```

### Using JavaScript (Fetch API)

```javascript
// Upload video
const formData = new FormData();
formData.append('video', videoFile); // videoFile is a File object
formData.append('title', 'My Video Title');
formData.append('description', 'My video description');

const response = await fetch('/api/videos/upload', {
  method: 'POST',
  body: formData
});

const result = await response.json();
console.log(result);
```

### Using Postman

1. Set method to `POST`
2. Enter URL: `http://localhost:3000/api/videos/upload`
3. Go to "Body" tab
4. Select "form-data"
5. Add keys:
   - `video` (type: File) - select your video file
   - `title` (type: Text) - enter video title
   - `description` (type: Text) - enter description
6. Click "Send"

### Using the Web Interface

Simply navigate to `http://localhost:3000/upload.html` in your browser to use the built-in upload interface.

## Storage

- Uploaded videos are stored in: `public/uploads/videos/`
- Files are named with a timestamp and random suffix to prevent conflicts
- Videos are immediately accessible via the URL returned in the response

## Notes

- **In-Memory Storage**: Video metadata is stored in memory. Restart the server will reset the video list (but uploaded files remain on disk).
- **Production**: For production use, consider:
  - Using a database to persist video metadata
  - Implementing authentication/authorization
  - Adding video processing (compression, thumbnails generation)
  - Using cloud storage (AWS S3, Google Cloud Storage, etc.)
  - Implementing rate limiting
  - Adding virus scanning for uploaded files

## Web Interface Features

The upload page (`/upload.html`) includes:
- ✅ Drag and drop support (via file input)
- ✅ File size validation
- ✅ Upload progress bar
- ✅ Real-time feedback
- ✅ Automatic redirect after successful upload
- ✅ Responsive design
- ✅ File type validation

## Error Handling

Common errors and solutions:

| Error | Cause | Solution |
|-------|-------|----------|
| "No video file uploaded" | No file in request | Ensure you're sending the file with key "video" |
| "Only video files are allowed!" | Wrong file type | Upload only video files (MP4, WebM, etc.) |
| File size exceeds limit | File > 100MB | Compress video or split into smaller parts |
| "Failed to upload video" | Server error | Check server logs for details |

## Integration Example

Here's a complete example of integrating video upload into your app:

```javascript
async function uploadVideo(file, title, description) {
  const formData = new FormData();
  formData.append('video', file);
  formData.append('title', title);
  formData.append('description', description);

  try {
    const response = await fetch('/api/videos/upload', {
      method: 'POST',
      body: formData
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error);
    }

    const result = await response.json();
    console.log('Upload successful:', result);
    return result.video;
  } catch (error) {
    console.error('Upload failed:', error);
    throw error;
  }
}

// Usage
const fileInput = document.getElementById('videoInput');
const file = fileInput.files[0];
const video = await uploadVideo(file, 'My Title', 'My Description');
console.log('Video URL:', video.videoUrl);
```

## Security Considerations

For production deployment:

1. **File Validation**: Currently only checks MIME type. Consider adding:
   - Magic number validation
   - File extension validation
   - Virus scanning

2. **Authentication**: Add user authentication before allowing uploads

3. **Rate Limiting**: Implement rate limiting to prevent abuse

4. **Storage**: Move to cloud storage for scalability

5. **HTTPS**: Always use HTTPS in production

6. **Input Sanitization**: Sanitize title and description to prevent XSS

## Support

For issues or questions:
- Check the console logs for detailed error messages
- Ensure the `public/uploads/videos/` directory exists and is writable
- Verify file size is under 100MB
- Confirm file is a valid video format


