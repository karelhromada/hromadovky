import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import type { CartItem } from '../App';
import './ProductShowcaseKarty.css';
import { X, Maximize, Minimize } from 'lucide-react';

interface ProductShowcaseKartyProps {
    onAddToCart?: (item: Omit<CartItem, 'quantity'>) => void;
}

const products = [
    {
        id: 'karty-klasika-vesmir',
        name: 'Noční klasika',
        description: 'Klasické herní hodnoty (10, J, Q, K, A) pro Vyšší bere a pohlcující noční obloha na luxusním rubu.',
        price: 349,
        themeColor: '#00d2ff',
        images: ['/cards/neutral_back_stars.png', '/cards/neutral_back_stars.png', '/cards/neutral_back_stars.png'],
        boxImage: '/cards/neutral_back_stars.png',
        allCards: ['/cards/neutral_back_stars.png'] // Placeholder for preview
    },
    {
        id: 'karty-tema-draku',
        name: 'Epická dračí edice',
        description: 'Luxusní Dračí edice. Mariášové barvy reprezentující živly. Hodnoty 10, J, Q, K, A v klasickém čistém herním designu s plnou originální malbou draků.',
        price: 449, // Adjusted price for smaller deck
        themeColor: '#ff0033',
        images: ['/cards/dragon_scales_realistic_1.png', '/cards/prsi/prsi_listy_A.png', '/cards/prsi/prsi_srdce_K.png'],
        boxImage: '/cards/dragon_scales_realistic_1.png',
        isThematic: true,
        sampleValue: 'A',
        sampleSuit: '♥',
        allCards: [
            '/cards/prsi/prsi_srdce_10.png', '/cards/prsi/prsi_srdce_J.png', '/cards/prsi/prsi_srdce_Q.png', '/cards/prsi/prsi_srdce_K.png', '/cards/prsi/prsi_srdce_A.png',
            '/cards/prsi/prsi_listy_10.png', '/cards/prsi/prsi_listy_J.png', '/cards/prsi/prsi_listy_Q.png', '/cards/prsi/prsi_listy_K.png', '/cards/prsi/prsi_listy_A.png',
            '/cards/prsi/prsi_zaludy_10.png', '/cards/prsi/prsi_zaludy_J.png', '/cards/prsi/prsi_zaludy_Q.png', '/cards/prsi/prsi_zaludy_K.png', '/cards/prsi/prsi_zaludy_A.png',
            '/cards/prsi/prsi_kule_10.png', '/cards/prsi/prsi_kule_J.png', '/cards/prsi/prsi_kule_Q.png', '/cards/prsi/prsi_kule_K.png', '/cards/prsi/prsi_kule_A.png'
        ]
    },
    {
        id: 'karty-klasika-draku',
        name: 'Dračí kůže',
        description: 'Standardní figury (10-A) pro snadné hraní, ale se zadní stranou potaženou realistickou dračí šupinou.',
        price: 349,
        themeColor: '#ff0033',
        images: ['/cards/dragon_scales_realistic_2.png', '/cards/dragon_scales_realistic_1.png', '/cards/dragon_scales_realistic_1.png'],
        boxImage: '/cards/dragon_scales_realistic_1.png',
        allCards: ['/cards/dragon_scales_realistic_1.png']
    },
    {
        id: 'karty-tema-dino',
        name: 'Tematické: Dinosauři',
        description: 'Plně tematický líc. Každá karta (10, J, Q, K, A) je ztvárněna fantastickou ilustrací dinosaura.',
        price: 449,
        themeColor: '#ff8a00',
        images: ['/cards/dino_full_4.png', '/cards/dino_full_5.png', '/cards/dino_full_2.png'],
        boxImage: '/cards/dragon_scales_seamless.png',
        isThematic: true,
        sampleValue: 'K',
        sampleSuit: '🔔',
        allCards: ['/cards/dino_full_4.png', '/cards/dino_full_5.png', '/cards/dino_full_2.png']
    },
    {
        id: 'karty-tema-kocky',
        name: 'Tematické: Kočky',
        description: 'Každá hodnota (10-A) má unikátní malovanou kočičí tvář, avšak při zachování snadné čitelnosti znaků.',
        price: 449,
        themeColor: '#00d2ff',
        images: ['/cards/cat_full_1.png', '/cards/cat_full_2.png', '/cards/cat_full_3.png'],
        boxImage: '/cards/magic_runes_1.png',
        isThematic: true,
        sampleValue: 'Q',
        sampleSuit: '🍃',
        allCards: ['/cards/cat_full_1.png', '/cards/cat_full_2.png', '/cards/cat_full_3.png']
    }
];

const ProductShowcaseKarty: React.FC<ProductShowcaseKartyProps> = ({ onAddToCart }) => {
    const [selectedProductForPreview, setSelectedProductForPreview] = useState<any | null>(null);
    const [activeTab, setActiveTab] = useState<string>('Všechny');
    const [isMaximized, setIsMaximized] = useState<boolean>(false);
    const [zoomedCardImage, setZoomedCardImage] = useState<string | null>(null);

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
        if (onAddToCart) {
            onAddToCart({
                id: product.id,
                name: product.name,
                description: product.description,
                price: product.price,
                image: product.images[1],
                themeColor: product.themeColor
            });
            alert(`${product.name} bylo přidáno do košíku!`);
        }
    };

    return (
        <section id="products" className="karty-showcase-section container">
            <div className="section-header">
                <span className="badge mb-4">Klasické hry</span>
                <h2 className="section-title">Luxusní <span className="text-gradient-gold">balíčky</span></h2>
                <p className="text-center text-secondary max-w-2xl mt-4">
                    Naše exkluzivní Prší edice vás ohromí prémiovým zpracováním, odolností a luxusním vzhledem. Prohlédněte si všechny karty před nákupem!
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
                                {product.isThematic && (
                                    <>
                                        <div className="karty-play-overlay top-left">
                                            <span>{product.sampleValue}</span>
                                            <span className="karty-play-suit">{product.sampleSuit}</span>
                                        </div>
                                        <div className="karty-play-overlay bottom-right">
                                            <span>{product.sampleValue}</span>
                                            <span className="karty-play-suit">{product.sampleSuit}</span>
                                        </div>
                                    </>
                                )}
                            </div>
                            <div
                                className="karty-slide-card karty-slide-card-1"
                                style={{ backgroundImage: `url('${product.images[1]}')` }}
                            >
                                {product.isThematic && (
                                    <>
                                        <div className="karty-play-overlay top-left">
                                            <span>{product.sampleValue}</span>
                                            <span className="karty-play-suit">{product.sampleSuit}</span>
                                        </div>
                                        <div className="karty-play-overlay bottom-right">
                                            <span>{product.sampleValue}</span>
                                            <span className="karty-play-suit">{product.sampleSuit}</span>
                                        </div>
                                    </>
                                )}
                            </div>

                            {/* The Box itself (Top layer) */}
                            <div
                                className="karty-deck-box"
                                style={{
                                    backgroundImage: `url('${product.boxImage}')`,
                                    border: `2px solid ${product.themeColor}80`
                                }}
                            >
                                <div className="absolute inset-0 bg-black/60 rounded-md flex items-center justify-center backdrop-blur-sm">
                                    <span className="text-white font-bold opacity-90 text-xl" style={{ textShadow: '0 2px 4px rgba(0,0,0,0.8)' }}>
                                        20 Karet
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="karty-deck-info">
                            <h3>{product.name}</h3>
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
                                <p className="karty-modal-subtitle">Sada obsahuje {selectedProductForPreview.allCards?.length || 0} karet · Detailní pohled</p>
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
                            {['Všechny', 'Srdce', 'Kule', 'Žaludy', 'Listy'].map(tab => {
                                const searchStr = tab === 'Žaludy' ? 'zaludy' : tab.toLowerCase();
                                const hasCardsForTab = tab === 'Všechny' || selectedProductForPreview.allCards?.some((url: string) => url.toLowerCase().includes(searchStr));
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
                                {(activeTab === 'Všechny' ? ['Srdce', 'Kule', 'Žaludy', 'Listy'] : [activeTab]).map(suitTab => {
                                    const matchStr = suitTab === 'Žaludy' ? 'zaludy' : suitTab.toLowerCase();
                                    const suitCards = selectedProductForPreview.allCards?.filter((url: string) => url.toLowerCase().includes(matchStr));

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
        </section>
    );
};

export default ProductShowcaseKarty;
