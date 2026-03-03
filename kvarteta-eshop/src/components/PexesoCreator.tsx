import React, { useState } from 'react';
import { CheckCircle, Plus, Upload, Sparkles, LayoutGrid, Layers, Diamond } from 'lucide-react';
import './PexesoCreator.css';

interface PexesoCreatorProps {
    onAddToCart?: (item: any) => void;
}

const backgrounds = [
    { id: 'bg1', name: 'Zelené Šupiny', url: '/cards/dragon_scales_realistic_1.png' },
    { id: 'bg2', name: 'Kovový Drak', url: '/cards/dragon_scales_metallic.png' },
    { id: 'bg3', name: 'Krvavé Šupiny', url: '/cards/dragon_scales_vibrant.png' },
    { id: 'bg4', name: 'Zlaté Šupiny', url: '/cards/dragon_scales_realistic_2.png' },
    { id: 'bg8', name: 'Tajemný Vzor', url: '/cards/card_back_pattern.png' },
    { id: 'bg9', name: 'Noční Obloha', url: '/cards/neutral_back_stars.png' },
    { id: 'bg12', name: 'Zrzavý Kocour', url: '/cards/cat_fur_orange.png' },
    { id: 'bg13', name: 'Stříbrná Srst', url: '/cards/cat_fur_silver.png' },
    { id: 'bg_geo_blue', name: 'Modré Diamanty', url: '/cards/pexeso_back_blue_geo.png' },
    { id: 'bg_geo_red', name: 'Červené Vzory', url: '/cards/pexeso_back_red_geo.png' },
    { id: 'bg_linen', name: 'Klasické Plátno', url: '/cards/pexeso_back_linen.png' },
    { id: 'bg_stars', name: 'Hvězdná Noc', url: '/cards/pexeso_back_stars.png' }
];

const dimensions = [
    { id: 'klasicke', label: 'Klasické', desc: '50 × 50 mm', priceAdd: 0 },
    { id: 'velke', label: 'Velké', desc: '60 × 60 mm', priceAdd: 49 },
    { id: 'maxi', label: 'Maxi', desc: '80 × 80 mm', priceAdd: 99 }
];

type DeckSize = 16 | 32 | 64;

const cardStyles = [
    { label: 'Roztomilé', value: 'Roztomilé' },
    { label: 'Drsné', value: 'Drsné' },
    { label: 'Husté', value: 'Husté' },
    { label: 'Majestátní', value: 'Majestátní' },
    { label: 'Vtipné', value: 'Vtipné' },
    { label: 'Temné', value: 'Temné' },
    { label: 'Epické', value: 'Epické' },
    { label: 'Jiné', value: 'Jiné' }
];

interface UploadedPhoto {
    id: string;
    url: string;
}

const PexesoCreator: React.FC<PexesoCreatorProps> = ({ onAddToCart }) => {
    const [deckSize, setDeckSize] = useState<DeckSize>(32);
    const [selectedSize, setSelectedSize] = useState<typeof dimensions[0]>(dimensions[0]);
    const [photos, setPhotos] = useState<UploadedPhoto[]>([]);
    const [selectedBack, setSelectedBack] = useState<string>(backgrounds[0].url);
    const [leaveDesignToUs, setLeaveDesignToUs] = useState(false);
    const [customThemeDesc, setCustomThemeDesc] = useState('');
    const [customThemeStyle, setCustomThemeStyle] = useState(cardStyles[0].value);

    // Calculate required pairs based on deck size
    const requiredPairs = deckSize / 2;

    const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            if (photos.length >= requiredPairs) {
                alert(`Už máte nahráno všech ${requiredPairs} potřebných fotografií.`);
                return;
            }
            const file = e.target.files[0];
            const reader = new FileReader();
            reader.onload = (event) => {
                if (event.target?.result && typeof event.target.result === 'string') {
                    setPhotos(prev => [...prev, {
                        id: Math.random().toString(36).substr(2, 9),
                        url: event.target!.result as string
                    }]);
                }
            };
            reader.readAsDataURL(file);
        }
    };

    const removePhoto = (idToRemove: string) => {
        setPhotos(prev => prev.filter(p => p.id !== idToRemove));
    };

    const handleAddToCart = () => {
        if (!leaveDesignToUs && photos.length < requiredPairs) {
            alert(`Prosím nahrajte ještě ${requiredPairs - photos.length} fotografií pro dokončení pexesa.`);
            return;
        }

        if (leaveDesignToUs && customThemeDesc.trim() === '') {
            alert('Prosím, popište nám krátce, z jakého světa nebo stylu chcete pexeso vymyslet a vytvořit.');
            return;
        }

        if (onAddToCart) {
            const basePrice = deckSize === 16 ? 249 : deckSize === 32 ? 399 : 599;
            const finalPrice = basePrice + selectedSize.priceAdd;
            let desc = leaveDesignToUs ? `Ilustrace na přání (${customThemeStyle}): ${customThemeDesc}` : 'Unikátní pexeso vytvořené z vašich vlastních fotografií.';
            onAddToCart({
                id: `pexeso-custom-${Date.now()}`,
                name: `Vlastní pexeso (${deckSize} karet) ${leaveDesignToUs ? '- Ilustrovaný design' : ''}`,
                description: desc,
                price: finalPrice,
                image: leaveDesignToUs ? '/cards/magic_runes_1.png' : (photos[0]?.url || '/cards/placeholder.png'),
                themeColor: '#eab308',
                size: `${selectedSize.label} (${selectedSize.desc})`
            });
            alert('Vaše unikátní Pexeso bylo přidáno do košíku!');
        }
    };

    // Generate empty slots for visual representation
    const emptySlots = Array.from({ length: Math.max(0, requiredPairs - photos.length) });

    return (
        <section id="creator" className="pexeso-creator-section container">
            <div className="section-header">
                <span className="badge mb-4">Interaktivní editor</span>
                <h2 className="section-title">Vytvořte si <span className="text-gradient-gold">vlastní pexeso</span></h2>
                <p className="text-center text-secondary max-w-2xl mt-4">
                    Tři jednoduché kroky k dokonalému dárku. Vyberte velikost, nahrajte své oblíbené fotografie a zvolte luxusní zadní stranu.
                </p>
            </div>

            <div className="pexeso-config-panel">

                {/* Step 1: Size */}
                <div className="config-step">
                    <div className="step-header">
                        <div className="step-number">1</div>
                        <h3 className="step-title">Vyberte velikost pexesa</h3>
                    </div>
                    <div className="size-options">
                        <div
                            className={`size-option-card ${deckSize === 16 ? 'active' : ''}`}
                            onClick={() => { setDeckSize(16); setPhotos([]); }}
                        >
                            <div className="size-icon"><Layers size={24} /></div>
                            <div className="size-title">16 Karet</div>
                            <div className="size-desc">8 unikátních fofografií<br />Ideální pro nejmenší</div>
                            <div className="size-price">249 Kč</div>
                        </div>
                        <div
                            className={`size-option-card ${deckSize === 32 ? 'active' : ''}`}
                            onClick={() => { setDeckSize(32); setPhotos([]); }}
                        >
                            <div className="size-badge">Nejpopulárnější</div>
                            <div className="size-icon"><LayoutGrid size={24} /></div>
                            <div className="size-title">32 Karet</div>
                            <div className="size-desc">16 unikátních fofografií<br />Zlatý standard</div>
                            <div className="size-price">399 Kč</div>
                        </div>
                        <div
                            className={`size-option-card ${deckSize === 64 ? 'active' : ''}`}
                            onClick={() => { setDeckSize(64); setPhotos([]); }}
                        >
                            <div className="size-icon"><Diamond size={24} /></div>
                            <div className="size-title">64 Karet</div>
                            <div className="size-desc">32 unikátních fofografií<br />Pro opravdové mistry paměti</div>
                            <div className="size-price">599 Kč</div>
                        </div>
                    </div>

                    <h4 style={{ fontSize: '1.2rem', fontWeight: 800, marginTop: '35px', marginBottom: '15px', color: '#1a1a1a' }}>Fyzický rozměr karet</h4>
                    <div className="size-options">
                        {dimensions.map((dim) => (
                            <div
                                key={dim.id}
                                className={`size-option-card ${selectedSize.id === dim.id ? 'active' : ''}`}
                                onClick={() => setSelectedSize(dim)}
                                style={{ padding: '16px' }}
                            >
                                <div className="size-title" style={{ fontSize: '1.2rem', marginBottom: '4px' }}>{dim.label}</div>
                                <div className="size-desc" style={{ marginBottom: '8px' }}>{dim.desc}</div>
                                <div className="size-price" style={{ fontSize: '1rem', color: dim.priceAdd > 0 ? 'var(--accent-gold)' : '#666' }}>
                                    {dim.priceAdd > 0 ? `+${dim.priceAdd} Kč` : 'V ceně základní sady'}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Step 2: Source of Images */}
                <div className="config-step">
                    <div className="step-header">
                        <div className="step-number">2</div>
                        <h3 className="step-title">Způsob dodání fotografií</h3>
                    </div>

                    <div className="method-options">
                        <div
                            className={`method-card ${!leaveDesignToUs ? 'active' : ''}`}
                            onClick={() => setLeaveDesignToUs(false)}
                        >
                            <div className="method-icon-wrapper">
                                <Upload size={32} />
                            </div>
                            <h4>Nahrát vlastní fotky</h4>
                            <p>Vytvořte pexeso ze svých vlastních vzpomínek, rodinných fotek nebo mazlíčků.</p>
                        </div>

                        <div
                            className={`method-card ${leaveDesignToUs ? 'active' : ''}`}
                            onClick={() => setLeaveDesignToUs(true)}
                        >
                            <div className="method-icon-wrapper">
                                <Sparkles size={32} />
                            </div>
                            <h4>Nemám fotky, chci ilustrace na míru</h4>
                            <p>Zadejte téma a my pro vás vytvoříme prémiové ilustrované obrázky.</p>
                        </div>
                    </div>

                    {leaveDesignToUs ? (
                        <div className="ai-design-container">
                            <h4 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#1a1a1a', marginBottom: '20px' }}>Jaké by vaše pexeso mělo být?</h4>

                            <div style={{ marginBottom: '24px' }}>
                                <label style={{ display: 'block', color: '#555', fontWeight: 600, marginBottom: '12px', fontSize: '0.95rem' }}>Zvolte styl kresby / Vizuál</label>
                                <div className="style-pills">
                                    {cardStyles.map(s => (
                                        <div
                                            key={s.value}
                                            className={`style-pill ${customThemeStyle === s.value ? 'active' : ''}`}
                                            onClick={() => setCustomThemeStyle(s.value)}
                                        >
                                            {s.label}
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="form-group mb-0">
                                <label style={{ display: 'block', color: '#555', fontWeight: 600, marginBottom: '12px', fontSize: '0.95rem' }}>Detailní popis vaší vize</label>
                                <textarea
                                    className="ai-textarea"
                                    value={customThemeDesc}
                                    placeholder="Např. Vesmírné lodě a planety, pohádkové víly v kouzelném lese, nebo vtipně ilustrovaná zvířata na farmě..."
                                    onChange={(e) => setCustomThemeDesc(e.target.value)}
                                    rows={4}
                                />
                            </div>
                        </div>
                    ) : (
                        <div className="upload-container">
                            <div className="upload-header">
                                <h4 className="upload-title">Nahrajte fotografie</h4>
                                <div className="upload-counter">
                                    {photos.length} / {requiredPairs}
                                </div>
                            </div>

                            <div className="upload-grid">
                                {/* Render uploaded photos */}
                                {photos.map(photo => (
                                    <div key={photo.id} className="upload-slot filled" onClick={() => removePhoto(photo.id)}>
                                        <img src={photo.url} alt="Uploaded" className="slot-image" />
                                        <div className="slot-delete-overlay">Odstranit</div>
                                    </div>
                                ))}

                                {/* Render remaining empty upload slots */}
                                {emptySlots.map((_, index) => (
                                    <label key={`empty-${index}`} className="upload-slot">
                                        <Plus size={24} style={{ color: 'var(--text-secondary)', marginBottom: '8px' }} />
                                        <span className="slot-placeholder">Přidat fotku</span>
                                        <input
                                            type="file"
                                            accept="image/*"
                                            style={{ display: 'none' }}
                                            onChange={handlePhotoUpload}
                                        />
                                    </label>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Step 3: Back Design */}
                <div className="config-step">
                    <div className="step-header">
                        <div className="step-number">3</div>
                        <h3 className="step-title">Zvolte zadní stranu karet</h3>
                    </div>
                    <div className="back-options">
                        {backgrounds.map((bg) => (
                            <div
                                key={bg.id}
                                className={`back-option ${selectedBack === bg.url ? 'active' : ''}`}
                                style={{ backgroundImage: `url('${bg.url}')` }}
                                onClick={() => setSelectedBack(bg.url)}
                                title={bg.name}
                            >
                                {selectedBack === bg.url && (
                                    <div className="back-active-check">
                                        <CheckCircle size={20} />
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

            </div>

            <div className="creator-actions" style={{ display: 'flex', justifyContent: 'center', marginTop: '2rem' }}>
                <button
                    className={`btn-primary btn-shine ${!leaveDesignToUs && photos.length < requiredPairs ? 'disabled' : ''}`}
                    style={{ opacity: (!leaveDesignToUs && photos.length < requiredPairs) ? 0.5 : 1, cursor: (!leaveDesignToUs && photos.length < requiredPairs) ? 'not-allowed' : 'pointer', fontSize: '1.1rem', padding: '16px 32px' }}
                    onClick={handleAddToCart}
                >
                    <span style={{ position: 'relative', zIndex: 2 }}>Přidat do košíku ({(deckSize === 16 ? 249 : deckSize === 32 ? 399 : 599) + selectedSize.priceAdd} Kč)</span>
                    <div style={{ position: 'absolute', top: 0, left: '-100%', width: '50%', height: '100%', background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.6), transparent)', transform: 'skewX(-20deg)', animation: 'btnShine 3s infinite', zIndex: 1 }}></div>
                </button>
            </div>
        </section>
    );
};

export default PexesoCreator;
