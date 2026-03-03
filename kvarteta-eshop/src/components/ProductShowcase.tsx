import React, { useState, useEffect, useMemo } from 'react';
import type { CartItem } from '../App';
import './ProductShowcase.css';

import { Star, Sparkles, Trophy, Shield } from 'lucide-react';

interface ProductShowcaseProps {
    onAddToCart: (product: Omit<CartItem, 'quantity'>) => void;
}

const backgrounds = [
    '/cards/card_back_pattern.png', '/cards/dragon_scales_seamless.png',
    '/cards/dragon_scales_vibrant.png', '/cards/dragon_scales_metallic.png',
    '/cards/dragon_scales_realistic_1.png', '/cards/dragon_scales_realistic_2.png',
    '/cards/cat_fur_orange.png', '/cards/cat_fur_silver.png', '/cards/cat_fur_calico.png',
    '/cards/sugar_glaze_pattern.png'
];

const products = [
    {
        id: 'prsi-draci',
        name: 'Prší: Dračí edice',
        description: 'Klasických 32 karet v unikátním dračím provedení. Ručně generované ilustrace pro každou kartu (7, 8, 9, 10, spodek, svršek, král, eso).',
        price: 399,
        themeColor: '#ca8a04',
        badges: [
            { id: 1, text: 'Nové Prší', icon: Sparkles, color: '#fbbf24' },
            { id: 2, text: 'Unikátní drak pro každou kartu', icon: Trophy, color: '#fbbf24' }
        ],
        image: [
            '/cards/prsi/prsi_srdce_A.png', '/cards/prsi/prsi_listy_K.png', '/cards/prsi/prsi_kule_Q.png', '/cards/prsi/prsi_zaludy_J.png',
            '/cards/prsi/prsi_srdce_7.png', '/cards/prsi/prsi_listy_8.png', '/cards/prsi/prsi_kule_9.png', '/cards/prsi/prsi_zaludy_10.png'
        ]
    },
    {
        id: 'kvarteto-dinosauri',
        name: 'Kvarteto: Dinosauři',
        description: 'Poznejte prehistorické obry v luxusní sběratelské edici. 32 nádherně ilustrovaných karet s unikátními statistikami.',
        price: 349,
        themeColor: '#ff8a00',
        badges: [
            { id: 1, text: 'Bestseller', icon: Trophy, color: '#ffb703' }
        ],
        image: [
            '/cards/dino_full_1.png', '/cards/dino_full_2.png', '/cards/dino_full_3.png', '/cards/dino_full_4.png',
            '/cards/dino_full_5.png', '/cards/dino_full_6.png', '/cards/dino_full_7.png', '/cards/dino_full_8.png',
            '/cards/dino_full_9.png', '/cards/dino_full_10.png'
        ]
    },
    {
        id: 'kvarteto-dracci',
        name: 'Kvarteto: Baby dráčci',
        description: 'Roztomilí a silní Baby dráčci v prémiové úpravě. Perfektní pro dětské hráče i sběratele.',
        price: 349,
        themeColor: '#a100ff',
        badges: [
            { id: 1, text: 'Roztomilé', icon: Star, color: '#d946ef' }
        ],
        image: [
            '/cards/baby_full_1.png', '/cards/baby_full_2.png', '/cards/baby_full_3.png', '/cards/baby_full_4.png',
            '/cards/baby_full_5.png', '/cards/baby_full_6.png', '/cards/baby_full_7.png', '/cards/baby_full_8.png',
            '/cards/baby_full_9.png', '/cards/baby_full_10.png', '/cards/baby_full_11.png'
        ]
    },
    {
        id: 'kvarteto-draci',
        name: 'Kvarteto: Draci',
        description: 'Mocní a legendární Draci přinášejí do hry epické souboje. Nejmocnější bytosti v prémiovém provedení.',
        price: 349,
        themeColor: '#ff0033',
        badges: [
            { id: 1, text: 'Premium', icon: Shield, color: '#ef4444' }
        ],
        image: [
            '/cards/drag_full_1.png', '/cards/drag_full_2.png', '/cards/drag_full_3.png', '/cards/drag_full_4.png',
            '/cards/drag_full_5.png', '/cards/drag_full_6.png', '/cards/drag_full_7.png', '/cards/drag_full_8.png',
            '/cards/drag_full_9.png', '/cards/drag_full_10.png', '/cards/drag_full_11.png'
        ]
    },
    {
        id: 'kvarteto-rytiri',
        name: 'Kvarteto: Roztomilí rytíři',
        description: 'Šlechetní a neuvěřitelně sladcí rytíři v brnění z marshmallow, karamelu i hvězdného prachu. Unikátní herní zážitek.',
        price: 389,
        themeColor: '#ffccdd',
        badges: [
            { id: 1, text: 'Horká novinka', icon: Sparkles, color: '#ffb703' }
        ],
        image: [
            '/cards/knight_full_1.png', '/cards/knight_full_2.png', '/cards/knight_full_3.png', '/cards/knight_full_4.png',
            '/cards/knight_full_5.png', '/cards/knight_full_6.png', '/cards/knight_full_7.png', '/cards/knight_full_8.png',
            '/cards/knight_full_9.png', '/cards/knight_full_10.png'
        ]
    },
    {
        id: 'kvarteto-kocky',
        name: 'Kvarteto: Kočky bojovnice',
        description: 'Odvážné, mrštné a nebezpečně roztomilé kočičí válečnice. Získejte celou kočičí armádu.',
        price: 349,
        themeColor: '#00d2ff',
        badges: [
            { id: 1, text: 'Populární', icon: Star, color: '#0ea5e9' }
        ],
        image: [
            '/cards/cat_full_1.png', '/cards/cat_full_2.png', '/cards/cat_full_3.png', '/cards/cat_full_4.png',
            '/cards/cat_full_5.png', '/cards/cat_full_6.png', '/cards/cat_full_7.png', '/cards/cat_full_8.png',
            '/cards/cat_full_9.png', '/cards/cat_full_10.png'
        ]
    }
];

// --- Internal Components ---
const ProductCardInteractive = ({ product, onAddToCartClick }: { product: any, onAddToCartClick: (product: any) => void }) => {
    const allImages = Array.isArray(product.image) ? product.image : [product.image];

    // Pick the main image + 5 random ones (or as many as available) to rotate through
    const shuffledImages = useMemo(() => {
        if (allImages.length <= 1) return allImages;
        const others = allImages.slice(1).sort(() => 0.5 - Math.random());
        const picked = others.slice(0, 9); // take max 9
        return [allImages[0], ...picked];
    }, [product.image]);

    const [activeIndex, setActiveIndex] = useState(0);
    const [isHovered, setIsHovered] = useState(false);

    useEffect(() => {
        let interval: ReturnType<typeof setTimeout>;
        if (isHovered && shuffledImages.length > 1) {
            interval = setInterval(() => {
                setActiveIndex((prev) => (prev + 1) % shuffledImages.length);
            }, 2500);
        } else {
            setActiveIndex(0); // Reset immediately on mouse leave
        }
        return () => clearInterval(interval);
    }, [isHovered, shuffledImages.length]);

    const handleMouseEnter = () => setIsHovered(true);
    const handleMouseLeave = () => setIsHovered(false);

    return (
        <div
            className="ps-card"
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
        >
            <div className="ps-image-container">
                {/* Back glow based on theme color */}
                <div
                    className="ps-theme-glow"
                    style={{ backgroundColor: product.themeColor }}
                />

                <div className="ps-image-bg" style={{ backgroundImage: `url('${shuffledImages[activeIndex]}')` }}></div>

                {/* Floating Badges */}
                {product.badges && product.badges.length > 0 && (
                    <div className="ps-badges-container">
                        {product.badges.map((badge: any) => {
                            const Icon = badge.icon;
                            return (
                                <div key={badge.id} className="ps-badge-item" style={{ color: badge.color, borderColor: badge.color }}>
                                    <Icon size={14} />
                                    <span>{badge.text}</span>
                                </div>
                            );
                        })}
                    </div>
                )}

                {/* Main and Fanned Cards (rendered concurrently for crossfade) */}
                {shuffledImages.map((imgUrl: string, idx: number) => (
                    <React.Fragment key={`${product.id}-${idx}`}>
                        {/* Fanned Left */}
                        <img
                            src={shuffledImages[(idx + 1) % shuffledImages.length]}
                            className={`ps-real-image ps-fanned ps-fanned-left`}
                            style={{ opacity: isHovered && idx === activeIndex ? 0.9 : 0 }}
                            alt=""
                        />
                        {/* Fanned Right */}
                        <img
                            src={shuffledImages[(idx + 2) % shuffledImages.length]}
                            className={`ps-real-image ps-fanned ps-fanned-right`}
                            style={{ opacity: isHovered && idx === activeIndex ? 0.9 : 0 }}
                            alt=""
                        />
                        {/* Main Image */}
                        <img
                            src={imgUrl}
                            alt={`${product.name} card ${idx}`}
                            className="ps-real-image ps-main-image"
                            style={{ opacity: idx === activeIndex ? 1 : 0 }}
                        />
                    </React.Fragment>
                ))}
            </div>

            <div className="ps-info">
                <h3 className="ps-name">{product.name}</h3>
                <p className="ps-desc">{product.description}</p>
                <div className="ps-footer">
                    <span className="ps-price">{product.price} Kč</span>
                    <button
                        className="ps-btn-add"
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
        </div>
    );
};

const ProductShowcase: React.FC<ProductShowcaseProps> = ({ onAddToCart }) => {
    const [selectedProduct, setSelectedProduct] = useState<any | null>(null);
    const [selectedBack, setSelectedBack] = useState<string>(backgrounds[0]);

    const handleAddToCartClick = (product: any) => {
        setSelectedProduct(product);
        setSelectedBack(backgrounds[0]);
    };

    const confirmAddToCart = () => {
        if (selectedProduct && selectedBack) {
            onAddToCart({
                ...selectedProduct,
                image: Array.isArray(selectedProduct.image) ? selectedProduct.image[0] : selectedProduct.image,
                selectedBack
            });
            setSelectedProduct(null);
        }
    };

    return (
        <section id="products" className="product-showcase container">
            <div className="ps-section-header">
                <span className="badge mb-4">Naše sady</span>
                <h2 className="ps-section-title">Naše <span className="text-gradient-gold">sady</span></h2>
                <p className="ps-text-center text-secondary max-w-2xl mt-4">
                    Každá sada projde pečlivým tiskem s důrazem na kvalitu a prémiový vzhled. Posuňte myší pro odhalení unikátních detailů.
                </p>
            </div>

            <div className="ps-product-grid">
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
                    <div className="back-selection-modal" onClick={e => e.stopPropagation()}>
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

                        <div className="modal-footer">
                            <button className="btn-cancel" onClick={() => setSelectedProduct(null)}>Zrušit</button>
                            <button className="btn-confirm" onClick={confirmAddToCart}>Potvrdit a přidat do košíku</button>
                        </div>
                    </div>
                </div>
            )}
        </section>
    );
};

export default ProductShowcase;
