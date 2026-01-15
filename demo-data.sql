-- ============================================
-- DEMO DATA FOR ENHANCED FEATURES
-- Run these in Supabase SQL Editor
-- ============================================

-- 1. ADD SAMPLE COUPONS
INSERT INTO coupons (code, discount_percent, min_purchase, max_uses, is_active, expires_at) VALUES
('WELCOME10', 10, 0, 100, true, NOW() + INTERVAL '30 days'),
('SAVE500', NULL, 5000, 50, true, NOW() + INTERVAL '7 days'),
('VIP20', 20, 10000, 25, true, NOW() + INTERVAL '14 days'),
('FLASH15', 15, 3000, 200, true, NOW() + INTERVAL '3 days');

-- Note: WELCOME10 = 10% off any order
--       SAVE500 = ৳500 off orders over ৳5000
--       VIP20 = 20% off orders over ৳10000
--       FLASH15 = 15% off orders over ৳3000

-- Update SAVE500 to use discount_amount instead of percent
UPDATE coupons SET discount_amount = 500, discount_percent = NULL WHERE code = 'SAVE500';

-- 2. ADD SAMPLE TESTIMONIALS
INSERT INTO testimonials (customer_name, customer_image, rating, comment, is_featured) VALUES
('Ahmed Khan', 'https://ui-avatars.com/api/?name=Ahmed+Khan&background=D4AF37&color=0A1B2A', 5, 'Absolutely stunning timepiece! The quality exceeded my expectations. Fast delivery and excellent customer service.', true),
('Fatima Rahman', 'https://ui-avatars.com/api/?name=Fatima+Rahman&background=D4AF37&color=0A1B2A', 5, 'I bought the Aura Milano Classic and I am in love! Perfect for everyday wear. Highly recommend Chronos!', true),
('Karim Hossain', 'https://ui-avatars.com/api/?name=Karim+Hossain&background=D4AF37&color=0A1B2A', 4, 'Great collection of watches. The Elite Luxury series is worth every taka. Will definitely buy again!', true);

-- 3. UPDATE EXISTING PRODUCTS WITH SALE PRICES
-- Put Aura Milano Classic on sale (assuming it's product ID 1)
UPDATE products 
SET is_on_sale = true, 
    sale_price = 549,
    stock_quantity = 15
WHERE id = 1;

-- Put another product on sale with low stock
UPDATE products 
SET is_on_sale = true, 
    sale_price = 1199,
    stock_quantity = 3
WHERE id = 2;

-- Set some products out of stock
UPDATE products 
SET stock_quantity = 0
WHERE id = 3;

-- Set normal stock for others
UPDATE products 
SET stock_quantity = 25
WHERE id >= 4;

-- 4. ADD SKUs TO PRODUCTS
UPDATE products SET sku = 'CH-AMC-001' WHERE id = 1;
UPDATE products SET sku = 'CH-ELC-002' WHERE id = 2;
UPDATE products SET sku = 'CH-LUX-003' WHERE id = 3;
UPDATE products SET sku = 'CH-SPT-004' WHERE id = 4;

-- ============================================
-- VERIFICATION QUERIES
-- ============================================

-- Check coupons
SELECT code, discount_percent, discount_amount, min_purchase, max_uses, is_active 
FROM coupons;

-- Check testimonials
SELECT customer_name, rating, is_featured 
FROM testimonials;

-- Check products with sales
SELECT id, name, price, sale_price, is_on_sale, stock_quantity, sku 
FROM products 
ORDER BY id;

-- ============================================
-- TESTING INSTRUCTIONS
-- ============================================

/*
1. COUPON TESTING:
   - Go to cart page
   - Enter "WELCOME10" - should give 10% off
   - Enter "SAVE500" - should give ৳500 off (if cart > ৳5000)
   - Enter "EXPIRED" - should show error

2. SALE PRICING:
   - Visit homepage
   - Product ID 1 should show:
     * Original price strikethrough
     * Sale price in gold
     * Red "SALE" badge
     * Discount percentage badge

3. STOCK INDICATORS:
   - Product ID 1: Green "In Stock" (15 items)
   - Product ID 2: Orange "Only 3 left!" (low stock)
   - Product ID 3: Red "Out of Stock"

4. TESTIMONIALS:
   - Should appear on homepage (if container exists)
   - 3 featured testimonials with 5-star ratings

5. SEARCH & FILTERS:
   - Search for "Aura" - should find product
   - Filter by category
   - Sort by price

6. MOBILE FEATURES:
   - Resize browser to mobile (< 768px)
   - Bottom navigation should appear
   - Cart badge should show count

7. TRUST BADGES:
   - Scroll to bottom of homepage
   - Hover over badges for tooltips

8. PURCHASE NOTIFICATIONS:
   - Wait 3 seconds after page load
   - Notification should appear bottom-left
   - Auto-rotates every 15 seconds
*/

-- ============================================
-- CLEANUP (if needed)
-- ============================================

-- Remove all test coupons
-- DELETE FROM coupons WHERE code LIKE '%TEST%';

-- Remove test testimonials
-- DELETE FROM testimonials WHERE customer_name LIKE '%Test%';

-- Reset product sales
-- UPDATE products SET is_on_sale = false, sale_price = NULL;
