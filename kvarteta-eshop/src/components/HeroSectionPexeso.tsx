import React, { useEffect, useState, useRef } from 'react';
import './HeroSectionPexeso.css';

const images = [
    '/cards/dino_1.webp', '/cards/baby_1.webp',
    '/cards/drag_1.webp', '/cards/cat_1.webp',
    '/cards/baby_2.webp', '/cards/dino_5.webp'
];

interface MemoryCard {
    id: number;
    imageId: string;
    isFlipped: boolean;
    isMatched: boolean;
}

const HeroSectionPexeso: React.FC = () => {
    const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
    const [cards, setCards] = useState<MemoryCard[]>([]);
    const timerRef = useRef<any>(null);

    // Initialize 12 cards (6 pairs)
    useEffect(() => {
        const initialCards: MemoryCard[] = [];
        let idCounter = 1;
        // Create 2 of each image
        images.forEach(img => {
            initialCards.push({ id: idCounter++, imageId: img, isFlipped: false, isMatched: false });
            initialCards.push({ id: idCounter++, imageId: img, isFlipped: false, isMatched: false });
        });

        // Shuffle (deterministic for SSR/hydration, but fine for simple client component)
        initialCards.sort(() => Math.random() - 0.5);
        setCards(initialCards);
    }, []);

    // Interactive perspective parallax
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

    // Automatic demonstration logic
    useEffect(() => {
        if (cards.length === 0) return;

        const demoInterval = setInterval(() => {
            setCards(prev => {
                const unflipped = prev.filter(c => !c.isFlipped && !c.isMatched);

                // If everything is flipped or matched, reset everything after a delay
                if (unflipped.length < 2) {
                    setTimeout(() => {
                        setCards(current => current.map(c => ({ ...c, isFlipped: false, isMatched: false })));
                    }, 2000);
                    return prev;
                }

                // Pick a random pair from the board (even if it's not a match, to simulate a real player)
                // Actually to make it look cool, let's artificially force a match 50% of the time
                let firstCard = unflipped[Math.floor(Math.random() * unflipped.length)];
                let secondCard;

                if (Math.random() > 0.5) {
                    // Try to find the actual match
                    const match = unflipped.find(c => c.imageId === firstCard.imageId && c.id !== firstCard.id);
                    if (match) secondCard = match;
                    else secondCard = unflipped.find(c => c.id !== firstCard.id)!;
                } else {
                    // Grab random
                    secondCard = unflipped.find(c => c.id !== firstCard.id)!;
                }

                // Flip them
                const newCardsState = prev.map(c =>
                    (c.id === firstCard.id || c.id === secondCard?.id) ? { ...c, isFlipped: true } : c
                );

                // Check match and unflip or lock them in
                setTimeout(() => {
                    setCards(latest => {
                        return latest.map(c => {
                            if (c.id === firstCard.id || c.id === secondCard?.id) {
                                if (firstCard.imageId === secondCard?.imageId) {
                                    return { ...c, isMatched: true };
                                } else {
                                    return { ...c, isFlipped: false };
                                }
                            }
                            return c;
                        });
                    });
                }, 1500);

                return newCardsState;
            });
        }, 3000);

        timerRef.current = demoInterval;
        return () => clearInterval(demoInterval);
    }, [cards.length]);


    return (
        <section id="hero" className="pexeso-hero-section container">
            <div className="pexeso-hero-content">
                <div className="badge animate-fade-in-up">🌟 Novinka: Prémiové sběratelské edice</div>
                <h1 className="hero-title animate-fade-in-up delay-100">
                    Trénujte paměť s mistry <br />
                    <span className="text-gradient-gold">Pexeso nejvyšší kvality</span>
                </h1>
                <p className="hero-description animate-fade-in-up delay-200">
                    S naším luxusním zpracováním karet do pexesa získá tahle klasika neuvěřitelný nádech prémiovosti. Posilujte mozek a kochte se uměním nebo vlastními fotografiemi, u kterých nerozeznáte žádný rozdíl v rubové stěně.
                </p>
                <div className="hero-actions animate-fade-in-up delay-300">
                    <a href="#creator" className="btn-primary">Vyzkoušet nahrávání</a>
                    <a href="#products" className="btn-secondary">Ukázková pexesa</a>
                </div>
            </div>

            <div className="pexeso-hero-visual">
                <div className="pexeso-grid-stage" style={{
                    transform: `rotateX(${15 + mousePos.y * -8}deg) rotateY(${-15 + mousePos.x * 8}deg)`
                }}>
                    {cards.map((card) => (
                        <div
                            key={card.id}
                            className={`pexeso-hero-card-wrapper ${card.isFlipped || card.isMatched ? 'flipped' : ''}`}
                        >
                            <div className="pexeso-hero-card-inner">
                                <div className="pexeso-hero-card-front">
                                    {/* The back pattern generated in CSS */}
                                </div>
                                <div
                                    className="pexeso-hero-card-back"
                                    style={{ backgroundImage: `url('${card.imageId}')` }}
                                >
                                    {/* The face of the card */}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="pexeso-hero-glow"></div>
            </div>
        </section>
    );
};

export default HeroSectionPexeso;
