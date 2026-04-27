import React, { useState, useRef, useEffect } from 'react';
import { Upload, ZoomIn, Trash2, Check, CreditCard, ChevronRight } from 'lucide-react';
import { backgrounds } from '../data/backgrounds';
import './FamilyCardConfigurator.css';
import { uploadOrderPhoto } from '../lib/storage';
import { renderAndUploadBatch, type RenderTask } from '../lib/cardExporter';

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
    imageUrl: string | null;   // blob: preview URL
    imagePath: string | null;  // supabase storage path — posílá se do košíku
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
const JOKER_RANK = 'Ž';

const buildJokers = (): CardConfig[] => SUITS.map(suit => ({
    id: `${JOKER_RANK}-${suit.id}`,
    suit: suit.id as any,
    suitChar: suit.char,
    label: 'Žolík',
    rank: JOKER_RANK,
    suitColor: suit.color,
    imageUrl: null,
    imagePath: null,
    zoom: 1,
    position: { x: 0, y: 0 }
}));

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
                imagePath: null,
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
    const [includeJoker, setIncludeJoker] = useState(false);

    const toggleJoker = (enable: boolean) => {
        if (enable) {
            setDeck(prev => prev.some(c => c.rank === JOKER_RANK) ? prev : [...prev, ...buildJokers()]);
        } else {
            setDeck(prev => {
                prev.filter(c => c.rank === JOKER_RANK && c.imageUrl?.startsWith('blob:'))
                    .forEach(c => URL.revokeObjectURL(c.imageUrl!));
                return prev.filter(c => c.rank !== JOKER_RANK);
            });
            if (selectedCardId.startsWith(`${JOKER_RANK}-`)) {
                setSelectedCardId(initialDeck[0].id);
            }
        }
        setIncludeJoker(enable);
    };
    
    // Refs for performant dragging (no re-renders)
    const imageRef = useRef<HTMLImageElement>(null);
    const posRef = useRef({ x: 0, y: 0 });
    const dragStartRef = useRef({ x: 0, y: 0 });

    // Refs for off-screen render of every card (pro export PNG do Supabase)
    const exportRefs = useRef<Map<string, HTMLElement>>(new Map());
    const [rendering, setRendering] = useState<{ done: number; total: number } | null>(null);

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

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        e.target.value = '';

        if (selectedCard.imageUrl && selectedCard.imageUrl.startsWith('blob:')) {
            URL.revokeObjectURL(selectedCard.imageUrl);
        }
        const targetId = selectedCardId;
        const previewUrl = URL.createObjectURL(file);
        updateCard(targetId, { imageUrl: previewUrl, imagePath: null, zoom: 1, position: { x: 0, y: 0 } });

        try {
            const { path } = await uploadOrderPhoto(file);
            updateCard(targetId, { imagePath: path });
        } catch (err: any) {
            alert(err?.message || 'Nahrání fotky se nezdařilo.');
            URL.revokeObjectURL(previewUrl);
            updateCard(targetId, { imageUrl: null, imagePath: null });
        }
    };

    const updateCard = (id: string, updates: Partial<CardConfig>) => {
        setDeck(prev => prev.map(card => card.id === id ? { ...card, ...updates } : card));
    };

    const handleZoomChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        updateCard(selectedCardId, { zoom: parseFloat(e.target.value) });
    };

    const handleShiftX = (e: React.ChangeEvent<HTMLInputElement>) => {
        const x = parseFloat(e.target.value);
        updateCard(selectedCardId, { position: { ...selectedCard.position, x } });
    };
    const handleShiftY = (e: React.ChangeEvent<HTMLInputElement>) => {
        const y = parseFloat(e.target.value);
        updateCard(selectedCardId, { position: { x: selectedCard.position.x, y } });
    };
    const handleResetPosition = () => {
        updateCard(selectedCardId, { position: { x: 0, y: 0 } });
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
        updateCard(selectedCardId, { imageUrl: null, imagePath: null, zoom: 1, position: { x: 0, y: 0 } });
    };

    const handleFinish = async () => {
        const cardsWithPhotos = deck.filter(c => c.imageUrl && c.imagePath);
        if (cardsWithPhotos.length === 0) {
            alert('Prosím, nahrajte alespoň jednu fotografii pro vaši sadu.');
            return;
        }

        // Exportovat hotové karty přesně jak vypadají → PNG do Supabase
        const tasks: RenderTask[] = cardsWithPhotos
            .map(card => {
                const node = exportRefs.current.get(card.id);
                return node ? { node, cardKey: `pokerovka-${card.rank}${card.suit}` } : null;
            })
            .filter((t): t is RenderTask => t !== null);

        setRendering({ done: 0, total: tasks.length });
        const { paths, failed } = await renderAndUploadBatch(tasks, p => {
            setRendering({ done: p.done, total: p.total });
        }, 3);
        setRendering(null);

        if (failed.length && failed.length === tasks.length) {
            alert(`Generování karet selhalo (${failed.length}/${tasks.length}). Objednávka bude pokračovat jen se surovými fotkami.`);
        } else if (failed.length) {
            console.warn('Některé karty se nepodařilo vyrenderovat:', failed);
        }

        const backName = backgrounds.find(b => b.url === selectedBackUrl)?.name || 'Klasika';

        if (onAddToCart) {
            onAddToCart({
                id: `rodinne-karty-${Date.now()}`,
                name: 'Rodinné hrací karty na zakázku',
                description: `Vlastní sada (${deck.length} karet${includeJoker ? ', včetně 4 žolíků' : ''}) s vašimi fotografiemi.`,
                price: 299,
                image: selectedCard.imageUrl || backgrounds[0].url,
                themeColor: '#d4af37',
                selectedBack: backName,
                selectedBackUrl: selectedBackUrl,
                isCustom: true,
                includeJoker,
                deckConfigs: cardsWithPhotos,
                customPhotoPaths: cardsWithPhotos.map(c => c.imagePath as string),
                renderedCardPaths: paths,
                cardBackRef: { name: backName, publicUrl: selectedBackUrl },
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
                                <div className="control-group">
                                    <div className="flex justify-between items-center mb-1">
                                        <label className="control-label">Posun vodorovně</label>
                                        <span className="text-xs font-bold text-gold">{Math.round(selectedCard.position.x)} px</span>
                                    </div>
                                    <input
                                        type="range"
                                        min={-200}
                                        max={200}
                                        step={1}
                                        value={selectedCard.position.x}
                                        onChange={handleShiftX}
                                        className="zoom-slider"
                                        style={{ width: '100%' }}
                                    />
                                </div>
                                <div className="control-group">
                                    <div className="flex justify-between items-center mb-1">
                                        <label className="control-label">Posun svisle</label>
                                        <span className="text-xs font-bold text-gold">{Math.round(selectedCard.position.y)} px</span>
                                    </div>
                                    <input
                                        type="range"
                                        min={-200}
                                        max={200}
                                        step={1}
                                        value={selectedCard.position.y}
                                        onChange={handleShiftY}
                                        className="zoom-slider"
                                        style={{ width: '100%' }}
                                    />
                                </div>
                                <div style={{ display: 'flex', gap: '10px' }}>
                                    <button
                                        className="btn-secondary py-2 px-4 text-sm"
                                        style={{ flex: 1, justifyContent: 'center' }}
                                        onClick={handleResetPosition}
                                        type="button"
                                    >
                                        Vycentrovat
                                    </button>
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
                        <div className="control-group" style={{ marginBottom: '14px' }}>
                            <label className="control-label" style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', userSelect: 'none' }}>
                                <input
                                    type="checkbox"
                                    checked={includeJoker}
                                    onChange={(e) => toggleJoker(e.target.checked)}
                                    style={{ width: '18px', height: '18px', accentColor: 'var(--gold-primary, #d4af37)', cursor: 'pointer' }}
                                />
                                <span>Přidat žolíky (1 ke každé barvě, zdarma)</span>
                            </label>
                        </div>
                        <div className="control-group">
                            <div className="flex justify-between items-center mb-2">
                                <label className="control-label">Sada karet ({deck.length} ks)</label>
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
                                {backgrounds.filter(bg => bg.game === 'hraci_karty').map(bg => (
                                    <div
                                        key={bg.id}
                                        className={`back-thumb-item ${selectedBackUrl === bg.url ? 'active' : ''}`}
                                        onClick={() => setSelectedBackUrl(bg.url)}
                                        title={bg.name}
                                        style={{ aspectRatio: bg.aspectRatio }}
                                    >
                                        <img src={bg.url} alt={bg.name} className="back-thumb-img" style={{ objectFit: 'contain' }} />
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
                                disabled={rendering !== null}
                            >
                                <div className="finish-btn-shine"></div>
                                <div className="finish-btn-content">
                                    <CreditCard size={24} />
                                    {rendering
                                        ? `Generujeme karty… ${rendering.done}/${rendering.total}`
                                        : 'Objednat vlastní sadu'}
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

            {/* Off-screen render container — používá se pro export PNG každé karty do Supabase */}
            <div
                aria-hidden="true"
                style={{
                    position: 'fixed',
                    left: '-10000px',
                    top: 0,
                    pointerEvents: 'none',
                    opacity: 0,
                }}
            >
                {deck.filter(c => c.imageUrl).map(card => (
                    <div
                        key={`export-${card.id}`}
                        ref={el => {
                            if (el) exportRefs.current.set(card.id, el);
                            else exportRefs.current.delete(card.id);
                        }}
                        className={`poker-card-frame frame-${card.suitColor}`}
                        style={{ margin: 0 }}
                    >
                        <div className="card-inner-border"></div>
                        <div className={`card-index index-top-left suit-${card.suitColor}`}>
                            <span className="idx-value">{card.rank}</span>
                            <span className="idx-suit">{card.suitChar}</span>
                        </div>
                        <div className={`card-index index-bottom-right suit-${card.suitColor}`}>
                            <span className="idx-value">{card.rank}</span>
                            <span className="idx-suit">{card.suitChar}</span>
                        </div>
                        <div className="card-photo-area">
                            {card.imageUrl && (
                                <img
                                    src={card.imageUrl}
                                    alt=""
                                    style={{
                                        transform: `translate(${card.position.x}px, ${card.position.y}px) scale(${card.zoom})`,
                                        maxWidth: '100%',
                                    }}
                                />
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
};

export default FamilyCardConfigurator;
