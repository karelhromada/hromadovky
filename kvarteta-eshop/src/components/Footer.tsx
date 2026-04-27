import React from 'react';
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
                            <li><a href="/faq">FAQ</a></li>
                            <li><a href="/pravidla">O hře a pravidla</a></li>
                            <li><a href="/o-nas">O nás</a></li>
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
                            <li>Sledujte nás na IG</li>
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
