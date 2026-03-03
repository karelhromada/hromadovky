import React from 'react';
import { motion } from 'framer-motion';
import { Swords, BookOpen, Sparkles, Diamond, Star, Image as ImageIcon } from 'lucide-react';
import './FeaturesSection.css';

const features = [
    {
        icon: <Swords size={28} />,
        title: 'Přebíjená se statistikami',
        desc: 'Nehrajte jen klasické kvarteto. Vyšší bere! Využijte unikátní bojové vlastnosti, sílu či rychlost.'
    },
    {
        icon: <BookOpen size={28} />,
        title: 'Příběh na každé kartě',
        desc: 'Každé zvíře nebo dráček má svůj vlastní poutavý lore a svět, který vás vtáhne do hry.'
    },
    {
        icon: <ImageIcon size={28} />,
        title: 'Vlastní fotografie',
        desc: 'Vytvořte si rodinné nebo firemní kvarteto z vlastních fotek. Každé kartě můžete přiřadit jméno a unikátní parametry.'
    },
    {
        icon: <Diamond size={28} />,
        title: 'Prémiová laminace',
        desc: 'Každá karta je kvalitně zalaminovaná a chráněná proti opotřebení, aby vydržela i bitvy.'
    },
    {
        icon: <Sparkles size={28} />,
        title: 'Vizuální nádhera',
        desc: 'Nechte se ohromit prémiovými, sytými a detailními ilustracemi, které si zamilujete.'
    }
];

const FeaturesSection: React.FC = () => {
    return (
        <section className="features-section-grid container">
            <div className="features-grid-container">
                {/* Central Luxurious Core Card */}
                <motion.div
                    initial={{ scale: 0.8, opacity: 0, rotateY: 30, rotateX: 20 }}
                    whileInView={{ scale: 1, opacity: 1, rotateY: 0, rotateX: 0 }}
                    viewport={{ once: true }}
                    transition={{ type: "spring", stiffness: 100, damping: 20, delay: 0.1 }}
                    className="core-card-wrapper"
                >
                    <div className="core-card">
                        <div className="core-card-border-outer">
                            <div className="core-card-border-inner">
                                <div className="core-card-texture"></div>
                                <div className="core-card-content">
                                    <div className="core-card-symbol top-left">
                                        <span>K</span>
                                        <Star size={12} fill="currentColor" />
                                    </div>
                                    <div className="core-card-center-logo">
                                        <div className="logo-icon-wrapper">
                                            <Star size={40} className="logo-icon" fill="currentColor" />
                                        </div>
                                        <span className="logo-text">KVARTETA</span>
                                        <span className="logo-subtext">Vyšší bere</span>
                                    </div>
                                    <div className="core-card-symbol bottom-right">
                                        <span>K</span>
                                        <Star size={12} fill="currentColor" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    {/* Magical glow behind the card */}
                    <div className="core-card-glow"></div>
                </motion.div>

                {/* Feature Grid */}
                <div className="features-grid">
                    {features.map((feature, idx) => (
                        <motion.div
                            key={idx}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: 0.1 * idx }}
                            className="feature-card-wrapper"
                        >
                            <div className="satellite-card">
                                <div className="sat-icon">
                                    {feature.icon}
                                </div>
                                <div className="sat-content">
                                    <h3>{feature.title}</h3>
                                    <p>{feature.desc}</p>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default FeaturesSection;

