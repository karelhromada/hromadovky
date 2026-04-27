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
                    Rodina, která chtěla vzít dětem tablety z ruky — a podstrčit jim místo nich karty s jejich oblíbenými hrdiny.
                </p>
            </section>

            <section className="container" style={{ paddingBottom: '40px' }}>
                <div className="glass-panel" style={{ padding: '48px', maxWidth: '780px', margin: '0 auto' }}>
                    <h2 style={{ fontSize: '1.8rem', marginBottom: '20px' }}>Jak to celé začalo</h2>
                    <p style={{ color: 'var(--text-secondary)', lineHeight: 1.8, marginBottom: '16px' }}>
                        Jsme čtyřčlenná rodina — <strong>Karel</strong> a <strong>Nikola</strong> a naše dvě úžasná stvoření,
                        sedmiletá <strong>Valinka</strong> a šestiletý <strong>Kájík</strong>.
                    </p>
                    <p style={{ color: 'var(--text-secondary)', lineHeight: 1.8, marginBottom: '16px' }}>
                        Jako každý rodič jsme hledali způsoby, jak naše děti zabavit, aniž bychom jim do ruky
                        dali tablet nebo mobil. Klasické hry někdy zafungovaly, jindy ne. Až jsme si jednoho
                        dne všimli něčeho zajímavého: když měly děti v ruce karty se svými oblíbenými motivy —
                        draky, dinosaury, princeznami nebo postavičkami z Minecraftu — jejich pozornost se jako
                        kouzlem upnula ke hře.
                    </p>
                    <p style={{ color: 'var(--text-secondary)', lineHeight: 1.8, marginBottom: '16px' }}>
                        Karty s vlastními oblíbenými motivy se v naší rodině velmi rychle staly hračkovými
                        favority. A někdy dokonce překonaly i lákadlo obrazovky.
                    </p>
                    <p style={{ color: 'var(--text-secondary)', lineHeight: 1.8 }}>
                        Tak vznikly <strong>Hromadovky</strong> — karty plné příběhů, které dělají z obyčejného
                        večera u stolu malé dobrodružství. Navrhujeme je nejdřív pro naše vlastní děti,
                        a teprve když projdou jejich přísným testem, podáváme je dál vaší rodině.
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
