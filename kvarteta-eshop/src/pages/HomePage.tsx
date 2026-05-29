import React from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Shield, Sparkles, X } from 'lucide-react';
import { PageHead } from '../components/seo/PageHead';
import { SEO } from '../data/seo';
import './HomePage.css';

const epicCards = [
    { id: 9, src: '/cards/mytologie_v4/thor_v4_1773232978954.webp', x: 0, y: -380, rot: 0 },
    { id: 1, src: '/cards/baby_full_1.webp', x: -350, y: -280, rot: -15 },
    { id: 2, src: '/cards/drag_full_1.webp', x: 350, y: -280, rot: 12 },
    { id: 3, src: '/cards/cat_full_1.webp', x: -500, y: 50, rot: -8 },
    { id: 4, src: '/cards/dino_full_1.webp', x: 500, y: 50, rot: 15 },
    { id: 5, src: '/cards/knight_full_1.webp', x: -380, y: 380, rot: -5 },
    { id: 6, src: '/cards/epicka-draci-edice/Cervene_Eso.webp', x: 380, y: 380, rot: 8 },
    { id: 7, src: '/cards/epicka-draci-edice/Kule_Kral.webp', x: -150, y: 480, rot: -10 },
    { id: 8, src: '/cards/carodejnice/Cervene_Eso.webp', x: 150, y: 480, rot: 5 },
];

const HomePage: React.FC = () => {
    const [isOpen, setIsOpen] = React.useState(false);
    const [scale, setScale] = React.useState(1);
    const [isMobile, setIsMobile] = React.useState(window.innerWidth < 768);
    const [isExploded, setIsExploded] = React.useState(false);

    // Dynamic scale for the card explosion based on window width
    React.useEffect(() => {
        const handleResize = () => {
            const width = window.innerWidth;
            setIsMobile(width < 768);
            if (width < 480) setScale(0.4);
            else if (width < 768) setScale(0.55);
            else if (width < 1024) setScale(0.75);
            else if (width < 1440) setScale(0.85);
            else setScale(1);
        };
        
        handleResize(); // Initial call
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    return (
        <div className="homepage-v5">
            <PageHead {...SEO.home} />
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
                        whileHover={{ scale: 1.05 }}
                    >
                        <div className={`main-deck-back ${!isOpen ? 'pulse-all' : ''}`}>
                            <img src="/logo.webp" alt="Hromadovky" />
                            <span className={!isOpen ? 'pulse-text' : ''}>
                                Otevřít balíček
                            </span>
                        </div>
                    </motion.div>

                    {/* Exploding Cards Background */}
                    {epicCards.map((card, index) => (
                        <motion.div
                            key={card.id}
                            className="exploding-card"
                            initial={{ x: 0, y: 0, rotate: 0, opacity: 0 }}
                            animate={{ 
                                x: isOpen ? card.x * scale : 0, 
                                y: isOpen ? card.y * scale : 0, 
                                rotate: isOpen ? card.rot : 0, 
                                opacity: isOpen ? 1 : 0 
                            }}
                            transition={{ 
                                type: "spring", 
                                stiffness: 45, 
                                damping: 14,
                                delay: isOpen ? (index * 0.05) : 0
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

                {/* STABILIZED WRAPPER: Fixed height anchor to prevent Hero reflow */}
                <div style={{ 
                    minHeight: '80px', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center', 
                    marginTop: '10rem',
                    position: 'relative',
                    width: '100%' 
                }}>
                    <div className="fan-buttons-container" style={{ margin: 0 }}>
                        <motion.button 
                            className={`btn-v9-epic ${!isExploded ? 'pulse' : ''}`}
                            onClick={() => setIsExploded(!isExploded)}
                            whileHover={{ scale: 1.05, translateY: -5 }}
                            whileTap={{ scale: 0.98 }}
                        >
                            {isExploded ? 'Zavřít výběr' : 'Prozkoumat naše sady'} 
                            {isExploded ? <X size={22} /> : <ArrowRight size={22} />}
                        </motion.button>

                        <AnimatePresence mode="popLayout">
                            {isExploded && (
                                <motion.div
                                    key="kvarteta"
                                    initial={{ x: 0, y: 0, opacity: 0, scale: 0.5 }}
                                    animate={{ 
                                        x: isMobile ? 0 : 320, 
                                        y: isMobile ? -230 : -150, 
                                        opacity: 1, 
                                        scale: 1, 
                                        rotate: isMobile ? 0 : 10 
                                    }}
                                    exit={{ x: 0, y: 0, opacity: 0, scale: 0.5, rotate: 0 }}
                                    whileHover={{ scale: 1.1, translateY: -5 }}
                                    transition={{ 
                                        duration: 0.8,
                                        delay: 0.1,
                                        ease: [0.34, 1.56, 0.64, 1]
                                    }}
                                    className="sub-btn-fan"
                                >
                                    <Link to="/kvarteta#products" style={{ color: 'inherit', textDecoration: 'none' }}>Kvarteta</Link>
                                </motion.div>
                            )}
                            
                            {isExploded && (
                                <motion.div
                                    key="pexeso"
                                    initial={{ x: 0, y: 0, opacity: 0, scale: 0.5 }}
                                    animate={{ 
                                        x: isMobile ? 0 : 420, 
                                        y: isMobile ? -155 : 0, 
                                        opacity: 1, 
                                        scale: 1, 
                                        rotate: 0 
                                    }}
                                    exit={{ x: 0, y: 0, opacity: 0, scale: 0.5, rotate: 0 }}
                                    whileHover={{ scale: 1.1, translateY: -5 }}
                                    transition={{ 
                                        duration: 0.8,
                                        delay: 0.25,
                                        ease: [0.34, 1.56, 0.64, 1]
                                    }}
                                    className="sub-btn-fan"
                                >
                                    <Link to="/pexeso#products" style={{ color: 'inherit', textDecoration: 'none' }}>Pexeso</Link>
                                </motion.div>
                            )}

                            {isExploded && (
                                <motion.div
                                    key="karty"
                                    initial={{ x: 0, y: 0, opacity: 0, scale: 0.5 }}
                                    animate={{ 
                                        x: isMobile ? 0 : 320, 
                                        y: isMobile ? -80 : 150, 
                                        opacity: 1, 
                                        scale: 1, 
                                        rotate: isMobile ? 0 : -10 
                                    }}
                                    exit={{ x: 0, y: 0, opacity: 0, scale: 0.5, rotate: 0 }}
                                    whileHover={{ scale: 1.1, translateY: -5 }}
                                    transition={{ 
                                        duration: 0.8,
                                        delay: 0.4,
                                        ease: [0.34, 1.56, 0.64, 1]
                                    }}
                                    className="sub-btn-fan"
                                >
                                    <Link to="/karty#products" style={{ color: 'inherit', textDecoration: 'none' }}>Hrací karty</Link>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
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
