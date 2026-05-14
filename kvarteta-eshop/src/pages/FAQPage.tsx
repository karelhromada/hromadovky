import React, { useEffect } from 'react';
import { PageHead } from '../components/seo/PageHead';
import { SEO } from '../data/seo';
import FAQ from '../components/FAQ';

const FAQPage: React.FC = () => {
    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    return (
        <div className="faq-page" style={{ paddingTop: '100px', minHeight: '80vh', paddingBottom: '40px' }}>
            <PageHead {...SEO.faq} />
            <FAQ />

            <section className="container" style={{ paddingTop: '20px', paddingBottom: '60px' }}>
                <div className="glass-panel" style={{ padding: '40px', textAlign: 'center', maxWidth: '780px', margin: '0 auto' }}>
                    <h3 style={{ fontSize: '1.6rem', marginBottom: '12px' }}>Nenašli jste odpověď?</h3>
                    <p style={{ color: 'var(--text-secondary)', marginBottom: '24px', maxWidth: '560px', margin: '0 auto 24px' }}>
                        Napište nám na <a href="mailto:info@hromadovky.cz" style={{ color: 'var(--accent-gold-dark)', textDecoration: 'underline', fontWeight: 600 }}>info@hromadovky.cz</a> a my vám rádi pomůžeme.
                    </p>
                    <a href="mailto:info@hromadovky.cz" className="btn-confirm" style={{ display: 'inline-flex', textDecoration: 'none' }}>
                        Napište nám
                    </a>
                </div>
            </section>
        </div>
    );
};

export default FAQPage;
