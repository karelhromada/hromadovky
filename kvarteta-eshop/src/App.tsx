import { useState } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import Cart from './components/Cart'
import Footer from './components/Footer'
import KvartetaPage from './pages/KvartetaPage'
import PexesoPage from './pages/PexesoPage'
import HraciKartyPage from './pages/HraciKartyPage'
import './App.css'

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

function App() {
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);

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
    <Router>
      <div className="app-container">
        {/* Animated Pastel Mesh Background */}
        <div className="pastel-mesh-bg">
          <div className="blob"></div>
        </div>

        <Navbar toggleCart={toggleCart} cartCount={cartItems.reduce((acc, item) => acc + item.quantity, 0)} />

        <main>
          <Routes>
            <Route path="/" element={<KvartetaPage onAddToCart={addToCart} />} />
            <Route path="/pexeso" element={<PexesoPage onAddToCart={addToCart} />} />
            <Route path="/karty" element={<HraciKartyPage onAddToCart={addToCart} />} />
          </Routes>
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
  )
}

export default App
