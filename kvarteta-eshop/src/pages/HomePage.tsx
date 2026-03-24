import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Shield, Sparkles } from 'lucide-react';
import './HomePage.css';

const epicCards = [
    { id: 1, src: '/cards/baby_full_1.webp', x: -350, y: -280, rot: -15 },
    { id: 2, src: '/cards/drag_full_1.webp', x: 350, y: -280, rot: 12 },
    { id: 3, src: '/cards/cat_full_1.webp', x: -500, y: 50, rot: -8 },
    { id: 4, src: '/cards/dino_full_1.webp', x: 500, y: 50, rot: 15 },
    { id: 5, src: '/cards/knight_full_1.webp', x: -380, y: 380, rot: -5 },
    { id: 6, src: '/cards/eso_srdce.webp', x: 380, y: 380, rot: 8 },
    { id: 7, src: '/cards/kral_kule_final.webp', x: -150, y: 480, rot: -10 },
    { id: 8, src: '/cards/witch_fire.png', x: 150, y: 480, rot: 5 },
];

const HomePage: React.FC = () => {
    const [isOpen, setIsOpen] = React.useState(false);

    return (
        <div className="homepage-v5">
            {/* --- HERO: EPIC UNBOXING --- */}
            <section className="hero-epic">
                <div className="hero-epic-container">
                    <motion.h1 
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 1, ease: "easeOut" }}
                    >
                        Rodinná radost<br />
                        <span style={{ color: 'var(--accent-gold)' }}>ručně vymazlená</span>
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.5, duration: 1 }}
                    >
                        Hromadovky tvoříme s láskou k detailu. Každá karta prochází 
                        našima rukama, aby přinesla kousek naší fantazie k vašemu stolu.
                    </motion.p>
                </div>

                {/* THE INTERACTIVE ZONE */}
                <div className="epic-deck-zone" onClick={() => setIsOpen(!isOpen)}>
                    <motion.div 
                        className="main-deck-wrapper"
                        animate={{ scale: isOpen ? 1.05 : 1 }}
                        whileHover={{ scale: 1.02 }}
                    >
                        <div className="main-deck-back">
                            <img src="/logo.webp" alt="Hromadovky" />
                            <span>Otevřít balíček</span>
                        </div>
                    </motion.div>

                    {/* Exploding Cards Background */}
                    {epicCards.map((card) => (
                        <motion.div
                            key={card.id}
                            className="exploding-card"
                            initial={{ x: 0, y: 0, rotate: 0, opacity: 0 }}
                            animate={{ 
                                x: isOpen ? card.x : 0, 
                                y: isOpen ? card.y : 0, 
                                rotate: isOpen ? card.rot : 0, 
                                opacity: isOpen ? 1 : 0 
                            }}
                            transition={{ 
                                type: "spring", 
                                stiffness: 45, 
                                damping: 14,
                                delay: isOpen ? (card.id * 0.05) : 0
                            }}
                        >
                            <img src={card.src} alt={`Karta ${card.id}`} />
                        </motion.div>
                    ))}

                    {/* Floating Particles */}
                    <div className="particle-container">
                        {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                            <motion.div
                                key={i}
                                className="particle"
                                animate={{
                                    y: isOpen ? [0, -200, 0] : 0,
                                    x: isOpen ? [0, Math.random() * 100 - 50, 0] : 0,
                                    opacity: isOpen ? [0, 0.7, 0] : 0
                                }}
                                transition={{
                                    duration: 2 + Math.random() * 2,
                                    repeat: Infinity,
                                    delay: i * 0.2
                                }}
                                style={{
                                    position: 'absolute',
                                    left: `50%`,
                                    top: `50%`,
                                    width: '8px',
                                    height: '8px',
                                    background: 'var(--accent-gold-light)',
                                    borderRadius: '50%',
                                    boxShadow: '0 0 15px var(--accent-gold)'
                                }}
                            />
                        ))}
                    </div>
                </div>

                <motion.div 
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1.2 }}
                    style={{ marginTop: '10rem' }}
                >
                    <Link to="/kvarteta" className="btn-v9-epic">
                        Prozkoumat naše sady <ArrowRight size={22} />
                    </Link>
                </motion.div>
            </section>

            {/* --- THE STORY (What the user liked) --- */}
            <section className="process-story-v9">
                <div className="container" style={{ textAlign: 'center' }}>
                    <h2 style={{ fontFamily: 'Bricolage Grotesque', fontSize: '3.5rem', fontWeight: 800 }}>Příběh každé karty</h2>
                    <p style={{ color: 'var(--text-muted)', fontSize: '1.2rem', maxWidth: '700px', margin: '1rem auto 4rem' }}>
                        U nás nenajdete tovární linky. Každý kus je výsledkem trpělivého procesu a poctivé ruční práce.
                    </p>

                    <div className="process-grid-v9">
                        <div className="process-block-v9">
                            <h3>Vymýšlíme srdcem</h3>
                            <p>Vše začíná u nás v hlavě. Každou sadu, její postavy i herní mechaniky sami navrhujeme tak, aby vás bavily od prvního tahu.</p>
                            <div className="process-usp-badge">
                                <Shield size={18} /> 100% autorské návrhy
                            </div>
                        </div>

                        <div className="process-block-v9">
                            <h3>Poctivý materiál</h3>
                            <p>Tiskneme na vysokogramážní papír a každou kartu oboustranně potahujeme laminací. Vydrží stovky partií.</p>
                            <div className="process-usp-badge">
                                <Shield size={18} /> Odolnost prověřená dětmi
                            </div>
                        </div>

                        <div className="process-block-v9">
                            <h3>Precizní řez</h3>
                            <p>Karty řežeme ručně na profesionální řezačce a následně pečlivě zakulacujeme každý roh pro příjemný úchop.</p>
                            <div className="process-usp-badge">
                                <Shield size={18} /> Ručně zakulacené rohy
                            </div>
                        </div>

                        <div className="process-block-v9">
                            <h3>Balíme pro vás</h3>
                            <p>Sady skládáme sami a balíme tak, aby k vám dorazily v perfektním stavu a dělaly radost hned po rozbalení. Od naší rodiny k té vaší.</p>
                            <div className="process-usp-badge">
                                <Shield size={18} /> Osobní přístup ke všemu
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* --- FINAL CTA --- */}
            <section className="cta-v9">
                <div className="container">
                    <Sparkles size={40} style={{ color: 'var(--accent-gold)', marginBottom: '2rem' }} />
                    <h2 style={{ fontFamily: 'Bricolage Grotesque', fontSize: '3rem', fontWeight: 800, marginBottom: '1.5rem' }}>
                        Který příběh si dnes vezmete ke stolu?
                    </h2>
                    <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '1.4rem', maxWidth: '750px', margin: '0 auto 3rem' }}>
                        Máte vlastní nápad na hrací karty? Ať už jsou to bagry, auta, nebo třeba vaše oblíbená zvířata, rádi vám je vytvoříme na míru! 
                        Od unikátních rodinných dárků až po firemní sady.
                    </p>
                    <div style={{ display: 'flex', gap: '2rem', justifyContent: 'center', marginTop: '3rem', flexWrap: 'wrap' }}>
                        <Link to="/kvarteta" className="btn-v9-epic">Prozkoumat sady</Link>
                        <Link to="/kvarteta#creator" className="btn-v9-epic" style={{ background: 'transparent', border: '2px solid var(--accent-gold)', color: '#fff' }}>
                            Chci karty na míru
                        </Link>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default HomePage;
