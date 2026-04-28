import React from 'react';
import HeroSection from '../components/HeroSection';
import FeaturesSection from '../components/FeaturesSection';
import ProductShowcase from '../components/ProductShowcase';
import Testimonials from '../components/Testimonials';
import CardCreator from '../components/CardCreator';
import HowToPlay from '../components/HowToPlay';
import type { CartItem } from '../App';

import { useLocation } from 'react-router-dom';

interface KvartetaPageProps {
    onAddToCart: (product: Omit<CartItem, 'quantity'>) => void;
}

const KvartetaPage: React.FC<KvartetaPageProps> = ({ onAddToCart }) => {
    const { hash } = useLocation();

    React.useEffect(() => {
        if (hash) {
            const element = document.getElementById(hash.replace('#', ''));
            if (element) {
                setTimeout(() => {
                    element.scrollIntoView({ behavior: 'smooth' });
                }, 100);
            }
        }
    }, [hash]);

    return (
        <>
            <HeroSection />
            <FeaturesSection />
            <ProductShowcase onAddToCart={onAddToCart} />
            <CardCreator onAddToCart={onAddToCart} />
            <Testimonials />
            <div id="pravidla">
                <HowToPlay />
                <section className="rules-additional-info container" style={{ paddingBottom: '100px', marginTop: '-40px' }}>
                    <div className="glass-panel" style={{ padding: '40px', textAlign: 'center' }}>
                        <h3 style={{ fontSize: '1.8rem', marginBottom: '16px' }}>Máte další dotazy?</h3>
                        <p style={{ color: 'var(--text-secondary)', marginBottom: '24px', maxWidth: '600px', margin: '0 auto 24px' }}>
                            Pokud vám v pravidlech cokoliv chybí nebo máte speciální dotaz k našim hrám, neváhejte nás kontaktovat přes sociální sítě nebo e-mailem.
                        </p>
                        <a href="mailto:info@hromadovky.cz" className="btn-confirm" style={{ display: 'inline-flex', textDecoration: 'none' }}>
                            Napište nám
                        </a>
                    </div>
                </section>
            </div>
        </>
    );
};

export default KvartetaPage;
