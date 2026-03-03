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
        { id: 1, image: '/cards/dino_full_5.png' },     // A cool dinosaur card
        { id: 2, image: '/cards/baby_full_2.png' },     // A cute baby dragon card
        { id: 3, image: '/cards/drag_full_11.png' },    // Kronos dragon card
        { id: 4, image: '/cards/cat_full_1.png' },      // A warrior cat card
        { id: 5, image: '/cards/baby_full_11.png' },    // Časíček baby dragon card
    ];

    return (
        <section id="hero" className="hero-section container">
            <div className="hero-content">
                <div className="badge animate-fade-in-up">🌟 Nová edice: Baby dráčci a dinosauři</div>
                <h1 className="hero-title animate-fade-in-up delay-100">
                    Objevte kouzla karet a pexes, <br />
                    která vyprávějí své <span className="text-gradient-gold">vlastní příběhy</span>
                </h1>
                <p className="hero-description animate-fade-in-up delay-200">
                    Nádherně vytvořené karetní sady s prémiovým designem pro celou rodinu.
                    Unikátní statistiky, úžasné ilustrace a desítky hodin zábavy čekají jen na vás.
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
                                <img src={card.image} alt="Kvarteta card" className="hero-card-img" />
                            </div>
                        );
                    })}
                    <div className="floating-particles">
                        <div className="particle p1"></div>
                        <div className="particle p2"></div>
                        <div className="particle p3"></div>
                    </div>
                </div>

                {/* Glow effect behind cards */}
                <div className="hero-glow"></div>
            </div>
        </section>
    );
};

export default HeroSection;
