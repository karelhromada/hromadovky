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
        id: 'karty-tema-draku',
        name: 'Epická dračí edice',
        description: 'Luxusní dračí edice. Mariášové barvy reprezentující živly. Hodnoty 10, J, Q, K, A v klasickém čistém herním designu s plnou originální malbou draků.',
        price: 449,
        themeColor: '#ff0033',
        images: ['/cards/dragon_scales_realistic_1.webp', '/cards/prsi/prsi_listy_A.webp', '/cards/prsi/prsi_srdce_K.webp'],
        boxImage: '/cards/dragon_scales_realistic_1.webp',
        isThematic: true,
        sampleValue: 'A',
        sampleSuit: '♥',
        allCards: [
            '/cards/prsi/prsi_srdce_7.webp', '/cards/prsi/prsi_srdce_8.webp', '/cards/prsi/prsi_srdce_9.webp', '/cards/prsi/prsi_srdce_10.webp', '/cards/prsi/prsi_srdce_J.webp', '/cards/prsi/prsi_srdce_Q.webp', '/cards/prsi/prsi_srdce_K.webp', '/cards/prsi/prsi_srdce_A.webp',
            '/cards/prsi/prsi_listy_7.webp', '/cards/prsi/prsi_listy_8.webp', '/cards/prsi/prsi_listy_9.webp', '/cards/prsi/prsi_listy_10.webp', '/cards/prsi/prsi_listy_J.webp', '/cards/prsi/prsi_listy_Q.webp', '/cards/prsi/prsi_listy_K.webp', '/cards/prsi/prsi_listy_A.webp',
            '/cards/prsi/prsi_zaludy_7.webp', '/cards/prsi/prsi_zaludy_8.webp', '/cards/prsi/prsi_zaludy_9.webp', '/cards/prsi/prsi_zaludy_10.webp', '/cards/prsi/prsi_zaludy_J.webp', '/cards/prsi/prsi_zaludy_Q.webp', '/cards/prsi/prsi_zaludy_K.webp', '/cards/prsi/prsi_zaludy_A.webp',
            '/cards/prsi/prsi_kule_7.webp', '/cards/prsi/prsi_kule_8.webp', '/cards/prsi/prsi_kule_9.webp', '/cards/prsi/prsi_kule_10.webp', '/cards/prsi/prsi_kule_J.webp', '/cards/prsi/prsi_kule_Q.webp', '/cards/prsi/prsi_kule_K.webp', '/cards/prsi/prsi_kule_A.webp'
        ]
    },
    {
        id: 'karty-tema-carodejnice',
        name: 'Magické čarodějnice',
        description: 'Mysteriózní sady čarodějnic. Každá hodnota (spodek, svršek, král, eso) nabízí jedinečnou detailní ilustraci od učednic ohně až po královny lesa.',
        price: 449,
        themeColor: '#ff4b4b',
        images: ['/cards/carodejnice/eso_srdce_oznaceno.png', '/cards/carodejnice/kral_listy_oznaceno.png', '/cards/carodejnice/svrsek_zaludy_oznaceno.png'],
        boxImage: '/cards/carodejnice/kral_srdce_oznaceno.png',
        isThematic: true,
        sampleValue: 'K',
        sampleSuit: '♥',
        allCards: [
            '/cards/carodejnice/eso_srdce_oznaceno.png', '/cards/carodejnice/kral_srdce_oznaceno.png', '/cards/carodejnice/svrsek_srdce_oznaceno.png', '/cards/carodejnice/spodek_srdce_oznaceno.png', '/cards/carodejnice/desitka_srdce_oznaceno.png',
            '/cards/carodejnice/eso_listy_oznaceno.png', '/cards/carodejnice/kral_listy_oznaceno.png', '/cards/carodejnice/svrsek_listy_oznaceno.png', '/cards/carodejnice/spodek_listy_oznaceno.png', '/cards/carodejnice/desitka_listy_oznaceno.png',
            '/cards/carodejnice/eso_zaludy_oznaceno.png', '/cards/carodejnice/kral_zaludy_oznaceno.png', '/cards/carodejnice/svrsek_zaludy_oznaceno.png', '/cards/carodejnice/spodek_zaludy_oznaceno.png', '/cards/carodejnice/desitka_zaludy_oznaceno.png',
            '/cards/carodejnice/eso_kule_oznaceno.png', '/cards/carodejnice/kral_kule_oznaceno.png', '/cards/carodejnice/svrsek_kule_oznaceno.png', '/cards/carodejnice/spodek_kule_oznaceno.png', '/cards/carodejnice/desitka_kule_oznaceno.png'
        ]
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
                                    backgroundImage: `url('${product.boxImage}')`,
                                    border: `2px solid ${product.themeColor}80`
                                }}
                            >
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
