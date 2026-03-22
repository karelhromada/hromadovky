import React, { useEffect } from 'react';
import HowToPlay from '../components/HowToPlay';

const RulesPage: React.FC = () => {
    // Scroll to top when page is loaded
    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    return (
        <div className="rules-page" style={{ paddingTop: '100px', minHeight: '80vh' }}>
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
    );
};

export default RulesPage;
