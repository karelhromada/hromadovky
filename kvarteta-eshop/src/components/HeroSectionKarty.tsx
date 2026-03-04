import React, { useEffect, useState } from 'react';
import './HeroSectionKarty.css';

const HeroSectionKarty: React.FC = () => {
    const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

    // Interactive perspective parallax for the whole hand
    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            if (window.innerWidth <= 968) return; // Disable parallax on mobile
            const x = (e.clientX / window.innerWidth) * 2 - 1;
            const y = (e.clientY / window.innerHeight) * 2 - 1;
            setMousePos({ x, y });
        };
        window.addEventListener('mousemove', handleMouseMove);
        return () => window.removeEventListener('mousemove', handleMouseMove);
    }, []);

    const prsiHand = [
        { id: 1, image: '/cards/prsi/prsi_srdce_10.webp', classes: 'fanned-1', zIndex: 1 },
        { id: 2, image: '/cards/prsi/prsi_srdce_J.webp', classes: 'fanned-2', zIndex: 2 },
        { id: 3, image: '/cards/prsi/prsi_srdce_A.webp', classes: 'fanned-3', zIndex: 5 }, // Top card
        { id: 4, image: '/cards/prsi/prsi_srdce_K.webp', classes: 'fanned-4', zIndex: 4 },
        { id: 5, image: '/cards/prsi/prsi_srdce_Q.webp', classes: 'fanned-5', zIndex: 3 }
    ];

    return (
        <section id="hero" className="karty-hero-section container">
            <div className="karty-hero-content">
                <div className="badge animate-fade-in-up">♦️ Prémiové sady</div>
                <h1 className="hero-title animate-fade-in-up delay-100">
                    Rozdejte ty nejlepší <br />
                    <span className="text-gradient-gold">hrací karty</span>
                </h1>
                <p className="hero-description animate-fade-in-up delay-200">
                    S tou nejlepší sadou (20 karet) na <strong>Vyšší bere nebo Mariáš</strong> vyhrajete každou rodinnou partii dřív, než protihráč řekne "stojím". Zvolte si <strong>klasiku s prémiovým rubem</strong>, nebo <strong>tematický balíček</strong> (např. Draci).
                </p>
                <div className="hero-actions animate-fade-in-up delay-300">
                    {/* <a href="#creator" className="btn-primary">Sestavit balíček</a> */}
                    <a href="#products" className="btn-secondary">Ukázkové sady</a>
                </div>
            </div>

            <div className="karty-hero-visual">
                <div className="poker-hand-stage" style={{
                    transform: `rotateX(${mousePos.y * -10}deg) rotateY(${mousePos.x * 10}deg)`
                }}>
                    {prsiHand.map((card) => (
                        <div
                            key={card.id}
                            className={`playing-card-wrapper ${card.classes}`}
                            style={{ zIndex: card.zIndex }}
                        >
                            <div className="card-face-inner dragon-card-image" style={{ backgroundImage: `url('${card.image}')` }}>
                                {/* Glossy sheen overlay (Safari fix for transparent interpolation) */}
                                <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/40 to-white/0 pointer-events-none rounded-xl"></div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default HeroSectionKarty;
