import { useState, useEffect, lazy, Suspense } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { HelmetProvider } from 'react-helmet-async'
import Navbar from './components/Navbar'
import Cart from './components/Cart'
import Footer from './components/Footer'
import CookieBanner from './components/CookieBanner'
import { ErrorBoundary } from './components/ErrorBoundary'
import HomePage from './pages/HomePage'
import NotFoundPage from './pages/NotFoundPage'
import { RequireAdmin } from './components/RequireAdmin'
import type { PackagingType } from './data/packaging'
import './App.css'

// Lazy-loaded routes — reduce initial bundle for non-home pages
const KvartetaPage = lazy(() => import('./pages/KvartetaPage'))
const PexesoPage = lazy(() => import('./pages/PexesoPage'))
const HraciKartyPage = lazy(() => import('./pages/HraciKartyPage'))
const ProductDetailPage = lazy(() => import('./pages/ProductDetailPage'))
const FAQPage = lazy(() => import('./pages/FAQPage'))
const AboutPage = lazy(() => import('./pages/AboutPage'))
const TermsPage = lazy(() => import('./pages/TermsPage'))
const ReturnsPage = lazy(() => import('./pages/ReturnsPage'))
const PrivacyPage = lazy(() => import('./pages/PrivacyPage'))
const CheckoutPage = lazy(() => import('./pages/CheckoutPage'))
const AuthPage = lazy(() => import('./pages/AuthPage'))
const ResetPasswordPage = lazy(() => import('./pages/ResetPasswordPage'))
const AdminInvoicesPage = lazy(() => import('./pages/AdminInvoicesPage'))

const RouteFallback = () => (
  <div
    role="status"
    aria-live="polite"
    aria-busy="true"
    style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
  >
    <div style={{ opacity: 0.5 }}>Načítám…</div>
  </div>
)

export interface CartItem {
  id: string;
  name: string;
  price: number;
  image: string | string[];
  quantity: number;
  description?: string;
  themeColor?: string;
  selectedBack?: string; // Optional card back selection
  groupName?: string;
  statShape?: string;
  statLayout?: string;
  style?: string;
  note?: string;
  customPhotos?: Record<string, string>;
  customPhotoPaths?: string[];
  renderedCardPaths?: string[];
  cardBackRef?: { name: string; publicUrl: string };
  customStats?: Record<string, string[]>;
  customCardNames?: Record<string, string>;
  customDescriptions?: Record<string, string>;
  customStatLayouts?: Record<string, string>;
  hideStats?: boolean;
  size?: string;
  packaging?: PackagingType;
}

import { AuthProvider } from './context/AuthContext'
import { migrateLegacyBackUrl } from './data/backgrounds'

function App() {
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [cartItems, setCartItems] = useState<CartItem[]>(() => {
    const saved = localStorage.getItem('hromadovky_cart');
    if (!saved) return [];
    try {
      const parsed = JSON.parse(saved) as CartItem[];
      return parsed.map((item) => ({
        ...item,
        selectedBack: migrateLegacyBackUrl(item.selectedBack) ?? item.selectedBack,
      }));
    } catch {
      return [];
    }
  });

  // Save to localStorage whenever cartItems changes
  useEffect(() => {
    localStorage.setItem('hromadovky_cart', JSON.stringify(cartItems));
  }, [cartItems]);

  const toggleCart = () => setIsCartOpen(!isCartOpen);

  const addToCart = (product: Omit<CartItem, 'quantity'>) => {
    setCartItems(prev => {
      // Find matching item by id, selectedBack, size AND packaging
      const sameLine = (item: CartItem) =>
        item.id === product.id &&
        item.selectedBack === product.selectedBack &&
        item.size === product.size &&
        item.packaging === product.packaging;
      const existing = prev.find(sameLine);
      if (existing) {
        return prev.map(item => sameLine(item) ? { ...item, quantity: item.quantity + 1 } : item);
      }
      return [...prev, { ...product, quantity: 1 }];
    });
    setIsCartOpen(true);
  };

  const clearCart = () => {
    setCartItems([]);
  };

  const removeFromCart = (id: string, selectedBack?: string, size?: string, packaging?: PackagingType) => {
    setCartItems(prev => prev.filter(item => !(item.id === id && item.selectedBack === selectedBack && item.size === size && item.packaging === packaging)));
  };

  const updateQuantity = (id: string, amount: number, selectedBack?: string, size?: string, packaging?: PackagingType) => {
    setCartItems(prev => prev.map(item => {
      if (item.id === id && item.selectedBack === selectedBack && item.size === size && item.packaging === packaging) {
        const newQuantity = item.quantity + amount;
        return newQuantity > 0 ? { ...item, quantity: newQuantity } : item;
      }
      return item;
    }));
  };

  return (
    <HelmetProvider>
      <AuthProvider>
        <Router>
          <div className="app-container">
          {/* Animated Pastel Mesh Background */}
          <div className="pastel-mesh-bg">
            <div className="blob"></div>
          </div>

          <Navbar toggleCart={toggleCart} cartCount={cartItems.reduce((acc, item) => acc + item.quantity, 0)} />

          <main>
            <ErrorBoundary>
            <Suspense fallback={<RouteFallback />}>
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/kvarteta" element={<KvartetaPage onAddToCart={addToCart} />} />
                <Route path="/kvarteta/:slug" element={<ProductDetailPage category="kvarteta" />} />
                <Route path="/pexeso" element={<PexesoPage onAddToCart={addToCart} />} />
                <Route path="/pexeso/:slug" element={<ProductDetailPage category="pexeso" />} />
                <Route path="/karty" element={<HraciKartyPage onAddToCart={addToCart} />} />
                <Route path="/karty/:slug" element={<ProductDetailPage category="karty" />} />
                <Route path="/faq" element={<FAQPage />} />
                <Route path="/o-nas" element={<AboutPage />} />
                <Route path="/obchodni-podminky" element={<TermsPage />} />
                <Route path="/reklamacni-rad" element={<ReturnsPage />} />
                <Route path="/gdpr" element={<PrivacyPage />} />
                <Route path="/checkout" element={<CheckoutPage items={cartItems} onClearCart={clearCart} />} />
                <Route path="/login" element={<AuthPage />} />
                <Route path="/reset-password" element={<ResetPasswordPage />} />
                <Route
                  path="/admin/invoices"
                  element={
                    <RequireAdmin>
                      <AdminInvoicesPage />
                    </RequireAdmin>
                  }
                />
                {/* Neznámá URL → reálná 404 stránka (noindex), ne tichý redirect. */}
                <Route path="*" element={<NotFoundPage />} />
              </Routes>
            </Suspense>
            </ErrorBoundary>
          </main>

          <Footer />

          <Cart
            isOpen={isCartOpen}
            onClose={() => setIsCartOpen(false)}
            items={cartItems}
            onRemove={removeFromCart}
            onUpdateQuantity={updateQuantity}
          />

          <CookieBanner />
          </div>
        </Router>
      </AuthProvider>
    </HelmetProvider>
  )
}

export default App
