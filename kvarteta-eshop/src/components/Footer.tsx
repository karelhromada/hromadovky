import React from 'react';
import { Link } from 'react-router-dom';
import './Footer.css';

const Footer: React.FC = () => {
    return (
        <footer id="about" className="footer border-t border-glass">
            <div className="container footer-content">
                <div className="footer-brand">
                    <div className="logo mb-4 footer-logo-container">
                        <img src="/logo.webp" alt="Hromadovky Logo" className="footer-logo-img" />
                        <span className="text-gradient-gold">HROMADOVKY</span>
                        <span className="logo-subtitle">| karty plné příběhů</span>
                    </div>
                    <p className="footer-desc">
                        Vytváříme prémiové karetní hry pro celou rodinu. Objevte sběratelské sady s nádherným artem a zábavnými pravidly.
                    </p>
                </div>

                <div className="footer-links">
                    <div className="link-column">
                        <h4>Navigace</h4>
                        <ul>
                            <li><Link to="/kvarteta">Kvarteta</Link></li>
                            <li><Link to="/karty">Hrací karty</Link></li>
                            <li><Link to="/pexeso">Pexesa</Link></li>
                            <li><Link to="/faq">FAQ</Link></li>
                            <li><a href="/kvarteta#pravidla">Pravidla hry</a></li>
                            <li><Link to="/o-nas">O nás</Link></li>
                        </ul>
                    </div>

                    <div className="link-column">
                        <h4>Právní informace</h4>
                        <ul>
                            <li><a href="/obchodni-podminky">Obchodní podmínky</a></li>
                            <li><a href="/reklamacni-rad">Reklamační řád</a></li>
                            <li><a href="/gdpr">Zásady ochrany osobních údajů</a></li>
                        </ul>
                    </div>

                    <div className="link-column">
                        <h4>Kontakt</h4>
                        <ul>
                            <li><a href="mailto:info@hromadovky.cz" className="contact-link">info@hromadovky.cz</a></li>
                            <li>
                                <a
                                    href="https://www.instagram.com/hromadovky/"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="social-link"
                                    aria-label="Hromadovky na Instagramu"
                                >
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                                        <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                                        <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                                        <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
                                    </svg>
                                    <span>@hromadovky</span>
                                </a>
                            </li>
                            <li>Vytvořeno s vášní v ČR.</li>
                        </ul>
                    </div>
                </div>
            </div>

            <div className="footer-bottom">
                <div className="container">
                    <p>© {new Date().getFullYear()} Hromadovky - karty plné příběhů. Všechna práva vyhrazena.</p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
