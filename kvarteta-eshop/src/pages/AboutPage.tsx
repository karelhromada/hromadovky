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
                        Jsme čtyřčlenná rodina — <strong>Karel</strong> a <strong>Nikola</strong> a naše dvě úžasná stvoření,
                        sedmiletá <strong>Valinka</strong> a šestiletý <strong>Kájík</strong>.
                    </p>
                    <p style={{ color: 'var(--text-secondary)', lineHeight: 1.8, marginBottom: '16px' }}>
                        Hry a karty nás v rodině provázely odjakživa. Snad od dětství máme oba dva ten
                        zvláštní pocit, že kolem rozdaných karet se vždycky stane něco kouzelného —
                        čas se na chvíli zastaví, telefon zůstane v kapse a u stolu sedí rodina, která
                        se baví <strong>spolu</strong>, ne každý zvlášť.
                    </p>
                    <p style={{ color: 'var(--text-secondary)', lineHeight: 1.8, marginBottom: '16px' }}>
                        Když naše děti začaly objevovat svět, všimli jsme si něčeho krásného: stačily karty
                        se správnými motivy — draky, dinosaury, princeznami nebo postavičkami z Minecraftu —
                        a tahle magie se přenesla i na ně. Soustředění, smích, „ještě jednu kolu, prosím!“
                        Chvíle, na které se nezapomíná.
                    </p>
                    <p style={{ color: 'var(--text-secondary)', lineHeight: 1.8, marginBottom: '16px' }}>
                        A protože nám tahle radost přijde příliš krásná na to, aby zůstala jen u nás doma,
                        vznikly <strong>Hromadovky</strong>. Karty plné příběhů, které dělají z obyčejného
                        večera u stolu malé dobrodružství. V dnešním uspěchaném digitálním světě jsou pro nás
                        takovým malým mostem — mezi rodiči a dětmi, mezi generacemi, mezi všedním dnem
                        a chvílemi, které si rodiny pamatují.
                    </p>
                    <p style={{ color: 'var(--text-secondary)', lineHeight: 1.8 }}>
                        Navrhujeme je nejdřív pro naše vlastní děti. A teprve když projdou jejich přísným
                        testem, podáváme je dál vaší rodině.
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
