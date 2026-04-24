import { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { ToastContainer } from '@/components/ui/Toast';
import Layout from '@/components/layout/Layout';
import AdminLayout from '@/pages/admin/AdminLayout';

// Public pages
const Home = lazy(() => import('@/pages/Home'));
const Shop = lazy(() => import('@/pages/Shop'));
const Category = lazy(() => import('@/pages/Category'));
const Product = lazy(() => import('@/pages/Product'));
const Checkout = lazy(() => import('@/pages/Checkout'));
const OrderConfirmation = lazy(() => import('@/pages/OrderConfirmation'));
const Contact = lazy(() => import('@/pages/Contact'));
const TermsOfService = lazy(() => import('@/pages/TermsOfService'));
const PrivacyPolicy = lazy(() => import('@/pages/PrivacyPolicy'));
const NotFound = lazy(() => import('@/pages/NotFound'));

// Admin pages
const AdminLogin = lazy(() => import('@/pages/admin/AdminLogin'));
const Dashboard = lazy(() => import('@/pages/admin/Dashboard'));
const ProductsManager = lazy(() => import('@/pages/admin/ProductsManager'));
const OrdersManager = lazy(() => import('@/pages/admin/OrdersManager'));
const CategoriesManager = lazy(() => import('@/pages/admin/CategoriesManager'));
const AdminSettings = lazy(() => import('@/pages/admin/Settings'));
const Messages = lazy(() => import('@/pages/admin/Messages'));
const Newsletter = lazy(() => import('@/pages/admin/Newsletter'));

const Loader = () => (
  <div className="min-h-screen bg-[#050505] flex items-center justify-center">
    <p className="font-mono text-xs text-[#FF0000] animate-pulse tracking-widest uppercase">
      LOADING...
    </p>
  </div>
);

export default function App() {
  return (
    <HelmetProvider>
      <BrowserRouter>
        <Suspense fallback={<Loader />}>
          <Routes>
            {/* Public */}
            <Route path="/" element={<Layout />}>
              <Route index element={<Home />} />
              <Route path="shop" element={<Shop />} />
              <Route path="category/:slug" element={<Category />} />
              <Route path="product/:slug" element={<Product />} />
              <Route path="checkout" element={<Checkout />} />
              <Route path="order-confirmation/:orderNumber" element={<OrderConfirmation />} />
              <Route path="contact" element={<Contact />} />
              <Route path="terms" element={<TermsOfService />} />
              <Route path="privacy-policy" element={<PrivacyPolicy />} />
              <Route path="*" element={<NotFound />} />
            </Route>

            {/* Admin login (no layout) */}
            <Route path="/admin/login" element={<AdminLogin />} />

            {/* Admin panel */}
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<Dashboard />} />
              <Route path="products" element={<ProductsManager />} />
              <Route path="orders" element={<OrdersManager />} />
              <Route path="categories" element={<CategoriesManager />} />
              <Route path="messages" element={<Messages />} />
              <Route path="newsletter" element={<Newsletter />} />
              <Route path="settings" element={<AdminSettings />} />
            </Route>
          </Routes>
        </Suspense>
        <ToastContainer />
      </BrowserRouter>
    </HelmetProvider>
  );
}
