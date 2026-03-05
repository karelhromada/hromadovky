import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './FeaturesSectionKarty.css';

const features = [
    {
        id: 'feat-1',
        title: 'Odolné',
        subtitle: 'materiály',
        desc: 'Naše karty tiskneme na prémiový karetní karton s karetním lakem. Přežijí rodinné oslavy, dětské ruce i napínavé turnaje, aniž by se jim ohnuly rožky.',
        images: ['/cards/dragon_scales_realistic_1.webp'],
        imageAlt: 'Ukázka odolného materiálu karet'
    },
    {
        id: 'feat-2',
        title: 'Jedinečné',
        subtitle: 'vizuály',
        desc: 'Každá edice má vlastní duši a nádherné, plně autorské ilustrace. Spojujeme tradiční herní zážitek s moderním uměním, které pozvedne každou partii.',
        images: [
            '/cards/prsi/prsi_srdce_K.webp',
            '/cards/prsi/prsi_kule_A.webp',
            '/cards/prsi/prsi_listy_J.webp',
            '/cards/prsi/prsi_zaludy_Q.webp'
        ],
        imageAlt: 'Ukázka autorských ilustrací hracích karet'
    },
    {
        id: 'feat-3',
        title: 'Výběr',
        subtitle: 'zadní strany',
        desc: 'Přizpůsobte si balíček svému stylu. Nabízíme desítky nádherných rubů od klasického plátna až po šupinaté dračí kůže a magickou noční oblohu.',
        images: [
            '/cards/neutral_back_stars.webp',
            '/cards/card_back_pattern.webp',
            '/cards/pexeso_back_blue_geo.webp',
            '/cards/pexeso_back_red_geo.webp',
            '/cards/pexeso_back_linen.webp',
            '/cards/dragon_scales_metallic.webp'
        ],
        imageAlt: 'Ukázka zadní strany karet'
    },
    {
        id: 'feat-4',
        title: 'Vlastní',
        subtitle: 'fotografie',
        desc: 'Vytvořte z karet dokonalý osobní dárek. V našem jednoduchém editoru si na karty snadno vložíte vlastní fotografie nebo firemní logo.',
        images: [
            '/cards/prsi/prsi_kule_K.webp',
            '/cards/carodejnice/eso_srdce_oznaceno.png',
            '/cards/prsi/prsi_srdce_A.webp',
            '/cards/carodejnice/kral_listy_oznaceno.png',
            '/cards/prsi/prsi_zaludy_10.webp',
            '/cards/carodejnice/devitka_srdce_oznaceno.png',
            '/cards/prsi/prsi_listy_A.webp',
            '/cards/carodejnice/sedmicka_zaludy_oznaceno.png'
        ],
        imageAlt: 'Možnost personalizace hracích karet'
    }
];

const RotatingImage: React.FC<{ images: string[], alt: string }> = ({ images, alt }) => {
    const [index, setIndex] = useState(0);

    useEffect(() => {
        if (images.length <= 1) return;

        const interval = setInterval(() => {
            setIndex((prev) => (prev + 1) % images.length);
        }, 3500);

        return () => clearInterval(interval);
    }, [images]);

    return (
        <div className="karty-scroll-image-inner">
            <AnimatePresence mode="wait">
                <motion.img
                    key={images[index]}
                    src={images[index]}
                    alt={alt}
                    className="karty-scroll-img"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 1.05 }}
                    transition={{ duration: 0.8, ease: "easeInOut" }}
                />
            </AnimatePresence>
            <div className="karty-scroll-image-glow"></div>
        </div>
    );
};

const FeaturesSectionKarty: React.FC = () => {
    return (
        <section className="karty-scroll-section">
            <div className="container mx-auto px-6 lg:px-8">
                <div className="text-center max-w-4xl mx-auto mb-24">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: "-100px" }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                    >
                        <h2 className="karty-scroll-main-heading">
                            Prémiová kvalita <br />
                            <span className="gold-accent-text">bez kompromisů</span>
                        </h2>
                        <div className="gold-divider-center"></div>
                        <p className="karty-scroll-main-sub">
                            Spojili jsme luxusní kasinové materiály s mistrovským autorským designem
                            a možností absolutní personalizace. Tyto karty vydrží generace.
                        </p>
                    </motion.div>
                </div>

                <div className="karty-scroll-list">
                    {features.map((feature, idx) => {
                        const isEven = idx % 2 === 0;
                        return (
                            <div className={`karty-scroll-row ${isEven ? 'row-even' : 'row-odd'}`} key={feature.id}>

                                <motion.div
                                    className="karty-scroll-content"
                                    initial={{ opacity: 0, x: isEven ? -50 : 50 }}
                                    whileInView={{ opacity: 1, x: 0 }}
                                    viewport={{ once: true, margin: "-150px" }}
                                    transition={{ duration: 0.8, ease: "easeOut" }}
                                >
                                    <div className="karty-scroll-number">0{idx + 1}</div>
                                    <h3 className="karty-scroll-title">
                                        <span className="title-bold">{feature.title}</span>
                                        <br />
                                        <span className="title-light">{feature.subtitle}</span>
                                    </h3>
                                    <div className="gold-divider-left"></div>
                                    <p className="karty-scroll-desc">{feature.desc}</p>
                                </motion.div>

                                <motion.div
                                    className="karty-scroll-image-wrap"
                                    initial={{ opacity: 0, scale: 0.95, x: isEven ? 50 : -50 }}
                                    whileInView={{ opacity: 1, scale: 1, x: 0 }}
                                    viewport={{ once: true, margin: "-150px" }}
                                    transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
                                >
                                    <RotatingImage images={feature.images} alt={feature.imageAlt} />
                                </motion.div>

                            </div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
};

export default FeaturesSectionKarty;
