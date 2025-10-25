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

// Video URL configuration
// Use environment variable to switch between local VPN and public URLs
const USE_VPN_VIDEOS = process.env.USE_VPN_VIDEOS === 'true';
const VIDEO_BASE_URL = USE_VPN_VIDEOS 
  ? 'http://vpn.axon.com.hk' 
  : ''; // Empty string means serve from this server

// Configure multer for video uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = join(__dirname, 'public', 'uploads', 'videos');
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


// Default videos
function getDefaultVideos() {
  return [
  {
    id: '1',
    title: '✨ GRWM Morning Vibes',
    description: 'Starting my day right 🌅 #morningroutine #aesthetic #grwm #dailyvlog',
    videoUrl: `${VIDEO_BASE_URL}/videos/video1.mp4`,
    thumbnailUrl: '',
    viewCount: 12500,
    likeCount: 890,
    isLive: true
  },
  {
    id: '2',
    title: '🎧 Unboxing My New Earbuds!',
    description: 'The sound quality is INSANE 😱 #unboxing #techreview #gadgets #musthave',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    thumbnailUrl: 'https://via.placeholder.com/400x600/4ECDC4/white?text=Video+2',
    viewCount: 8900,
    likeCount: 650,
    isLive: false
  },
  {
    id: '3',
    title: '⌚ My Smart Watch Changed Everything',
    description: 'Game changer for fitness goals 💪 #smartwatch #fitness #tech #productreview',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
    thumbnailUrl: 'https://via.placeholder.com/400x600/95E1D3/white?text=Video+3',
    viewCount: 15600,
    likeCount: 1200,
    isLive: false
  },
  {
    id: '4',
    title: '🎒 Perfect Backpack for Everything',
    description: 'So many pockets! Travel ready ✈️ #backpack #travel #organization #essentials',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    thumbnailUrl: 'https://via.placeholder.com/400x600/F38181/white?text=Video+4',
    viewCount: 7800,
    likeCount: 520,
    isLive: false
  },
  {
    id: '5',
    title: '💆‍♀️ Skincare That Actually Works',
    description: 'My skin has never been better! ✨ #skincare #beauty #glowup #selfcare',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
    thumbnailUrl: 'https://via.placeholder.com/400x600/AA96DA/white?text=Video+5',
    viewCount: 11200,
    likeCount: 980,
    isLive: false
  },
  {
    id: '6',
    title: '🔥 This is a MUST HAVE',
    description: 'Trust me on this one! 💯 #trending #viral #musthave #shopping',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4',
    thumbnailUrl: 'https://via.placeholder.com/400x600/FFB6C1/white?text=Video+6',
    viewCount: 9300,
    likeCount: 720,
    isLive: false
  },
  {
    id: '7',
    title: '💎 Found a Hidden Gem',
    description: 'You need to see this! 😍 #hiddengem #discover #amazing #wow',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4',
    thumbnailUrl: 'https://via.placeholder.com/400x600/87CEEB/white?text=Video+7',
    viewCount: 10500,
    likeCount: 850,
    isLive: false
  },
  {
    id: '8',
    title: '🌟 Trending Right Now',
    description: 'Everyone is getting this! 🛒 #trending #viral #popular #foryou',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4',
    thumbnailUrl: 'https://via.placeholder.com/400x600/98FB98/white?text=Video+8',
    viewCount: 8700,
    likeCount: 690,
    isLive: false
  },
  {
    id: '9',
    title: '👀 Wait Until You See This',
    description: 'Mind = Blown 🤯 #mindblown #amazing #cool #satisfying',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4',
    thumbnailUrl: 'https://via.placeholder.com/400x600/DDA0DD/white?text=Video+9',
    viewCount: 12100,
    likeCount: 940,
    isLive: false
  },
  {
    id: '10',
    title: '💕 My Current Obsession',
    description: 'Can\'t stop using this! 😊 #obsessed #favorite #love #recommendation',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/SubaruOutbackOnStreetAndDirt.mp4',
    thumbnailUrl: 'https://via.placeholder.com/400x600/F0E68C/white?text=Video+10',
    viewCount: 11800,
    likeCount: 900,
    isLive: false
  },
  {
    id: '11',
    title: '🎬 Behind The Scenes',
    description: 'Here\'s how it\'s done! 📸 #bts #behindthescenes #content #creator',
    videoUrl: `${VIDEO_BASE_URL}/videos/video1.mp4`,
    thumbnailUrl: 'https://via.placeholder.com/400x600/FFD700/white?text=Video+11',
    viewCount: 15000,
    likeCount: 1300,
    isLive: false
  }
  ];
}

// Initialize videos with default videos
let videos = getDefaultVideos();

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

    const { title, description, viewCount, likeCount, isLive } = req.body;
    const videoUrl = `/uploads/videos/${req.file.filename}`;
    
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

    videos.push(newVideo);
    res.json(newVideo);
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

  const { title, description, viewCount, likeCount, isLive } = req.body;
  if (title !== undefined) video.title = title;
  if (description !== undefined) video.description = description;
  if (viewCount !== undefined) video.viewCount = parseInt(viewCount);
  if (likeCount !== undefined) video.likeCount = parseInt(likeCount);
  if (isLive !== undefined) video.isLive = isLive === 'true' || isLive === true;

  res.json(video);
});

// Delete video endpoint
app.delete('/api/videos/:id', (req, res) => {
  const videoIndex = videos.findIndex(v => v.id === req.params.id);
  
  if (videoIndex === -1) {
    return res.status(404).json({ error: 'Video not found' });
  }

  const video = videos[videoIndex];
  
  // Delete file if it's an uploaded video
  if (video.videoUrl.startsWith('/uploads/')) {
    const filePath = join(__dirname, 'public', video.videoUrl);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  }

  videos.splice(videoIndex, 1);
  res.json({ success: true, message: 'Video deleted successfully' });
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
  console.log(`📹 Loaded ${videos.length} default videos`);
  console.log(`✅ Upload/Edit/Delete features are enabled`);
});


