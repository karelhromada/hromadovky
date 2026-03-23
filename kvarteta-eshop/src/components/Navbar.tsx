import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import './Navbar.css';

interface NavbarProps {
    toggleCart: () => void;
    cartCount: number;
}

const Navbar: React.FC<NavbarProps> = ({ toggleCart, cartCount }) => {
    const [scrolled, setScrolled] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const location = useLocation();
    const { user, profile } = useAuth();

    // Close mobile menu when route changes
    useEffect(() => {
        setMobileMenuOpen(false);
    }, [location]);

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <header className={`navbar ${scrolled ? 'scrolled glass-panel' : ''}`}>
            <div className="navbar-container container">
                <Link to="/" className="logo">
                    <img src="/logo.webp" alt="Hromadovky Logo" className="navbar-logo-img" />
                    <span className="text-gradient-gold">HROMADOVKY</span>
                    <span className="logo-subtitle">| karty plné příběhů</span>
                </Link>

                <nav className="nav-links">
                    <Link to="/" className={`nav-link ${location.pathname === '/' ? 'active' : ''}`}>Domů</Link>
                    <Link to="/kvarteta" className={`nav-link ${location.pathname === '/kvarteta' ? 'active' : ''}`}>Kvarteta</Link>
                    <Link to="/pexeso" className={`nav-link ${location.pathname === '/pexeso' ? 'active' : ''}`}>Pexeso</Link>
                    <Link to="/karty" className={`nav-link ${location.pathname === '/karty' ? 'active' : ''}`}>Hrací karty</Link>
                    <Link to="/pravidla" className={`nav-link ${location.pathname === '/pravidla' ? 'active' : ''}`}>Pravidla hry</Link>
                </nav>

                <div className="nav-actions">
                    <Link to="/login" className={`nav-link-icon ${location.pathname === '/login' ? 'active' : ''}`} aria-label="Profil">
                        <User size={22} />
                        {user && <span className="nav-user-name">{profile?.first_name || 'Profil'}</span>}
                    </Link>

                    <button className="cart-button" onClick={toggleCart} aria-label="Košík">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
                            <line x1="3" y1="6" x2="21" y2="6"></line>
                            <path d="M16 10a4 4 0 0 1-8 0"></path>
                        </svg>
                        {cartCount > 0 && (
                            <span className="cart-badge">{cartCount}</span>
                        )}
                    </button>

                    <button
                        className="mobile-menu-btn"
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                        aria-label="Menu"
                    >
                        {mobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
                    </button>
                </div>
            </div>

            {/* Mobile Navigation Menu */}
            <div className={`mobile-nav ${mobileMenuOpen ? 'open' : ''}`}>
                <nav className="mobile-nav-links">
                    <Link to="/" className={`mobile-nav-link ${location.pathname === '/' ? 'active' : ''}`}>Domů</Link>
                    <Link to="/kvarteta" className={`mobile-nav-link ${location.pathname === '/kvarteta' ? 'active' : ''}`}>Kvarteta</Link>
                    <Link to="/pexeso" className={`mobile-nav-link ${location.pathname === '/pexeso' ? 'active' : ''}`}>Pexeso</Link>
                    <Link to="/karty" className={`mobile-nav-link ${location.pathname === '/karty' ? 'active' : ''}`}>Hrací karty</Link>
                    <Link to="/pravidla" className={`mobile-nav-link ${location.pathname === '/pravidla' ? 'active' : ''}`}>Pravidla hry</Link>
                    <Link to="/login" className={`mobile-nav-link ${location.pathname === '/login' ? 'active' : ''}`}>
                        <User size={20} style={{ marginRight: '10px' }} />
                        {user ? (profile?.first_name || 'Můj profil') : 'Přihlásit se'}
                    </Link>
                </nav>
            </div>


        </header>
    );
};

export default Navbar;
