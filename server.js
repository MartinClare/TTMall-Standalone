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

// Data file path
const DATA_FILE = join(__dirname, 'videos-data.json');

// Configure multer for video uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'public/uploads/videos/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + '-' + file.originalname);
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 100 * 1024 * 1024 // 100MB limit
  },
  fileFilter: (req, file, cb) => {
    // Accept video files only
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
app.use(express.static('public'));

// Load videos from file or use default data
function loadVideos() {
  try {
    if (fs.existsSync(DATA_FILE)) {
      const data = fs.readFileSync(DATA_FILE, 'utf8');
      return JSON.parse(data);
    }
  } catch (error) {
    console.error('Error loading videos:', error);
  }
  return getDefaultVideos();
}

// Save videos to file
function saveVideos() {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(videos, null, 2), 'utf8');
  } catch (error) {
    console.error('Error saving videos:', error);
  }
}

// Default videos
function getDefaultVideos() {
  return [
  {
    id: '1',
    title: 'From the Window',
    description: 'I saw a wonderful view ！',
    videoUrl: 'http://vpn.axon.com.hk/Download01.mp4',
    thumbnailUrl: '',
    viewCount: 12500,
    likeCount: 890,
    isLive: false
  },
  {
    id: '2',
    title: '无线蓝牙耳机开箱',
    description: '音质超棒，性价比之王！',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
    thumbnailUrl: 'https://via.placeholder.com/400x600/4ECDC4/white?text=Video+2',
    viewCount: 8900,
    likeCount: 650,
    isLive: false
  },
  {
    id: '3',
    title: '智能手表体验',
    description: '功能强大，续航持久！',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    thumbnailUrl: 'https://via.placeholder.com/400x600/95E1D3/white?text=Video+3',
    viewCount: 15600,
    likeCount: 1200,
    isLive: false
  },
  {
    id: '4',
    title: '时尚背包推荐',
    description: '大容量，超耐用！',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
    thumbnailUrl: 'https://via.placeholder.com/400x600/F38181/white?text=Video+4',
    viewCount: 7800,
    likeCount: 520,
    isLive: false
  },
  {
    id: '5',
    title: '护肤套装评测',
    description: '效果惊人，皮肤水润！',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4',
    thumbnailUrl: 'https://via.placeholder.com/400x600/AA96DA/white?text=Video+5',
    viewCount: 11200,
    likeCount: 980,
    isLive: false
  }
  ];
}

// Initialize videos from file
let videos = loadVideos();

const products = [
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

// In-memory storage
let cart = [];
let orders = [];

// API Routes
app.get('/api/videos', (req, res) => {
  res.json(videos);
});

// Upload video endpoint
app.post('/api/videos/upload', upload.single('video'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No video file uploaded' });
    }

    const { title, description } = req.body;
    
    const newVideo = {
      id: `video_${Date.now()}`,
      title: title || 'Untitled Video',
      description: description || 'No description',
      videoUrl: `/uploads/videos/${req.file.filename}`,
      thumbnailUrl: 'https://via.placeholder.com/400x600/6C63FF/white?text=Uploaded',
      viewCount: 0,
      likeCount: 0,
      isLive: false,
      uploadedAt: new Date().toISOString()
    };

    videos.push(newVideo);
    saveVideos(); // Save to file

    res.json({
      success: true,
      video: newVideo,
      message: 'Video uploaded successfully'
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: 'Failed to upload video' });
  }
});

// Update video endpoint
app.put('/api/videos/:id', (req, res) => {
  const video = videos.find(v => v.id === req.params.id);
  
  if (!video) {
    return res.status(404).json({ error: 'Video not found' });
  }

  const { title, description, viewCount, likeCount } = req.body;
  
  if (title) video.title = title;
  if (description !== undefined) video.description = description;
  if (viewCount !== undefined) video.viewCount = parseInt(viewCount) || 0;
  if (likeCount !== undefined) video.likeCount = parseInt(likeCount) || 0;

  saveVideos(); // Save to file

  res.json({
    success: true,
    video,
    message: 'Video updated successfully'
  });
});

// Delete video endpoint
app.delete('/api/videos/:id', (req, res) => {
  const index = videos.findIndex(v => v.id === req.params.id);
  
  if (index !== -1) {
    videos.splice(index, 1);
    saveVideos(); // Save to file
    res.json({ success: true, message: 'Video deleted successfully' });
  } else {
    res.status(404).json({ error: 'Video not found' });
  }
});

app.get('/api/videos/:id/products', (req, res) => {
  const videoProducts = products.filter(p => p.videoId === req.params.id);
  res.json(videoProducts);
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
  console.log(`✅ Server running at http://localhost:${PORT}`);
  console.log(`📱 Open http://localhost:${PORT} in your browser`);
  console.log(`📹 Loaded ${videos.length} videos (${videos.filter(v => v.uploadedAt).length} uploaded)`);
});


