import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Star, Shield, Sparkles } from 'lucide-react';
import './HomePage.css';

const HomePage: React.FC = () => {
    return (
        <div className="homepage-v5">
            {/* --- HERO SECTION: FAMILY JOY --- */}
            <section className="hero-v5 container">
                <div className="hero-v5-grid">
                    <motion.div 
                        className="hero-v5-text"
                        initial={{ opacity: 0, x: -30 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.8 }}
                    >
                        <h1 className="hero-v5-title">
                            Rodinná radost<br />
                            <span className="text-accent">v každém balíčku</span>
                        </h1>
                        <p className="hero-v5-desc">
                            Hromadovky tvoříme jako rodina, pro kterou jsou hry víc než jen zábava. 
                            S láskou vytváříme hry, které přinášejí radost a fantazii k vašemu stolu.
                        </p>
                        <div className="hero-v5-actions">
                            <Link to="/kvarteta" className="btn-v5-primary">
                                Prozkoumat hry <ArrowRight size={20} />
                            </Link>
                            <Link to="/pravidla" className="btn-v5-secondary">
                                Pravidla her
                            </Link>
                        </div>
                    </motion.div>
                     <motion.div 
                        className="hero-v5-visual"
                        initial={{ opacity: 0, x: 50 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.8, delay: 0.4 }}
                    >
                        <motion.div 
                            className="hero-card-fan-container"
                            initial="idle"
                            whileHover="hover"
                        >
                            {[1, 2, 3, 4].map((num) => (
                                <motion.div
                                    key={num}
                                    className={`hero-fan-card-wrapper card-${num}`}
                                    variants={{
                                        idle: { x: 0, rotate: (num - 2.5) * 5, y: 0, scale: 1 },
                                        hover: {
                                            x: (num - 2.5) * 120,
                                            rotate: (num - 2.5) * 15,
                                            y: Math.abs(num - 2.5) * 20,
                                            scale: 1
                                        }
                                    }}
                                    transition={{ type: "spring", stiffness: 80, damping: 20 }}
                                >
                                    <motion.div 
                                        className="hero-card-inner"
                                        whileHover={{ 
                                            scale: 1.15,
                                            y: -60,
                                            rotate: 0,
                                            zIndex: 100
                                        }}
                                        transition={{ type: "spring", stiffness: 200, damping: 25 }}
                                    >
                                        <img 
                                            src={`/cards/baby_full_${num}.webp`}
                                            alt={`Karta Baby dráček ${num}`} 
                                            className="hero-fan-card-img"
                                        />
                                        <div className="card-glint"></div>
                                    </motion.div>
                                </motion.div>
                            ))}
                        </motion.div>
                        <div className="hero-floating-badge">
                            <Star size={20} fill="currentColor" />
                            <span>Naše nejoblíbenější</span>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* --- PROCESS SECTION: THE ARTISAN STORY --- */}
            <section className="process-v5">
                <div className="container">
                    <div className="process-v5-grid">
                        <motion.div 
                            className="process-v5-visual"
                            initial={{ opacity: 0 }}
                            whileInView={{ opacity: 1 }}
                            viewport={{ once: true }}
                        >
                            <div className="process-img-frame">
                                <img 
                                    src="/images/process_v5_packaging.png" 
                                    alt="Příběh každé karty" 
                                    className="process-v5-img"
                                />
                                <div className="process-overlay-badge">
                                    <Shield size={18} /> Ruční práce
                                </div>
                            </div>
                        </motion.div>

                        <div className="process-v5-content">
                            <span className="section-label-v5">Jak to děláme</span>
                            <h2 className="section-title-v5">Příběh každé karty</h2>
                            <p className="section-desc-v5">
                                U Hromadovek nepoužíváme továrny. Každá karta je výsledkem 
                                trpělivého procesu, od prvního nápadu až po doručení k vám.
                            </p>

                            <div className="steps-v5">
                                <div className="step-v5">
                                    <div className="step-num-v5">I.</div>
                                    <div className="step-text-v5">
                                        <h4>Digitální tvorba</h4>
                                        <p>Vytváříme vlastní světy s důrazem na atmosféru a každý pixel.</p>
                                    </div>
                                </div>
                                <div className="step-v5">
                                    <div className="step-num-v5">II.</div>
                                    <div className="step-text-v5">
                                        <h4>Ušlechtilý materiál</h4>
                                        <p>Tiskneme na vysokogramážní papír chráněný matnou nebo lesklou laminací.</p>
                                    </div>
                                </div>
                                <div className="step-v5">
                                    <div className="step-num-v5">III.</div>
                                    <div className="step-text-v5">
                                        <h4>Královský řez</h4>
                                        <p>Ručně řežeme a zarovnáváme každou kartu pro dokonalou symetrii.</p>
                                    </div>
                                </div>
                                <div className="step-v5">
                                    <div className="step-num-v5">IV.</div>
                                    <div className="step-text-v5">
                                        <h4>Pečlivé balení</h4>
                                        <p>Každou sadu s láskou kompletujeme do krabiček, aby vám dělala radost už při rozbalování.</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* --- CATEGORIES: JOYFUL COLLECTIONS --- */}
            <section className="collections-v5 container">
                <div className="text-center mb-10">
                    <span className="section-label-v5">Naše tvorba</span>
                    <h2 className="section-title-v5">Sbírky plné radosti</h2>
                </div>

                <div className="collections-grid-v5">
                    <Link to="/kvarteta" className="collection-card-v5">
                        <div className="coll-img-v5" style={{ backgroundImage: 'url("/cards/drag_full_3.webp")' }}></div>
                        <div className="coll-content-v5">
                            <h3>Kvarteto</h3>
                            <p>Klasická hra v moderním fantasy kabátě.</p>
                            <span className="coll-link-v5">Zobrazit sady <ArrowRight size={16} /></span>
                        </div>
                    </Link>

                    <Link to="/kvarteta" className="collection-card-v5">
                        <div className="coll-img-v5" style={{ backgroundImage: 'url("/cards/drag_full_2.webp")' }}></div>
                        <div className="coll-content-v5">
                            <h3>Pexeso</h3>
                            <p>Pro nejmenší i velké milovníky draků.</p>
                            <span className="coll-link-v5">Zobrazit sady <ArrowRight size={16} /></span>
                        </div>
                    </Link>

                    <Link to="/kvarteta" className="collection-card-v5">
                        <div className="coll-img-v5" style={{ backgroundImage: 'url("/cards/prsi/prsi_srdce_A.webp")' }}></div>
                        <div className="coll-content-v5">
                            <h3>Hrací karty</h3>
                            <p>Originální balíčky pro Prší i oko bere.</p>
                            <span className="coll-link-v5">Zobrazit sady <ArrowRight size={16} /></span>
                        </div>
                    </Link>
                </div>
            </section>

            {/* --- CTA: CUSTOM GIFTS --- */}
            <section className="cta-v5 container">
                <motion.div 
                    className="cta-v5-box"
                    whileHover={{ y: -5 }}
                >
                    <Sparkles size={32} className="cta-icon-v5" />
                    <h2 className="section-title-v5">Chcete kartu na zakázku?</h2>
                    <p className="section-desc-v5">
                        Máte vlastní postavu, rodinnou fotku nebo unikátní nápad? 
                        Vytvoříme Vám sadu přesně podle Vašich představ.
                    </p>
                    <Link to="/kvarteta" className="btn-v5-primary">
                        Otevřít konfigurátor
                    </Link>
                </motion.div>
            </section>
        </div>
    );
};

export default HomePage;
