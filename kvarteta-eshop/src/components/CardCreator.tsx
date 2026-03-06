import React, { useState } from 'react';
import { Upload, Sparkles } from 'lucide-react';
import './CardCreator.css';

const backgrounds = [
    '/cards/neutral_back_ruby_formatted.png',
    '/cards/knight_back_iron_steel.webp',
    '/cards/knight_back_crest.webp',
    '/cards/knight_back_gate.webp',
    '/cards/knight_back_pattern.webp',
    '/cards/dragon_scales_realistic_1.webp',
    '/cards/dragon_scales_metallic.webp',
    '/cards/dragon_scales_vibrant.webp',
    '/cards/dragon_scales_realistic_2.webp',
    '/cards/card_back_pattern.webp',
    '/cards/neutral_back_stars.webp',
    '/cards/cat_fur_orange.webp',
    '/cards/cat_fur_silver.webp',
    '/cards/cat_fur_calico.webp',
    '/cards/pexeso_back_blue_geo.webp',
    '/cards/pexeso_back_red_geo.webp',
    '/cards/pexeso_back_linen.webp',
    '/cards/pexeso_back_stars.webp',
    '/cards/dragon_scales_seamless.webp',
    '/cards/neutral_back_gradient.webp'
];

const frontImages = [
    '/cards/baby_1.webp', '/cards/baby_2.webp', '/cards/baby_7.webp',
    '/cards/dino_1.webp', '/cards/dino_2.webp', '/cards/dino_5.webp',
    '/cards/drag_3.webp', '/cards/drag_8.webp',
    '/cards/cat_4.webp', '/cards/cat_7.webp'
];

const fontFamilies = [
    { label: 'Cinzel (Filmové, Elegantní)', value: "'Cinzel', serif" },
    { label: 'Outfit (Moderní, Čisté)', value: "'Outfit', sans-serif" },
    { label: 'Roboto (Klasické)', value: "'Roboto', sans-serif" },
    { label: 'Playfair Display (Knižní)', value: "'Playfair Display', serif" },
    { label: 'Bangers (Komiksové)', value: "'Bangers', cursive" },
    { label: 'Nevím', value: "unknown" }
];



const statShapes = [
    { label: 'Šestiúhelník (Zlatý)', value: 'hexagon' },
    { label: 'Kruh (Magický)', value: 'circle' },
    { label: 'Štít (Bojový)', value: 'shield' },
    { label: 'Kosočtverec (Přírodní)', value: 'diamond' },
    { label: 'Hvězda (Legendární)', value: 'star' },
    { label: 'Kapka (Vodní)', value: 'tear' },
    { label: 'Osmiúhelník (Temný)', value: 'octagon' },
    { label: 'Pergamen (Historický)', value: 'scroll' },
    { label: 'Krystal (Ledový)', value: 'gem' },
    { label: 'Jiné', value: "other" },
    { label: 'Nevím', value: "unknown" }
];

const statLayouts = [
    { label: 'V rozích (Klasika)', value: 'corners' },
    { label: 'Pod sebou - Levá strana', value: 'left' },
    { label: 'Pod sebou - Pravá strana', value: 'right' },
    { label: 'Vedle sebe - Dole', value: 'bottom' },
    { label: 'Jiné', value: "other" },
    { label: 'Nevím', value: "unknown" }
];

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

interface CardCreatorProps {
    onAddToCart?: (item: any) => void;
}

const CardCreator: React.FC<CardCreatorProps> = ({ onAddToCart }) => {
    const [letDesignOnUs, setLetDesignOnUs] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isModalCardFlipped, setIsModalCardFlipped] = useState(false);
    const [useCustomPhotos, setUseCustomPhotos] = useState(false);
    const [hideStats, setHideStats] = useState(false);
    const [customPhotos, setCustomPhotos] = useState<Record<string, string>>({});
    const [customStats, setCustomStats] = useState<Record<string, string[]>>({});
    const [customCardNames, setCustomCardNames] = useState<Record<string, string>>({});
    const [customDescriptions, setCustomDescriptions] = useState<Record<string, string>>({});
    const [customStatLayouts, setCustomStatLayouts] = useState<Record<string, string>>({});
    const [previewSlot, setPreviewSlot] = useState<string>('1A');
    const [wantsCustomBack, setWantsCustomBack] = useState(false);

    const kvartetoSlots = Array.from({ length: 8 }, (_, i) =>
        ['A', 'B', 'C', 'D'].map(letter => `${i + 1}${letter}`)
    ).flat();

    const [cardData, setCardData] = useState({
        idBadge: '1A',
        groupName: 'MOJE KVARTETO',
        description: '',
        style: 'Roztomilé',
        note: '',
        customThemeDescription: '',
        frontImage: frontImages[0],
        bgImage: backgrounds[0],
        fontFamily: fontFamilies[0].value,
        statShape: 'hexagon',
        statLayout: 'corners',
        stats: [
            { label: 'SÍLA', value: '100' },
            { label: 'RYCHLOST (km/h)', value: '45' },
            { label: 'VÁHA (kg)', value: '250' },
            { label: 'VĚK (let)', value: '99' }
        ]
    });

    const handleStatChange = (index: number, field: 'label' | 'value', val: string) => {
        const newStats = [...cardData.stats];
        newStats[index][field] = val;
        setCardData({ ...cardData, stats: newStats });
    };



    const getMainTextColor = (badge: string) => {
        const match = badge.match(/[A-Za-z0-9]/);
        if (!match) return '#d4af37'; // gold fallback
        const char = match[0].toUpperCase();
        switch (char) {
            case 'A': case '1': return '#ff4444'; // Red
            case 'B': case '2': return '#33b5e5'; // Blue
            case 'C': case '3': return '#00C851'; // Green
            case 'D': case '4': return '#ffbb33'; // Yellow
            case 'E': case '5': return '#a100ff'; // Purple
            case 'F': case '6': return '#ff8800'; // Orange
            case 'G': case '7': return '#00d2ff'; // Cyan
            case 'H': case '8': return '#ff66b2'; // Pink
            case '9': return '#d4af37'; // Gold
            default: return '#d4af37';
        }
    };

    const mainTextColor = getMainTextColor(useCustomPhotos ? previewSlot : cardData.idBadge);
    const safeFontFamily = ['other', 'unknown'].includes(cardData.fontFamily) ? "'Outfit', sans-serif" : cardData.fontFamily;

    const renderCardPreview = (isBack: boolean, extraWrapperStyles: any = {}, isMini: boolean = false) => {
        if (isBack) {
            return (
                <div className={`live-card-wrapper back-card-preview`} style={{ '--theme-color': mainTextColor, fontFamily: safeFontFamily, ...extraWrapperStyles } as any}>
                    <div className="live-card" style={isMini ? { width: '100%', height: '100%' } : {}}>
                        <img src={cardData.bgImage} className="card-image-main" style={{ filter: 'none', ...(isMini ? { width: '100%', height: '100%', objectFit: 'cover', borderRadius: '16px' } : {}) }} alt="back design" />
                    </div>
                </div>
            );
        }

        const layout = useCustomPhotos ? (customStatLayouts[previewSlot] || cardData.statLayout) : cardData.statLayout;
        const bgImage = useCustomPhotos && customPhotos[previewSlot] ? customPhotos[previewSlot] : cardData.frontImage;
        const idText = useCustomPhotos ? previewSlot : cardData.idBadge;
        const titleText = useCustomPhotos ? (customCardNames[previewSlot] || 'NÁZEV KARTY') : 'NÁZEV KARTY';

        return (
            <div className="live-card-wrapper" style={{ '--theme-color': mainTextColor, fontFamily: safeFontFamily, ...extraWrapperStyles } as any}>
                <div className={`live-card ${isMini ? '' : 'front-card-preview'} has-layout-${layout}`} style={{ backgroundImage: `url('${bgImage}')`, backgroundSize: 'cover', backgroundPosition: 'center', border: 'none', overflow: 'hidden' }}>
                    <div className="card-overlay-bottom" style={{ boxShadow: 'inset 0 -130px 150px -20px rgba(0, 0, 0, 0.2)', zIndex: isMini ? 2 : undefined }}></div>

                    <div className={`card-id-badge ${layout === 'corners' ? '' : 'pos-tl'}`} style={{ background: '#f8f9fa', color: '#111', zIndex: isMini ? 15 : undefined }}>
                        {idText}
                    </div>

                    {!hideStats && layout !== 'corners' && (
                        <div className="card-header-info" style={{ zIndex: isMini ? 10 : undefined }}>
                            <h1 className="card-hero-name" style={{ color: mainTextColor, fontFamily: safeFontFamily }}>
                                {titleText}
                            </h1>
                        </div>
                    )}

                    {/* Hexagons */}
                    {!hideStats && (
                        <div className={`stats-layout-wrapper layout-${layout}`} style={{ zIndex: isMini ? 10 : undefined }}>
                            {[0, 1, 2, 3].map(i => (
                                <div key={i} className={`card-hex pos-${['tl', 'tr', 'bl', 'br'][i]} shape-${cardData.statShape}`}>
                                    <div className="card-hex-inner">
                                        <div className="card-stat-val">{useCustomPhotos ? (customStats[previewSlot]?.[i] ?? cardData.stats[i].value) : cardData.stats[i].value}</div>
                                        <div className="card-stat-lbl">{cardData.stats[i].label}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    <div className="card-footer-info" style={{ zIndex: isMini ? 10 : undefined }}>
                        {(!hideStats && layout === 'corners') && (
                            <h1 className="card-hero-name" style={{ color: mainTextColor, fontFamily: safeFontFamily }}>
                                {titleText}
                            </h1>
                        )}
                        {useCustomPhotos && customDescriptions[previewSlot] && (
                            <p className="card-hero-desc" style={{ fontFamily: safeFontFamily }}><i>{customDescriptions[previewSlot]}</i></p>
                        )}
                    </div>
                </div>
            </div>
        );
    };

    return (
        <section id="creator" className="creator-section container">
            <div className="section-header">
                <span className="badge mb-4">Interaktivní editor</span>
                <h2 className="section-title">Vytvoř si <span className="text-gradient-gold">vlastní kvarteto</span></h2>
                <p className="text-center text-secondary max-w-2xl mt-4">
                    Vyberte si pozadí, navrhněte statistiky a stvořte si vlastní kvarteto. Vaše představivost je jediným limitem.
                </p>
            </div>

            <div className="creator-grid">
                {/* FORM COLUMN */}
                <div className="creator-form glass-panel">
                    <h3 className="form-main-title">Hlavní způsob tvorby designu</h3>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px' }}>
                        <div
                            onClick={() => { setUseCustomPhotos(true); setLetDesignOnUs(false); }}
                            style={{
                                cursor: 'pointer',
                                padding: '24px',
                                borderRadius: '16px',
                                border: useCustomPhotos && !letDesignOnUs ? '2px solid var(--accent-gold)' : '1px solid var(--glass-border)',
                                background: useCustomPhotos && !letDesignOnUs ? 'rgba(212, 175, 55, 0.05)' : 'var(--glass-bg)',
                                transition: 'all 0.3s',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                textAlign: 'center',
                                boxShadow: useCustomPhotos && !letDesignOnUs ? '0 4px 15px rgba(212,175,55,0.1)' : 'none'
                            }}
                        >
                            <div style={{ padding: '16px', background: useCustomPhotos && !letDesignOnUs ? 'var(--accent-gold)' : 'rgba(212, 175, 55, 0.1)', borderRadius: '50%', marginBottom: '16px', color: useCustomPhotos && !letDesignOnUs ? '#fff' : 'var(--accent-gold)' }}>
                                <Upload size={32} />
                            </div>
                            <h4 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '8px', color: 'var(--text-primary)' }}>Nahrát vlastní fotky</h4>
                            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Nahrajete až 32 vlastních fotek a přiřadíte je ke konkrétním kartám.</p>
                        </div>

                        <div
                            onClick={() => { setLetDesignOnUs(true); setUseCustomPhotos(false); }}
                            style={{
                                cursor: 'pointer',
                                padding: '24px',
                                borderRadius: '16px',
                                border: letDesignOnUs ? '2px solid var(--accent-gold)' : '1px solid var(--glass-border)',
                                background: letDesignOnUs ? 'rgba(212, 175, 55, 0.05)' : 'var(--glass-bg)',
                                transition: 'all 0.3s',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                textAlign: 'center',
                                boxShadow: letDesignOnUs ? '0 4px 15px rgba(212,175,55,0.1)' : 'none'
                            }}
                        >
                            <div style={{ padding: '16px', background: letDesignOnUs ? 'var(--accent-gold)' : 'rgba(212, 175, 55, 0.1)', borderRadius: '50%', marginBottom: '16px', color: letDesignOnUs ? '#fff' : 'var(--accent-gold)' }}>
                                <Sparkles size={32} />
                            </div>
                            <h4 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '8px', color: 'var(--text-primary)' }}>Generovat design (AI)</h4>
                            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Profesionálně sladíme barvy a obrázky na přání pro dokonalý výsledek.</p>
                        </div>
                    </div>

                    {letDesignOnUs && (
                        <div className="form-section" style={{ borderColor: 'var(--accent-gold)' }}>
                            <div className="step-indicator" style={{ background: 'var(--accent-gold)' }}>*</div>
                            <h4 className="form-section-title">Jaké téma si představujete?</h4>
                            <div className="form-group mb-0">
                                <label>Téma, atmosféra, barvy, nebo z čeho karty tvoříme (např. rodinné fotky)</label>
                                <textarea
                                    value={cardData.customThemeDescription}
                                    placeholder="Napište nám, jaké jsou vaše představy, ať vám návrh ušijeme na míru..."
                                    onChange={(e) => setCardData({ ...cardData, customThemeDescription: e.target.value })}
                                    rows={3}
                                />
                            </div>
                        </div>
                    )}

                    {/* SECTION 1: Texty */}
                    <div className="form-section theme-cyan">
                        <div className="step-indicator">1</div>
                        <h4 className="form-section-title">Texty a popisky</h4>
                        <div className="form-row">
                            <div className="form-group" style={{ width: '25%' }}>
                                <label>Označení</label>
                                <input
                                    type="text"
                                    value={cardData.idBadge}
                                    maxLength={3}
                                    placeholder="1A"
                                    onChange={(e) => setCardData({ ...cardData, idBadge: e.target.value.toUpperCase() })}
                                />
                            </div>
                            <div className="form-group" style={{ width: '70%' }}>
                                <label>Název sady / podtitul (na kartě)</label>
                                <input
                                    type="text"
                                    value={cardData.groupName}
                                    placeholder="Např. Moje kvarteto"
                                    onChange={(e) => setCardData({ ...cardData, groupName: e.target.value })}
                                />
                            </div>
                        </div>

                        {!useCustomPhotos && (
                            <div className="form-row">
                                <div className="form-group half">
                                    <label>Styl kresby / Vizuál</label>
                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                                        {cardStyles.map(s => (
                                            <button
                                                key={s.value}
                                                type="button"
                                                onClick={(e) => { e.preventDefault(); setCardData({ ...cardData, style: s.value }); }}
                                                style={{
                                                    padding: '8px 16px',
                                                    borderRadius: '20px',
                                                    cursor: 'pointer',
                                                    fontSize: '0.9rem',
                                                    fontWeight: 600,
                                                    transition: 'all 0.2s',
                                                    border: cardData.style === s.value ? '2px solid var(--accent-gold)' : '1px solid var(--glass-border)',
                                                    background: cardData.style === s.value ? 'rgba(212, 175, 55, 0.15)' : 'var(--glass-bg)',
                                                    color: cardData.style === s.value ? 'var(--accent-gold)' : 'var(--text-secondary)'
                                                }}
                                            >
                                                {s.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <div className="form-group half">
                                    {/* Dříve zde byl globální popis karty */}
                                </div>
                            </div>
                        )}

                        {!useCustomPhotos && (
                            <div className="form-group mb-0">
                                <label>Poznámka</label>
                                <textarea
                                    value={cardData.note}
                                    placeholder="Máte nějaké speciální přání? Podělte se o něj a my se pokusíme Vám ho splnit."
                                    onChange={(e) => setCardData({ ...cardData, note: e.target.value })}
                                    rows={2}
                                />
                            </div>
                        )}
                    </div>

                    {/* SECTION 2: Vzhled */}
                    {!letDesignOnUs && (
                        <div className="form-section theme-magenta">
                            <div className="step-indicator">2</div>
                            <h4 className="form-section-title">Typografie a barvy</h4>
                            <div className="form-group">
                                <label>Styl písma (font)</label>
                                <select
                                    value={cardData.fontFamily}
                                    onChange={(e) => setCardData({ ...cardData, fontFamily: e.target.value })}
                                >
                                    {fontFamilies.map(f => <option key={f.value} value={f.value}>{f.label}</option>)}
                                </select>
                            </div>
                        </div>
                    )}

                    {/* SECTION 3: Statistiky */}
                    <div className="form-section theme-orange">
                        <div className="step-indicator">{letDesignOnUs ? '2' : '3'}</div>
                        <h4 className="form-section-title">Herní systém (statistiky)</h4>

                        <div className="mb-4" style={{ display: 'flex', alignItems: 'center', gap: '12px', background: 'rgba(255,255,255,0.5)', padding: '12px 16px', borderRadius: '8px' }}>
                            <input
                                type="checkbox"
                                id="hideStats"
                                checked={hideStats}
                                onChange={(e) => setHideStats(e.target.checked)}
                                style={{ width: '18px', height: '18px', cursor: 'pointer', accentColor: 'var(--accent-gold)' }}
                            />
                            <div>
                                <label htmlFor="hideStats" style={{ margin: 0, fontWeight: 700, cursor: 'pointer', color: 'var(--text-primary)', fontSize: '0.95rem', display: 'block' }}>
                                    Nechci mít na kvartetech vlastnosti
                                </label>
                                <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Zobrazí se pouze čisté obrázky bez čísel a tvarů</span>
                            </div>
                        </div>

                        {!hideStats && (
                            <>
                                {!letDesignOnUs && (
                                    <div className="form-row">
                                        <div className="form-group half">
                                            <label>Tvar vlastností</label>
                                            <select
                                                value={cardData.statShape}
                                                onChange={(e) => setCardData({ ...cardData, statShape: e.target.value })}
                                            >
                                                {statShapes.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                                            </select>
                                        </div>
                                        <div className="form-group half">
                                            <label>Rozložení vlastností</label>
                                            <select
                                                value={cardData.statLayout}
                                                onChange={(e) => setCardData({ ...cardData, statLayout: e.target.value })}
                                            >
                                                {statLayouts.map(l => <option key={l.value} value={l.value}>{l.label}</option>)}
                                            </select>
                                        </div>
                                    </div>
                                )}

                                {useCustomPhotos && (
                                    <div style={{ marginBottom: '1.5rem', padding: '1rem', background: 'rgba(212,175,55,0.05)', borderRadius: '12px', border: '1px solid rgba(212,175,55,0.2)' }}>
                                        <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
                                            <div style={{ fontWeight: 700, color: 'var(--accent-gold)', marginBottom: '0.2rem' }}>Upravujete hodnoty pro kartu: {previewSlot}</div>
                                            <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Názvy vlastností jsou společné pro celé kvarteto. Ostatní údaje se uloží přímo pro tuto konkrétní kartu.</div>
                                        </div>

                                        <div className="form-group">
                                            <label>Název karty</label>
                                            <input
                                                type="text"
                                                placeholder="Zadejte jméno nebo název"
                                                value={customCardNames[previewSlot] || ''}
                                                maxLength={30}
                                                onChange={(e) => setCustomCardNames(prev => ({ ...prev, [previewSlot]: e.target.value }))}
                                            />
                                        </div>

                                        <div className="form-group">
                                            <label>Popis karty</label>
                                            <textarea
                                                placeholder="Krátký popis specifičnosti této karty"
                                                value={customDescriptions[previewSlot] || ''}
                                                maxLength={150}
                                                rows={2}
                                                onChange={(e) => setCustomDescriptions(prev => ({ ...prev, [previewSlot]: e.target.value }))}
                                                style={{ fontSize: '0.9rem' }}
                                            />
                                            <div style={{ fontSize: '0.75rem', color: '#94a3b8', textAlign: 'right', marginTop: '4px' }}>
                                                Doporučujeme cca 80-120 znaků
                                            </div>
                                        </div>

                                        {!hideStats && !letDesignOnUs && (
                                            <div className="form-group mb-0">
                                                <label>Rozložení vlastností pro tuto kartu</label>
                                                <select
                                                    value={customStatLayouts[previewSlot] || cardData.statLayout}
                                                    onChange={(e) => setCustomStatLayouts(prev => ({ ...prev, [previewSlot]: e.target.value }))}
                                                >
                                                    {statLayouts.map(l => <option key={l.value} value={l.value}>{l.label}</option>)}
                                                </select>
                                                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '6px' }}>
                                                    Umožní přizpůsobit rozmístění statistik tak, aby nezakrývaly důležitou část fotografie.
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}
                                <div className={`stats-grid ${letDesignOnUs ? '' : 'mt-3'}`}>
                                    {cardData.stats.map((stat, i) => {
                                        const displayValue = useCustomPhotos ? (customStats[previewSlot]?.[i] ?? stat.value) : stat.value;
                                        return (
                                            <div key={i} className="form-group mb-0">
                                                <label>Vlastnost {i + 1}</label>
                                                <div className="stat-input-group">
                                                    <input
                                                        type="text"
                                                        placeholder="NÁZEV"
                                                        className="stat-label-input"
                                                        value={stat.label}
                                                        maxLength={10}
                                                        onChange={(e) => handleStatChange(i, 'label', e.target.value)}
                                                    />
                                                    <input
                                                        type="text"
                                                        placeholder="HODNOTA"
                                                        className="stat-val-input"
                                                        value={displayValue}
                                                        maxLength={5}
                                                        onChange={(e) => {
                                                            if (useCustomPhotos) {
                                                                setCustomStats(prev => {
                                                                    const slotStats = prev[previewSlot] ? [...prev[previewSlot]] : [cardData.stats[0].value, cardData.stats[1].value, cardData.stats[2].value, cardData.stats[3].value];
                                                                    slotStats[i] = e.target.value;
                                                                    return { ...prev, [previewSlot]: slotStats };
                                                                });
                                                            } else {
                                                                handleStatChange(i, 'value', e.target.value);
                                                            }
                                                        }}
                                                    />
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </>
                        )}
                    </div>

                    {/* SECTION 4: Obrázek Přední strany */}
                    {!letDesignOnUs && (
                        <div className="form-section theme-purple">
                            <div className="step-indicator">4</div>
                            <h4 className="form-section-title">Vzor přední strany</h4>
                            {!useCustomPhotos ? (
                                <>
                                    <div className="bg-picker-grid">
                                        {frontImages.map(img => (
                                            <div
                                                key={img}
                                                className={`bg-thumb ${cardData.frontImage === img ? 'active' : ''}`}
                                                style={{ backgroundImage: `url('${img}')` }}
                                                onClick={() => setCardData({ ...cardData, frontImage: img })}
                                            >
                                                {cardData.frontImage === img && <div className="bg-thumb-active-dot"></div>}
                                            </div>
                                        ))}
                                    </div>
                                </>
                            ) : (
                                <div style={{ marginTop: '1rem', background: 'rgba(255,255,255,0.6)', padding: '1.5rem', borderRadius: '12px', border: '1px solid rgba(212,175,55,0.3)' }}>
                                    <p style={{ fontSize: '0.9rem', color: '#64748b', marginBottom: '1rem', textAlign: 'center' }}>
                                        Nahrajte fotografie buď jednotlivě po kliknutí na konkrétní políčko, nebo všechny hromadně. Kliknutím na políčko se karta zobrazí v náhledu vpravo.
                                    </p>
                                    <div style={{ marginBottom: '1.5rem', textAlign: 'center' }}>
                                        <label className="btn-secondary" style={{ display: 'inline-block', cursor: 'pointer', fontSize: '0.95rem', padding: '0.8rem 1.5rem', margin: 0 }}>
                                            <input type="file" multiple accept="image/*" onChange={(e) => {
                                                if (e.target.files) {
                                                    const newPhotos = { ...customPhotos };
                                                    let fileIndex = 0;
                                                    const files = Array.from(e.target.files);

                                                    // Najít prázdná místa a zaplnit je
                                                    for (const slot of kvartetoSlots) {
                                                        if (!newPhotos[slot] && fileIndex < files.length) {
                                                            newPhotos[slot] = URL.createObjectURL(files[fileIndex]);
                                                            fileIndex++;
                                                        }
                                                    }

                                                    // Pokud stále zbývají soubory, přepisovat od začátku
                                                    if (fileIndex < files.length) {
                                                        for (const slot of kvartetoSlots) {
                                                            if (fileIndex < files.length) {
                                                                newPhotos[slot] = URL.createObjectURL(files[fileIndex]);
                                                                fileIndex++;
                                                            }
                                                        }
                                                    }

                                                    setCustomPhotos(newPhotos);
                                                }
                                            }} style={{ display: 'none' }} />
                                            Hromadné nahrání fotografií
                                        </label>
                                    </div>
                                    <div className="custom-photos-grid">
                                        {kvartetoSlots.map(slot => (
                                            <div
                                                key={slot}
                                                style={{
                                                    aspectRatio: '62/88',
                                                    borderRadius: '6px',
                                                    border: `2px solid ${previewSlot === slot ? 'var(--accent-gold)' : 'rgba(0,0,0,0.1)'}`,
                                                    position: 'relative',
                                                    overflow: 'hidden',
                                                    cursor: 'pointer',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    backgroundColor: customPhotos[slot] ? '#111' : 'rgba(0,0,0,0.02)',
                                                    backgroundImage: customPhotos[slot] ? `url(${customPhotos[slot]})` : 'none',
                                                    backgroundSize: 'contain',
                                                    backgroundRepeat: 'no-repeat',
                                                    backgroundPosition: 'center',
                                                    transition: 'border-color 0.2s'
                                                }}
                                                onClick={() => setPreviewSlot(slot)}
                                            >
                                                <div style={{ position: 'absolute', top: 0, left: 0, background: 'rgba(255,255,255,0.95)', padding: '2px 6px', fontSize: '0.75rem', fontWeight: 800, borderBottomRightRadius: '6px', color: '#111' }}>
                                                    {slot}
                                                </div>
                                                <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'flex-end', justifyContent: 'center', paddingBottom: '4px', opacity: 0, transition: 'opacity 0.2s', background: customPhotos[slot] ? 'rgba(0,0,0,0.4)' : 'none' }}
                                                    onMouseEnter={e => e.currentTarget.style.opacity = '1'}
                                                    onMouseLeave={e => e.currentTarget.style.opacity = '0'}
                                                >
                                                    <label style={{ cursor: 'pointer', background: 'white', color: '#111', fontSize: '10px', padding: '2px 8px', borderRadius: '10px', fontWeight: 'bold' }} onClick={e => e.stopPropagation()}>
                                                        {customPhotos[slot] ? 'Změnit' : 'Nahrát'}
                                                        <input type="file" accept="image/*" style={{ display: 'none' }} onChange={e => {
                                                            if (e.target.files && e.target.files[0]) {
                                                                setCustomPhotos(prev => ({ ...prev, [slot]: URL.createObjectURL(e.target.files![0]) }));
                                                                setPreviewSlot(slot);
                                                            }
                                                        }} />
                                                    </label>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* SECTION 5: Pozadí Zadní strany */}
                    <div className="form-section theme-emerald mb-0 border-b-0 pb-0">
                        <div className="step-indicator">{letDesignOnUs ? '4' : '5'}</div>
                        <h4 className="form-section-title">Vzor zadní strany</h4>

                        {letDesignOnUs && (
                            <div className="mb-4" style={{ display: 'flex', alignItems: 'center', gap: '12px', background: 'rgba(255,255,255,0.5)', padding: '12px 16px', borderRadius: '8px' }}>
                                <input
                                    type="checkbox"
                                    id="wantsCustomBack"
                                    checked={wantsCustomBack}
                                    onChange={(e) => setWantsCustomBack(e.target.checked)}
                                    style={{ width: '18px', height: '18px', cursor: 'pointer', accentColor: 'var(--accent-gold)' }}
                                />
                                <div>
                                    <label htmlFor="wantsCustomBack" style={{ margin: 0, fontWeight: 700, cursor: 'pointer', color: 'var(--text-primary)', fontSize: '0.95rem', display: 'block' }}>
                                        Chci si vybrat zadní stranu
                                    </label>
                                    <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Jinak zadní stranu sladíme s přední podle AI návrhu</span>
                                </div>
                            </div>
                        )}

                        {(!letDesignOnUs || wantsCustomBack) && (
                            <div className="bg-picker-grid">
                                {backgrounds.map(bg => (
                                    <div
                                        key={bg}
                                        className={`bg-thumb ${cardData.bgImage === bg ? 'active' : ''}`}
                                        style={{ backgroundImage: `url('${bg}')` }}
                                        onClick={() => setCardData({ ...cardData, bgImage: bg })}
                                    >
                                        {cardData.bgImage === bg && <div className="bg-thumb-active-dot"></div>}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="creator-submit-wrap" style={{ marginTop: '2rem', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
                        {useCustomPhotos && kvartetoSlots.filter(s => !customPhotos[s]).length > 0 && (
                            <div style={{ color: '#ef4444', fontWeight: 600, fontSize: '0.95rem', background: 'rgba(239, 68, 68, 0.05)', padding: '0.8rem 1.5rem', borderRadius: '8px', border: '1px solid rgba(239, 68, 68, 0.2)', display: 'inline-block' }}>
                                📸 Kvarteto nemůže být nekompletní. Nahrajte prosím ještě <strong>{kvartetoSlots.filter(s => !customPhotos[s]).length}</strong> fotografií.
                            </div>
                        )}
                        <button
                            className="btn-premium w-full"
                            disabled={useCustomPhotos && kvartetoSlots.filter(s => !customPhotos[s]).length > 0}
                            onClick={() => {
                                setIsModalCardFlipped(false);
                                setIsModalOpen(true);
                            }}
                            style={{
                                padding: '1.2rem',
                                fontSize: '1.2rem',
                                background: (useCustomPhotos && kvartetoSlots.filter(s => !customPhotos[s]).length > 0) ? '#e2e8f0' : 'linear-gradient(135deg, #d4af37 0%, #f9e596 50%, #d4af37 100%)',
                                color: (useCustomPhotos && kvartetoSlots.filter(s => !customPhotos[s]).length > 0) ? '#94a3b8' : '#111',
                                border: 'none',
                                borderRadius: '12px',
                                cursor: (useCustomPhotos && kvartetoSlots.filter(s => !customPhotos[s]).length > 0) ? 'not-allowed' : 'pointer',
                                fontWeight: 800,
                                textTransform: 'uppercase',
                                letterSpacing: '1px',
                                boxShadow: (useCustomPhotos && kvartetoSlots.filter(s => !customPhotos[s]).length > 0) ? 'none' : '0 10px 25px rgba(212, 175, 55, 0.4)',
                                transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                                position: 'relative',
                                overflow: 'hidden'
                            }}
                            onMouseEnter={(e) => {
                                if (!(useCustomPhotos && kvartetoSlots.filter(s => !customPhotos[s]).length > 0)) {
                                    e.currentTarget.style.transform = 'translateY(-2px) scale(1.02)';
                                    e.currentTarget.style.boxShadow = '0 15px 35px rgba(212, 175, 55, 0.6)';
                                }
                            }}
                            onMouseLeave={(e) => {
                                if (!(useCustomPhotos && kvartetoSlots.filter(s => !customPhotos[s]).length > 0)) {
                                    e.currentTarget.style.transform = 'none';
                                    e.currentTarget.style.boxShadow = '0 10px 25px rgba(212, 175, 55, 0.4)';
                                }
                            }}
                        >
                            <span style={{ position: 'relative', zIndex: 2 }}>Chci své jedinečné Kvarteto</span>
                            <div style={{ position: 'absolute', top: 0, left: '-100%', width: '50%', height: '100%', background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.6), transparent)', transform: 'skewX(-20deg)', animation: 'btnShine 3s infinite', zIndex: 1 }}></div>
                        </button>
                    </div>
                </div>

                <div className="creator-preview">
                    {/* Přední strana */}
                    {renderCardPreview(false)}

                    {/* Zadní strana */}
                    {renderCardPreview(true)}
                </div>
            </div>

            {/* RECAP MODAL */}
            {isModalOpen && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.85)', backdropFilter: 'blur(8px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }} onClick={() => setIsModalOpen(false)}>
                    <div
                        className="creator-modal-content glass-panel"
                        style={{
                            maxWidth: '900px', width: '100%',
                            background: 'rgba(255,255,255,0.95)', border: '1px solid rgba(212, 175, 55, 0.3)',
                            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 40px rgba(212, 175, 55, 0.1)',
                            borderRadius: '24px', padding: '0', display: 'flex', flexDirection: 'row',
                            overflow: 'hidden', animation: 'scaleUp 0.4s cubic-bezier(0.16, 1, 0.3, 1)'
                        }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Close button */}
                        <button
                            style={{ position: 'absolute', top: '1rem', right: '1.5rem', background: 'none', border: 'none', fontSize: '2rem', cursor: 'pointer', color: '#666', zIndex: 10 }}
                            onClick={() => setIsModalOpen(false)}
                        >
                            &times;
                        </button>

                        {/* Visual Recap (Left Side) */}
                        <div style={{ flex: '1', padding: '2.5rem', background: 'linear-gradient(135deg, rgba(212,175,55,0.05), transparent)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                            <div style={{ width: '80%', maxWidth: '280px', pointerEvents: 'none', marginBottom: '2rem', perspective: '1000px' }}>
                                <div style={{
                                    position: 'relative',
                                    width: '100%',
                                    transformStyle: 'preserve-3d',
                                    transition: 'transform 0.8s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                                    transform: isModalCardFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)'
                                }}>
                                    {/* Front Card Mini Preview */}
                                    <div style={{ backfaceVisibility: 'hidden', width: '100%' }}>
                                        {renderCardPreview(false, { margin: 0, boxShadow: '0 20px 40px rgba(0,0,0,0.3)' }, true)}
                                    </div>

                                    {/* Back Card Preview */}
                                    <div style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)', position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, width: '100%', height: '100%' }}>
                                        {renderCardPreview(true, { margin: 0, boxShadow: '0 20px 40px rgba(0,0,0,0.3)', width: '100%', height: '100%' }, true)}
                                    </div>
                                </div>
                            </div>

                            <button
                                onClick={() => setIsModalCardFlipped(!isModalCardFlipped)}
                                style={{
                                    background: 'transparent',
                                    color: '#64748b',
                                    border: '1px solid #cbd5e1',
                                    padding: '0.6rem 1.2rem',
                                    borderRadius: '50px',
                                    fontSize: '0.9rem',
                                    fontWeight: 600,
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.5rem',
                                    marginBottom: '1rem',
                                    transition: 'all 0.2s ease'
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.background = '#f1f5f9';
                                    e.currentTarget.style.color = '#334155';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.background = 'transparent';
                                    e.currentTarget.style.color = '#64748b';
                                }}
                            >
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2.5 2v6h6M21.5 22v-6h-6" /><path d="M22 11.5A10 10 0 0 0 3.2 7.2M2 12.5a10 10 0 0 0 18.8 4.2" /></svg>
                                {isModalCardFlipped ? 'Zobrazit přední stranu' : 'Zobrazit zadní stranu'}
                            </button>

                            <p style={{ textAlign: 'center', fontSize: '1.05rem', color: '#64748b', margin: 0, lineHeight: 1.5, fontStyle: 'italic', fontWeight: 500 }}>
                                Kvarteta na míru nikdy nenabízíme k sériovému prodeji. Díky tomu bude Vaše kvarteto navěky zcela jedinečné.
                            </p>
                        </div>

                        {/* Order Details (Right Side) */}
                        <div style={{ flex: '1.2', padding: '3rem 3rem 3rem 1rem', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                            <span style={{ color: '#d4af37', fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase', fontSize: '0.85rem' }}>Dokončení návrhu</span>
                            <h3 style={{ fontSize: '2.5rem', fontWeight: 800, color: '#334155', margin: '0.5rem 0 1.5rem 0', lineHeight: 1.1 }}>Rekapitulace kvarteta</h3>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
                                <div>
                                    <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '0.2rem' }}>Název sady</p>
                                    <p style={{ fontWeight: 600, color: '#334155', fontSize: '1.1rem' }}>{cardData.groupName}</p>
                                </div>
                                <div>
                                    <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '0.2rem' }}>Základní identifikátor</p>
                                    <p style={{ fontWeight: 600, color: '#334155', fontSize: '1.1rem' }}>Sada {cardData.idBadge}</p>
                                </div>
                                <div>
                                    <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '0.2rem' }}>Tvar / Rozložení vlastností</p>
                                    <p style={{ fontWeight: 600, color: '#334155', fontSize: '1.1rem', textTransform: 'capitalize' }}>
                                        {cardData.statShape} (
                                        {cardData.statLayout === 'corners' ? 'V rozích' : cardData.statLayout === 'left' ? 'Vlevo' : cardData.statLayout === 'right' ? 'Vpravo' : 'Dole'}
                                        )
                                    </p>
                                </div>
                                <div>
                                    <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '0.2rem' }}>Styl kresby</p>
                                    <p style={{ fontWeight: 600, color: '#334155', fontSize: '1.1rem' }}>{cardData.style}</p>
                                </div>
                            </div>

                            {cardData.note && (
                                <div style={{ marginBottom: '2.5rem' }}>
                                    <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '0.4rem' }}>Vaše poznámka</p>
                                    <p style={{ color: '#334155', fontSize: '0.95rem', fontStyle: 'italic', background: 'rgba(0,0,0,0.03)', padding: '0.8rem', borderRadius: '8px', borderLeft: '3px solid #cbd5e1', margin: 0 }}>
                                        "{cardData.note}"
                                    </p>
                                </div>
                            )}

                            <div style={{ background: '#f8fafc', padding: '1.5rem', borderRadius: '12px', border: '1px solid #e2e8f0', marginBottom: '2.5rem' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                                    <span style={{ color: '#334155', fontWeight: 500 }}>Vlastní sada 32 karet</span>
                                    <span style={{ fontWeight: 700, color: '#334155', fontSize: '1.2rem' }}>599 Kč</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <span style={{ color: '#64748b', fontSize: '0.9rem' }}>+ Exkluzivní tisk a balení</span>
                                    <span style={{ color: '#10b981', fontWeight: 600, fontSize: '0.9rem' }}>Zdarma</span>
                                </div>
                            </div>

                            <button
                                className="btn-premium w-full"
                                onClick={() => {
                                    if (onAddToCart) {
                                        onAddToCart({
                                            id: `custom-quartet-${Date.now()}`,
                                            name: `Unikátní kvarteto: ${cardData.groupName}`,
                                            price: 599,
                                            image: '', // Vlastní karty nemají v košíku přední ilustrační obrázek
                                            selectedBack: (letDesignOnUs && !wantsCustomBack) ? 'Dle AI návrhu' : cardData.bgImage,
                                            groupName: cardData.groupName,
                                            statShape: statShapes.find(s => s.value === cardData.statShape)?.label || cardData.statShape,
                                            statLayout: statLayouts.find(s => s.value === cardData.statLayout)?.label || cardData.statLayout,
                                            style: cardData.style,
                                            note: cardData.note,
                                            customPhotos: useCustomPhotos ? customPhotos : undefined,
                                            customStats: useCustomPhotos ? customStats : undefined,
                                            customCardNames: useCustomPhotos ? customCardNames : undefined,
                                            customDescriptions: useCustomPhotos ? customDescriptions : undefined,
                                            customStatLayouts: useCustomPhotos ? customStatLayouts : undefined,
                                            hideStats: hideStats
                                        });
                                    }
                                    setIsModalOpen(false);
                                }}
                                style={{
                                    padding: '1.2rem',
                                    fontSize: '1.2rem',
                                    background: 'linear-gradient(135deg, #d4af37 0%, #f9e596 50%, #d4af37 100%)',
                                    color: '#111',
                                    border: 'none',
                                    borderRadius: '12px',
                                    cursor: 'pointer',
                                    fontWeight: 800,
                                    textTransform: 'uppercase',
                                    letterSpacing: '1px',
                                    boxShadow: '0 10px 25px rgba(212, 175, 55, 0.4)',
                                    transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                                    position: 'relative',
                                    overflow: 'hidden'
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.transform = 'translateY(-2px) scale(1.02)';
                                    e.currentTarget.style.boxShadow = '0 15px 35px rgba(212, 175, 55, 0.6)';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.transform = 'none';
                                    e.currentTarget.style.boxShadow = '0 10px 25px rgba(212, 175, 55, 0.4)';
                                }}
                            >
                                <span style={{ position: 'relative', zIndex: 2, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem' }}>
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="21" r="1"></circle><circle cx="20" cy="21" r="1"></circle><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path></svg>
                                    Vložit do košíku
                                </span>
                                <div style={{ position: 'absolute', top: 0, left: '-100%', width: '50%', height: '100%', background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.6), transparent)', transform: 'skewX(-20deg)', animation: 'btnShine 3s infinite', zIndex: 1 }}></div>
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </section>
    );
};

export default CardCreator;
