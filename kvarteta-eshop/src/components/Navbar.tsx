import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import './Navbar.css';

interface NavbarProps {
    toggleCart: () => void;
    cartCount: number;
}

const Navbar: React.FC<NavbarProps> = ({ toggleCart, cartCount }) => {
    const [scrolled, setScrolled] = useState(false);
    const location = useLocation();

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
                <div className="logo">
                    <img src="/logo.webp" alt="Hromadovky Logo" className="navbar-logo-img" />
                    <span className="text-gradient-gold">HROMADOVKY</span>
                    <span className="logo-subtitle">| karty plné příběhů</span>
                </div>

                <nav className="nav-links">
                    <Link to="/" className={`nav-link ${location.pathname === '/' ? 'active' : ''}`}>Kvarteta</Link>
                    <Link to="/pexeso" className={`nav-link ${location.pathname === '/pexeso' ? 'active' : ''}`}>Pexeso</Link>
                    <Link to="/karty" className={`nav-link ${location.pathname === '/karty' ? 'active' : ''}`}>Hrací karty</Link>
                </nav>

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
            </div>
        </header>
    );
};

export default Navbar;
