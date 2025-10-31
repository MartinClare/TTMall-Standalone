// State
let videos = [];
let currentIndex = 0;
let cart = [];
let products = [];
let trackedVideoViews = new Set(); // Track which videos we've already tracked in this session
let globalMuted = true; // Global mute state - starts as muted for autoplay
let memoryCheckInterval = null; // Memory check interval

// Device ID - unique identifier for this device
let deviceId = localStorage.getItem('deviceId');
if (!deviceId) {
  deviceId = 'device_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  localStorage.setItem('deviceId', deviceId);
}

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
        
        // Update sound button icon to reflect initial state
        updateSoundButtonIcon();
        
        // Start memory monitoring
        startMemoryMonitoring();
        
        // Start playing first video
        playCurrentVideo();
    } catch (error) {
        console.error('Init error:', error);
        document.querySelector('.loading').textContent = '加载失败，请刷新页面';
    }
}

function renderVideos() {
    const container = document.getElementById('videos');
    // Render all videos but use lazy loading to prevent memory issues
    container.innerHTML = videos.map((video, index) => `
        <div class="video-container" data-index="${index}" data-video-id="${video.id}">
            <video 
                data-src="${video.videoUrl}" 
                loop 
                ${globalMuted ? 'muted' : ''}
                playsinline
                preload="none"
                crossorigin="anonymous"
                onerror="handleVideoError(this, ${index})"
                data-video-index="${index}"
            ></video>
            <div class="video-error" id="error${index}" style="display:none; position:absolute; top:50%; left:50%; transform:translate(-50%,-50%); text-align:center; color:#fff; background:rgba(0,0,0,0.8); padding:20px; border-radius:10px; z-index:5;">
                <div style="font-size:40px; margin-bottom:10px;">⚠️</div>
                <div>Video not available</div>
                <div style="font-size:12px; margin-top:5px; opacity:0.8;">${video.videoUrl}</div>
            </div>
            
            ${video.isLive ? `
            <div class="live-indicator" style="position: absolute; bottom: 220px; left: 15px; background: rgba(255, 0, 0, 0.95); color: white; padding: 6px 12px; border-radius: 4px; font-size: 12px; font-weight: bold; display: flex; align-items: center; gap: 6px; z-index: 11; box-shadow: 0 2px 12px rgba(255,0,0,0.5); pointer-events: none;">
                <span style="width: 8px; height: 8px; background: white; border-radius: 50%; animation: pulse 1.5s ease-in-out infinite;"></span>
                LIVE
            </div>
            ` : ''}
            
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
                
                <!-- View Count -->
                <button class="action-btn" data-action="views" style="cursor: default;">
                    <div class="action-btn-icon">
                        <svg viewBox="0 0 24 24" fill="currentColor">
                            <path fill="currentColor" d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/>
                        </svg>
                    </div>
                    <div class="action-btn-count">${formatCount(video.viewCount)}</div>
                </button>
                
                <!-- Like -->
                <button class="action-btn" onclick="likeVideo(${index})" data-action="like">
                    <div class="action-btn-icon">
                        <svg viewBox="0 0 24 24" fill="currentColor">
                            <path fill="currentColor" d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                        </svg>
                    </div>
                    <div class="action-btn-count">${formatCount(video.likeCount)}</div>
                </button>
                
                <!-- Comment -->
                <button class="action-btn" onclick="commentVideo(${index})" data-action="comment">
                    <div class="action-btn-icon">
                        <svg viewBox="0 0 24 24" fill="currentColor">
                            <path fill="currentColor" d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z"/>
                        </svg>
                    </div>
                    <div class="action-btn-count">128</div>
                </button>
                
                <!-- Share -->
                <button class="action-btn" onclick="shareVideo(${index})" data-action="share">
                    <div class="action-btn-icon">
                        <svg viewBox="0 0 24 24" fill="currentColor">
                            <path fill="currentColor" d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92 1.61 0 2.92-1.31 2.92-2.92s-1.31-2.92-2.92-2.92z"/>
                        </svg>
                    </div>
                    <div class="action-btn-count">45</div>
                </button>
                
                <!-- Shop -->
                <button class="action-btn" onclick="showProducts()" data-action="shop">
                    <div class="action-btn-icon">
                        <svg viewBox="0 0 24 24" fill="currentColor">
                            <path fill="currentColor" d="M7 18c-1.1 0-1.99.9-1.99 2S5.9 22 7 22s2-.9 2-2-.9-2-2-2zM1 2v2h2l3.6 7.59-1.35 2.45c-.16.28-.25.61-.25.96 0 1.1.9 2 2 2h12v-2H7.42c-.14 0-.25-.11-.25-.25l.03-.12.9-1.63h7.45c.75 0 1.41-.41 1.75-1.03l3.58-6.49c.08-.14.12-.31.12-.48 0-.55-.45-1-1-1H5.21l-.94-2H1zm16 16c-1.1 0-1.99.9-1.99 2s.89 2 1.99 2 2-.9 2-2-.9-2-2-2z"/>
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
async function likeVideo(index) {
    const video = videos[index];
    const container = document.querySelector(`.video-container[data-index="${index}"]`);
    const likeBtn = container.querySelector('[data-action="like"]');
    const isLiked = likeBtn.classList.contains('liked');
    const action = isLiked ? 'unlike' : 'like';
    
    try {
        // Call API to update like count in videos-data.json
        const response = await fetch(`/api/videos/${video.id}/like`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ action })
        });

        if (response.ok) {
            const result = await response.json();
            
            // Update local state
            video.likeCount = result.likeCount;
            
            // Update UI
            if (isLiked) {
                likeBtn.classList.remove('liked');
            } else {
                likeBtn.classList.add('liked');
                
                // Add animation
                likeBtn.style.transform = 'scale(1.2)';
                setTimeout(() => {
                    likeBtn.style.transform = '';
                }, 200);
            }
            
            likeBtn.querySelector('.action-btn-count').textContent = formatCount(video.likeCount);
        } else {
            console.error('Failed to update like count');
        }
    } catch (error) {
        console.error('Error updating like:', error);
        // Fallback: update UI locally even if API fails
        if (isLiked) {
            video.likeCount = Math.max(0, (video.likeCount || 0) - 1);
            likeBtn.classList.remove('liked');
        } else {
            video.likeCount = (video.likeCount || 0) + 1;
            likeBtn.classList.add('liked');
        }
        likeBtn.querySelector('.action-btn-count').textContent = formatCount(video.likeCount);
    }
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

// Toggle sound globally for all videos
function toggleCurrentVideoSound() {
    // Toggle global mute state
    globalMuted = !globalMuted;
    
    // Apply to all video elements
    const allVideos = document.querySelectorAll('video');
    allVideos.forEach(videoEl => {
        videoEl.muted = globalMuted;
    });
    
    // Update button icon and title
    const soundBtn = document.getElementById('globalSoundBtn');
    const soundIcon = document.getElementById('globalSoundIcon');
    
    if (globalMuted) {
        // Muted state
        soundIcon.innerHTML = '<path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z"/>';
        soundBtn.title = 'Unmute';
    } else {
        // Unmuted state
        soundIcon.innerHTML = '<path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/>';
        soundBtn.title = 'Mute';
    }
}

// Update sound button icon to reflect global state
function updateSoundButtonIcon() {
    const soundIcon = document.getElementById('globalSoundIcon');
    if (!soundIcon) return;
    
    if (globalMuted) {
        soundIcon.innerHTML = '<path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z"/>';
    } else {
        soundIcon.innerHTML = '<path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/>';
    }
}

// Track video view when a new device views the video
async function trackVideoView(videoId) {
    if (!videoId) return;
    
    // Prevent duplicate tracking for the same video in this session
    // (backend will handle device-based uniqueness)
    const trackingKey = `${deviceId}:${videoId}`;
    if (trackedVideoViews.has(trackingKey)) {
        return;
    }
    
    try {
        const response = await fetch(`/api/videos/${videoId}/view`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ deviceId })
        });

        if (response.ok) {
            const result = await response.json();
            
            // Mark as tracked for this session
            trackedVideoViews.add(trackingKey);
            
            // Update local state
            const video = videos.find(v => v.id === videoId);
            if (video && result.viewCount !== undefined) {
                video.viewCount = result.viewCount;
                
                // Update UI if this video is currently displayed
                const container = document.querySelector(`.video-container[data-video-id="${videoId}"]`);
                if (container) {
                    const viewBtn = container.querySelector('[data-action="views"]');
                    if (viewBtn) {
                        viewBtn.querySelector('.action-btn-count').textContent = formatCount(video.viewCount);
                    }
                }
            }
        }
    } catch (error) {
        console.error('Error tracking video view:', error);
        // Silently fail - don't interrupt video playback
    }
}

function setupScrollListener() {
    const videosContainer = document.getElementById('videos');
    let scrollTimeout;
    
    videosContainer.addEventListener('scroll', (e) => {
        clearTimeout(scrollTimeout);
        
        // Prevent bounce at boundaries
        const scrollTop = videosContainer.scrollTop;
        const scrollHeight = videosContainer.scrollHeight;
        const clientHeight = videosContainer.clientHeight;
        const maxScroll = scrollHeight - clientHeight;
        
        // If at the top or bottom, prevent further scrolling
        if (scrollTop <= 0) {
            videosContainer.scrollTop = 0;
        } else if (scrollTop >= maxScroll) {
            videosContainer.scrollTop = maxScroll;
        }
        
        scrollTimeout = setTimeout(() => {
            updateCurrentVideoIndex();
            // Force aggressive cleanup of distant videos after scroll (critical for Android)
            cleanupDistantVideos();
        }, 100); // Reduced timeout for faster cleanup on Android
    });
    
    // Initial video play
    setTimeout(() => {
        playCurrentVideo();
    }, 500);
}

// Cleanup videos that are far from current position to save memory
function cleanupDistantVideos() {
    const containers = document.querySelectorAll('.video-container');
    const maxDistance = 3; // Keep only 3 videos around current (prev, current, next)
    
    containers.forEach((container, index) => {
        const distance = Math.abs(index - currentIndex);
        const videoEl = container.querySelector('video');
        
        if (!videoEl) return;
        
        // More aggressive cleanup for Android - unload videos more than maxDistance away
        if (distance > maxDistance) {
            // Pause and reset
            videoEl.pause();
            videoEl.currentTime = 0;
            
            // Remove src and clear video element completely
            if (videoEl.src) {
                videoEl.src = '';
                videoEl.removeAttribute('src');
            }
            
            // Clear the poster if any
            if (videoEl.poster) {
                videoEl.poster = '';
            }
            
            // Force unload
            videoEl.load();
            
            // Clear video element from memory
            try {
                videoEl.removeAttribute('src');
                videoEl.innerHTML = '';
            } catch (e) {
                console.log('Cleanup error:', e);
            }
        } else if (distance > 1) {
            // For videos 2-3 positions away, just pause and reset time
            videoEl.pause();
            videoEl.currentTime = 0;
        }
    });
    
    // Force garbage collection hint on Android
    if (window.gc && typeof window.gc === 'function') {
        setTimeout(() => window.gc(), 100);
    }
    
    // Update memory label after cleanup
    updateMemoryLabel();
}

function updateCurrentVideoIndex() {
    const videosContainer = document.getElementById('videos');
    const scrollTop = videosContainer.scrollTop;
    const windowHeight = window.innerHeight;
    
    // Calculate which video is currently in view
    let newIndex = Math.round(scrollTop / windowHeight);
    
    // Clamp the index to prevent issues at boundaries
    newIndex = Math.max(0, Math.min(newIndex, videos.length - 1));
    
    if (newIndex !== currentIndex) {
        currentIndex = newIndex;
        playCurrentVideo();
        
        // Snap to the correct position if we're close to boundaries
        const targetScroll = currentIndex * windowHeight;
        if (Math.abs(scrollTop - targetScroll) > windowHeight * 0.1) {
            videosContainer.scrollTo({
                top: targetScroll,
                behavior: 'smooth'
            });
        }
    }
}

function playCurrentVideo() {
    const containers = document.querySelectorAll('.video-container');
    const maxPreloadDistance = 1; // Only preload immediate neighbors
    
    // First, aggressively cleanup distant videos
    containers.forEach((container, index) => {
        const videoEl = container.querySelector('video');
        if (!videoEl) return;
        
        const distance = Math.abs(index - currentIndex);
        
        if (distance > 2) {
            // Completely unload videos more than 2 away
            videoEl.pause();
            videoEl.currentTime = 0;
            if (videoEl.src) {
                videoEl.src = '';
                videoEl.removeAttribute('src');
                videoEl.load();
            }
        }
    });
    
    // Then handle current and nearby videos
    containers.forEach((container, index) => {
        const videoEl = container.querySelector('video');
        if (!videoEl) return;
        
        const distance = Math.abs(index - currentIndex);
        
        if (index === currentIndex) {
            // Load and play current video
            if (videoEl.dataset.src && !videoEl.src) {
                videoEl.src = videoEl.dataset.src;
                videoEl.load();
            }
            // Apply global mute state to video
            videoEl.muted = globalMuted;
            
            // Play with error handling
            const playPromise = videoEl.play();
            if (playPromise !== undefined) {
                playPromise.catch(e => {
                    console.log('Play error:', e);
                    // Retry after a short delay
                    setTimeout(() => {
                        videoEl.play().catch(err => console.log('Retry play error:', err));
                    }, 100);
                });
            }
            
            // Update sound button icon to reflect global state
            updateSoundButtonIcon();
            
            // Track video view when it starts playing
            trackVideoView(videos[currentIndex]?.id);
        } else if (distance <= maxPreloadDistance) {
            // Preload only immediate neighbors (previous and next)
            if (videoEl.dataset.src && !videoEl.src) {
                videoEl.src = videoEl.dataset.src;
                videoEl.load();
            }
            // Apply global mute state to preloaded videos
            videoEl.muted = globalMuted;
            videoEl.pause();
            videoEl.currentTime = 0;
        }
    });
    
    // Cleanup after a short delay to allow video to start playing
    setTimeout(() => {
        cleanupDistantVideos();
        updateMemoryLabel(); // Update memory info after cleanup
    }, 200);
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

// Video error handler
function handleVideoError(videoElement, index) {
    console.error(`Video ${index} failed to load:`, videoElement.src);
    const errorDiv = document.getElementById(`error${index}`);
    if (errorDiv) {
        errorDiv.style.display = 'block';
    }
    videoElement.style.display = 'none';
}

// Prevent bounce-back on Android - aggressive fix
function preventBounce() {
    const videosContainer = document.getElementById('videos');
    let lastScrollTop = 0;
    let isAtTop = false;
    let isAtBottom = false;
    
    // Prevent default touchmove when at boundaries
    videosContainer.addEventListener('touchstart', (e) => {
        const scrollTop = videosContainer.scrollTop;
        const scrollHeight = videosContainer.scrollHeight;
        const clientHeight = videosContainer.clientHeight;
        const maxScroll = scrollHeight - clientHeight;
        
        isAtTop = scrollTop <= 1;
        isAtBottom = scrollTop >= maxScroll - 1;
        lastScrollTop = scrollTop;
    }, { passive: false });
    
    videosContainer.addEventListener('touchmove', (e) => {
        const scrollTop = videosContainer.scrollTop;
        const scrollHeight = videosContainer.scrollHeight;
        const clientHeight = videosContainer.clientHeight;
        const maxScroll = scrollHeight - clientHeight;
        
        // Calculate touch direction
        const isScrollingUp = scrollTop < lastScrollTop;
        const isScrollingDown = scrollTop > lastScrollTop;
        
        // Prevent overscroll at top
        if (isAtTop && isScrollingUp) {
            e.preventDefault();
            videosContainer.scrollTop = 0;
            return false;
        }
        
        // Prevent overscroll at bottom
        if (isAtBottom && isScrollingDown) {
            e.preventDefault();
            videosContainer.scrollTop = maxScroll;
            return false;
        }
        
        // Lock at boundaries
        if (scrollTop <= 0) {
            videosContainer.scrollTop = 1;
        } else if (scrollTop >= maxScroll) {
            videosContainer.scrollTop = maxScroll - 1;
        }
        
        lastScrollTop = scrollTop;
    }, { passive: false });
    
    // Additional boundary enforcement
    videosContainer.addEventListener('scroll', () => {
        const scrollTop = videosContainer.scrollTop;
        const scrollHeight = videosContainer.scrollHeight;
        const clientHeight = videosContainer.clientHeight;
        const maxScroll = scrollHeight - clientHeight;
        
        if (scrollTop < 0) {
            videosContainer.scrollTop = 0;
        } else if (scrollTop > maxScroll) {
            videosContainer.scrollTop = maxScroll;
        }
    });
}

// Memory monitoring functions
function getMemoryInfo() {
    const info = {
        jsHeapSize: 'N/A',
        jsHeapSizeLimit: 'N/A',
        totalJSHeapSize: 'N/A',
        usedJSHeapSize: 'N/A',
        videoCount: 0,
        loadedVideos: 0
    };
    
    // Check if performance.memory is available (Chrome/Edge)
    if (performance.memory) {
        const memory = performance.memory;
        info.jsHeapSize = formatBytes(memory.jsHeapSizeLimit);
        info.jsHeapSizeLimit = formatBytes(memory.jsHeapSizeLimit);
        info.totalJSHeapSize = formatBytes(memory.totalJSHeapSize);
        info.usedJSHeapSize = formatBytes(memory.usedJSHeapSize);
    }
    
    // Count video elements
    const allVideos = document.querySelectorAll('video');
    info.videoCount = allVideos.length;
    info.loadedVideos = Array.from(allVideos).filter(v => v.src && v.src !== '').length;
    
    return info;
}

function formatBytes(bytes) {
    if (bytes === 'N/A') return 'N/A';
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
}

function updateMemoryLabel() {
    const label = document.getElementById('memoryLabel');
    if (!label) return;
    
    const memInfo = getMemoryInfo();
    
    let text = `Videos: ${memInfo.videoCount} (${memInfo.loadedVideos} loaded)\n`;
    
    if (memInfo.usedJSHeapSize !== 'N/A') {
        text += `Memory: ${memInfo.usedJSHeapSize} / ${memInfo.totalJSHeapSize}\n`;
        text += `Limit: ${memInfo.jsHeapSizeLimit}`;
    } else {
        text += 'Memory: Not available\n';
        text += '(Chrome/Edge only)';
    }
    
    label.textContent = text;
}

function startMemoryMonitoring() {
    // Update immediately
    updateMemoryLabel();
    
    // Update every 2 seconds
    if (memoryCheckInterval) {
        clearInterval(memoryCheckInterval);
    }
    
    memoryCheckInterval = setInterval(() => {
        updateMemoryLabel();
    }, 2000);
}

function stopMemoryMonitoring() {
    if (memoryCheckInterval) {
        clearInterval(memoryCheckInterval);
        memoryCheckInterval = null;
    }
}

// Start the app
init();
preventBounce();



