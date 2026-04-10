import React, { useState, useRef, useEffect } from 'react';
import { Upload, ZoomIn, Trash2, Check, CreditCard, ChevronRight } from 'lucide-react';
import { backgrounds } from '../data/backgrounds';
import './FamilyCardConfigurator.css';

interface FamilyCardConfiguratorProps {
    onAddToCart?: (item: any) => void;
}

interface CardConfig {
    id: string;
    suit: 'H' | 'D' | 'C' | 'S';
    suitChar: string;
    label: string;
    rank: string;
    suitColor: 'red' | 'black';
    imageUrl: string | null;
    zoom: number;
    position: { x: number; y: number };
}

const MiniCard = React.memo(({ card, isActive, onSelect }: { card: CardConfig, isActive: boolean, onSelect: (id: string) => void }) => {
    return (
        <button
            className={`mini-card-btn frame-${card.suitColor} ${isActive ? 'active' : ''}`}
            onClick={() => onSelect(card.id)}
        >
            {card.imageUrl && (
                <img 
                    src={card.imageUrl} 
                    alt="" 
                    className="mini-card-thumb-img" 
                    loading="lazy" 
                />
            )}
            <span className={`mini-card-label suit-${card.suitColor}`}>
                {card.rank}{card.suitChar}
            </span>
        </button>
    );
});

MiniCard.displayName = 'MiniCard';

const SUITS = [
    { id: 'H', char: '♥', name: 'Srdce', color: 'red' as const },
    { id: 'D', char: '♦', name: 'Káry', color: 'red' as const },
    { id: 'C', char: '♣', name: 'Kříže', color: 'black' as const },
    { id: 'S', char: '♠', name: 'Piky', color: 'black' as const },
];

const RANKS = ['7', '8', '9', '10', 'J', 'Q', 'K', 'A'];

const FamilyCardConfigurator: React.FC<FamilyCardConfiguratorProps> = ({ onAddToCart }) => {
    // Generate initial deck
    const initialDeck: CardConfig[] = [];
    SUITS.forEach(suit => {
        RANKS.forEach(rank => {
            initialDeck.push({
                id: `${rank}-${suit.id}`,
                suit: suit.id as any,
                suitChar: suit.char,
                label: rank,
                rank: rank,
                suitColor: suit.color,
                imageUrl: null,
                zoom: 1,
                position: { x: 0, y: 0 }
            });
        });
    });

    const [deck, setDeck] = useState<CardConfig[]>(initialDeck);
    const [selectedCardId, setSelectedCardId] = useState<string>(initialDeck[0].id);
    const [selectedBackUrl, setSelectedBackUrl] = useState<string>(backgrounds[0].url);
    const [isDragging, setIsDragging] = useState(false);
    const [activeSuitId, setActiveSuitId] = useState<string>('H');
    
    // Refs for performant dragging (no re-renders)
    const imageRef = useRef<HTMLImageElement>(null);
    const posRef = useRef({ x: 0, y: 0 });
    const dragStartRef = useRef({ x: 0, y: 0 });

    const handleSelectCard = React.useCallback((id: string) => {
        setSelectedCardId(id);
    }, []);

    const selectedCard = React.useMemo(() => {
        return deck.find(c => c.id === selectedCardId) || deck[0];
    }, [deck, selectedCardId]);

    // Cleanup Object URLs to prevent memory leaks
    useEffect(() => {
        return () => {
            deck.forEach(card => {
                if (card.imageUrl && card.imageUrl.startsWith('blob:')) {
                    URL.revokeObjectURL(card.imageUrl);
                }
            });
        };
    }, []); // Only on unmount

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            // Revoke old URL if exists for this card
            if (selectedCard.imageUrl && selectedCard.imageUrl.startsWith('blob:')) {
                URL.revokeObjectURL(selectedCard.imageUrl);
            }
            const url = URL.createObjectURL(file);
            updateCard(selectedCardId, { imageUrl: url, zoom: 1, position: { x: 0, y: 0 } });
        }
    };

    const updateCard = (id: string, updates: Partial<CardConfig>) => {
        setDeck(prev => prev.map(card => card.id === id ? { ...card, ...updates } : card));
    };

    const handleZoomChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        updateCard(selectedCardId, { zoom: parseFloat(e.target.value) });
    };

    const handleMouseDown = (e: React.MouseEvent) => {
        if (!selectedCard.imageUrl) return;
        setIsDragging(true);
        dragStartRef.current = { 
            x: e.clientX - selectedCard.position.x, 
            y: e.clientY - selectedCard.position.y 
        };
        posRef.current = { x: selectedCard.position.x, y: selectedCard.position.y };
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        if (!isDragging || !imageRef.current) return;
        
        const newX = e.clientX - dragStartRef.current.x;
        const newY = e.clientY - dragStartRef.current.y;
        
        posRef.current = { x: newX, y: newY };
        
        // Direct DOM manipulation for bypass React render cycles
        imageRef.current.style.transform = `translate(${newX}px, ${newY}px) scale(${selectedCard.zoom})`;
    };

    const handleMouseUp = () => {
        if (isDragging) {
            setIsDragging(false);
            // Sync final position back to React state
            updateCard(selectedCardId, { position: { ...posRef.current } });
        }
    };

    const handleRemoveImage = () => {
        updateCard(selectedCardId, { imageUrl: null, zoom: 1, position: { x: 0, y: 0 } });
    };

    const handleFinish = () => {
        const withPhotos = deck.filter(c => c.imageUrl).length;
        if (withPhotos === 0) {
            alert('Prosím, nahrajte alespoň jednu fotografii pro vaši sadu.');
            return;
        }

        if (onAddToCart) {
            onAddToCart({
                id: `rodinne-karty-${Date.now()}`,
                name: 'Rodinné hrací karty na zakázku',
                description: `Vlastní sada (${deck.length} karet) s vašimi fotografiemi.`,
                price: 299,
                image: selectedCard.imageUrl || backgrounds[0].url,
                themeColor: '#d4af37',
                selectedBack: backgrounds.find(b => b.url === selectedBackUrl)?.name || 'Klasika',
                selectedBackUrl: selectedBackUrl,
                isCustom: true,
                deckConfigs: deck.filter(c => c.imageUrl)
            });
        }
    };

    // Card counts for UI
    const totalWithPhotos = deck.filter(c => c.imageUrl).length;

    return (
        <section id="family-configurator" className={`family-configurator-section container ${isDragging ? 'is-dragging' : ''}`}>
            <div className="section-header">
                <span className="badge mb-4">Unikátní dárek</span>
                <h2 className="section-title">Vytvořte si <span className="text-gradient-gold">rodinné karty</span></h2>
                <p className="text-center text-secondary max-w-2xl mt-4">
                    Nahrajte své vlastní fotografie a vytvořte si nezapomenutelnou sadu karet. Každá karta může nést jiný příběh. Přímo zde v prohlížeči můžete fotky libovolně posouvat a zvětšovat.
                </p>
            </div>

            <div className="fcc-main-panel mt-12">
                <div className="config-layout">
                    {/* LEVÁ STRANA: Náhled a interaktivní editor */}
                    <div className="card-preview-container">
                        <div 
                            className={`poker-card-frame frame-${selectedCard.suitColor}`}
                            onMouseDown={handleMouseDown}
                            onMouseMove={handleMouseMove}
                            onMouseUp={handleMouseUp}
                            onMouseLeave={handleMouseUp}
                        >
                            <div className="card-inner-border"></div>
                            
                            {/* Indices */}
                            <div className={`card-index index-top-left suit-${selectedCard.suitColor}`}>
                                <span className="idx-value">{selectedCard.rank}</span>
                                <span className="idx-suit">{selectedCard.suitChar}</span>
                            </div>

                            <div className={`card-index index-bottom-right suit-${selectedCard.suitColor}`}>
                                <span className="idx-value">{selectedCard.rank}</span>
                                <span className="idx-suit">{selectedCard.suitChar}</span>
                            </div>

                            {/* Photo Area */}
                            <div className="card-photo-area">
                                {selectedCard.imageUrl ? (
                                    <img 
                                        ref={imageRef}
                                        key={selectedCard.id}
                                        src={selectedCard.imageUrl} 
                                        alt="User custom" 
                                        style={{
                                            transform: `translate(${selectedCard.position.x}px, ${selectedCard.position.y}px) scale(${selectedCard.zoom})`,
                                            maxWidth: '100%',
                                        }}
                                    />
                                ) : (
                                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#334155', gap: '1rem' }}>
                                        <Upload size={64} opacity={0.2} />
                                        <p style={{ fontSize: '0.9rem', opacity: 0.5 }}>Nahrajte fotku pro {selectedCard.rank}{selectedCard.suitChar}</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {selectedCard.imageUrl && (
                            <div className="manipulation-controls w-full animate-fade-in">
                                <div className="control-group">
                                    <div className="flex justify-between items-center mb-1">
                                        <label className="control-label">Měřítko (Zoom)</label>
                                        <span className="text-xs font-bold text-gold">{Math.round(selectedCard.zoom * 100)}%</span>
                                    </div>
                                    <div className="zoom-slider-container">
                                        <ZoomIn size={18} className="text-gray-500" />
                                        <input 
                                            type="range" 
                                            min="0.5" 
                                            max="3" 
                                            step="0.01" 
                                            value={selectedCard.zoom} 
                                            onChange={handleZoomChange}
                                            className="zoom-slider"
                                        />
                                    </div>
                                </div>
                                <div style={{ display: 'flex', gap: '10px' }}>
                                    <button 
                                        className="btn-secondary py-2 px-4 flex items-center gap-2 text-sm"
                                        style={{ flex: 1, justifyContent: 'center' }}
                                        onClick={handleRemoveImage}
                                    >
                                        <Trash2 size={16} /> Odstranit fotku
                                    </button>
                                </div>
                            </div>
                        )}

                        {!selectedCard.imageUrl && (
                            <label className="upload-dropzone w-full">
                                <input type="file" hidden accept="image/*" onChange={handleImageUpload} />
                                <Upload className="mx-auto mb-3 text-gold" size={32} />
                                <p className="font-bold text-sm">Vybrat fotografii</p>
                                <p className="text-xs text-gray-500 mt-1">PNG, JPG až do 10MB</p>
                            </label>
                        )}
                    </div>

                    {/* PRAVÁ STRANA: Výběr karet a shrnutí */}
                    <div className="config-controls">
                        <div className="control-group">
                            <div className="flex justify-between items-center mb-2">
                                <label className="control-label">Sada karet (32 ks)</label>
                                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Hotovo: {totalWithPhotos}/{deck.length}</span>
                            </div>
                            <div className="flex flex-col gap-4">
                                <div className="suit-tabs">
                                    {SUITS.map(suit => (
                                        <button
                                            key={suit.id}
                                            className={`suit-tab-btn ${activeSuitId === suit.id ? 'active' : ''} suit-${suit.color}`}
                                            onClick={() => setActiveSuitId(suit.id)}
                                        >
                                            <span className="suit-tab-char">{suit.char}</span>
                                            <span className="suit-tab-name">{suit.name}</span>
                                        </button>
                                    ))}
                                </div>
                                <div className="cards-selection-grid-mini">
                                    {deck.filter(c => c.suit === activeSuitId).map(card => (
                                        <MiniCard 
                                            key={card.id} 
                                            card={card} 
                                            isActive={selectedCardId === card.id} 
                                            onSelect={handleSelectCard} 
                                        />
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Rub karet selection */}
                        <div className="control-group mt-6">
                            <label className="control-label">Vybrat zadní stranu (Rub)</label>
                            <div className="backs-selection-horizontal">
                                {backgrounds.filter(bg => !bg.category?.includes('pexeso')).slice(0, 12).map(bg => (
                                    <div 
                                        key={bg.id}
                                        className={`back-thumb-item ${selectedBackUrl === bg.url ? 'active' : ''}`}
                                        onClick={() => setSelectedBackUrl(bg.url)}
                                        title={bg.name}
                                    >
                                        <img src={bg.url} alt={bg.name} className="back-thumb-img" />
                                        {selectedBackUrl === bg.url && <div className="back-check-badge"><Check size={12} /></div>}
                                    </div>
                                ))}
                                <div className="back-thumb-more" title="Další vzory vám ukážeme v košíku">
                                    +30
                                </div>
                            </div>
                        </div>

                        <div className="border-t border-gray-200 pt-8 mt-auto">
                            <div className="flex justify-between items-center mb-6">
                                <div>
                                    <h4 className="font-bold text-xl text-slate-800">Celková cena</h4>
                                    <p className="text-sm text-gray-500">Komplet rodinná sada poker</p>
                                </div>
                                <div className="price-tag">299 Kč</div>
                            </div>

                            <button 
                                className="finish-order-btn"
                                onClick={handleFinish}
                            >
                                <div className="finish-btn-shine"></div>
                                <div className="finish-btn-content">
                                    <CreditCard size={24} />
                                    Objednat vlastní sadu
                                    <ChevronRight size={20} />
                                </div>
                            </button>
                            
                            <div className="shipping-info-row">
                                <Check size={14} className="text-green-500" />
                                <span>Expedujeme do 48 hodin od schválení</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default FamilyCardConfigurator;
