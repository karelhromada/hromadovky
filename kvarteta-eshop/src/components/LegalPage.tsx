import React, { useEffect } from 'react';

interface LegalPageProps {
    title: string;
    subtitle?: string;
    effectiveDate: string;
    children: React.ReactNode;
}

const LegalPage: React.FC<LegalPageProps> = ({ title, subtitle, effectiveDate, children }) => {
    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    return (
        <div className="legal-page" style={{ paddingTop: '100px', minHeight: '80vh' }}>
            <section className="container" style={{ paddingTop: '40px', paddingBottom: '24px', textAlign: 'center' }}>
                <h1 style={{ fontSize: '2.4rem', marginBottom: '8px' }}>{title}</h1>
                {subtitle && (
                    <p style={{ fontSize: '1.05rem', color: 'var(--text-secondary)', maxWidth: '640px', margin: '0 auto' }}>
                        {subtitle}
                    </p>
                )}
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '12px', opacity: 0.75 }}>
                    Účinnost od: {effectiveDate}
                </p>
            </section>

            <section className="container" style={{ paddingBottom: '60px' }}>
                <div
                    className="glass-panel legal-content"
                    style={{ padding: '48px', maxWidth: '820px', margin: '0 auto' }}
                >
                    {children}
                </div>
            </section>

            <section className="container" style={{ paddingBottom: '100px' }}>
                <div className="glass-panel" style={{ padding: '32px', textAlign: 'center', maxWidth: '820px', margin: '0 auto' }}>
                    <h3 style={{ fontSize: '1.3rem', marginBottom: '12px' }}>Máte k dokumentu dotaz?</h3>
                    <p style={{ color: 'var(--text-secondary)', marginBottom: '20px', maxWidth: '560px', margin: '0 auto 20px' }}>
                        Napište nám, rádi vše vysvětlíme.
                    </p>
                    <a href="mailto:info@hromadovky.cz" className="btn-confirm" style={{ display: 'inline-flex', textDecoration: 'none' }}>
                        Napište nám
                    </a>
                </div>
            </section>
        </div>
    );
};

export default LegalPage;
