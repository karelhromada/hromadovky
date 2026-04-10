import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './FeaturesSectionKarty.css';

const features = [
    {
        id: 'feat-1',
        title: 'Odolné',
        subtitle: 'materiály',
        desc: 'Naše karty tiskneme na prémiový papír a následně profesionálně oboustranně laminujeme a precizně řežeme. Přežijí rodinné oslavy, dětské ruce i napínavé turnaje, aniž by se jim ohnuly rožky.',
        images: ['/cards/dragon_scales_realistic_1.webp'],
        imageAlt: 'Ukázka odolného materiálu karet'
    },
    {
        id: 'feat-2',
        title: 'Jedinečné',
        subtitle: 'vizuály',
        desc: 'Každá edice má vlastní duši a nádherné, plně autorské ilustrace. Spojujeme tradiční herní zážitek s moderním uměním, které pozvedne každou partii.',
        images: [
            '/cards/epicka-draci-edice/Cervene_Kral.webp',
            '/cards/epicka-draci-edice/Kule_Eso.webp',
            '/cards/epicka-draci-edice/Zelene_Spodek.webp',
            '/cards/epicka-draci-edice/Zaludy_Svrsek.webp'
        ],
        imageAlt: 'Ukázka autorských ilustrací hracích karet'
    },
    {
        id: 'feat-3',
        title: 'Výběr',
        subtitle: 'zadní strany',
        desc: 'Přizpůsobte si balíček svému stylu. Nabízíme desítky nádherných rubů od klasického plátna až po šupinaté dračí kůže a magickou noční oblohu.',
        images: [
            '/cards/backs/back_1.webp',
            '/cards/backs/back_2.webp',
            '/cards/backs/back_3.webp',
            '/cards/backs/back_7.webp',
            '/cards/backs/back_8.webp'
        ],
        imageAlt: 'Ukázka zadní strany karet'
    },
    {
        id: 'feat-4',
        title: 'Vlastní',
        subtitle: 'fotografie',
        desc: 'Vytvořte z karet dokonalý osobní dárek. V našem jednoduchém editoru si na karty snadno vložíte vlastní fotografie nebo firemní logo.',
        images: [
            '/cards/epicka-draci-edice/Kule_Kral.webp',
            '/cards/carodejnice/Cervene_Eso.webp',
            '/cards/epicka-draci-edice/Cervene_Eso.webp',
            '/cards/carodejnice/Zelene_Kral.webp',
            '/cards/epicka-draci-edice/Zaludy_10.webp',
            '/cards/carodejnice/Cervene_9.webp',
            '/cards/epicka-draci-edice/Zelene_Eso.webp',
            '/cards/carodejnice/Zaludy_7.webp'
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
