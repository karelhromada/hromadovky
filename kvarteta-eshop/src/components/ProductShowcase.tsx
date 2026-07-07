import React, { useState, useEffect, useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import type { CartItem } from '../App';
import PackagingSelector from './PackagingSelector';
import { packagingSurcharge, type PackagingType } from '../data/packaging';
import './ProductShowcase.css';


interface ProductShowcaseProps {
    onAddToCart: (product: Omit<CartItem, 'quantity'>) => void;
}

import { getBackgroundsForGame } from '../data/backgrounds';

const backgrounds = getBackgroundsForGame('kvarteta');

import { kvartetaProducts as products } from '../data/products';

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

                {/* Main Images Loop - Persistent in DOM for smooth crossfade */}
                {shuffledImages.map((imgUrl: string, idx: number) => (
                    <img
                        key={`${product.id}-${idx}`}
                        src={imgUrl}
                        alt={`${product.name} — ukázková karta ${idx + 1}`}
                        loading={idx === 0 ? undefined : 'lazy'}
                        decoding="async"
                        className="ps-real-image ps-main-image"
                        style={{ 
                            opacity: idx === activeIndex ? 1 : 0,
                            zIndex: idx === activeIndex ? 30 : 25,
                            willChange: 'opacity'
                        }}
                    />
                ))}

                {/* Fanned decorations - Persistent in DOM for smooth fanning effect */}
                {shuffledImages.length > 2 && (
                    <>
                        <img
                            src={shuffledImages[(activeIndex + 1) % shuffledImages.length]}
                            loading="lazy"
                            decoding="async"
                            className="ps-real-image ps-fanned ps-fanned-left"
                            style={{ 
                                opacity: isHovered ? 0.9 : 0,
                                visibility: isHovered ? 'visible' : 'hidden',
                                willChange: 'transform, opacity'
                            }}
                            alt=""
                        />
                        <img
                            src={shuffledImages[(activeIndex + 2) % shuffledImages.length]}
                            loading="lazy"
                            decoding="async"
                            className="ps-real-image ps-fanned ps-fanned-right"
                            style={{ 
                                opacity: isHovered ? 0.9 : 0,
                                visibility: isHovered ? 'visible' : 'hidden',
                                willChange: 'transform, opacity'
                            }}
                            alt=""
                        />
                    </>
                )}
            </div>

            <div className="ps-info">
                <h3 className="ps-name">
                    <Link to={`/kvarteta/${product.slug}`} className="ps-name-link">{product.name}</Link>
                </h3>
                <p className="ps-desc">{product.description}</p>
                <Link to={`/kvarteta/${product.slug}`} className="ps-detail-link">Zobrazit detail sady →</Link>
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
    const [selectedBack, setSelectedBack] = useState<string>(backgrounds[0]?.url ?? '');
    const [packaging, setPackaging] = useState<PackagingType>('standard');
    const [searchParams, setSearchParams] = useSearchParams();

    const handleAddToCartClick = (product: any) => {
        setSelectedProduct(product);
        setSelectedBack(backgrounds[0]?.url ?? '');
        setPackaging('standard');
    };

    // Deep-link z produktové stránky: /kvarteta?pridat=<id> rovnou otevře výběr rubu.
    useEffect(() => {
        const id = searchParams.get('pridat');
        if (!id) return;
        const product = products.find((p) => p.id === id);
        if (product) handleAddToCartClick(product);
        const next = new URLSearchParams(searchParams);
        next.delete('pridat');
        setSearchParams(next, { replace: true });
        // eslint-disable-next-line react-hooks/exhaustive-deps -- jen při mountu
    }, []);

    const confirmAddToCart = () => {
        if (selectedProduct && selectedBack) {
            onAddToCart({
                ...selectedProduct,
                image: Array.isArray(selectedProduct.image) ? selectedProduct.image[0] : selectedProduct.image,
                price: selectedProduct.price + packagingSurcharge(packaging),
                selectedBack,
                packaging
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
                        <div className="modal-body">
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
                                    className={`back-preview-item ${selectedBack === bg.url ? 'selected' : ''}`}
                                    onClick={() => setSelectedBack(bg.url)}
                                    style={{
                                        backgroundImage: `url('${bg.url}')`,
                                        aspectRatio: bg.aspectRatio,
                                        backgroundSize: 'contain',
                                        backgroundRepeat: 'no-repeat',
                                    }}
                                >
                                    {selectedBack === bg.url && (
                                        <div className="selection-check">
                                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                                <polyline points="20 6 9 17 4 12"></polyline>
                                            </svg>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>

                        <PackagingSelector value={packaging} onChange={setPackaging} />
                        </div>

                        <div className="modal-footer">
                            <button className="btn-cancel" onClick={() => setSelectedProduct(null)}>Zrušit</button>
                            <button className="btn-confirm" onClick={confirmAddToCart}>
                                Potvrdit a přidat do košíku ({selectedProduct.price + packagingSurcharge(packaging)} Kč)
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </section>
    );
};

export default ProductShowcase;
