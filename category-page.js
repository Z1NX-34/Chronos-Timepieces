// Category Page JavaScript
// Handles filtering, sorting, and product display
// NOTE: getSupabaseClient() is defined in script.js

// Get supabase client (using function from script.js)
// Use a function call wrapper to avoid redeclaration issues
const categorySupabase = typeof getSupabaseClient === 'function' ? getSupabaseClient() : window.supabaseClient;

// Get category from page
const pageTitle = document.querySelector('.category-title')?.textContent.trim();
const isSearchPage = pageTitle === 'SEARCH RESULTS';
const pageCategory = pageTitle?.toLowerCase().replace(/\s+/g, '-') || 'everyday-elegance';

// State - using different names to avoid conflict with script.js
let categoryProducts = [];
let filteredProducts = [];
let activeFilters = {
    ribbons: [],
    brands: [],
    minPrice: null,
    maxPrice: null
};
let currentSort = 'recommended';

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    if (categorySupabase) {
        loadProducts();
        initializeFilters();
        initializeSorting();
        
        // Account Button Handler
        const accountBtn = document.getElementById('accountBtn');
        if (accountBtn) {
            accountBtn.addEventListener('click', async () => {
                const { data: { session } } = await categorySupabase.auth.getSession();
                if (session) {
                    window.location.href = 'admin.html';
                } else {
                    window.location.href = 'login.html';
                }
            });
            
            // Update label if logged in
            checkLoginStatus();
        }
    } else {
        console.warn('Supabase not available');
        const grid = document.getElementById('productsGrid');
        if (grid) grid.innerHTML = '<div style="grid-column: 1/-1; text-align: center; padding: 4rem; color: var(--gold);">Unable to load products. Please try refreshing.</div>';
    }
});

async function checkLoginStatus() {
    if (!categorySupabase) return;
    const { data: { session } } = await categorySupabase.auth.getSession();
    const label = document.querySelector('#accountBtn .nav-icon-label');
    if (session && label) {
        label.textContent = 'Admin';
    }
}

// Load products from Supabase
async function loadProducts() {
    // Show loading state
    const grid = document.getElementById('productsGrid');
    if(grid) grid.innerHTML = '<div style="grid-column: 1/-1; text-align: center; padding: 4rem; color: var(--gold);">Loading products...</div>';

    if (!categorySupabase) {
        if(grid) grid.innerHTML = '<div style="grid-column: 1/-1; text-align: center; padding: 4rem; color: var(--gold);">Unable to connect. Please refresh.</div>';
        return;
    }

    try {
        const { data: products, error } = await categorySupabase
            .from('products')
            .select('*');

        if (error) throw error;

        if (isSearchPage) {
            // Search Logic
            const urlParams = new URLSearchParams(window.location.search);
            const query = urlParams.get('q')?.toLowerCase() || '';
            
            if (query) {
                document.querySelector('.category-title').textContent = `SEARCH RESULTS: "${query}"`;
                categoryProducts = products.filter(p => 
                    p.name.toLowerCase().includes(query) || 
                    (p.brand && p.brand.toLowerCase().includes(query)) ||
                    (p.category && p.category.toLowerCase().includes(query))
                );
            } else {
                categoryProducts = products; // Show all if no query
            }
        } else {
            // Category Logic
            const categoryMap = {
                'everyday-elegance': 'everyday',
                'elite-luxury': 'elite',
                'exclusive-collections': 'exclusive',
                'premium-accessories': 'accessories'
            };
            
            const categoryKey = categoryMap[pageCategory];
            
            // Filter products for this category
            categoryProducts = products.filter(p => p.category === categoryKey);
        }

        filteredProducts = [...categoryProducts];
        
        // Populate brands filter
        populateBrandsFilter();
        
        // Display products
        displayProducts();
        updateResultsCount();

    } catch (err) {
        console.error('Error loading products:', err);
        if(grid) grid.innerHTML = '<div style="grid-column: 1/-1; text-align: center; padding: 2rem;">Error loading products. Please try refreshing.</div>';
    }
}

// Populate brands filter dynamically
function populateBrandsFilter() {
    const brands = [...new Set(categoryProducts.map(p => p.brand).filter(Boolean))];
    const brandsContainer = document.getElementById('brands-filter');
    
    if (brands.length === 0) {
        brandsContainer.innerHTML = '<p style="color: rgba(255,255,255,0.5); font-size: 0.85rem; padding: 0.5rem 0;">No brands available</p>';
        return;
    }
    
    brandsContainer.innerHTML = brands.map(brand => `
        <label class="filter-checkbox">
            <input type="checkbox" value="${brand}" data-filter-type="brand">
            <span class="checkmark"></span>
            <span class="label-text">${brand}</span>
        </label>
    `).join('');
    
    // Add event listeners
    brandsContainer.querySelectorAll('input[type="checkbox"]').forEach(checkbox => {
        checkbox.addEventListener('change', handleBrandFilter);
    });
}

// Initialize filter accordion
function initializeFilters() {
    // Accordion functionality
    document.querySelectorAll('.filter-group-header').forEach(header => {
        header.addEventListener('click', () => {
            header.classList.toggle('active');
            const content = header.nextElementSibling;
            content.classList.toggle('active');
        });
        
        // Open all by default
        header.click();
    });
    
    // Ribbon filters
    document.querySelectorAll('input[data-filter-type="ribbon"]').forEach(checkbox => {
        checkbox.addEventListener('change', handleRibbonFilter);
    });
    
    // Price filter
    document.getElementById('applyPriceFilter')?.addEventListener('click', handlePriceFilter);
}

// Handle ribbon filter
function handleRibbonFilter(e) {
    const value = e.target.value;
    if (e.target.checked) {
        activeFilters.ribbons.push(value);
    } else {
        activeFilters.ribbons = activeFilters.ribbons.filter(r => r !== value);
    }
    applyFilters();
}

// Handle brand filter
function handleBrandFilter(e) {
    const value = e.target.value;
    if (e.target.checked) {
        activeFilters.brands.push(value);
    } else {
        activeFilters.brands = activeFilters.brands.filter(b => b !== value);
    }
    applyFilters();
}

// Handle price filter
function handlePriceFilter() {
    const minPrice = parseInt(document.getElementById('minPrice').value) || null;
    const maxPrice = parseInt(document.getElementById('maxPrice').value) || null;
    
    activeFilters.minPrice = minPrice;
    activeFilters.maxPrice = maxPrice;
    
    applyFilters();
}

// Apply all filters
function applyFilters() {
    filteredProducts = categoryProducts.filter(product => {
        // Ribbon filter
        if (activeFilters.ribbons.length > 0) {
            // Check if product badge matches any of the active ribbon filters
            // Case insensitive check
            const hasRibbon = activeFilters.ribbons.some(ribbon => 
                product.badge && product.badge.toLowerCase() === ribbon.toLowerCase()
            );
            if (!hasRibbon) return false;
        }
        
        // Brand filter
        if (activeFilters.brands.length > 0) {
            if (!activeFilters.brands.includes(product.brand)) return false;
        }
        
        // Price filter
        // Supabase uses snake_case
        const price = (product.is_on_sale || (product.sale_price && product.sale_price < product.price)) 
            ? product.sale_price 
            : product.price;
            
        if (activeFilters.minPrice !== null && price < activeFilters.minPrice) return false;
        if (activeFilters.maxPrice !== null && price > activeFilters.maxPrice) return false;
        
        return true;
    });
    
    applySorting();
    displayProducts();
    updateResultsCount();
}

// Initialize sorting
function initializeSorting() {
    document.getElementById('sortSelect')?.addEventListener('change', (e) => {
        currentSort = e.target.value;
        applySorting();
        displayProducts();
    });
}

// Apply sorting
function applySorting() {
    switch (currentSort) {
        case 'price-low':
            filteredProducts.sort((a, b) => {
                const priceA = (a.is_on_sale || (a.sale_price && a.sale_price < a.price)) ? a.sale_price : a.price;
                const priceB = (b.is_on_sale || (b.sale_price && b.sale_price < b.price)) ? b.sale_price : b.price;
                return priceA - priceB;
            });
            break;
        case 'price-high':
            filteredProducts.sort((a, b) => {
                const priceA = (a.is_on_sale || (a.sale_price && a.sale_price < a.price)) ? a.sale_price : a.price;
                const priceB = (b.is_on_sale || (b.sale_price && b.sale_price < b.price)) ? b.sale_price : b.price;
                return priceB - priceA;
            });
            break;
        case 'newest':
            filteredProducts.sort((a, b) => b.id - a.id);
            break;
        case 'recommended':
        default:
            // Keep original order or custom recommendation logic
            break;
    }
}

// Display products
function displayProducts() {
    const grid = document.getElementById('productsGrid');
    const noResults = document.getElementById('noResults');
    
    if (filteredProducts.length === 0) {
        grid.innerHTML = '';
        noResults.style.display = 'block';
        return;
    }
    
    noResults.style.display = 'none';
    
    grid.innerHTML = filteredProducts.map(product => {
        // Supabase returns snake_case keys
        const isOnSale = product.is_on_sale || (product.sale_price && product.sale_price < product.price);
        const displayPrice = isOnSale ? product.sale_price : product.price;
        const originalPrice = product.price;
        const discountPercentage = isOnSale ? Math.round(((originalPrice - displayPrice) / originalPrice) * 100) : 0;
        
        return `
            <div class="product-card" data-product-id="${product.id}">
                <div class="product-image-wrapper">
                    <a href="product-details.html?id=${product.id}" class="product-link-overlay"></a>
                    <img src="${product.image}" alt="${product.name}" class="product-image" loading="lazy">
                    ${product.badge ? `<span class="product-badge">${product.badge}</span>` : ''}
                    ${isOnSale ? `<span class="sale-badge">-${discountPercentage}% OFF</span>` : ''}
                </div>
                <div class="product-info">
                    <h3 class="product-name">
                        <a href="product-details.html?id=${product.id}">${product.name}</a>
                    </h3>
                    ${product.brand ? `<p class="product-brand">${product.brand}</p>` : ''}
                    <div class="product-price-wrapper">
                        ${isOnSale ? `<span class="original-price">৳${originalPrice.toLocaleString()}</span>` : ''}
                        <span class="product-price" style="${isOnSale ? 'color: #e74c3c;' : ''}">৳${displayPrice.toLocaleString()}</span>
                    </div>
                </div>
                <div class="card-actions">
                    <button class="card-action-btn" onclick="window.location.href='product-details.html?id=${product.id}'">
                        View Details
                    </button>
                    <button class="card-action-btn wishlist-btn" onclick="toggleWishlist(${product.id}, event)">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                        </svg>
                    </button>
                </div>
            </div>
        `;
    }).join('');
    
    // Check wishlist status
    checkWishlistStatus();
}

// Update results count
function updateResultsCount() {
    const count = filteredProducts.length;
    const countEl = document.getElementById('resultsCount');
    if (countEl) {
        countEl.textContent = `${count} product${count !== 1 ? 's' : ''} found`;
    }
}

// Wishlist functions (reuse from main script)
function toggleWishlist(productId, event) {
    event?.stopPropagation();
    event?.preventDefault();
    
    let wishlist = JSON.parse(localStorage.getItem('wishlist') || '[]');
    const index = wishlist.indexOf(productId);
    
    if (index > -1) {
        wishlist.splice(index, 1);
    } else {
        wishlist.push(productId);
    }
    
    localStorage.setItem('wishlist', JSON.stringify(wishlist));
    checkWishlistStatus();
}

function checkWishlistStatus() {
    const wishlist = JSON.parse(localStorage.getItem('wishlist') || '[]');
    document.querySelectorAll('.product-card').forEach(card => {
        const productId = parseInt(card.dataset.productId);
        const wishlistBtn = card.querySelector('.wishlist-btn');
        if (wishlist.includes(productId)) {
            wishlistBtn?.classList.add('active');
        } else {
            wishlistBtn?.classList.remove('active');
        }
    });
}

// Mobile Filter Toggle
window.toggleFilters = function() {
    const sidebar = document.querySelector('.filters-sidebar');
    const overlay = document.querySelector('.filters-overlay');
    
    if (sidebar && overlay) {
        sidebar.classList.toggle('active');
        overlay.classList.toggle('active');
        
        // Prevent body scroll when filters are open
        if (sidebar.classList.contains('active')) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
    }
}
