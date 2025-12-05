# ⌚ Chronos Timepieces - Premium E-commerce Store

A modern, responsive e-commerce website for luxury watches built with vanilla HTML, CSS, and JavaScript with Supabase backend.

![Chronos Timepieces](assets/logo/chronos-logo.jpg)

## ✨ Features

### 🛍️ E-commerce Functionality

- **Product Catalog** - Beautiful grid layout with category filtering
- **Product Details** - Image gallery, quantity selector, shipping options
- **Shopping Cart** - Persistent cart with localStorage
- **Wishlist** - Save favorites (requires authentication)
- **Search** - Live search with instant preview
- **Checkout** - Cash on Delivery payment system

### 🎨 Design

- **Premium Dark Theme** - Luxury aesthetic with gold accents
- **Responsive Design** - Mobile-first approach
- **Smooth Animations** - Micro-interactions and transitions
- **Hero Carousel** - Infinite sliding watch showcase
- **Floating WhatsApp** - Easy customer contact

### 👤 User Features

- **User Authentication** - Sign up, login, Google OAuth
- **Wishlist Management** - Add/remove favorites
- **Order History** - Track past orders

### 👨‍💼 Admin Panel

- **Dashboard** - Revenue, orders, products overview
- **Product Management** - Add, edit, delete products
- **Order Management** - View and update order status
- **Stock Control** - Inventory tracking

## 🚀 Tech Stack

- **Frontend**: HTML5, CSS3, Vanilla JavaScript (ES6+)
- **Backend**: [Supabase](https://supabase.com) (PostgreSQL, Auth, Realtime)
- **Styling**: Custom CSS with CSS Variables
- **Icons**: SVG icons
- **Fonts**: Google Fonts (Playfair Display SC, Inter)

## 📦 Installation

### 1. Clone the repository

```bash
git clone https://github.com/Z1NX-34/chronos-timepieces.git
cd chronos-timepieces
```

### 2. Set up Supabase

1. Create a free account at [supabase.com](https://supabase.com)
2. Create a new project
3. Go to **Settings > API** to get your credentials
4. Copy `supabase-config.example.js` to `supabase-config.js`:
   ```bash
   cp supabase-config.example.js supabase-config.js
   ```
5. Add your credentials to `supabase-config.js`:
   ```javascript
   const SUPABASE_URL = "your-project-url";
   const SUPABASE_ANON_KEY = "your-anon-key";
   ```

### 3. Set up Database

Run this SQL in your Supabase SQL Editor:

```sql
-- Products table
CREATE TABLE products (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  sale_price DECIMAL(10,2),
  is_on_sale BOOLEAN DEFAULT false,
  image TEXT,
  extra_images TEXT[],
  category VARCHAR(50),
  description TEXT,
  short_description TEXT,
  sku VARCHAR(50),
  brand VARCHAR(100),
  badge VARCHAR(50),
  stock_quantity INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Orders table
CREATE TABLE orders (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  total DECIMAL(10,2),
  shipping_info JSONB,
  status VARCHAR(50) DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT NOW()
);

-- Order items table
CREATE TABLE order_items (
  id SERIAL PRIMARY KEY,
  order_id INTEGER REFERENCES orders(id),
  product_id INTEGER REFERENCES products(id),
  quantity INTEGER,
  price DECIMAL(10,2)
);

-- Wishlist table
CREATE TABLE wishlist (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  product_id INTEGER REFERENCES products(id),
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, product_id)
);
```

### 4. Run locally

You need a local server (ES modules don't work with file:// protocol):

```bash
# Using Node.js
npx serve

# Or using Python
python -m http.server 8080
```

Open `http://localhost:8080` in your browser.

## 📁 Project Structure

```
chronos-timepieces/
├── index.html              # Homepage
├── product-details.html    # Product detail page
├── cart.html               # Shopping cart
├── checkout.html           # Checkout page
├── wishlist.html           # User wishlist
├── login.html              # Authentication
├── admin.html              # Admin dashboard
├── search.html             # Search results
├── about.html              # About page
├── contact.html            # Contact page
├── styles.css              # Main stylesheet
├── script.js               # Main JavaScript
├── enhanced-features.js    # Additional features
├── supabase-config.js      # Supabase credentials (gitignored)
├── supabase-config.example.js  # Example config
└── assets/
    ├── images/             # Product images
    └── logo/               # Brand assets
```

## 🖼️ Screenshots

### Homepage

![Homepage](screenshots/homepage.png)

### Product Details

![Product Details](screenshots/product-details.png)

### Admin Panel

![Admin Panel](screenshots/admin.png)

## 🛠️ Customization

### Change Theme Colors

Edit CSS variables in `styles.css`:

```css
:root {
  --gold: #d4af37;
  --navy: #0a1b2a;
  --white: #ffffff;
}
```

### Add Products

Use the Admin Panel at `/admin.html` or insert directly into Supabase.

## 📱 Responsive Breakpoints

- **Desktop**: > 1024px
- **Tablet**: 768px - 1024px
- **Mobile**: < 768px

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the project
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👨‍💻 Author

**Z1NX**

- GitHub: [@Z1NX-34](https://github.com/Z1NX-34)
- Portfolio: [z1nx-portfolio.vercel.app](https://z1nx-portfolio.vercel.app)

## 🙏 Acknowledgments

- [Supabase](https://supabase.com) for the awesome backend
- [Google Fonts](https://fonts.google.com) for typography
- Watch images from various sources

---

⭐ **Star this repo if you found it helpful!**
