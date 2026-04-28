import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import './Navbar.css';

import { motion, AnimatePresence } from 'framer-motion';

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

    // Lock body scroll when mobile menu is open
    useEffect(() => {
        if (mobileMenuOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [mobileMenuOpen]);

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const menuLinks = [
        { path: '/kvarteta', label: 'Kvarteta' },
        { path: '/pexeso', label: 'Pexeso' },
        { path: '/karty', label: 'Hrací karty' },
        { path: '/o-nas', label: 'O nás' }
    ];

    return (
        <header className={`navbar ${scrolled ? 'scrolled glass-panel' : ''}`}>
            <div className="navbar-container container">
                <Link to="/" className="logo">
                    <img src="/logo.webp" alt="Hromadovky Logo" className="navbar-logo-img" />
                    <span className="text-gradient-gold">HROMADOVKY</span>
                    <span className="logo-subtitle">| karty plné příběhů</span>
                </Link>

                <nav className="nav-links">
                    {menuLinks.map(link => (
                        <Link 
                            key={link.path}
                            to={link.path} 
                            className={`nav-link ${location.pathname === link.path ? 'active' : ''}`}
                        >
                            {link.label}
                        </Link>
                    ))}
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
                        className={`mobile-menu-btn ${mobileMenuOpen ? 'menu-open-icon' : ''}`}
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                        aria-label="Menu"
                    >
                        {mobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
                    </button>
                </div>
            </div>

            {/* Mobile Navigation Menu */}
            <AnimatePresence>
                {mobileMenuOpen && (
                    <motion.div 
                        initial={{ x: '100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '100%' }}
                        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                        className="mobile-nav open"
                    >
                        <nav className="mobile-nav-links">
                            {menuLinks.map((link, i) => (
                                <motion.div
                                    key={link.path}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.1 + (i * 0.1) }}
                                    style={{ width: '100%' }}
                                >
                                    <Link 
                                        to={link.path} 
                                        className={`mobile-nav-link ${location.pathname === link.path ? 'active' : ''}`}
                                    >
                                        {link.label}
                                    </Link>
                                </motion.div>
                            ))}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.1 + (menuLinks.length * 0.1) }}
                                style={{ width: '100%' }}
                            >
                                <Link to="/login" className={`mobile-nav-link ${location.pathname === '/login' ? 'active' : ''}`}>
                                    <User size={24} style={{ marginRight: '10px' }} />
                                    {user ? (profile?.first_name || 'Můj profil') : 'Přihlásit se'}
                                </Link>
                            </motion.div>
                        </nav>
                        
                        {/* Elegant footer for mobile menu */}
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 0.3 }}
                            transition={{ delay: 0.8 }}
                            style={{ position: 'absolute', bottom: '40px', textAlign: 'center' }}
                        >
                            <p style={{ color: '#121826', fontSize: '0.9rem', letterSpacing: '2px', fontWeight: 600 }}>HROMADOVKY</p>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

        </header>
    );
};

export default Navbar;
