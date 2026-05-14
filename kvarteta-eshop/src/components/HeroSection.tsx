import React, { useEffect, useState } from 'react';
import './HeroSection.css';

const HeroSection: React.FC = () => {
    const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
    const [rotation, setRotation] = useState(0);

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            // Calculate normalized mouse position from -1 to 1
            const x = (e.clientX / window.innerWidth) * 2 - 1;
            const y = (e.clientY / window.innerHeight) * 2 - 1;
            setMousePos({ x, y });
        };

        window.addEventListener('mousemove', handleMouseMove);
        return () => window.removeEventListener('mousemove', handleMouseMove);
    }, []);

    useEffect(() => {
        const timer = setInterval(() => {
            setRotation(prev => prev + 1);
        }, 3000);
        return () => clearInterval(timer);
    }, []);

    const cards = [
        { id: 1, image: '/cards/mytologie_v4/zeus_v4_1773232441103.webp' },     // Mytologie
        { id: 2, image: '/cards/knight_full_1.webp' },                          // Rytíři
        { id: 3, image: '/cards/drag_full_1.webp' },                            // Draci
        { id: 4, image: '/cards/cat_full_1.webp' },                             // Kočky
        { id: 5, image: '/cards/baby_full_1.webp' },                           // Baby dráčci
    ];

    return (
        <section id="hero" className="hero-section container">
            <div className="hero-content">
                <div className="badge animate-fade-in-up">Karetní hry, které propojují generace</div>
                <h1 className="hero-title animate-fade-in-up delay-100">
                    Objevte kouzla <span className="text-gradient-gold">našich kvartet</span>, <br />
                    která vyprávějí své vlastní příběhy
                </h1>
                <p className="hero-description animate-fade-in-up delay-200">
                    Nádherně vytvořené karetní sady s prémiovým designem pro celou rodinu. 
                    Unikátní statistiky, originální ilustrace a desítky hodin společné zábavy čekají jen na vás.
                </p>
                <div className="hero-actions animate-fade-in-up delay-300">
                    <a href="#products" className="btn-primary">Prozkoumat sady</a>
                    <a href="#how-to-play" className="btn-secondary">Pravidla hry</a>
                </div>
            </div>

            <div className="hero-visual">
                <div className="cards-stage" style={{
                    transform: `perspective(1000px) rotateX(${mousePos.y * -10}deg) rotateY(${mousePos.x * 10}deg)`
                }}>
                    {/* Animated stacked cards */}
                    {cards.map((card, index) => {
                        const pos = (index + rotation) % cards.length;
                        return (
                            <div
                                key={card.id}
                                className={`hero-card card-pos-${pos}`}
                                style={{
                                    animationDelay: `${index * 0.5}s`
                                }}
                            >
                                <img
                                    src={card.image}
                                    alt="Kvarteta card"
                                    className="hero-card-img"
                                    width={300}
                                    height={420}
                                    loading={index === 0 ? 'eager' : 'lazy'}
                                    fetchPriority={index === 0 ? 'high' : 'auto'}
                                    decoding="async"
                                />
                            </div>
                        );
                    })}

                </div>

                {/* Glow effect behind cards */}
                <div className="hero-glow"></div>
            </div>
        </section>
    );
};

export default HeroSection;
