import { useState, useEffect, lazy, Suspense } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import Cart from './components/Cart'
import Footer from './components/Footer'
import HomePage from './pages/HomePage'
import './App.css'

const KvartetaPage = lazy(() => import('./pages/KvartetaPage'))
const PexesoPage = lazy(() => import('./pages/PexesoPage'))
const HraciKartyPage = lazy(() => import('./pages/HraciKartyPage'))
const RulesPage = lazy(() => import('./pages/RulesPage'))
const CheckoutPage = lazy(() => import('./pages/CheckoutPage'))
const AuthPage = lazy(() => import('./pages/AuthPage'))

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
  customStats?: Record<string, string[]>;
  customCardNames?: Record<string, string>;
  customDescriptions?: Record<string, string>;
  customStatLayouts?: Record<string, string>;
  hideStats?: boolean;
  size?: string;
}

import { AuthProvider } from './context/AuthContext'

function App() {
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [cartItems, setCartItems] = useState<CartItem[]>(() => {
    const saved = localStorage.getItem('hromadovky_cart');
    if (!saved) return [];
    try {
      return JSON.parse(saved) as CartItem[];
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
      // Find matching item by id, selectedBack, AND size
      const existing = prev.find(item => item.id === product.id && item.selectedBack === product.selectedBack && item.size === product.size);
      if (existing) {
        return prev.map(item => (item.id === product.id && item.selectedBack === product.selectedBack && item.size === product.size) ? { ...item, quantity: item.quantity + 1 } : item);
      }
      return [...prev, { ...product, quantity: 1 }];
    });
    setIsCartOpen(true);
  };

  const clearCart = () => {
    setCartItems([]);
  };

  const removeFromCart = (id: string, selectedBack?: string, size?: string) => {
    setCartItems(prev => prev.filter(item => !(item.id === id && item.selectedBack === selectedBack && item.size === size)));
  };

  const updateQuantity = (id: string, amount: number, selectedBack?: string, size?: string) => {
    setCartItems(prev => prev.map(item => {
      if (item.id === id && item.selectedBack === selectedBack && item.size === size) {
        const newQuantity = item.quantity + amount;
        return newQuantity > 0 ? { ...item, quantity: newQuantity } : item;
      }
      return item;
    }));
  };

  return (
    <AuthProvider>
      <Router>
        <div className="app-container">
          {/* Animated Pastel Mesh Background */}
          <div className="pastel-mesh-bg">
            <div className="blob"></div>
          </div>

          <Navbar toggleCart={toggleCart} cartCount={cartItems.reduce((acc, item) => acc + item.quantity, 0)} />

          <main>
            <Suspense fallback={<div style={{ minHeight: '60vh' }} />}>
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/kvarteta" element={<KvartetaPage onAddToCart={addToCart} />} />
                <Route path="/pexeso" element={<PexesoPage onAddToCart={addToCart} />} />
                <Route path="/karty" element={<HraciKartyPage onAddToCart={addToCart} />} />
                <Route path="/pravidla" element={<RulesPage />} />
                <Route path="/checkout" element={<CheckoutPage items={cartItems} onClearCart={clearCart} />} />
                <Route path="/login" element={<AuthPage />} />
              </Routes>
            </Suspense>
          </main>

          <Footer />

          <Cart
            isOpen={isCartOpen}
            onClose={() => setIsCartOpen(false)}
            items={cartItems}
            onRemove={removeFromCart}
            onUpdateQuantity={updateQuantity}
          />
        </div>
      </Router>
    </AuthProvider>
  )
}

export default App
