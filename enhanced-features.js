// Enhanced Features JavaScript - CLEANED VERSION
// Only includes actively used functionality

// Note: This file does not require Supabase

// ========== MOBILE FEATURES ==========

// Mobile Bottom Navigation
function initMobileNav() {
  const currentPage = window.location.pathname.split('/').pop() || 'index.html';
  
  document.querySelectorAll('.mobile-nav-item').forEach(item => {
    const href = item.getAttribute('href');
    if (href && href.includes(currentPage)) {
      item.classList.add('active');
    }
  });
  
  // Update cart badge
  updateMobileCartBadge();
}

function updateMobileCartBadge() {
  const cart = JSON.parse(localStorage.getItem('cart') || '[]');
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  
  const badges = document.querySelectorAll('.mobile-nav-badge, .cart-count');
  badges.forEach(badge => {
    if (badge) {
      badge.textContent = totalItems;
      if (badge.classList.contains('mobile-nav-badge')) {
        badge.style.display = totalItems > 0 ? 'block' : 'none';
      }
    }
  });
}

// ========== STOCK STATUS ==========

// Get stock status for a product
function getStockStatus(quantity) {
  if (!quantity || quantity === 0) {
    return { class: 'out-of-stock', text: 'Out of Stock', canOrder: false };
  } else if (quantity <= 5) {
    return { class: 'low-stock', text: `Only ${quantity} left!`, canOrder: true };
  } else {
    return { class: 'in-stock', text: 'In Stock', canOrder: true };
  }
}

// ========== ANIMATIONS ==========

// Cart shake animation when item added
window.shakeCart = function() {
  const cartBtn = document.getElementById('cartBtn');
  if (cartBtn) {
    cartBtn.classList.add('cart-shake');
    setTimeout(() => cartBtn.classList.remove('cart-shake'), 500);
  }
};

// ========== MOBILE SECTION REORDERING ==========

function reorderSectionsForMobile() {
  const isMobile = window.innerWidth <= 768;
  
  if (!isMobile) return;
  
  const heroSection = document.querySelector('.hero-modern');
  const productsSection = document.querySelector('.all-products-section');
  const servicesSection = document.querySelector('.services-section');
  
  if (!heroSection || !productsSection || !servicesSection) return;
  
  // Move products section right after hero section
  // Insert products before services (which comes after hero)
  if (servicesSection.previousElementSibling !== productsSection) {
    heroSection.parentNode.insertBefore(productsSection, servicesSection);
  }
}

// ========== INITIALIZE ==========

function initEnhancedFeatures() {
  initMobileNav();
  initHeroWatch();
  reorderSectionsForMobile();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initEnhancedFeatures);
} else {
  initEnhancedFeatures();
}

// Handle window resize
let resizeTimer;
window.addEventListener('resize', () => {
  clearTimeout(resizeTimer);
  resizeTimer = setTimeout(() => {
    reorderSectionsForMobile();
  }, 250);
});

// ========== HERO WATCH ANIMATION ==========

function initHeroWatch() {
  const hourHand = document.getElementById('hourHand');
  const minuteHand = document.getElementById('minuteHand');
  const secondHand = document.getElementById('secondHand');
  const heroWatch = document.getElementById('heroWatch');
  
  if (!hourHand || !minuteHand || !secondHand || !heroWatch) return;
  
  // Update clock hands in real-time
  function updateClock() {
    const now = new Date();
    
    const hours = now.getHours() % 12;
    const minutes = now.getMinutes();
    const seconds = now.getSeconds();
    const milliseconds = now.getMilliseconds();
    
    // Calculate precise angles
    const secondAngle = ((seconds + milliseconds / 1000) * 6); // 6 degrees per second
    const minuteAngle = ((minutes + seconds / 60) * 6); // 6 degrees per minute
    const hourAngle = ((hours + minutes / 60) * 30); // 30 degrees per hour
    
    // Apply transforms with hardware acceleration
    hourHand.style.transform = `rotate(${hourAngle}deg)`;
    minuteHand.style.transform = `rotate(${minuteAngle}deg)`;
    secondHand.style.transform = `rotate(${secondAngle}deg)`;
    
    // Use requestAnimationFrame for smooth 60fps animation
    requestAnimationFrame(updateClock);
  }
  
  // Start the clock
  updateClock();
  
  // Scroll-based parallax effect (throttled for performance)
  let scrollTimeout;
  let lastScrollY = window.scrollY;
  
  function handleScroll() {
    if (scrollTimeout) return;
    
    scrollTimeout = setTimeout(() => {
      const scrollY = window.scrollY;
      const scrollDelta = scrollY - lastScrollY;
      
      // Calculate parallax transform
      const heroSection = document.querySelector('.hero-modern');
      if (!heroSection) return;
      
      const heroHeight = heroSection.offsetHeight;
      const scrollPercent = Math.min(scrollY / heroHeight, 1);
      
      // Parallax: move watch slower than scroll (depth effect)
      const parallaxY = scrollY * 0.3;
      
      // Rotate slightly based on scroll for dynamic effect
      const rotateAmount = scrollPercent * 15; // Max 15 degrees rotation
      
      // Scale down slightly as user scrolls
      const scaleAmount = 1 - (scrollPercent * 0.2); // Scale from 1 to 0.8
      
      // Apply combined transform
      heroWatch.style.transform = `translate(-50%, calc(-50% + ${parallaxY}px)) rotate(${rotateAmount}deg) scale(${scaleAmount})`;
      
      lastScrollY = scrollY;
      scrollTimeout = null;
    }, 16); // ~60fps throttle
  }
  
  // Add scroll listener with passive flag for better performance
  window.addEventListener('scroll', handleScroll, { passive: true });
  
  // Cleanup on page unload
  window.addEventListener('beforeunload', () => {
    window.removeEventListener('scroll', handleScroll);
  });
}

// ========== HERO CAROUSEL - HORIZONTAL SLIDE ==========

function initHeroCarousel() {
  const carousel = document.getElementById('heroCarousel');
  const track = document.getElementById('carouselTrack');
  const dotsContainer = document.getElementById('carouselDots');
  
  if (!carousel || !track || !dotsContainer) return;
  
  const items = Array.from(track.querySelectorAll('.hero-carousel-item'));
  if (items.length === 0) return;
  
  // Get unique slides (remove duplicates)
  const totalItems = Math.floor(items.length / 2);
  items.slice(totalItems).forEach(item => item.remove());
  
  const originalSlides = items.slice(0, totalItems);
  
  // Clone first slide and append to end for infinite loop
  const firstClone = originalSlides[0].cloneNode(true);
  track.appendChild(firstClone);
  
  const allSlides = Array.from(track.querySelectorAll('.hero-carousel-item'));
  
  let currentIndex = 0;
  let intervalId;
  let isTransitioning = false;
  
  // Touch/Mouse drag variables
  let isDragging = false;
  let startPos = 0;
  let currentTranslate = 0;
  let prevTranslate = 0;
  
  // Create navigation dots (only for original slides)
  originalSlides.forEach((_, index) => {
    const dot = document.createElement('div');
    dot.classList.add('hero-carousel-dot');
    if (index === 0) dot.classList.add('active');
    dot.addEventListener('click', () => goToSlide(index));
    dotsContainer.appendChild(dot);
  });
  
  const dots = Array.from(dotsContainer.querySelectorAll('.hero-carousel-dot'));
  
  // Update slide position
  function updateSlidePosition(instant = false) {
    const offset = -currentIndex * 100;
    
    if (instant) {
      track.style.transition = 'none';
      track.style.transform = `translateX(${offset}%)`;
      // Force reflow
      track.offsetHeight;
      track.style.transition = 'transform 0.6s cubic-bezier(0.4, 0, 0.2, 1)';
    } else {
      track.style.transform = `translateX(${offset}%)`;
    }
    
    // Update dots (use modulo to handle clone)
    const dotIndex = currentIndex % originalSlides.length;
    dots.forEach((dot, index) => {
      dot.classList.toggle('active', index === dotIndex);
    });
  }
  
  // Go to specific slide
  function goToSlide(index) {
    if (isTransitioning) return;
    currentIndex = index;
    updateSlidePosition();
    resetInterval();
  }
  
  // Next slide with infinite loop
  function nextSlide() {
    if (isTransitioning) return;
    isTransitioning = true;
    
    currentIndex++;
    updateSlidePosition();
    
    // Check if we're at the clone
    if (currentIndex === allSlides.length - 1) {
      setTimeout(() => {
        // Reset to first slide instantly
        currentIndex = 0;
        updateSlidePosition(true);
        isTransitioning = false;
      }, 600); // Wait for transition to complete
    } else {
      setTimeout(() => {
        isTransitioning = false;
      }, 600);
    }
  }
  
  // Start auto-advance (3 seconds)
  function startAutoAdvance() {
    intervalId = setInterval(nextSlide, 3000);
  }
  
  // Reset interval
  function resetInterval() {
    if (intervalId) clearInterval(intervalId);
    startAutoAdvance();
  }
  
  // Touch/Mouse drag handlers
  function getPositionX(event) {
    return event.type.includes('mouse') ? event.pageX : event.touches[0].clientX;
  }
  
  function dragStart(event) {
    if (isTransitioning) return;
    isDragging = true;
    startPos = getPositionX(event);
    prevTranslate = -currentIndex * carousel.offsetWidth;
    
    if (intervalId) clearInterval(intervalId);
    track.style.transition = 'none';
  }
  
  function dragMove(event) {
    if (!isDragging) return;
    const currentPosition = getPositionX(event);
    const diff = currentPosition - startPos;
    currentTranslate = prevTranslate + diff;
    
    const percentage = (currentTranslate / carousel.offsetWidth) * 100;
    track.style.transform = `translateX(${percentage}%)`;
  }
  
  function dragEnd() {
    if (!isDragging) return;
    isDragging = false;
    
    const movedBy = currentTranslate - prevTranslate;
    const threshold = carousel.offsetWidth * 0.2;
    
    track.style.transition = 'transform 0.6s cubic-bezier(0.4, 0, 0.2, 1)';
    
    if (movedBy < -threshold && currentIndex < allSlides.length - 1) {
      currentIndex++;
    } else if (movedBy > threshold && currentIndex > 0) {
      currentIndex--;
    }
    
    updateSlidePosition();
    
    // Handle infinite loop after drag
    if (currentIndex === allSlides.length - 1) {
      setTimeout(() => {
        currentIndex = 0;
        updateSlidePosition(true);
      }, 600);
    }
    
    startAutoAdvance();
  }
  
  // Event listeners
  carousel.addEventListener('mousedown', dragStart);
  carousel.addEventListener('touchstart', dragStart, { passive: true });
  
  carousel.addEventListener('mousemove', dragMove);
  carousel.addEventListener('touchmove', dragMove, { passive: true });
  
  carousel.addEventListener('mouseup', dragEnd);
  carousel.addEventListener('mouseleave', dragEnd);
  carousel.addEventListener('touchend', dragEnd);
  
  // Prevent image dragging
  allSlides.forEach(slide => {
    const img = slide.querySelector('img');
    if (img) img.addEventListener('dragstart', (e) => e.preventDefault());
  });
  
  // Start carousel
  updateSlidePosition();
  startAutoAdvance();
  
  // Cleanup
  window.addEventListener('beforeunload', () => {
    if (intervalId) clearInterval(intervalId);
  });
}

// Initialize carousel on DOM load
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initHeroCarousel);
} else {
  initHeroCarousel();
}

// Export functions for use in other scripts
window.enhancedFeatures = {
  updateMobileCartBadge,
  shakeCart,
  getStockStatus
};
