import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { Link, useSearchParams } from 'react-router-dom';
import type { CartItem } from '../App';
import './ProductShowcase.css'; // sdílené .ps-* třídy patičky (cena + košík) – stejně jako Pexeso; jinak se na hard-refresh /karty nenačtou
import './ProductShowcaseKarty.css';
import { X, Maximize, Minimize } from 'lucide-react';
import PackagingSelector from './PackagingSelector';
import { packagingSurcharge, type PackagingType } from '../data/packaging';

interface ProductShowcaseKartyProps {
    onAddToCart?: (item: Omit<CartItem, 'quantity'>) => void;
}

import { kartyProducts as products } from '../data/products';

import { getBackgroundsForGame } from '../data/backgrounds';

const KARTY_BACKS = getBackgroundsForGame('hraci_karty');

const ProductShowcaseKarty: React.FC<ProductShowcaseKartyProps> = ({ onAddToCart }) => {
    const [selectedProductForPreview, setSelectedProductForPreview] = useState<any | null>(null);
    const [activeTab, setActiveTab] = useState<string>('Všechny');
    const [isMaximized, setIsMaximized] = useState<boolean>(false);
    const [zoomedCardImage, setZoomedCardImage] = useState<string | null>(null);
    const [selectedProductForCart, setSelectedProductForCart] = useState<any | null>(null);
    const [selectedBack, setSelectedBack] = useState<string>(KARTY_BACKS[0].url);
    const [packaging, setPackaging] = useState<PackagingType>('standard');

    // Prevent background scrolling when modal or lightbox is open
    React.useEffect(() => {
        if (selectedProductForPreview || zoomedCardImage) {
            document.body.style.overflow = 'hidden';
            return () => {
                document.body.style.overflow = '';
            };
        }
    }, [selectedProductForPreview, zoomedCardImage]);

    const handleAddToCart = (product: any) => {
        setSelectedProductForCart(product);
        setSelectedBack(KARTY_BACKS[0].url);
        setPackaging('standard');
    };

    // Deep-link z produktové stránky: /karty?pridat=<id> rovnou otevře výběr rubu.
    const [searchParams, setSearchParams] = useSearchParams();
    React.useEffect(() => {
        const id = searchParams.get('pridat');
        if (!id) return;
        const product = products.find((p) => p.id === id);
        if (product) handleAddToCart(product);
        const next = new URLSearchParams(searchParams);
        next.delete('pridat');
        setSearchParams(next, { replace: true });
        // eslint-disable-next-line react-hooks/exhaustive-deps -- jen při mountu
    }, []);

    const confirmAddToCart = () => {
        if (onAddToCart && selectedProductForCart) {
            onAddToCart({
                id: selectedProductForCart.id,
                name: selectedProductForCart.name,
                description: selectedProductForCart.description,
                price: selectedProductForCart.price + packagingSurcharge(packaging),
                image: selectedProductForCart.images[1],
                themeColor: selectedProductForCart.themeColor,
                selectedBack: selectedBack,
                packaging
            });
            setSelectedProductForCart(null);
        }
    };

    return (
        <section id="products" className="karty-showcase-section container">
            <div className="section-header">
                <span className="badge mb-4">Klasické hry</span>
                <h2 className="section-title">Naše <span className="text-gradient-gold">luxusní sady</span> hracích karet</h2>
                <p className="section-subtitle text-center">
                    Naše exkluzivní edice pro prší vás ohromí prémiovým zpracováním, odolností a luxusním vzhledem. Prohlédněte si všechny karty rovnou zde na webu!
                </p>
            </div>

            <div className="karty-product-grid">
                {products.map(product => (
                    <div key={product.id} className="karty-deck-card">

                        <div className="karty-deck-visual">
                            {/* Slide out cards (underneath the box initially) */}
                            <div
                                className="karty-slide-card karty-slide-card-2"
                                style={{ backgroundImage: `url('${product.images[2]}')` }}
                            >
                            </div>
                            <div
                                className="karty-slide-card karty-slide-card-1"
                                style={{ backgroundImage: `url('${product.images[1]}')` }}
                            >
                            </div>

                            {/* The Box itself (Top layer) */}
                            <div
                                className="karty-deck-box"
                                style={{
                                    backgroundImage: `url('${product.boxImage}')`
                                }}
                            >
                            </div>
                        </div>

                        <div className="karty-deck-info">
                            <h3>
                                <Link to={`/karty/${product.slug}`} className="ps-name-link">{product.name}</Link>
                            </h3>
                            <Link to={`/karty/${product.slug}`} className="ps-detail-link">Zobrazit detail sady →</Link>
                            {/* Removed product description to make room for viewing cards */}
                            <div style={{ marginBottom: '24px', marginTop: '16px' }}>
                                <button
                                    onClick={() => {
                                        setSelectedProductForPreview(product);
                                    }}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '8px',
                                        color: '#6b7280',
                                        background: 'rgba(0,0,0,0.03)',
                                        padding: '10px 16px',
                                        borderRadius: '12px',
                                        fontWeight: '600',
                                        fontSize: '0.95rem',
                                        border: '1px solid rgba(0,0,0,0.05)',
                                        width: '100%',
                                        justifyContent: 'center',
                                        cursor: 'pointer',
                                        transition: 'all 0.2s ease'
                                    }}
                                    onMouseOver={(e) => {
                                        e.currentTarget.style.background = 'rgba(0,0,0,0.06)';
                                        e.currentTarget.style.color = '#374151';
                                    }}
                                    onMouseOut={(e) => {
                                        e.currentTarget.style.background = 'rgba(0,0,0,0.03)';
                                        e.currentTarget.style.color = '#6b7280';
                                    }}
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                                        <circle cx="12" cy="12" r="3"></circle>
                                    </svg>
                                    <span>Prohlédnout karty</span>
                                </button>
                            </div>

                            <div className="ps-footer">
                                <span className="ps-price">{product.price} Kč</span>
                                <button
                                    className="ps-btn-add"
                                    onClick={() => handleAddToCart(product)}
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <circle cx="9" cy="21" r="1"></circle>
                                        <circle cx="20" cy="21" r="1"></circle>
                                        <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
                                        <line x1="12" y1="10" x2="12" y2="16"></line>
                                        <line x1="9" y1="13" x2="15" y2="13"></line>
                                    </svg>
                                    <span>Přidat</span>
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Preview Modal */}
            {selectedProductForPreview && createPortal(
                <div className="karty-modal-overlay">
                    {/* Dark Backdrop */}
                    <div
                        className="karty-modal-backdrop"
                        onClick={() => setSelectedProductForPreview(null)}
                    ></div>

                    {/* Modal Content */}
                    <div className={`karty-modal-content ${isMaximized ? 'karty-modal-maximized' : ''}`}>
                        <div className="karty-modal-header">
                            <div>
                                <h3 className="karty-modal-title">{selectedProductForPreview.name}</h3>
                                <p className="karty-modal-subtitle">Detailní pohled na balíček</p>
                            </div>
                            <div className="karty-modal-actions">
                                <button
                                    onClick={() => setIsMaximized(!isMaximized)}
                                    className="karty-modal-icon-btn"
                                    title={isMaximized ? "Obnovit velikost" : "Maximalizovat"}
                                >
                                    {isMaximized ? <Minimize size={24} /> : <Maximize size={24} />}
                                </button>
                                <button
                                    onClick={() => setSelectedProductForPreview(null)}
                                    className="karty-modal-icon-btn"
                                    title="Zavřít"
                                >
                                    <X size={24} />
                                </button>
                            </div>
                        </div>

                        {/* Tabs Navigation */}
                        <div className="karty-modal-tabs">
                            {['Všechny', 'Červené', 'Kule', 'Žaludy', 'Zelené'].map(tab => {
                                const mapping: { [key: string]: string[] } = {
                                    'Červené': ['cervene', 'srdce'],
                                    'Kule': ['kule', 'kary'],
                                    'Žaludy': ['zaludy', 'trefy'],
                                    'Zelené': ['zelene', 'listy', 'piky', 'zelen']
                                };

                                const hasCardsForTab = tab === 'Všechny' || selectedProductForPreview.allCards?.some((url: string) => {
                                    const lowerUrl = url.toLowerCase();
                                    return mapping[tab]?.some(m => lowerUrl.includes(m));
                                });
                                
                                if (!hasCardsForTab) return null;

                                return (
                                    <button
                                        key={tab}
                                        onClick={() => setActiveTab(tab)}
                                        className={`karty-modal-tab ${activeTab === tab ? 'active' : ''}`}
                                    >
                                        {tab}
                                    </button>
                                );
                            })}
                        </div>

                        <div className="karty-modal-body">
                            <div className="karty-modal-suit-groups">
                                {(activeTab === 'Všechny' ? ['Červené', 'Kule', 'Žaludy', 'Zelené'] : [activeTab]).map(suitTab => {
                                    const mapping: { [key: string]: string[] } = {
                                        'Červené': ['cervene', 'srdce'],
                                        'Kule': ['kule', 'kary'],
                                        'Žaludy': ['zaludy', 'trefy'],
                                        'Zelené': ['zelene', 'listy', 'piky', 'zelen']
                                    };

                                    const matchStrings = mapping[suitTab] || [];
                                    const suitCards = selectedProductForPreview.allCards?.filter((url: string) => {
                                        const lowerUrl = url.toLowerCase();
                                        return matchStrings.some(m => lowerUrl.includes(m));
                                    });

                                    if (!suitCards || suitCards.length === 0) return null;

                                    return (
                                        <div key={suitTab} className="karty-modal-suit-section">
                                            {activeTab === 'Všechny' && (
                                                <h4 className="karty-modal-suit-title">{suitTab}</h4>
                                            )}
                                            <div className="karty-modal-grid">
                                                {suitCards.map((imgUrl: string, idx: number) => (
                                                    <div
                                                        key={idx}
                                                        className="karty-modal-card-item"
                                                        style={{ backgroundImage: `url('${imgUrl}')` }}
                                                        onClick={() => setZoomedCardImage(imgUrl)}
                                                    />
                                                ))}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        <div className="karty-modal-footer">
                            <span className="karty-modal-price">{selectedProductForPreview.price} Kč</span>
                            <button
                                className="btn-primary py-3 px-8 text-lg shadow-lg hover:shadow-xl transition-all"
                                onClick={() => {
                                    handleAddToCart(selectedProductForPreview);
                                    setSelectedProductForPreview(null);
                                }}
                            >
                                Koupit rovnou
                            </button>
                        </div>
                    </div>
                </div>,
                document.body
            )}

            {/* Lightbox / Zvětšený náhled karty */}
            {zoomedCardImage && createPortal(
                <div
                    className="karty-lightbox-overlay"
                    onClick={() => setZoomedCardImage(null)}
                >
                    <button
                        className="karty-lightbox-close"
                        onClick={(e) => {
                            e.stopPropagation();
                            setZoomedCardImage(null);
                        }}
                        title="Zavřít detail"
                    >
                        <X size={32} />
                    </button>
                    <img
                        src={zoomedCardImage}
                        alt="Zvětšený detail karty"
                        className="karty-lightbox-image"
                        onClick={(e) => e.stopPropagation()} // Prevent closing when clicking the image itself
                    />
                </div>,
                document.body
            )}

            {/* Back Selection Modal for Hrací karty */}
            {selectedProductForCart && (
                <div className="back-selection-modal-overlay" onClick={() => setSelectedProductForCart(null)}>
                    <div className="back-selection-modal glass-panel" onClick={e => e.stopPropagation()}>
                        <div className="modal-body">
                        <div className="modal-header">
                            <h3>Zvolte zadní stranu sady</h3>
                            <button className="close-btn" onClick={() => setSelectedProductForCart(null)}>
                                <X size={24} />
                            </button>
                        </div>
                        <p className="modal-subtitle">Vybraná zadní strana se vytiskne na všechny karty v tomto balíčku.</p>
                        
                        <div className="backs-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', maxHeight: '300px', overflowY: 'auto', padding: '4px' }}>
                            {KARTY_BACKS.map((bg, idx) => (
                                <div
                                    key={idx}
                                    className={`back-preview-item ${selectedBack === bg.url ? 'selected' : ''}`}
                                    onClick={() => setSelectedBack(bg.url)}
                                    style={{
                                        backgroundImage: `url('${bg.url}')`,
                                        aspectRatio: bg.aspectRatio,
                                        borderRadius: '8px',
                                        cursor: 'pointer',
                                        border: selectedBack === bg.url ? '2px solid var(--accent-gold)' : '2px solid transparent',
                                        backgroundSize: 'contain',
                                        backgroundRepeat: 'no-repeat',
                                        backgroundPosition: 'center',
                                        position: 'relative'
                                    }}
                                >
                                    {selectedBack === bg.url && (
                                        <div className="selection-check" style={{ position: 'absolute', top: '4px', right: '4px', background: 'var(--accent-gold)', borderRadius: '50%', padding: '2px' }}>
                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                                <polyline points="20 6 9 17 4 12"></polyline>
                                            </svg>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>

                        <PackagingSelector value={packaging} onChange={setPackaging} />
                        </div>

                        <div className="modal-footer" style={{ marginTop: '24px', display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                            <button className="btn-cancel" onClick={() => setSelectedProductForCart(null)}>Zrušit</button>
                            <button
                                className="btn-confirm"
                                onClick={confirmAddToCart}
                                style={{ background: 'var(--accent-gold)', color: 'white', border: 'none', padding: '12px 24px', borderRadius: '12px', fontWeight: 600, cursor: 'pointer' }}
                            >
                                Přidat do košíku ({selectedProductForCart.price + packagingSurcharge(packaging)} Kč)
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </section>
    );
};

export default ProductShowcaseKarty;
