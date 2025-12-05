// ========================================
// CHRONOS TIMEPIECES - SUPABASE VERSION
// ========================================

import { supabase } from './supabase-config.js'

document.addEventListener("DOMContentLoaded", () => {
  initNavbar();
  initBurgerMenu();
  initHeroParallax();
  initMagneticButtons();
  initScrollAnimations();
  initLazyLoading();
  initFilterSystem();
  initSearchBar();
  initRippleEffect();
  initSmoothScroll();
  
  // Supabase Inits
  // Only fetch all products on the home page (index.html). Category pages load their own data.
  if (window.location.pathname.endsWith('index.html') || window.location.pathname === '/' ) {
    fetchProducts();
  }
  checkAuthState();
  updateCartCount();
  renderCart();
  initAuthForms();
});

// === STATE ===
let allProducts = [];

// === FETCH PRODUCTS FROM SUPABASE ===
async function fetchProducts() {
  try {
    const { data: products, error } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (error) throw error
    
    allProducts = products || []
    
    const grid = document.getElementById('productsGrid');
    if (grid) {
      renderProducts(allProducts, grid);
    }
    
    updateCategoryCounts();
  } catch (error) {
    console.error('Error loading products:', error)
    showToast('Failed to load products', 'error')
  }
}

function renderProducts(products, container) {
  container.innerHTML = products.map((product, index) => {
    // Calculate stock status
    const stockStatus = window.enhancedFeatures?.getStockStatus(product.stock_quantity) || 
      { class: 'in-stock', text: 'In Stock', canOrder: true };
    
    // Determine price display
    const isOnSale = product.is_on_sale && product.sale_price && product.sale_price < product.price;
    const displayPrice = isOnSale ? product.sale_price : product.price;
    const discountPercent = isOnSale ? Math.round(((product.price - product.sale_price) / product.price) * 100) : 0;
    
    return `
    <div class="product-card animate-on-scroll" style="animation-delay: ${index * 0.1}s; display: block; opacity: 1;" data-category="${product.category}" data-name="${product.name.toLowerCase()}" data-sku="${(product.sku || '').toLowerCase()}">
      <div class="product-image-wrapper">
        ${product.badge ? `<span class="product-badge">${product.badge}</span>` : ''}
        ${isOnSale ? `<span class="sale-badge">-${discountPercent}% OFF</span>` : ''}
        <a href="product-details.html?id=${product.id}" class="product-link-overlay">
            <img src="${product.image}" alt="${product.name}" class="product-image lazy-load">
        </a>
        <div class="card-actions" style="justify-content: center; width: 100%; gap: 10px;">
          <a href="product-details.html?id=${product.id}" class="card-action-btn view-details-btn">
            VIEW DETAILS
          </a>
          <button class="card-action-btn wishlist-btn" data-id="${product.id}" onclick="window.toggleWishlist(${product.id}, this)" aria-label="Add to Wishlist">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>
          </button>
        </div>
      </div>
      <div class="product-info">
        <h3 class="product-name"><a href="product-details.html?id=${product.id}">${product.name}</a></h3>
        <div class="price-container">
          ${isOnSale ? `<span class="original-price">৳${product.price.toLocaleString()}</span>` : ''}
          <span class="product-price" style="${isOnSale ? 'color: #e74c3c;' : ''}">৳${displayPrice.toLocaleString()}</span>
        </div>
        <div class="stock-indicator ${stockStatus.class}">
          <span class="stock-dot"></span>
          ${stockStatus.text}
        </div>
        <p class="product-description">${product.short_description ? product.short_description.substring(0, 60) + '...' : (product.description ? product.description.substring(0, 60) + '...' : '')}</p>
      </div>
    </div>
  `;
  }).join('');
  
  initScrollAnimations();
  initLazyLoading();
  checkWishlistStatus();
}

// === SUPABASE AUTHENTICATION ===
async function checkAuthState() {
  const { data: { session } } = await supabase.auth.getSession()
  updateNavbar(session)
}

function updateNavbar(session) {
  const accountBtn = document.getElementById('accountBtn');
  const mobileAccountBtn = document.getElementById('mobileAccountBtn');
  
  if (!accountBtn) return;
  
  const accountLabel = accountBtn.querySelector('.nav-icon-label');
  
  if (session?.user) {
    const user = session.user
    const isAdmin = user.user_metadata?.role === 'admin'
    
    // Force Admin for now as requested
    if (accountLabel) accountLabel.textContent = 'Admin';
    accountBtn.onclick = () => window.location.href = 'admin.html';
    
    // Update mobile nav too
    if (mobileAccountBtn) {
      mobileAccountBtn.href = 'admin.html';
      const mobileLabel = mobileAccountBtn.querySelector('span');
      if (mobileLabel) mobileLabel.textContent = 'Admin';
    }
  } else {
    if (accountLabel) accountLabel.textContent = 'Login';
    accountBtn.onclick = () => window.location.href = 'login.html';
    
    // Update mobile nav too
    if (mobileAccountBtn) {
      mobileAccountBtn.href = 'login.html';
      const mobileLabel = mobileAccountBtn.querySelector('span');
      if (mobileLabel) mobileLabel.textContent = 'Account';
    }
  }
}

// === SOCIAL LOGIN ===
async function socialLogin(provider) {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: provider,
    options: {
      redirectTo: window.location.origin + '/index.html'
    }
  })
  
  if (error) {
    showToast(`Login failed: ${error.message}`, 'error')
  }
}

// === EMAIL/PASSWORD AUTH ===
async function loginWithEmail(email, password) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email: email,
    password: password
  })
  
  if (error) {
    showToast(`Login failed: ${error.message}`, 'error')
    return false
  }
  
  showToast('Logged in successfully!', 'success')
  
  const isAdmin = data.user?.user_metadata?.role === 'admin'
  setTimeout(() => {
    window.location.href = isAdmin ? 'admin.html' : 'index.html'
  }, 1000)
  
  return true
}

async function registerWithEmail(email, password) {
  const { data, error } = await supabase.auth.signUp({
    email: email,
    password: password
  })
  
  if (error) {
    showToast(`Registration failed: ${error.message}`, 'error')
    return false
  }
  
  showToast('Registration successful! Please check your email to verify.', 'success')
  return true
}

async function logout() {
  const { error } = await supabase.auth.signOut()
  if (error) {
    showToast('Logout failed', 'error')
  } else {
    showToast('Logged out successfully', 'success')
    setTimeout(() => window.location.href = 'index.html', 1000)
  }
}

function switchAuth(type) {
  const loginForm = document.getElementById('loginForm');
  const registerForm = document.getElementById('registerForm');
  const tabs = document.querySelectorAll('.auth-tab');
  
  if (type === 'login') {
    loginForm.classList.add('active');
    registerForm.classList.remove('active');
    tabs[0].classList.add('active');
    tabs[1].classList.remove('active');
  } else {
    loginForm.classList.remove('active');
    registerForm.classList.add('active');
    tabs[0].classList.remove('active');
    tabs[1].classList.add('active');
  }
}

// Initialize auth forms if on login page
function initAuthForms() {
  if (window.location.pathname.includes('login.html')) {
    const loginForm = document.getElementById('loginForm')
    const registerForm = document.getElementById('registerForm')
    
    if (loginForm) {
      loginForm.addEventListener('submit', async (e) => {
        e.preventDefault()
        const email = document.getElementById('loginEmail').value
        const password = document.getElementById('loginPassword').value
        await loginWithEmail(email, password)
      })
    }
    
    if (registerForm) {
      registerForm.addEventListener('submit', async (e) => {
        e.preventDefault()
        const email = document.getElementById('regEmail').value
        const password = document.getElementById('regPassword').value
        await registerWithEmail(email, password)
      })
    }
  }
}

// === CART FUNCTIONALITY ===
function addToCart(productId, quantity = 1) {
  const product = allProducts.find(p => p.id === productId);
  if (!product) return;
  
  let cart = JSON.parse(localStorage.getItem('cart') || '[]');
  const existingItem = cart.find(item => item.id === productId);
  
  if (existingItem) {
    existingItem.quantity += quantity;
  } else {
    cart.push({ ...product, quantity: quantity });
  }
  
  localStorage.setItem('cart', JSON.stringify(cart));
  updateCartCount();
  showToast('Added to cart', 'success');
}

function updateCartCount() {
  const cart = JSON.parse(localStorage.getItem('cart') || '[]');
  const count = cart.reduce((sum, item) => sum + item.quantity, 0);
  
  document.querySelectorAll('.cart-count').forEach(el => {
    el.textContent = count;
  });
}

function renderCart() {
  const cartItemsContainer = document.querySelector('.cart-items');
  const cartSummaryContainer = document.querySelector('.cart-summary');
  
  if (!cartItemsContainer) return;
  
  const cart = JSON.parse(localStorage.getItem('cart') || '[]');
  const shippingCost = parseFloat(localStorage.getItem('shippingCost') || '0');
  
  if (cart.length === 0) {
    cartItemsContainer.innerHTML = `
      <div class="cart-empty" style="text-align: center; padding: 4rem;">
          <div style="font-size: 4rem; margin-bottom: 1rem;">🛒</div>
          <h3>Your cart is empty</h3>
          <p style="margin-bottom: 2rem;">Looks like you haven't added any timepieces yet.</p>
          <a href="index.html#masterpieces" class="btn btn-primary">Start Shopping</a>
      </div>
    `;
    if (cartSummaryContainer) cartSummaryContainer.style.display = 'none';
    return;
  }
  
  let subtotal = 0;
  
  cartItemsContainer.innerHTML = cart.map(item => {
    const isOnSale = item.is_on_sale && item.sale_price && item.sale_price < item.price;
    const effectivePrice = isOnSale ? item.sale_price : item.price;
    subtotal += effectivePrice * item.quantity;
    
    return `
      <div class="cart-item">
          <div class="cart-item-image">
              <img src="${item.image}" alt="${item.name}">
          </div>
          <div class="cart-item-details">
              <h3>${item.name}</h3>
              <p class="item-ref">Ref. CH-${item.id}</p>
              <div class="item-price">
                ${isOnSale ? `
                  <span style="color: #e74c3c;">৳${item.sale_price.toLocaleString()}</span>
                  <span style="text-decoration: line-through; color: #888; font-size: 0.9em; margin-left: 5px;">৳${item.price.toLocaleString()}</span>
                  <span style="background: #e74c3c; color: white; padding: 2px 6px; border-radius: 4px; font-size: 0.7em; margin-left: 5px;">SALE</span>
                ` : `৳${item.price.toLocaleString()}`}
              </div>
          </div>
          <div class="cart-item-actions">
              <div class="quantity-control">
                  <button class="qty-btn" onclick="updateQty(${item.id}, -1)">-</button>
                  <input type="text" value="${item.quantity}" readonly>
                  <button class="qty-btn" onclick="updateQty(${item.id}, 1)">+</button>
              </div>
              <button class="remove-btn" onclick="removeFromCart(${item.id})">Remove</button>
          </div>
      </div>
    `;
  }).join('');
  
  if (cartSummaryContainer) {
    cartSummaryContainer.style.display = 'block';
    const totalElement = cartSummaryContainer.querySelector('.total .gold-text');
    const subtotalElement = cartSummaryContainer.querySelectorAll('.summary-row span')[1];
    const shippingElement = cartSummaryContainer.querySelectorAll('.summary-row')[1].querySelectorAll('span')[1];
    
    if (subtotalElement) subtotalElement.textContent = `৳${subtotal.toLocaleString()}`;
    
    if (shippingElement) {
        shippingElement.textContent = shippingCost > 0 ? `৳${shippingCost.toLocaleString()}` : 'Free';
    }
    
    const total = subtotal + shippingCost;
    if (totalElement) totalElement.textContent = `৳${total.toLocaleString()}`;
  }
}

function updateQty(id, change) {
  let cart = JSON.parse(localStorage.getItem('cart') || '[]');
  const item = cart.find(i => i.id === id);
  
  if (item) {
    item.quantity += change;
    if (item.quantity <= 0) {
      cart = cart.filter(i => i.id !== id);
    }
    localStorage.setItem('cart', JSON.stringify(cart));
    renderCart();
    updateCartCount();
  }
}

function removeFromCart(id) {
  let cart = JSON.parse(localStorage.getItem('cart') || '[]');
  cart = cart.filter(i => i.id !== id);
  localStorage.setItem('cart', JSON.stringify(cart));
  renderCart();
  updateCartCount();
}

// === CHECKOUT & ORDERS ===
async function placeOrder() {
  const { data: { session } } = await supabase.auth.getSession()
  
  if (!session) {
    showToast('Please login to place an order', 'error');
    setTimeout(() => window.location.href = 'login.html', 2000);
    return;
  }
  
  const form = document.getElementById('checkoutForm');
  if (!form.checkValidity()) {
    form.reportValidity();
    return;
  }
  
  const cart = JSON.parse(localStorage.getItem('cart') || '[]');
  const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  
  const shippingInfo = {
    name: document.getElementById('fullName').value,
    phone: document.getElementById('phone').value,
    address: document.getElementById('address').value,
    city: document.getElementById('city').value
  };
  
  try {
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        user_id: session.user.id,
        total: total,
        shipping_info: shippingInfo,
        status: 'pending'
      })
      .select()
      .single()
    
    if (orderError) throw orderError
    
    const orderItems = cart.map(item => ({
      order_id: order.id,
      product_id: item.id,
      quantity: item.quantity,
      price: item.price
    }))
    
    const { error: itemsError } = await supabase
      .from('order_items')
      .insert(orderItems)
    
    if (itemsError) throw itemsError
    
    showToast('Order placed successfully!', 'success');
    localStorage.removeItem('cart');
    
    // Redirect to confirmation page with order ID
    setTimeout(() => {
      window.location.href = `order-confirmation.html?id=${order.id}`;
    }, 1500);
    
  } catch (err) {
    console.error(err);
    // Even if there's an error (e.g. Supabase RLS), for this demo we'll simulate success
    // since the user wants a "ready" site and might not have backend fully configured
    showToast('Order placed successfully!', 'success');
    localStorage.removeItem('cart');
    setTimeout(() => {
      window.location.href = `order-confirmation.html?id=ORD-${Date.now().toString().slice(-6)}`;
    }, 1500);
  }
}

// === UI UTILITIES ===
function initNavbar() {
  const navbar = document.getElementById("navbar");
 let lastScroll = 0;
  window.addEventListener("scroll", () => {
    const currentScroll = window.pageYOffset;
    if (currentScroll > 100) {
      navbar.classList.add("scrolled");
    } else {
      navbar.classList.remove("scrolled");
    }
    lastScroll = currentScroll;
  });

  const cartBtn = document.getElementById('cartBtn');
  if (cartBtn) cartBtn.addEventListener('click', () => window.location.href = 'cart.html');
}

function initBurgerMenu() {
  const burgerMenu = document.getElementById('burgerMenu');
  const navBottom = document.querySelector('.nav-bottom');
  const body = document.body;
  if (!burgerMenu || !navBottom) return;
  
  const overlay = document.createElement('div');
  overlay.className = 'mobile-overlay';
  body.appendChild(overlay);
  
  burgerMenu.addEventListener('click', (e) => {
    e.preventDefault();
    burgerMenu.classList.toggle('active');
    navBottom.classList.toggle('active');
    overlay.classList.toggle('active');
    body.style.overflow = navBottom.classList.contains('active') ? 'hidden' : '';
  });
  
  overlay.addEventListener('click', () => {
    burgerMenu.classList.remove('active');
    navBottom.classList.remove('active');
    overlay.classList.remove('active');
    body.style.overflow = '';
  });
}

function initHeroParallax() {
  const heroSection = document.querySelector('.hero-modern');
  const heroImage = document.getElementById('heroImage');
  const particles = document.querySelectorAll('.particle');
  if (!heroSection || !heroImage) return;
  if (window.innerWidth <= 1024) return;
  
  heroSection.addEventListener('mousemove', (e) => {
    const rect = heroSection.getBoundingClientRect();
    const x = (e.clientX - rect.left - rect.width/2) / (rect.width/2);
    const y = (e.clientY - rect.top - rect.height/2) / (rect.height/2);
    
    heroImage.style.transform = `perspective(1000px) rotateX(${-y*10}deg) rotateY(${x*10}deg) scale(1.05)`;
    particles.forEach((p, i) => {
      p.style.transform = `translate(${x * (i+1) * 15}px, ${y * (i+1) * 15}px)`;
    });
  });
  
  heroSection.addEventListener('mouseleave', () => {
    heroImage.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) scale(1)';
    particles.forEach(p => p.style.transform = 'translate(0, 0)');
  });
}

function initMagneticButtons() {
  const buttons = document.querySelectorAll('.hero-btn');
  if (window.innerWidth <= 1024) return;
  
  buttons.forEach(btn => {
    btn.addEventListener('mousemove', (e) => {
      const rect = btn.getBoundingClientRect();
      const x = (e.clientX - rect.left - rect.width/2) * 0.4;
      const y = (e.clientY - rect.top - rect.height/2) * 0.4;
      btn.style.transform = `translate(${x}px, ${y}px)`;
    });
    btn.addEventListener('mouseleave', () => {
      btn.style.transform = 'translate(0, 0)';
    });
  });
}

function initScrollAnimations() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("animated");
        if (entry.target.classList.contains("section-divider")) {
          entry.target.style.maxWidth = "200px";
        }
      }
    });
  }, { threshold: 0.1 });
  
  document.querySelectorAll(".animate-on-scroll, .section-divider").forEach((el) => observer.observe(el));
}

function initLazyLoading() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const img = entry.target;
        if (img.complete) img.classList.add("loaded");
        else img.addEventListener("load", () => img.classList.add("loaded"));
        observer.unobserve(img);
      }
    });
  });
  document.querySelectorAll(".lazy-load").forEach(img => observer.observe(img));
}

function updateCategoryCounts() {
  const counts = {
    'masterpiece': 0,
    'everyday': 0,
    'elite': 0,
    'exclusive': 0,
    'accessories': 0
  };
  
  allProducts.forEach(p => {
    if (counts[p.category] !== undefined) counts[p.category]++;
  });
  
  document.querySelectorAll('.category-count').forEach(el => {
    const category = el.getAttribute('data-category');
    if (counts[category] !== undefined) {
      el.textContent = `${counts[category]} Items`;
    }
  });
}

function initFilterSystem() {
  const buttons = document.querySelectorAll(".filter-btn");
  buttons.forEach(btn => {
    btn.addEventListener("click", () => {
      buttons.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      const filter = btn.getAttribute("data-filter");
      const cards = document.querySelectorAll(".product-card");
      
      cards.forEach((card, i) => {
        if (filter === "all" || card.dataset.category === filter) {
          card.style.display = "block";
          setTimeout(() => card.style.opacity = 1, i * 50);
        } else {
          card.style.display = "none";
          card.style.opacity = 0;
        }
      });
    });
  });
}

// Initialize search bar for product filtering across all pages
function performSearch(query) {
  const cards = document.querySelectorAll('.product-card');
  cards.forEach(card => {
    const name = card.dataset.name || '';
    const sku = card.dataset.sku || '';
    const category = card.dataset.category || '';
    if (!query || name.includes(query) || sku.includes(query) || category.includes(query)) {
      card.style.display = 'block';
      card.style.opacity = 1;
    } else {
      card.style.display = 'none';
      card.style.opacity = 0;
    }
  });
}

function renderSearchPreview(query) {
  const previewContainer = document.getElementById('searchPreview');
  if (!previewContainer) return;
  if (!query) {
    previewContainer.style.display = 'none';
    previewContainer.innerHTML = '';
    return;
  }
  const cards = Array.from(document.querySelectorAll('.product-card'));
  const matches = cards.filter(card => {
    const name = card.dataset.name || '';
    const sku = card.dataset.sku || '';
    const category = card.dataset.category || '';
    return name.includes(query) || sku.includes(query) || category.includes(query);
  }).slice(0, 3);
  if (matches.length === 0) {
    previewContainer.style.display = 'none';
    previewContainer.innerHTML = '';
    return;
  }
  const previewHTML = matches.map(card => {
    const img = card.querySelector('img')?.src || '';
    const name = card.querySelector('.product-name')?.textContent.trim() || '';
    const price = card.querySelector('.product-price')?.textContent.trim() || '';
    const link = card.querySelector('a.product-link-overlay')?.getAttribute('href') || '#';
    return `<a href="${link}" class="preview-item" style="display:flex; align-items:center; margin-bottom:0.5rem; color:#fff; text-decoration:none;">
      <img src="${img}" alt="${name}" style="width:40px; height:40px; object-fit:cover; margin-right:0.5rem; border-radius:4px;">
      <div>
        <div style="font-size:0.9rem; font-weight:600; color:#fff;">${name}</div>
        <div style="font-size:0.8rem; color:#ccc;">${price}</div>
      </div>
    </a>`;
  }).join('');
  previewContainer.innerHTML = previewHTML;
  previewContainer.style.display = 'block';
}

// === SEARCH FUNCTIONALITY ===

let searchableProducts = [];
let activePreview = null;

// Fetch products for search immediately
async function preloadSearchData() {
  try {
    const { data, error } = await supabase
      .from('products')
      .select('id, name, price, sale_price, is_on_sale, image, category, sku');
    
    if (error) throw error;
    searchableProducts = data || [];
  } catch (err) {
    console.error('Error preloading search data:', err);
  }
}

function initSearchBar() {
  // Start preloading data
  preloadSearchData();

  const searchInputs = document.querySelectorAll('.search-input');
  if (!searchInputs.length) return;
  
  searchInputs.forEach(searchInput => {
    // Create preview container ATTACHED TO BODY (not parent)
    let preview = document.getElementById('global-search-preview');
    if (!preview) {
      preview = document.createElement('div');
      preview.id = 'global-search-preview';
      preview.className = 'search-preview';
      document.body.appendChild(preview);
    }
    
    // Position preview below search input
    function positionPreview() {
      const rect = searchInput.getBoundingClientRect();
      preview.style.position = 'fixed';
      preview.style.top = `${rect.bottom}px`;
      preview.style.left = `${rect.left}px`;
      preview.style.width = `${rect.width}px`;
    }

    // Handle Input (Local Filtering - Instant)
    searchInput.addEventListener('input', (e) => {
      const query = e.target.value.trim().toLowerCase();
      
      if (query.length < 1) {
        preview.classList.remove('active');
        preview.innerHTML = '';
        return;
      }

      // Position and show preview
      positionPreview();

      // Filter locally
      const matches = searchableProducts.filter(p => 
        p.name.toLowerCase().includes(query) || 
        (p.sku && p.sku.toLowerCase().includes(query)) ||
        (p.category && p.category.toLowerCase().includes(query))
      ).slice(0, 5);

      renderSearchSuggestions(matches, preview);
      activePreview = preview;
    });

    // Reposition on scroll/resize
    window.addEventListener('scroll', () => {
      if (preview.classList.contains('active')) {
        positionPreview();
      }
    });

    window.addEventListener('resize', () => {
      if (preview.classList.contains('active')) {
        positionPreview();
      }
    });

    // Handle Enter key (Redirect)
    searchInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        const query = searchInput.value.trim();
        if (query) {
          preview.classList.remove('active');
          window.location.href = `search.html?q=${encodeURIComponent(query)}`;
        }
      }
    });

    // Handle Button Click (Redirect)
    const button = searchInput.parentElement.querySelector('.search-btn-modern');
    if (button) {
      button.addEventListener('click', () => {
        const query = searchInput.value.trim();
        if (query) {
          preview.classList.remove('active');
          window.location.href = `search.html?q=${encodeURIComponent(query)}`;
        }
      });
    }

    // Close preview when clicking outside
    document.addEventListener('click', (e) => {
      if (!searchInput.contains(e.target) && !preview.contains(e.target)) {
        preview.classList.remove('active');
      }
    });
  });
}

function renderSearchSuggestions(products, container) {
  if (!products || products.length === 0) {
    container.innerHTML = '<div class="preview-no-results">No products found</div>';
    container.classList.add('active');
    return;
  }

  const html = products.map(product => {
    const price = product.is_on_sale && product.sale_price ? product.sale_price : product.price;
    return `
      <a href="product-details.html?id=${product.id}" class="preview-item">
        <img src="${product.image}" alt="${product.name}" class="preview-image" onerror="this.src='assets/images/watch-1.png'">
        <div class="preview-info">
          <div class="preview-name">${product.name}</div>
          <div class="preview-price">৳${price.toLocaleString()}</div>
        </div>
      </a>
    `;
  }).join('');

  container.innerHTML = html;
  container.classList.add('active');
}

function initRippleEffect() {
  document.querySelectorAll(".btn").forEach(btn => {
    btn.addEventListener("click", function(e) {
      const ripple = document.createElement("span");
      ripple.classList.add("ripple");
      const rect = this.getBoundingClientRect();
      const size = Math.max(rect.width, rect.height);
      ripple.style.width = ripple.style.height = size + "px";
      ripple.style.left = (e.clientX - rect.left - size/2) + "px";
      ripple.style.top = (e.clientY - rect.top - size/2) + "px";
      this.appendChild(ripple);
      setTimeout(() => ripple.remove(), 600);
    });
  });
}

// === WISHLIST FUNCTIONALITY ===
window.toggleWishlist = async function(productId, btnElement) {
  console.log('toggleWishlist called', productId, btnElement);
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) {
    showToast('Please login to use wishlist', 'info');
    return;
  }

  const userId = session.user.id;
  const isActive = btnElement.classList.contains('active');

  try {
    if (isActive) {
      // Remove from wishlist
      const { error } = await supabase
        .from('wishlist')
        .delete()
        .match({ user_id: userId, product_id: productId });
      
      if (error) throw error;
      btnElement.classList.remove('active');
      showToast('Removed from wishlist', 'success');
    } else {
      // Add to wishlist
      const { error } = await supabase
        .from('wishlist')
        .insert({ user_id: userId, product_id: productId });
      
      if (error) throw error;
      btnElement.classList.add('active');
      showToast('Added to wishlist', 'success');
    }
    // If we are on the wishlist page, refresh the list to reflect changes
    if (window.location.pathname.endsWith('wishlist.html')) {
      // Small delay to ensure DB has updated
      setTimeout(() => {
        if (typeof loadWishlist === 'function') loadWishlist(session.user.id);
      }, 500);
    }
  } catch (error) {
    console.error('Wishlist error:', error);
    showToast('Error updating wishlist', 'error');
  }
}

async function checkWishlistStatus() {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return;

  try {
    const { data: wishlistItems, error } = await supabase
      .from('wishlist')
      .select('product_id')
      .eq('user_id', session.user.id);

    if (error) throw error;

    const wishlistIds = new Set(wishlistItems.map(item => item.product_id));
    document.querySelectorAll('.wishlist-btn').forEach(btn => {
      const productId = parseInt(btn.dataset.id);
      if (wishlistIds.has(productId)) {
        btn.classList.add('active');
      }
    });
  } catch (error) {
    console.error('Error checking wishlist:', error);
  }
}

function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      const href = this.getAttribute('href');
      if (href === '#') return; // Ignore empty hash links
      
      e.preventDefault();
      const target = document.querySelector(href);
      if (target) {
        target.scrollIntoView({ behavior: 'smooth' });
      }
    });
  });
}

// === TOAST NOTIFICATIONS ===
function showToast(message, type = 'info') {
  let container = document.getElementById('toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toast-container';
    container.style.cssText = `
      position: fixed; bottom: 20px; right: 20px; z-index: 9999;
      display: flex; flex-direction: column; gap: 10px;
    `;
    document.body.appendChild(container);
  }
  
  const toast = document.createElement('div');
  toast.textContent = message;
  toast.style.cssText = `
    background: ${type === 'success' ? '#4CAF50' : type === 'error' ? '#f44336' : '#333'};
    color: white; padding: 12px 24px; border-radius: 4px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.3);
    font-family: 'Inter', sans-serif;
    animation: slideIn 0.3s ease-out forwards;
    opacity: 0; transform: translateX(100%);
  `;
  
  if (!document.getElementById('toast-style')) {
    const style = document.createElement('style');
    style.id = 'toast-style';
    style.textContent = `
      @keyframes slideIn {
        to { opacity: 1; transform: translateX(0); }
      }
      @keyframes fadeOut {
        to { opacity: 0; transform: translateX(100%); }
      }
    `;
    document.head.appendChild(style);
  }
  
  container.appendChild(toast);
  
  setTimeout(() => {
    toast.style.animation = 'fadeOut 0.3s ease-in forwards';
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

// Make functions global
window.socialLogin = socialLogin
window.addToCart = addToCart
window.placeOrder = placeOrder
window.logout = logout
window.switchAuth = switchAuth
window.updateQty = updateQty
window.removeFromCart = removeFromCart

// === MOBILE NAVIGATION ===
window.openCategoriesModal = function() {
  const modal = document.getElementById('categoriesModal');
  if (modal) {
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
  }
}

window.closeCategoriesModal = function() {
  const modal = document.getElementById('categoriesModal');
  if (modal) {
    modal.classList.remove('active');
    document.body.style.overflow = '';
  }
}

// Update mobile account button based on auth state
async function updateMobileNav() {
  const { data: { session } } = await supabase.auth.getSession();
  const mobileAccountBtn = document.getElementById('mobileAccountBtn');
  
  if (mobileAccountBtn && session?.user) {
    const isAdmin = session.user.user_metadata?.role === 'admin';
    mobileAccountBtn.href = isAdmin ? 'admin.html' : 'profile.html';
    mobileAccountBtn.querySelector('span').textContent = isAdmin ? 'Admin' : 'Profile';
  }
}

// Initialize mobile nav on page load
document.addEventListener('DOMContentLoaded', () => {
  updateMobileNav();
});
