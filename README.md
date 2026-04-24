# Northernwest

A fully custom-built cyberpunk e-commerce store for gaming peripherals — keyboards, mice, and headphones. Made by **Alaa Younsi** ([@alaayounsi](https://alaayounsi.vercel.app/)), with no Shopify, no WordPress. It is a 100% programmed web application.

---

## Live Store

northernwest.shop

---

## What Makes This Store Different

Most e-commerce sites run on platforms like Shopify or WooCommerce. Northernwest is built entirely from source code: a React SPA frontend, a PostgreSQL database hosted on Supabase, and a built-in admin dashboard — all programmed by hand, all tailored specifically for this brand.

### The Integrated Admin Dashboard

The store has a private `/admin` panel (authenticated via Supabase Auth) that gives full control over:

| Section | What It Does |
|---|---|
| **Dashboard** | Live analytics — unique visitors today, total unique visitors, total page views, top pages visited |
| **Products** | Create, edit, duplicate, delete products. Set prices, images, variants, stock levels, featured flag |
| **Categories** | Manage product categories with slug, bilingual name (EN/AR), sort order |
| **Orders** | View all customer orders, filter by status, update order status, export CSV |
| **Messages** | Read contact form submissions, mark as read, reply via email |
| **Newsletter** | View all subscribers, export CSV, bulk delete |
| **Settings** | Store configuration |

The dashboard connects directly to the Supabase database using the admin's authenticated session — no separate API server needed.

### The Database (Supabase + PostgreSQL)

All data lives in a Supabase project. The schema:

| Table | Description |
|---|---|
| `categories` | Product categories (slug, bilingual name, description, sort_order) |
| `products` | Products (name EN/AR, slug, price, images, is_active, is_featured, category FK) |
| `product_variants` | Variants per product (size, color, etc. — name, price_modifier, stock) |
| `orders` | Customer orders (customer info, shipping address, total, status) |
| `order_items` | Line items per order (product + variant FK, quantity, unit price) |
| `messages` | Contact form submissions |
| `newsletter_subscriptions` | Email newsletter subscribers |
| `page_visits` | Anonymous visitor analytics (visitor_id via localStorage, page, timestamp) |

**Row Level Security (RLS)** is active on every table:
- Public (anon key): can read products/categories, insert orders, insert messages, subscribe to newsletter, track visits.
- Authenticated (admin): full read/write on all tables.

---

## The Interactive Keyboard + Terminal Idea

The hero section of the home page features a custom-built **60% mechanical keyboard** rendered entirely in React using `clamp()`-based responsive CSS. Every key is a real DOM element. The keyboard comes to life with:

- **Hover effects** — individual keys light up in red (`#FF0000`) on hover, with a glow shadow.
- **Animated keypress** — a random key presses itself every 2 seconds, simulating someone typing.
- **Terminal panel** — a floating terminal window above the keyboard types out a fake code sequence character by character, with a blinking cursor, giving the hero a live hacking aesthetic.

This entire component lives in `src/components/ui/Keyboard60.tsx` and `src/components/ui/KeyboardWithTerminal.tsx` — no canvas, no WebGL, pure React + CSS.

---

## Tech Stack

| Layer | Technology |
|---|---|
| **Framework** | React 18 + Vite 5 + TypeScript (strict) |
| **Routing** | React Router v6 (lazy-loaded pages via `React.lazy`) |
| **Styling** | Tailwind CSS v3 (cyberpunk dark theme, custom fonts) |
| **Animations** | Framer Motion |
| **State** | Zustand (cart + auth, persisted to localStorage) |
| **Database** | Supabase (PostgreSQL + Auth + RLS) |
| **Forms** | React Hook Form + Zod |
| **i18n** | react-i18next (English + Arabic, RTL support) |
| **SEO** | react-helmet-async |
| **Icons** | Lucide React + custom SVG icons |
| **Deployment** | Vercel (Hobby plan, SPA catch-all rewrite) |

---

## Project Structure

```
Northernwest/
├── public/
│   └── logo.png                  # Store logo
├── src/
│   ├── components/
│   │   ├── icons/
│   │   │   └── index.tsx         # All custom SVG icons (social, category, cart)
│   │   ├── layout/
│   │   │   ├── Layout.tsx        # Public layout wrapper (Navbar + Footer + analytics + scroll-to-top)
│   │   │   ├── Navbar.tsx        # Top navigation (desktop + mobile slide menu, cart trigger)
│   │   │   └── Footer.tsx        # Footer with social links, quick links, legal links
│   │   ├── seo/
│   │   │   └── SEOHead.tsx       # Per-page <title> and <meta> via react-helmet-async
│   │   ├── shop/
│   │   │   ├── CartDrawer.tsx    # Sliding cart panel (CSS transition, always-rendered)
│   │   │   ├── ProductCard.tsx   # Product grid card
│   │   │   ├── ProductGrid.tsx   # Responsive product grid + skeleton loading
│   │   │   ├── VariantSelector.tsx
│   │   │   └── CategoryFilter.tsx
│   │   └── ui/
│   │       ├── Button.tsx        # Framer Motion button with variants (primary/secondary/ghost/danger)
│   │       ├── Badge.tsx         # Status/label badge
│   │       ├── Modal.tsx         # Accessible modal dialog
│   │       ├── Toast.tsx         # Toast notification system
│   │       ├── Keyboard60.tsx    # Interactive 60% keyboard (pure React + CSS)
│   │       └── KeyboardWithTerminal.tsx # Keyboard + animated terminal panel
│   ├── hooks/
│   │   ├── useProducts.ts        # Data hooks: useProducts, useProduct, useCategoryProducts, useFeatured
│   │   └── useAdmin.ts           # Admin data hooks: useAdminProducts, useAdminOrders, etc.
│   ├── lib/
│   │   ├── supabase.ts           # Supabase client (browser, anon key)
│   │   └── api.ts                # All data operations: api.products.*, api.orders.*, api.admin.*, etc.
│   ├── pages/
│   │   ├── Home.tsx              # Hero + categories + featured + marquee + newsletter
│   │   ├── Shop.tsx              # All products with sidebar filter
│   │   ├── Category.tsx          # Products filtered by category
│   │   ├── Product.tsx           # Product detail page (gallery, variants, add to cart)
│   │   ├── Checkout.tsx          # Checkout form (react-hook-form + zod)
│   │   ├── OrderConfirmation.tsx # Post-order thank-you page
│   │   ├── Contact.tsx           # Contact form (saved to messages table)
│   │   ├── TermsOfService.tsx    # Static legal page
│   │   ├── PrivacyPolicy.tsx     # Static legal page
│   │   ├── NotFound.tsx          # 404 page
│   │   └── admin/
│   │       ├── AdminLayout.tsx   # Admin shell (sidebar navigation, auth guard)
│   │       ├── AdminLogin.tsx    # Login page (Supabase signInWithPassword)
│   │       ├── Dashboard.tsx     # Analytics overview + visit stats
│   │       ├── ProductsManager.tsx
│   │       ├── ProductForm.tsx
│   │       ├── OrdersManager.tsx
│   │       ├── OrderDetail.tsx
│   │       ├── CategoriesManager.tsx
│   │       ├── Messages.tsx
│   │       ├── Newsletter.tsx
│   │       └── Settings.tsx
│   ├── store/
│   │   ├── cartStore.ts          # Zustand cart store (items, isCartOpen, openCart, closeCart — persisted)
│   │   └── authStore.ts          # Zustand auth store (session, persisted)
│   ├── types/
│   │   └── index.ts              # TypeScript types: Product, Order, Category, CartItem, etc.
│   ├── i18n/
│   │   └── index.ts              # i18next config + EN/AR translation strings
│   ├── App.tsx                   # Route definitions (React.lazy + Suspense)
│   └── main.tsx                  # Entry point
├── supabase/
│   ├── rls.sql                   # Row Level Security policies for core tables
│   ├── seed.sql                  # Initial category seed data
│   └── features.sql              # messages, newsletter_subscriptions, page_visits tables + RLS
├── index.html
├── vite.config.ts
├── tailwind.config.js
├── tsconfig.json
└── vercel.json                   # SPA catch-all rewrite rule
```

---

## Environment Variables

Set these in Vercel (and locally in `.env.local`):

```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

---

## Database Setup (First Time)

1. Create a Supabase project.
2. Run `supabase/rls.sql` in the SQL Editor → sets up RLS for products, categories, orders.
3. Run `supabase/seed.sql` → creates the 3 initial categories (Mouse, Headphones, Keyboards).
4. Run `supabase/features.sql` → creates messages, newsletter_subscriptions, page_visits tables with RLS.
5. Go to **Supabase Auth → Users** and create an admin user (email + password).
6. Log in at `/admin/login` with those credentials.

---

## Local Development

```bash
npm install
npm run dev       # http://localhost:5173
npm run build     # production build → dist/
npm run preview   # preview production build
```

---

## License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.

---

## Author

**Alaa Younsi** — Full-stack web developer.  
Portfolio: [alaayounsi.vercel.app](https://alaayounsi.vercel.app/)
