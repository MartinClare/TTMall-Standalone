import express from 'express';
import cors from 'cors';
import multer from 'multer';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Configure multer for video uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = join(__dirname, 'public', 'videos');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + '-' + file.originalname);
  }
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 100 * 1024 * 1024 }, // 100MB limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('video/')) {
      cb(null, true);
    } else {
      cb(new Error('Only video files are allowed!'), false);
    }
  }
});

// Middleware
app.use(cors());
app.use(express.json());

// Serve static files with proper caching headers
app.use(express.static('public', {
  setHeaders: (res, path) => {
    // Disable caching for HTML and JS files to ensure updates are picked up
    if (path.endsWith('.html') || path.endsWith('.js')) {
      res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
      res.setHeader('Pragma', 'no-cache');
      res.setHeader('Expires', '0');
    }
  }
}));


// Videos data file path
const VIDEOS_DATA_FILE = join(__dirname, 'videos-data.json');

// View tracking data file path
const VIEWS_DATA_FILE = join(__dirname, 'views-data.json');

// Get videos from videos-data.json file (always reads from disk)
function getVideos() {
  try {
    if (fs.existsSync(VIDEOS_DATA_FILE)) {
      const data = fs.readFileSync(VIDEOS_DATA_FILE, 'utf8');
      return JSON.parse(data);
    } else {
      return [];
    }
  } catch (error) {
    console.error('Error loading videos from file:', error);
    return [];
  }
}

// Save videos to file
function saveVideos(videosArray) {
  try {
    fs.writeFileSync(VIDEOS_DATA_FILE, JSON.stringify(videosArray, null, 2), 'utf8');
    console.log(`💾 Saved ${videosArray.length} videos to videos-data.json`);
  } catch (error) {
    console.error('Error saving videos to file:', error);
  }
}

// Get view tracking data (device-video mappings)
function getViews() {
  try {
    if (fs.existsSync(VIEWS_DATA_FILE)) {
      const data = fs.readFileSync(VIEWS_DATA_FILE, 'utf8');
      return JSON.parse(data);
    } else {
      return {};
    }
  } catch (error) {
    console.error('Error loading views from file:', error);
    return {};
  }
}

// Save view tracking data
function saveViews(viewsData) {
  try {
    fs.writeFileSync(VIEWS_DATA_FILE, JSON.stringify(viewsData, null, 2), 'utf8');
  } catch (error) {
    console.error('Error saving views to file:', error);
  }
}

// Products data file path
const PRODUCTS_DATA_FILE = join(__dirname, 'products-data.json');

// Default products
function getDefaultProducts() {
  return [
  {
    id: 'p1',
    videoId: '1',
    name: '时尚运动鞋',
    description: '超轻超舒适，透气网面设计',
    price: 29900,
    originalPrice: 39900,
    imageUrl: 'https://via.placeholder.com/200/FF6B6B/white?text=Shoes',
    stock: 100
  },
  {
    id: 'p2',
    videoId: '2',
    name: '无线蓝牙耳机',
    description: '降噪功能，音质出众',
    price: 19900,
    originalPrice: 29900,
    imageUrl: 'https://via.placeholder.com/200/4ECDC4/white?text=Earbuds',
    stock: 150
  },
  {
    id: 'p3',
    videoId: '3',
    name: '智能手表',
    description: '多功能运动追踪，健康监测',
    price: 89900,
    originalPrice: 119900,
    imageUrl: 'https://via.placeholder.com/200/95E1D3/white?text=Watch',
    stock: 50
  },
  {
    id: 'p4',
    videoId: '4',
    name: '时尚背包',
    description: '大容量，多口袋设计',
    price: 15900,
    originalPrice: 21900,
    imageUrl: 'https://via.placeholder.com/200/F38181/white?text=Backpack',
    stock: 80
  },
  {
    id: 'p5',
    videoId: '5',
    name: '护肤套装',
    description: '深层滋养，改善肤质',
    price: 25900,
    originalPrice: 35900,
    imageUrl: 'https://via.placeholder.com/200/AA96DA/white?text=Skincare',
    stock: 120
  }
];
}

// Load products from file or use defaults
function loadProducts() {
  try {
    if (fs.existsSync(PRODUCTS_DATA_FILE)) {
      const data = fs.readFileSync(PRODUCTS_DATA_FILE, 'utf8');
      const savedProducts = JSON.parse(data);
      console.log(`📦 Loaded ${savedProducts.length} products from file`);
      return savedProducts;
    }
  } catch (error) {
    console.error('Error loading products from file:', error);
  }
  return getDefaultProducts();
}

// Save products to file
function saveProducts() {
  try {
    fs.writeFileSync(PRODUCTS_DATA_FILE, JSON.stringify(products, null, 2), 'utf8');
    console.log(`💾 Saved ${products.length} products to file`);
  } catch (error) {
    console.error('Error saving products to file:', error);
  }
}

// Initialize products with default products or loaded data
let products = loadProducts();

// In-memory storage
let cart = [];
let orders = [];

// API Routes
app.get('/api/videos', (req, res) => {
  const videos = getVideos();
  res.json(videos);
});

// Get deployment/sync information
app.get('/api/deployment-info', (req, res) => {
  // Get package.json modification time as proxy for last deployment
  const packageJsonPath = join(__dirname, 'package.json');
  let lastSyncTime = null;
  
  try {
    if (fs.existsSync(packageJsonPath)) {
      const stats = fs.statSync(packageJsonPath);
      lastSyncTime = stats.mtime.toISOString();
    } else {
      // Fallback to server.js or current time
      const serverPath = join(__dirname, 'server.js');
      if (fs.existsSync(serverPath)) {
        const stats = fs.statSync(serverPath);
        lastSyncTime = stats.mtime.toISOString();
      } else {
        lastSyncTime = new Date().toISOString();
      }
    }
  } catch (error) {
    console.error('Error getting deployment info:', error);
    lastSyncTime = new Date().toISOString();
  }
  
  res.json({
    lastSyncTime: lastSyncTime,
    buildTime: lastSyncTime
  });
});

// Upload video endpoint (file upload)
app.post('/api/videos/upload', upload.single('video'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No video file uploaded' });
    }

    const { title, description, viewCount, likeCount, isLive } = req.body;
    const videoUrl = `/videos/${req.file.filename}`;
    
    const newVideo = {
      id: Date.now().toString(),
      title: title || 'Untitled Video',
      description: description || '',
      videoUrl,
      thumbnailUrl: '',
      viewCount: parseInt(viewCount) || 0,
      likeCount: parseInt(likeCount) || 0,
      isLive: isLive === 'true' || isLive === true || false
    };

    // Read from file, add new video, save back
    const videos = getVideos();
    videos.push(newVideo);
    saveVideos(videos); // Persist to file
    res.json(newVideo);
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: 'Failed to upload video' });
  }
});

// Add video with public URL endpoint
app.post('/api/videos/add-url', (req, res) => {
  try {
    const { videoUrl, title, description, viewCount, likeCount, isLive } = req.body;
    
    if (!videoUrl || !videoUrl.trim()) {
      return res.status(400).json({ error: 'Video URL is required' });
    }

    // Validate URL format
    try {
      new URL(videoUrl);
    } catch (e) {
      return res.status(400).json({ error: 'Invalid URL format' });
    }
    
    const newVideo = {
      id: Date.now().toString(),
      title: title || 'Untitled Video',
      description: description || '',
      videoUrl: videoUrl.trim(),
      thumbnailUrl: '',
      viewCount: parseInt(viewCount) || 0,
      likeCount: parseInt(likeCount) || 0,
      isLive: isLive === 'true' || isLive === true || false
    };

    // Read from file, add new video, save back
    const videos = getVideos();
    videos.push(newVideo);
    saveVideos(videos); // Persist to file
    res.json(newVideo);
  } catch (error) {
    console.error('Add URL error:', error);
    res.status(500).json({ error: 'Failed to add video' });
  }
});

// Update video endpoint
app.put('/api/videos/:id', (req, res) => {
  // Read from file
  const videos = getVideos();
  const video = videos.find(v => v.id === req.params.id);
  
  if (!video) {
    return res.status(404).json({ error: 'Video not found' });
  }

  const { title, description, viewCount, likeCount, isLive } = req.body;
  if (title !== undefined) video.title = title;
  if (description !== undefined) video.description = description;
  if (viewCount !== undefined) video.viewCount = parseInt(viewCount);
  if (likeCount !== undefined) video.likeCount = parseInt(likeCount);
  if (isLive !== undefined) video.isLive = isLive === 'true' || isLive === true;

  saveVideos(videos); // Persist to file
  res.json(video);
});

// Like/Unlike video endpoint
app.post('/api/videos/:id/like', (req, res) => {
  // Read from file
  const videos = getVideos();
  const video = videos.find(v => v.id === req.params.id);
  
  if (!video) {
    return res.status(404).json({ error: 'Video not found' });
  }

  const { action } = req.body; // 'like' or 'unlike'
  
  if (action === 'like') {
    video.likeCount = (video.likeCount || 0) + 1;
  } else if (action === 'unlike') {
    video.likeCount = Math.max(0, (video.likeCount || 0) - 1);
  }

  saveVideos(videos); // Persist to file
  res.json({ success: true, likeCount: video.likeCount });
});

// Track video view endpoint
app.post('/api/videos/:id/view', (req, res) => {
  const { deviceId } = req.body;
  
  if (!deviceId) {
    return res.status(400).json({ error: 'Device ID is required' });
  }

  // Read from file
  const videos = getVideos();
  const video = videos.find(v => v.id === req.params.id);
  
  if (!video) {
    return res.status(404).json({ error: 'Video not found' });
  }

  // Load view tracking data (structure: { videoId: { deviceId: { viewedAt } } })
  const views = getViews();
  const videoId = req.params.id;
  
  // Initialize video entry if it doesn't exist
  if (!views[videoId]) {
    views[videoId] = {};
  }
  
  // Check if this device has already viewed this video
  if (!views[videoId][deviceId]) {
    // First view from this device - increment viewCount
    video.viewCount = (video.viewCount || 0) + 1;
    saveVideos(videos);
    
    // Mark this device as having viewed this video
    views[videoId][deviceId] = {
      viewedAt: new Date().toISOString()
    };
    saveViews(views);
    
    res.json({ 
      success: true, 
      viewCount: video.viewCount,
      isNewView: true 
    });
  } else {
    // Device has already viewed this video
    res.json({ 
      success: true, 
      viewCount: video.viewCount,
      isNewView: false 
    });
  }
});

// Check if device has viewed a video endpoint
app.get('/api/videos/:id/view/:deviceId', (req, res) => {
  const { id: videoId, deviceId } = req.params;
  
  // Load view tracking data (structure: { videoId: { deviceId: { viewedAt } } })
  const views = getViews();
  
  // Check if this device has viewed this video
  const hasViewed = !!(views[videoId] && views[videoId][deviceId]);
  
  if (hasViewed) {
    res.json({
      success: true,
      hasViewed: true,
      viewInfo: {
        deviceId,
        videoId,
        ...views[videoId][deviceId]
      }
    });
  } else {
    res.json({
      success: true,
      hasViewed: false
    });
  }
});

// Delete video endpoint
app.delete('/api/videos/:id', (req, res) => {
  // Read from file
  const videos = getVideos();
  const videoIndex = videos.findIndex(v => v.id === req.params.id);
  
  if (videoIndex === -1) {
    return res.status(404).json({ error: 'Video not found' });
  }

  const video = videos[videoIndex];
  
  // Delete file if it's an uploaded video (local server file)
  if (video.videoUrl.startsWith('/videos/') || video.videoUrl.startsWith('/uploads/')) {
    const filePath = join(__dirname, 'public', video.videoUrl);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  }

  // Delete view tracking data for this video
  const views = getViews();
  if (views[req.params.id]) {
    delete views[req.params.id];
    saveViews(views);
  }

  videos.splice(videoIndex, 1);
  saveVideos(videos); // Persist to file
  res.json({ success: true, message: 'Video deleted successfully' });
});

// Get all products
app.get('/api/products', (req, res) => {
  res.json(products);
});

// Get products for a specific video
app.get('/api/videos/:id/products', (req, res) => {
  const videoProducts = products.filter(p => p.videoId === req.params.id);
  res.json(videoProducts);
});

// Create new product
app.post('/api/products', (req, res) => {
  const { videoId, name, description, price, originalPrice, imageUrl, stock } = req.body;
  
  const newProduct = {
    id: `p${Date.now()}`,
    videoId,
    name: name || 'New Product',
    description: description || '',
    price: parseInt(price) || 0,
    originalPrice: parseInt(originalPrice) || 0,
    imageUrl: imageUrl || '',
    stock: parseInt(stock) || 0
  };
  
  products.push(newProduct);
  saveProducts(); // Persist to file
  res.json(newProduct);
});

// Update product
app.put('/api/products/:id', (req, res) => {
  const product = products.find(p => p.id === req.params.id);
  
  if (!product) {
    return res.status(404).json({ error: 'Product not found' });
  }
  
  const { videoId, name, description, price, originalPrice, imageUrl, stock } = req.body;
  
  if (videoId !== undefined) product.videoId = videoId;
  if (name !== undefined) product.name = name;
  if (description !== undefined) product.description = description;
  if (price !== undefined) product.price = parseInt(price);
  if (originalPrice !== undefined) product.originalPrice = parseInt(originalPrice);
  if (imageUrl !== undefined) product.imageUrl = imageUrl;
  if (stock !== undefined) product.stock = parseInt(stock);
  
  saveProducts(); // Persist to file
  res.json(product);
});

// Delete product
app.delete('/api/products/:id', (req, res) => {
  const productIndex = products.findIndex(p => p.id === req.params.id);
  
  if (productIndex === -1) {
    return res.status(404).json({ error: 'Product not found' });
  }
  
  products.splice(productIndex, 1);
  saveProducts(); // Persist to file
  res.json({ success: true, message: 'Product deleted successfully' });
});

app.get('/api/cart', (req, res) => {
  res.json(cart);
});

app.post('/api/cart', (req, res) => {
  const { productId, quantity = 1 } = req.body;
  const product = products.find(p => p.id === productId);
  
  if (!product) {
    return res.status(404).json({ error: 'Product not found' });
  }

  const existingItem = cart.find(item => item.productId === productId);
  
  if (existingItem) {
    existingItem.quantity += quantity;
  } else {
    cart.push({
      id: `cart_${Date.now()}`,
      productId,
      quantity,
      product
    });
  }
  
  res.json({ success: true, cart });
});

app.put('/api/cart/:id', (req, res) => {
  const { quantity } = req.body;
  const item = cart.find(i => i.id === req.params.id);
  
  if (item) {
    item.quantity = quantity;
    res.json({ success: true, item });
  } else {
    res.status(404).json({ error: 'Cart item not found' });
  }
});

app.delete('/api/cart/:id', (req, res) => {
  cart = cart.filter(item => item.id !== req.params.id);
  res.json({ success: true });
});

app.get('/api/orders', (req, res) => {
  res.json(orders);
});

app.post('/api/orders', (req, res) => {
  const { items, shippingName, shippingPhone, shippingAddress } = req.body;
  
  const totalAmount = items.reduce((sum, item) => {
    const product = products.find(p => p.id === item.productId);
    return sum + (product.price * item.quantity);
  }, 0);
  
  const order = {
    id: `order_${Date.now()}`,
    items,
    totalAmount,
    shippingName,
    shippingPhone,
    shippingAddress,
    status: 'pending',
    createdAt: new Date().toISOString()
  };
  
  orders.push(order);
  cart = []; // Clear cart after order
  
  res.json(order);
});

app.post('/api/orders/:id/pay', (req, res) => {
  const order = orders.find(o => o.id === req.params.id);
  
  if (order) {
    order.status = 'paid';
    order.paidAt = new Date().toISOString();
    res.json({ success: true, order });
  } else {
    res.status(404).json({ error: 'Order not found' });
  }
});

// Serve index.html for all other routes
app.get('*', (req, res) => {
  res.sendFile(join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  const videos = getVideos();
  console.log(`✅ Server running at http://localhost:${PORT}`);
  console.log(`📱 Open http://localhost:${PORT} in your browser`);
  console.log(`📹 Loaded ${videos.length} videos from videos-data.json`);
  console.log(`📦 Loaded ${products.length} products`);
  console.log(`✅ Upload/Edit/Delete features are enabled`);
  console.log(`💾 Videos: Always read/write from videos-data.json (no in-memory storage)`);
});


