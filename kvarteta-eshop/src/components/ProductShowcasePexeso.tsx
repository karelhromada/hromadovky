import React, { useState, useEffect } from 'react';
import type { CartItem } from '../App';
import './ProductShowcase.css';
import './ProductShowcasePexeso.css';

import { motion, useMotionValue, useTransform, useSpring } from 'framer-motion';
import { Star, Sparkles, Trophy, Shield } from 'lucide-react';

interface ProductShowcaseProps {
    onAddToCart: (product: Omit<CartItem, 'quantity'>) => void;
}

const backgrounds = [
    '/cards/card_back_pattern.webp', '/cards/dragon_scales_seamless.webp',
    '/cards/dragon_scales_vibrant.webp', '/cards/dragon_scales_metallic.webp',
    '/cards/dragon_scales_realistic_1.webp', '/cards/dragon_scales_realistic_2.webp',
    '/cards/cat_fur_orange.webp', '/cards/cat_fur_silver.webp', '/cards/cat_fur_calico.webp',
    '/cards/pexeso_back_blue_geo.webp', '/cards/pexeso_back_red_geo.webp',
    '/cards/pexeso_back_linen.webp', '/cards/pexeso_back_stars.webp'
];

const products = [
    {
        id: 'pexeso-dinosauri',
        name: 'Pexeso: Dinosauři',
        description: 'Poznejte prehistorické obry v luxusní sběratelské edici. 32 nádherně ilustrovaných karet s unikátními statistikami.',
        price: 349,
        themeColor: '#ff8a00',
        badges: [
            { id: 1, text: 'Bestseller', icon: Trophy, color: '#ffb703' }
        ],
        image: [
            '/cards/dinosauri/Alosaurus.webp', '/cards/dinosauri/Amargasaurus.webp', '/cards/dinosauri/Ankylosaurus.webp', '/cards/dinosauri/Argentinosaurus.webp',
            '/cards/dinosauri/Baryonix.webp', '/cards/dinosauri/Brachiosaurus.webp', '/cards/dinosauri/Diplodocus.webp', '/cards/dinosauri/Giganotosaurus.webp',
            '/cards/dinosauri/Mosasaurus.webp', '/cards/dinosauri/Pteranodon.webp', '/cards/dinosauri/Quetzalcoatlus.webp', '/cards/dinosauri/Spinosaurus.webp',
            '/cards/dinosauri/Stegosaurus.webp', '/cards/dinosauri/Styrocaurus.webp', '/cards/dinosauri/T-rex.webp', '/cards/dinosauri/Triceratops.webp',
            '/cards/dinosauri/Utahoraptor.webp', '/cards/dinosauri/Velociraptor.webp'
        ]
    },
    {
        id: 'pexeso-dracci',
        name: 'Pexeso: Baby dráčci',
        description: 'Roztomilí dráčci v pexesu pro nejmenší i velké. 64 karet pro trénink paměti.',
        price: 249,
        themeColor: '#a100ff',
        badges: [
            { id: 1, text: 'Roztomilé', icon: Star, color: '#d946ef' }
        ],
        image: [
            '/cards/baby_2.webp', '/cards/baby_1.webp', '/cards/baby_3.webp', '/cards/baby_4.webp',
            '/cards/baby_5.webp', '/cards/baby_6.webp', '/cards/baby_7.webp', '/cards/baby_8.webp',
            '/cards/baby_full_1.webp'
        ]
    },
    {
        id: 'pexeso-draci',
        name: 'Pexeso: Draci',
        description: 'Mocní a legendární Draci přinášejí do hry epické souboje. Nejmocnější bytosti v prémiovém provedení.',
        price: 349,
        themeColor: '#ff0033',
        badges: [
            { id: 1, text: 'Premium', icon: Shield, color: '#ef4444' }
        ],
        image: [
            '/cards/draci/Aeris.webp', '/cards/draci/Astrál.webp', '/cards/draci/Bazilišek.webp', '/cards/draci/Blesk.webp',
            '/cards/draci/Bouře.webp', '/cards/draci/Golem.webp', '/cards/draci/Hlídač světů.webp', '/cards/draci/Hydrus.webp',
            '/cards/draci/Ignis Rex.webp', '/cards/draci/Jedový trn.webp', '/cards/draci/Knihovník.webp', '/cards/draci/Kronos.webp',
            '/cards/draci/Kříšťál.webp', '/cards/draci/Lávový král.webp', '/cards/draci/Magmaton.webp', '/cards/draci/Moudré oko.webp',
            '/cards/draci/Mrakošlap.webp', '/cards/draci/Nebeský poutník.webp', '/cards/draci/Nekromancer.webp', '/cards/draci/Ohnivý pásovec.webp',
            '/cards/draci/Ostrý hvizd.webp', '/cards/draci/Otec podzimu.webp', '/cards/draci/Popelavý dech.webp', '/cards/draci/Sonic.webp',
            '/cards/draci/Stařec z hor.webp', '/cards/draci/Stínový běžec.webp', '/cards/draci/Terrogor.webp', '/cards/draci/Tornádo.webp',
            '/cards/draci/Vesmírňák.webp', '/cards/draci/Vichřice.webp', '/cards/draci/Vulcanus.webp', '/cards/draci/Větrný živel.webp'
        ]
    },
    {
        id: 'pexeso-kocky',
        name: 'Pexeso: Kočky bojovnice',
        description: 'Odvážné, mrštné a nebezpečně roztomilé kočičí válečnice. Získejte celou kočičí armádu.',
        price: 349,
        themeColor: '#00d2ff',
        badges: [
            { id: 1, text: 'Novinka', icon: Sparkles, color: '#0ea5e9' }
        ],
        image: [
            '/cards/cat_1.webp', '/cards/cat_2.webp', '/cards/cat_3.webp', '/cards/cat_4.webp',
            '/cards/cat_5.webp', '/cards/cat_6.webp', '/cards/cat_7.webp', '/cards/cat_8.webp',
            '/cards/cat_full_1.webp'
        ]
    },
    {
        id: 'pexeso-dravci',
        name: 'Pexeso: Velcí lovci',
        description: 'Odhalte sílu nejobávanějších dravců naší planety ve strhujícím pexesu pro odvážné.',
        price: 349,
        themeColor: '#8b5a2b',
        badges: [
            { id: 1, text: 'Divoká příroda', icon: Star, color: '#d97706' }
        ],
        image: [
            '/cards/dravci/Bengálský tygr.webp', '/cards/dravci/Hyeny.webp', '/cards/dravci/Jaguár.webp', '/cards/dravci/Lev.webp',
            '/cards/dravci/Medvěd grizzly.webp', '/cards/dravci/Nilský krokodýl.webp', '/cards/dravci/Polární medvěd.webp', '/cards/dravci/Puma.webp',
            '/cards/dravci/Sněžný levhart.webp', '/cards/dravci/Tygr usuryjský.webp', '/cards/dravci/Varan komodský.webp', '/cards/dravci/Vlci.webp',
            '/cards/dravci/gepard.webp', '/cards/dravci/krokodýl.webp', '/cards/dravci/Černý panter.webp', '/cards/dravci/žralok bílý.webp'
        ]
    }
];

// --- Internal Components ---
const ProductCardInteractive = ({ product, onAddToCartClick }: { product: any, onAddToCartClick: (product: any) => void }) => {
    const images = Array.isArray(product.image) ? product.image : [product.image];
    const [isHovered, setIsHovered] = useState(false);

    // 3D Parallax Tilt state
    const x = useMotionValue(0);
    const y = useMotionValue(0);
    const mouseXSpring = useSpring(x, { stiffness: 300, damping: 30 });
    const mouseYSpring = useSpring(y, { stiffness: 300, damping: 30 });

    // Smooth transform mappings for rotation
    const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["12deg", "-12deg"]);
    const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-12deg", "12deg"]);

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const width = rect.width;
        const height = rect.height;
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;
        const xPct = mouseX / width - 0.5;
        const yPct = mouseY / height - 0.5;
        x.set(xPct);
        y.set(yPct);
    };

    const [revealedCards, setRevealedCards] = useState<number[]>([]);

    useEffect(() => {
        let timeouts: ReturnType<typeof setTimeout>[] = [];

        if (isHovered) {
            // Sequence: Flip the cards sequentially for a cascade reveal effect
            const baseDelay = 150;
            const sequence = [0, 4, 8, 2, 6, 1, 3, 5, 7]; // pattern for revealing

            sequence.forEach((cardIndex, i) => {
                const timeout = setTimeout(() => {
                    setRevealedCards(prev => [...prev, cardIndex]);
                }, baseDelay + (i * 120));
                timeouts.push(timeout);
            });
        } else {
            setRevealedCards([]);
        }

        return () => {
            timeouts.forEach(clearTimeout);
        };
    }, [isHovered]);

    return (
        <motion.div
            className="product-card glass-panel group"
            onMouseMove={handleMouseMove}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => { setIsHovered(false); x.set(0); y.set(0); }}
            style={{
                rotateX,
                rotateY,
                transformStyle: "preserve-3d",
                '--card-glow': product.themeColor
            } as any}
        >
            <div className="product-image-container" style={{ transformStyle: "preserve-3d" }}>
                {/* Back glow based on theme color */}
                <div
                    className="product-theme-glow"
                    style={{ backgroundColor: product.themeColor, opacity: isHovered ? 0.3 : 0 }}
                />
                <div className="product-image-bg" style={{ backgroundImage: `url('${images[0]}')` }}></div>

                {/* Floating Badges */}
                {product.badges && product.badges.length > 0 && (
                    <div className="product-badges-container" style={{ transform: "translateZ(60px)" }}>
                        {product.badges.map((badge: any) => {
                            const Icon = badge.icon;
                            return (
                                <div key={badge.id} className="glass-badge" style={{ color: badge.color, borderColor: badge.color }}>
                                    <Icon size={14} />
                                    <span>{badge.text}</span>
                                </div>
                            );
                        })}
                    </div>
                )}

                {/* Main cover that hides on hover */}
                <div
                    className="pexeso-main-cover"
                    style={{ backgroundImage: `url('${images[0]}')` }}
                ></div>

                {/* 3x3 Grid that appears on hover */}
                <div className="pexeso-hover-grid">
                    {[0, 1, 2, 3, 4, 5, 6, 7, 8].map((index) => {
                        // Spread the character images across the 9 tiles. 
                        // If we have fewer than 9 images, modulo wrap them.
                        const imgIndex = index % images.length;
                        const img = images[imgIndex];

                        // We stagger the reveal so it creates a sweeping effect
                        const isRevealed = revealedCards.includes(index);

                        // Generate a random stable back texture once per grid load
                        const backTexture = React.useMemo(() => {
                            // Assign different backs based on the product series name to keep it stable
                            if (product.id.includes('kocky')) return '/cards/cat_fur_orange.webp';
                            if (product.id.includes('dinosauri')) return '/cards/dragon_scales_realistic_1.webp';
                            if (product.id.includes('dracci')) return '/cards/dragon_scales_realistic_2.webp';
                            if (product.id.includes('draci')) return '/cards/dragon_scales_vibrant.webp';
                            if (product.id.includes('dravci')) return '/cards/card_back_pattern.webp';
                            return backgrounds[index % backgrounds.length];
                        }, [product.id, index]);

                        return (
                            <div key={index} className={`pexeso-mini-card ${isRevealed ? 'revealed' : ''}`}>
                                <div className="pexeso-mini-inner">
                                    <div className="pexeso-mini-front" style={{ backgroundImage: `url('${backTexture}')` }}></div>
                                    <div className="pexeso-mini-back" style={{ backgroundImage: `url('${img}')` }}></div>
                                </div>
                            </div>
                        );
                    })}
                </div>

                <div className="holographic-shine" style={{ transform: "translateZ(41px)" }}></div>
            </div>

            <div className="product-info" style={{ transform: "translateZ(30px)" }}>
                <h3 className="product-name">{product.name}</h3>
                <p className="product-desc">{product.description}</p>
                <div className="product-footer">
                    <span className="product-price">{product.price} Kč</span>
                    <button
                        className="btn-add-cart"
                        onClick={() => onAddToCartClick(product)}
                    >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="9" cy="21" r="1"></circle><circle cx="20" cy="21" r="1"></circle>
                            <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
                            <line x1="12" y1="10" x2="12" y2="16"></line>
                            <line x1="9" y1="13" x2="15" y2="13"></line>
                        </svg>
                        <span>Přidat</span>
                    </button>
                </div>
            </div>
        </motion.div >
    );
};

const dimensions = [
    { id: 'klasicke', label: 'Klasické', desc: '50 × 50 mm', priceAdd: 0 },
    { id: 'velke', label: 'Velké', desc: '60 × 60 mm', priceAdd: 49 },
    { id: 'maxi', label: 'Maxi', desc: '80 × 80 mm', priceAdd: 99 }
];

const ProductShowcasePexeso: React.FC<ProductShowcaseProps> = ({ onAddToCart }) => {
    const [selectedProduct, setSelectedProduct] = useState<any | null>(null);
    const [selectedBack, setSelectedBack] = useState<string>(backgrounds[0]);
    const [selectedSize, setSelectedSize] = useState<typeof dimensions[0]>(dimensions[0]);

    const handleAddToCartClick = (product: any) => {
        setSelectedProduct(product);
        setSelectedBack(backgrounds[0]); // Reset to default on open
        setSelectedSize(dimensions[0]); // Reset to classical
    };

    const confirmAddToCart = () => {
        if (selectedProduct && selectedBack && selectedSize) {
            onAddToCart({
                ...selectedProduct,
                price: selectedProduct.price + selectedSize.priceAdd,
                image: Array.isArray(selectedProduct.image) ? selectedProduct.image[0] : selectedProduct.image,
                selectedBack,
                size: `${selectedSize.label} (${selectedSize.desc})`
            });
            setSelectedProduct(null);
        }
    };

    return (
        <section id="products" className="product-showcase container">
            <div className="section-header">
                <span className="badge mb-4">Naše pexesa</span>
                <h2 className="section-title">Kouzelná <span className="text-gradient-gold">pexesa</span></h2>
                <p className="text-center text-secondary max-w-2xl mt-4">
                    Každé pexeso projde pečlivým tiskem s důrazem na kvalitu a prémiový vzhled, aby dvojice nešly zezadu vůbec rozpoznat.
                </p>
            </div>

            <div className="product-grid">
                {products.map(product => (
                    <ProductCardInteractive
                        key={product.id}
                        product={product}
                        onAddToCartClick={handleAddToCartClick}
                    />
                ))}
            </div>

            {selectedProduct && (
                <div className="back-selection-modal-overlay" onClick={() => setSelectedProduct(null)}>
                    <div className="back-selection-modal glass-panel" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3>Zvolte zadní stranu sady</h3>
                            <button className="close-btn" onClick={() => setSelectedProduct(null)}>
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <line x1="18" y1="6" x2="6" y2="18"></line>
                                    <line x1="6" y1="6" x2="18" y2="18"></line>
                                </svg>
                            </button>
                        </div>
                        <p className="modal-subtitle">Vybraná zadní strana se vytiskne na všechny karty v této sadě.</p>

                        <div className="backs-grid">
                            {backgrounds.map((bg, idx) => (
                                <div
                                    key={idx}
                                    className={`back-preview-item ${selectedBack === bg ? 'selected' : ''}`}
                                    onClick={() => setSelectedBack(bg)}
                                    style={{ backgroundImage: `url('${bg}')` }}
                                >
                                    {selectedBack === bg && (
                                        <div className="selection-check">
                                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                                <polyline points="20 6 9 17 4 12"></polyline>
                                            </svg>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>

                        <div className="size-selection-container" style={{ marginTop: '24px' }}>
                            <h4 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '12px', color: 'var(--text-primary)' }}>Vyberte rozměr pexesa</h4>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
                                {dimensions.map((dim) => (
                                    <div
                                        key={dim.id}
                                        onClick={() => setSelectedSize(dim)}
                                        style={{
                                            border: selectedSize.id === dim.id ? '2px solid var(--accent-gold)' : '1px solid var(--glass-border)',
                                            background: selectedSize.id === dim.id ? 'rgba(212, 175, 55, 0.05)' : 'var(--glass-bg)',
                                            padding: '12px',
                                            borderRadius: '12px',
                                            cursor: 'pointer',
                                            textAlign: 'center',
                                            transition: 'all 0.2s',
                                            boxShadow: selectedSize.id === dim.id ? '0 4px 12px rgba(212, 175, 55, 0.15)' : 'none'
                                        }}
                                    >
                                        <div style={{ fontWeight: 800, fontSize: '0.95rem', color: selectedSize.id === dim.id ? 'var(--accent-gold)' : 'var(--text-primary)' }}>{dim.label}</div>
                                        <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '4px' }}>{dim.desc}</div>
                                        <div style={{ fontSize: '0.8rem', fontWeight: 700, color: dim.priceAdd > 0 ? 'var(--accent-gold)' : 'var(--text-secondary)', marginTop: '8px' }}>
                                            {dim.priceAdd > 0 ? `+${dim.priceAdd} Kč` : 'V ceně'}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="modal-footer" style={{ marginTop: '30px' }}>
                            <button className="btn-cancel" onClick={() => setSelectedProduct(null)}>Zrušit</button>
                            <button className="btn-confirm" onClick={confirmAddToCart}>Položka za {selectedProduct.price + selectedSize.priceAdd} Kč do košíku</button>
                        </div>
                    </div>
                </div>
            )}
        </section>
    );
};

export default ProductShowcasePexeso;
