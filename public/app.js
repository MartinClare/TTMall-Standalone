// State
let videos = [];
let currentIndex = 0;
let cart = [];
let products = [];

// Initialize
async function init() {
    try {
        // Fetch videos
        const response = await fetch('/api/videos');
        videos = await response.json();
        
        // Render videos
        renderVideos();
        
        // Load cart
        await loadCart();
        
        // Hide loading
        document.querySelector('.loading').style.display = 'none';
        
        // Start playing first video
        playCurrentVideo();
    } catch (error) {
        console.error('Init error:', error);
        document.querySelector('.loading').textContent = '加载失败，请刷新页面';
    }
}

function renderVideos() {
    const container = document.getElementById('videos');
    container.innerHTML = videos.map((video, index) => `
        <div class="video-container" data-index="${index}" data-video-id="${video.id}">
            <video 
                src="${video.videoUrl}" 
                loop 
                muted
                playsinline
            ></video>
            
            <!-- Video Info - TikTok Style -->
            <div class="video-info">
                <div class="video-creator">
                    <span class="creator-name">@ttmall</span>
                </div>
                <div class="video-caption">${video.title} ${video.description ? '- ' + video.description : ''}</div>
                <div class="video-music">
                    <span class="music-icon">♪</span>
                    <span>Original Sound</span>
                </div>
            </div>
            
            <!-- Action Buttons - TikTok Style -->
            <div class="action-buttons">
                <!-- Avatar with Follow -->
                <button class="action-btn" onclick="followCreator(${index})" data-action="avatar">
                    <div style="position: relative;">
                        <div class="action-btn-avatar">
                            <svg viewBox="0 0 24 24" style="width: 24px; height: 24px;">
                                <path fill="currentColor" d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                            </svg>
                        </div>
                        <div class="follow-icon" id="followIcon${index}">+</div>
                    </div>
                </button>
                
                <!-- Like -->
                <button class="action-btn" onclick="likeVideo(${index})" data-action="like">
                    <div class="action-btn-icon">
                        <svg viewBox="0 0 24 24">
                            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                        </svg>
                    </div>
                    <div class="action-btn-count">${formatCount(video.likeCount)}</div>
                </button>
                
                <!-- Comment -->
                <button class="action-btn" onclick="commentVideo(${index})" data-action="comment">
                    <div class="action-btn-icon">
                        <svg viewBox="0 0 24 24">
                            <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z"/>
                        </svg>
                    </div>
                    <div class="action-btn-count">128</div>
                </button>
                
                <!-- Share -->
                <button class="action-btn" onclick="shareVideo(${index})" data-action="share">
                    <div class="action-btn-icon">
                        <svg viewBox="0 0 24 24">
                            <path d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92 1.61 0 2.92-1.31 2.92-2.92s-1.31-2.92-2.92-2.92z"/>
                        </svg>
                    </div>
                    <div class="action-btn-count">45</div>
                </button>
                
                <!-- Shop -->
                <button class="action-btn" onclick="showProducts()" data-action="shop">
                    <div class="action-btn-icon">
                        <svg viewBox="0 0 24 24">
                            <path d="M7 18c-1.1 0-1.99.9-1.99 2S5.9 22 7 22s2-.9 2-2-.9-2-2-2zM1 2v2h2l3.6 7.59-1.35 2.45c-.16.28-.25.61-.25.96 0 1.1.9 2 2 2h12v-2H7.42c-.14 0-.25-.11-.25-.25l.03-.12.9-1.63h7.45c.75 0 1.41-.41 1.75-1.03l3.58-6.49c.08-.14.12-.31.12-.48 0-.55-.45-1-1-1H5.21l-.94-2H1zm16 16c-1.1 0-1.99.9-1.99 2s.89 2 1.99 2 2-.9 2-2-.9-2-2-2z"/>
                        </svg>
                    </div>
                </button>
            </div>
        </div>
    `).join('');
    
    setupScrollListener();
    setupNavigationControls();
}

function formatCount(count) {
    if (count >= 1000000) {
        return (count / 1000000).toFixed(1) + 'M';
    } else if (count >= 1000) {
        return (count / 1000).toFixed(1) + 'K';
    }
    return count.toString();
}

// Scroll indicator removed for true TikTok style

// Video interaction functions
function likeVideo(index) {
    const video = videos[index];
    const container = document.querySelector(`.video-container[data-index="${index}"]`);
    const likeBtn = container.querySelector('[data-action="like"]');
    
    if (likeBtn.classList.contains('liked')) {
        // Unlike
        video.likeCount = Math.max(0, (video.likeCount || 0) - 1);
        likeBtn.classList.remove('liked');
    } else {
        // Like
        video.likeCount = (video.likeCount || 0) + 1;
        likeBtn.classList.add('liked');
        
        // Add animation
        likeBtn.style.transform = 'scale(1.2)';
        setTimeout(() => {
            likeBtn.style.transform = '';
        }, 200);
    }
    
    likeBtn.querySelector('.action-btn-count').textContent = formatCount(video.likeCount);
}

function commentVideo(index) {
    alert('💬 Comment feature - Coming soon!');
}

function shareVideo(index) {
    const video = videos[index];
    if (navigator.share) {
        navigator.share({
            title: video.title,
            text: video.description,
            url: window.location.href
        }).catch(err => console.log('Share cancelled'));
    } else {
        alert('📤 Share: ' + video.title);
    }
}

function followCreator(index) {
    const followIcon = document.getElementById(`followIcon${index}`);
    if (followIcon.style.display === 'none') {
        followIcon.style.display = 'flex';
    } else {
        followIcon.style.display = 'none';
    }
}

function setupScrollListener() {
    const videosContainer = document.getElementById('videos');
    let scrollTimeout;
    
    videosContainer.addEventListener('scroll', () => {
        clearTimeout(scrollTimeout);
        scrollTimeout = setTimeout(() => {
            updateCurrentVideoIndex();
        }, 150);
    });
    
    // Initial video play
    setTimeout(() => {
        playCurrentVideo();
    }, 500);
}

function updateCurrentVideoIndex() {
    const videosContainer = document.getElementById('videos');
    const scrollTop = videosContainer.scrollTop;
    const windowHeight = window.innerHeight;
    
    // Calculate which video is currently in view
    const newIndex = Math.round(scrollTop / windowHeight);
    
    if (newIndex !== currentIndex && newIndex >= 0 && newIndex < videos.length) {
        currentIndex = newIndex;
        playCurrentVideo();
    }
}

function playCurrentVideo() {
    const containers = document.querySelectorAll('.video-container');
    containers.forEach((container, index) => {
        const videoEl = container.querySelector('video');
        if (index === currentIndex) {
            videoEl.play().catch(e => console.log('Play error:', e));
        } else {
            videoEl.pause();
            videoEl.currentTime = 0;
        }
    });
}

function scrollToVideo(index) {
    if (index >= 0 && index < videos.length) {
        const videosContainer = document.getElementById('videos');
        const targetScroll = index * window.innerHeight;
        videosContainer.scrollTo({
            top: targetScroll,
            behavior: 'smooth'
        });
    }
}

function nextVideo() {
    if (currentIndex < videos.length - 1) {
        scrollToVideo(currentIndex + 1);
    }
}

function prevVideo() {
    if (currentIndex > 0) {
        scrollToVideo(currentIndex - 1);
    }
}

// Keyboard navigation
document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowDown') {
        e.preventDefault();
        nextVideo();
    }
    if (e.key === 'ArrowUp') {
        e.preventDefault();
        prevVideo();
    }
});

// Setup navigation controls
function setupNavigationControls() {
    const videosContainer = document.getElementById('videos');
    let isScrolling = false;
    let touchStartY = 0;
    let touchEndY = 0;

    // Mouse wheel navigation with throttle
    videosContainer.addEventListener('wheel', (e) => {
        if (isScrolling) return;
        
        e.preventDefault();
        isScrolling = true;
        
        if (Math.abs(e.deltaY) > 10) {
            if (e.deltaY > 0) {
                nextVideo();
            } else {
                prevVideo();
            }
        }
        
        setTimeout(() => {
            isScrolling = false;
        }, 800);
    });

    // Touch swipe gestures for mobile
    videosContainer.addEventListener('touchstart', (e) => {
        touchStartY = e.changedTouches[0].screenY;
    }, { passive: true });

    videosContainer.addEventListener('touchend', (e) => {
        touchEndY = e.changedTouches[0].screenY;
        handleSwipe();
    }, { passive: true });

    function handleSwipe() {
        const swipeThreshold = 50;
        const diff = touchStartY - touchEndY;
        
        if (Math.abs(diff) > swipeThreshold) {
            if (diff > 0) {
                // Swipe up - next video
                nextVideo();
            } else {
                // Swipe down - previous video
                prevVideo();
            }
        }
    }
}

// Products
async function showProducts() {
    const video = videos[currentIndex];
    const response = await fetch(`/api/videos/${video.id}/products`);
    products = await response.json();
    
    const listEl = document.getElementById('productsList');
    listEl.innerHTML = products.map(product => `
        <div class="product-item">
            <img src="${product.imageUrl}" alt="${product.name}" class="product-image">
            <div class="product-details">
                <div class="product-name">${product.name}</div>
                <div class="product-desc">${product.description}</div>
                <div class="product-price">
                    ¥${(product.price / 100).toFixed(2)}
                    ${product.originalPrice ? `<span style="text-decoration: line-through; color: #999; font-size: 14px; margin-left: 10px;">¥${(product.originalPrice / 100).toFixed(2)}</span>` : ''}
                </div>
                <button class="add-cart-btn" onclick="addToCart('${product.id}')">加购</button>
            </div>
        </div>
    `).join('');
    
    document.getElementById('productsModal').classList.add('show');
}

function hideProducts() {
    document.getElementById('productsModal').classList.remove('show');
}

async function addToCart(productId) {
    try {
        await fetch('/api/cart', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ productId, quantity: 1 })
        });
        
        await loadCart();
        alert('已加入购物车！');
    } catch (error) {
        alert('添加失败，请重试');
    }
}

async function loadCart() {
    const response = await fetch('/api/cart');
    cart = await response.json();
    updateCartBadge();
}

function updateCartBadge() {
    const badge = document.getElementById('cartBadge');
    const count = cart.reduce((sum, item) => sum + item.quantity, 0);
    
    if (count > 0) {
        badge.textContent = count;
        badge.style.display = 'flex';
    } else {
        badge.style.display = 'none';
    }
}

function showCart() {
    renderCart();
    document.getElementById('cartPage').classList.add('show');
}

function hideCart() {
    document.getElementById('cartPage').classList.remove('show');
}

function renderCart() {
    const content = document.getElementById('cartContent');
    
    if (cart.length === 0) {
        content.innerHTML = `
            <div class="empty-message">
                <div style="font-size: 60px; margin-bottom: 20px;">🛒</div>
                <div>购物车是空的</div>
            </div>
        `;
        return;
    }
    
    const total = cart.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
    
    content.innerHTML = `
        ${cart.map(item => `
            <div class="cart-item">
                <img src="${item.product.imageUrl}" alt="${item.product.name}" class="product-image">
                <div class="product-details">
                    <div class="product-name">${item.product.name}</div>
                    <div class="product-price">¥${(item.product.price / 100).toFixed(2)}</div>
                    <div style="display: flex; align-items: center; gap: 10px; margin-top: 10px;">
                        <button onclick="updateQuantity('${item.id}', ${item.quantity - 1})" style="padding: 5px 10px; border-radius: 5px; border: 1px solid #ddd; background: #fff; cursor: pointer;">−</button>
                        <span>${item.quantity}</span>
                        <button onclick="updateQuantity('${item.id}', ${item.quantity + 1})" style="padding: 5px 10px; border-radius: 5px; border: 1px solid #ddd; background: #fff; cursor: pointer;">+</button>
                        <button onclick="removeFromCart('${item.id}')" style="padding: 5px 10px; border-radius: 5px; border: 1px solid #ff4458; color: #ff4458; background: #fff; cursor: pointer; margin-left: auto;">删除</button>
                    </div>
                </div>
            </div>
        `).join('')}
        
        <div style="background: #fff; padding: 20px; border-radius: 8px; margin-top: 20px;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
                <span style="font-size: 16px; color: #000;">总计:</span>
                <span style="font-size: 24px; font-weight: bold; color: #ff4458;">¥${(total / 100).toFixed(2)}</span>
            </div>
            <button class="checkout-btn" onclick="checkout()">去结算</button>
        </div>
    `;
}

async function updateQuantity(itemId, quantity) {
    if (quantity <= 0) {
        await removeFromCart(itemId);
        return;
    }
    
    await fetch(`/api/cart/${itemId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ quantity })
    });
    
    await loadCart();
    renderCart();
}

async function removeFromCart(itemId) {
    await fetch(`/api/cart/${itemId}`, { method: 'DELETE' });
    await loadCart();
    renderCart();
}

function checkout() {
    const name = prompt('请输入收货人姓名:');
    if (!name) return;
    
    const phone = prompt('请输入手机号:');
    if (!phone) return;
    
    const address = prompt('请输入收货地址:');
    if (!address) return;
    
    createOrder(name, phone, address);
}

async function createOrder(name, phone, address) {
    try {
        const items = cart.map(item => ({
            productId: item.productId,
            quantity: item.quantity
        }));
        
        const response = await fetch('/api/orders', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                items,
                shippingName: name,
                shippingPhone: phone,
                shippingAddress: address
            })
        });
        
        const order = await response.json();
        
        alert(`订单创建成功！\n订单号: ${order.id}\n总金额: ¥${(order.totalAmount / 100).toFixed(2)}`);
        
        await loadCart();
        hideCart();
    } catch (error) {
        alert('订单创建失败，请重试');
    }
}

// Start the app
init();



