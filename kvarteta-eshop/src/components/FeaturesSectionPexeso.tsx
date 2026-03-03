import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Brain, BookOpen, Sparkles, Diamond, Star, Image as ImageIcon, Layers, Palette, Shield, Crop } from 'lucide-react';
import './FeaturesSection.css';

const features = [
    {
        icon: <Brain size={28} />,
        title: 'Bystrá mysl',
        desc: 'Procvičte svou paměť v napínavém hledání dvojic. Klasika v luxusním provedení.'
    },
    {
        icon: <BookOpen size={28} />,
        title: 'Výběr zadní strany',
        desc: 'Přizpůsobte si rub karet. Různé textury dračích šupin, srsti nebo hvězdné nebe.'
    },
    {
        icon: <ImageIcon size={28} />,
        title: 'Vlastní fotografie',
        desc: 'Vytvořte si rodinné pexeso z vlastních fotek. Ideální jako nezapomenutelný dárek.'
    },
    {
        icon: <Diamond size={28} />,
        title: 'Prémiové provedení',
        desc: 'Pevné a odolné kartičky s profesionální povrchovou úpravou, co vydrží roky.'
    },
    {
        icon: <Sparkles size={28} />,
        title: 'Vizuální nádhera',
        desc: 'Nechte se ohromit prémiovými, sytými detaily, které si zamilujete na první pohled.'
    },
    {
        icon: <Layers size={28} />,
        title: 'Tvrdý karton',
        desc: 'Pevný karton, který se hned tak nezohýbá a vydrží i divočejší dětskou hru.'
    },
    {
        icon: <Palette size={28} />,
        title: 'Generování na míru',
        desc: 'Máte oblíbené zvířecí postavy, stroje nebo magické bytosti? S naším generátorem je možné cokoliv.'
    },
    {
        icon: <Shield size={28} />,
        title: 'Ochranný povrch',
        desc: 'Speciální povrchová úprava chrání karty před vlhkostí a drobnými oděrkami.'
    },
    {
        icon: <Crop size={28} />,
        title: 'Perfektní řez',
        desc: 'Hladce zaoblené rohy a čistý řez zajistí, že se karty příjemně drží v ruce.'
    }
];

const FeaturesSectionPexeso: React.FC = () => {
    const [flippedIndexes, setFlippedIndexes] = useState<number[]>([]);

    const handleCardHover = (idx: number) => {
        setFlippedIndexes(prev => {
            if (!prev.includes(idx)) {
                return [...prev, idx];
            }
            return prev;
        });
    };

    const allFlipped = flippedIndexes.length === features.length;

    return (
        <section className="features-section-grid container">
            <div className="section-header" style={{ textAlign: 'center', marginBottom: '40px' }}>
                <span className="badge mb-4">Detaily tvoří mistrovské dílo</span>
                <h2 className="section-title">Dokonalé pexeso <span className="text-gradient-gold">na dosah ruky</span></h2>
                <p className="text-center text-secondary max-w-2xl mx-auto mt-4" style={{ margin: '0 auto' }}>
                    Odhalte všechny naše výhody a získejte tajnou odměnu! Najetím myši otočíte kartu.
                </p>
            </div>

            <div className="gamification-progress">
                <span>Otočeno karet:</span>
                <span style={{ fontSize: '1.4rem' }}>{flippedIndexes.length} / {features.length}</span>
            </div>

            <div className="pexeso-3x3-container">
                <div className="pexeso-3x3-grid">
                    {features.map((feature, idx) => (
                        <motion.div
                            key={idx}
                            initial={{ opacity: 0, scale: 0.8 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: 0.1 * idx }}
                            className="pexeso-flip-card"
                            onMouseEnter={() => handleCardHover(idx)}
                        >
                            <div className={`pexeso-flip-inner ${allFlipped || flippedIndexes.includes(idx) ? 'gamification-counted is-flipped' : ''}`}>
                                {/* Back of the card (Default state before flip) */}
                                <div className="pexeso-flip-back">
                                    <div className="pexeso-flip-back-border">
                                        <div className="pexeso-flip-back-content">
                                            <div className="stars-top"><Star size={12} fill="currentColor" /></div>
                                            <div className="pexeso-logo-small">PEXESO</div>
                                            <div className="stars-bottom"><Star size={12} fill="currentColor" /></div>
                                        </div>
                                    </div>
                                </div>

                                {/* Front of the card (Revealed state) */}
                                <div className="pexeso-flip-front">
                                    <div className="satellite-card">
                                        <div className="sat-icon mx-auto mb-4" style={{ margin: '0 auto 16px', display: 'flex' }}>
                                            {feature.icon}
                                        </div>
                                        <div className="sat-content text-center">
                                            <h3 style={{ fontSize: '1.1rem', marginBottom: '8px' }}>{feature.title}</h3>
                                            <p style={{ fontSize: '0.85rem' }}>{feature.desc}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>

            {allFlipped && (
                <motion.div
                    className="gamification-prize-reveal"
                    initial={{ opacity: 0, y: 50, scale: 0.9 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ type: "spring", stiffness: 60, damping: 15 }}
                >
                    <div className="prize-title">
                        <Sparkles color="var(--accent-gold)" size={32} />
                        Gratulujeme k perfektní paměti!
                        <Sparkles color="var(--accent-gold)" size={32} />
                    </div>
                    <p className="prize-desc">
                        Našli jste všechny naše výhody. Zde je vaše tajná odměna: sleva 10 % na první objednávku prémiového pexesa.
                    </p>
                    <div className="discount-code-box">
                        PEXESO10
                    </div>
                </motion.div>
            )}
        </section>
    );
};

export default FeaturesSectionPexeso;

