import React, { useEffect } from 'react';

const AboutPage: React.FC = () => {
    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    return (
        <div className="about-page" style={{ paddingTop: '100px', minHeight: '80vh' }}>
            <section className="container" style={{ paddingTop: '60px', paddingBottom: '40px', textAlign: 'center' }}>
                <h1 style={{ fontSize: '3rem', marginBottom: '16px' }}>
                    O <span className="text-gradient-gold">nás</span>
                </h1>
                <p style={{ fontSize: '1.2rem', color: 'var(--text-secondary)', maxWidth: '640px', margin: '0 auto' }}>
                    Milujeme hry. Milujeme karty. A nic nás netěší víc, než když u nich svítí oči celé rodině.
                </p>
            </section>

            <section className="container" style={{ paddingBottom: '40px' }}>
                <div className="glass-panel" style={{ padding: '48px', maxWidth: '780px', margin: '0 auto' }}>
                    <h2 style={{ fontSize: '1.8rem', marginBottom: '20px' }}>Jak to celé začalo</h2>
                    <p style={{ color: 'var(--text-secondary)', lineHeight: 1.8, marginBottom: '16px' }}>
                        Jsme čtyřčlenná rodina — <strong>Karel</strong> a <strong>Nikola</strong> a naše dvě úžasné děti,
                        sedmiletá <strong>Valinka</strong> a šestiletý <strong>Kájík</strong>.
                    </p>
                    <p style={{ color: 'var(--text-secondary)', lineHeight: 1.8, marginBottom: '16px' }}>
                        Hry a karty nás v rodině provázely odjakživa. Ať už to byl mariáš, prší nebo žolíky. Když rodina zasedne ke karetnímu stolu, vždy se
                        čas na chvíli zastaví, telefon zůstane v kapse a rodina 
                        se baví <strong>spolu</strong>, ne každý zvlášť.
                    </p>
                    <p style={{ color: 'var(--text-secondary)', lineHeight: 1.8, marginBottom: '16px' }}>
                        Když jsme naši vášeň pro karty začali přenášet na naše děti, velmi brzy začaly mít svoje specifické požadavky. A proč nemůžeme mít kvarteta, kde jsou draci? Nebo dinosauři? A protože jsme nikde nennašli nabídku, která by splňovala přísné požadavky našich dětí, tak jsme začali tvořit karty, kvarteta a pexesa pro ně. 
                    </p>
                    <p style={{ color: 'var(--text-secondary)', lineHeight: 1.8, marginBottom: '16px' }}>
                        A protože naše karty všude na dovolených, nebo kdekoliv jsme je vytáhli, vzbuzovaly velký ohlas, tak jsme se rozhodli, že si je nenecháme jen pro sebe. No a tak vznikly <strong>Hromadovky</strong>. Karty plné příběhů. 
                     
                    </p>
                    <p style={{ color: 'var(--text-secondary)', lineHeight: 1.8 }}>
                        Navrhujeme je nejdřív pro naše vlastní děti. A teprve když projdou jejich přísným 
                        testem a nekompromisním hodnocením, podáváme je dál do dalších rodin.
                    </p>
                </div>
            </section>

            <section className="container" style={{ paddingBottom: '100px' }}>
                <div className="glass-panel" style={{ padding: '40px', textAlign: 'center', maxWidth: '780px', margin: '0 auto' }}>
                    <h3 style={{ fontSize: '1.6rem', marginBottom: '12px' }}>Máte dotaz nebo nápad?</h3>
                    <p style={{ color: 'var(--text-secondary)', marginBottom: '24px', maxWidth: '560px', margin: '0 auto 24px' }}>
                        Napište nám, rádi si přečteme váš příběh.
                    </p>
                    <a href="mailto:info@hromadovky.cz" className="btn-confirm" style={{ display: 'inline-flex', textDecoration: 'none' }}>
                        Napište nám
                    </a>
                </div>
            </section>
        </div>
    );
};

export default AboutPage;
