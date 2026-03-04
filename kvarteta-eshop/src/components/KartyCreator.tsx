import React, { useState } from 'react';
import { CheckCircle, Sparkles, LayoutGrid } from 'lucide-react';
import './KartyCreator.css';

interface KartyCreatorProps {
    onAddToCart?: (item: any) => void;
}

type PlayMode = 'classic' | 'thematic';

const backgrounds = [
    { id: 'bg1', name: 'Zelené šupiny', url: '/cards/dragon_scales_realistic_1.webp' },
    { id: 'bg2', name: 'Kovový drak', url: '/cards/dragon_scales_metallic.webp' },
    { id: 'bg3', name: 'Krvavé šupiny', url: '/cards/dragon_scales_vibrant.webp' },
    { id: 'bg4', name: 'Zlaté šupiny', url: '/cards/dragon_scales_realistic_2.webp' },
    { id: 'bg8', name: 'Tajemný vzor', url: '/cards/card_back_pattern.webp' },
    { id: 'bg9', name: 'Noční obloha', url: '/cards/neutral_back_stars.webp' },
    { id: 'bg12', name: 'Zrzavý kocour', url: '/cards/cat_fur_orange.webp' },
    { id: 'bg13', name: 'Stříbrná srst', url: '/cards/cat_fur_silver.webp' },
    { id: 'bg_geo_blue', name: 'Modré diamanty', url: '/cards/pexeso_back_blue_geo.webp' },
    { id: 'bg_geo_red', name: 'Červené vzory', url: '/cards/pexeso_back_red_geo.webp' },
    { id: 'bg_linen', name: 'Klasické plátno', url: '/cards/pexeso_back_linen.webp' },
    { id: 'bg_stars', name: 'Hvězdná noc', url: '/cards/pexeso_back_stars.webp' }
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

const themes = [
    { id: 'theme-prsi-drag', name: 'Epická dračí edice', url: '/cards/prsi/prsi_srdce_K.webp', color: '#ff0033', sampleValue: 'K', sampleSuit: '♥' },
    { id: 'theme-dino', name: 'Dinosauři', url: '/cards/dino_1.webp', color: '#ff8a00', sampleValue: 'A', sampleSuit: '🔔' },
    { id: 'theme-baby', name: 'Baby dráčci', url: '/cards/baby_1.webp', color: '#a100ff', sampleValue: 'J', sampleSuit: '🍃' },
    { id: 'theme-cats', name: 'Bojovné kočky', url: '/cards/cat_1.webp', color: '#00d2ff', sampleValue: 'Q', sampleSuit: '🌰' }
];

const KartyCreator: React.FC<KartyCreatorProps> = ({ onAddToCart }) => {
    const [playMode, setPlayMode] = useState<PlayMode>('classic');
    const [selectedBack, setSelectedBack] = useState<string>(backgrounds[0].url);
    const [selectedTheme, setSelectedTheme] = useState<string>(themes[0].id);
    const [leaveDesignToUs, setLeaveDesignToUs] = useState(false);
    const [customThemeDesc, setCustomThemeDesc] = useState('');
    const [customThemeStyle, setCustomThemeStyle] = useState(cardStyles[0].value);

    const getPrice = () => {
        let basePrice = 349;
        if (playMode === 'thematic') {
            basePrice += 150; // Extra charge for fully thematic custom fronts
        }
        return basePrice;
    };

    const handleAddToCart = () => {
        const themeRef = themes.find(t => t.id === selectedTheme);
        const nameSuffix = 'Vyšší bere (20)';

        let productName, productDesc, productImage, themeColor;

        if (playMode === 'classic') {
            productName = `Klasické Karty - ${nameSuffix}`;
            productDesc = 'Standardní lícové figury (Srdce, Piky atd.) s luxusním grafickým rubem.';
            productImage = selectedBack;
            themeColor = '#eab308';
        } else {
            if (leaveDesignToUs) {
                productName = `Plně Tematické Karty (AI na přání) - ${nameSuffix}`;
                productDesc = `Zadání klienta (${customThemeStyle}): ${customThemeDesc}`;
                productImage = '/cards/magic_runes_1.webp'; // placeholder
                themeColor = '#a100ff';
            } else {
                productName = `Tematické Karty - ${themeRef?.name} - ${nameSuffix}`;
                productDesc = 'Plně tematická sada. Každá karta je unikátně ilustrována, při zachování klasických herních hodnot.';
                productImage = themeRef?.url;
                themeColor = themeRef?.color;
            }
        }

        if (onAddToCart) {
            onAddToCart({
                id: `hraci-karty-custom-${Date.now()}`,
                name: productName,
                description: productDesc,
                price: getPrice(),
                image: productImage || backgrounds[0].url,
                themeColor: themeColor
            });
            alert('Váš vlastní balíček byl přidán do košíku!');
        }
    };

    return (
        <section id="creator" className="karty-creator-section container">
            <div className="section-header">
                <span className="badge mb-4">Interaktivní editor</span>
                <h2 className="section-title">Sestavte si <span className="text-gradient-gold">komplet</span></h2>
                <p className="text-center text-secondary max-w-2xl mt-4">
                    Vyberte si režim hry. Preferujete čistou klasiku se speciální zadní stranou, nebo chcete plnou fantazii a objevovat unikátní malby i zepředu?
                </p>
            </div>

            <div className="karty-config-panel">

                {/* Step 1: Mode Selection */}
                <div className="k-config-step">
                    <div className="k-step-header">
                        <div className="k-step-number">1</div>
                        <h3 className="k-step-title">Vizáž lícových karet</h3>
                    </div>
                    <div className="k-type-options">
                        <div
                            className={`k-type-card ${playMode === 'classic' ? 'active' : ''}`}
                            onClick={() => setPlayMode('classic')}
                        >
                            <div className="k-type-icon"><LayoutGrid size={40} className="text-gray-400" /></div>
                            <div className="k-type-title">Tradiční Klasika</div>
                            <div className="k-type-desc">Klasické "Hospodské" či "Casinové" symboly pro maximální přehlednost. Přizpůsobíte si pouze ohromující rub karet.</div>
                        </div>
                        <div
                            className={`k-type-card ${playMode === 'thematic' ? 'active' : ''}`}
                            style={playMode === 'thematic' ? { borderColor: 'var(--gold-primary)', boxShadow: '0 0 20px rgba(234, 179, 8, 0.2)' } : {}}
                            onClick={() => setPlayMode('thematic')}
                        >
                            <div className="k-type-icon"><Sparkles size={40} style={{ color: 'var(--gold-primary)' }} /></div>
                            <div className="k-type-title" style={{ color: 'var(--gold-primary)' }}>Plně Tematické (+ 150 Kč)</div>
                            <div className="k-type-desc">Zcela vymyšlené obrázky přední strany, např. Dinosauři. "Eso v srdcích" bude krásný obraz, avšak zachová rohové indexy pro hru.</div>
                        </div>
                    </div>
                </div>

                {/* Step 2: Specific Design Choice */}
                <div className="k-config-step mt-8">
                    <div className="k-step-header">
                        <div className="k-step-number">2</div>
                        <h3 className="k-step-title">{playMode === 'classic' ? 'Zvolte si rub balíčku' : 'Zvolte si téma balíčku'}</h3>
                    </div>

                    {playMode === 'classic' ? (
                        <>
                            <div className="k-mode-intro animate-fade-in-up">
                                <p>
                                    Prohlédněte si dostupné <strong>luxusní zadní strany karet</strong>. Na přední straně najdete námi pečlivě zpracovanou mariášovou nebo pokerovou klasiku v mimořádně elegantním střihu.
                                </p>
                            </div>
                            <div className="k-back-options">
                                {backgrounds.map((bg) => (
                                    <div
                                        key={bg.id}
                                        className={`k-back-option ${selectedBack === bg.url ? 'active' : ''}`}
                                        style={{ backgroundImage: `url('${bg.url}')` }}
                                        onClick={() => setSelectedBack(bg.url)}
                                        title={bg.name}
                                    >
                                        {selectedBack === bg.url && (
                                            <div className="k-back-check"><CheckCircle size={16} /></div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </>
                    ) : (
                        <>
                            <div className="k-mode-intro animate-fade-in-up">
                                <p>
                                    Vyberte <strong>plně tematický svět</strong>, do kterého chcete nahlédnout. Každá karta ve vaší sadě ponese unikátní profesionální ilustraci z daného tématu, včetně čitelných hracích indexů v rozích.
                                </p>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px', marginTop: '20px' }}>
                                <div
                                    onClick={() => setLeaveDesignToUs(false)}
                                    style={{
                                        cursor: 'pointer',
                                        padding: '24px',
                                        borderRadius: '16px',
                                        border: !leaveDesignToUs ? '2px solid var(--gold-primary)' : '1px solid var(--glass-border)',
                                        background: !leaveDesignToUs ? 'rgba(234, 179, 8, 0.05)' : 'var(--glass-bg)',
                                        transition: 'all 0.3s',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        alignItems: 'center',
                                        textAlign: 'center',
                                        boxShadow: !leaveDesignToUs ? '0 4px 15px rgba(234, 179, 8, 0.1)' : 'none'
                                    }}
                                >
                                    <div style={{ padding: '16px', background: !leaveDesignToUs ? 'var(--gold-primary)' : 'rgba(234, 179, 8, 0.1)', borderRadius: '50%', marginBottom: '16px', color: !leaveDesignToUs ? '#000' : 'var(--gold-primary)' }}>
                                        <LayoutGrid size={32} />
                                    </div>
                                    <h4 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '8px', color: 'var(--text-primary)' }}>Vybrat z naší nabídky</h4>
                                    <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Zvolte si jedno z našich vyladěných témat s unikátními ilustracemi.</p>
                                </div>

                                <div
                                    onClick={() => setLeaveDesignToUs(true)}
                                    style={{
                                        cursor: 'pointer',
                                        padding: '24px',
                                        borderRadius: '16px',
                                        border: leaveDesignToUs ? '2px solid var(--gold-primary)' : '1px solid var(--glass-border)',
                                        background: leaveDesignToUs ? 'rgba(234, 179, 8, 0.05)' : 'var(--glass-bg)',
                                        transition: 'all 0.3s',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        alignItems: 'center',
                                        textAlign: 'center',
                                        boxShadow: leaveDesignToUs ? '0 4px 15px rgba(234, 179, 8, 0.1)' : 'none'
                                    }}
                                >
                                    <div style={{ padding: '16px', background: leaveDesignToUs ? 'var(--gold-primary)' : 'rgba(234, 179, 8, 0.1)', borderRadius: '50%', marginBottom: '16px', color: leaveDesignToUs ? '#000' : 'var(--gold-primary)' }}>
                                        <Sparkles size={32} />
                                    </div>
                                    <h4 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '8px', color: 'var(--text-primary)' }}>Vygenerovat téma na přání (AI)</h4>
                                    <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Máte unikátní vizi? Naše AI vytvoří téma přesně podle vašeho zadání.</p>
                                </div>
                            </div>

                            {leaveDesignToUs ? (
                                <div className="form-section theme-gold" style={{ border: '1px solid var(--gold-primary)' }}>
                                    <h4 className="form-section-title">Jaké téma si představujete?</h4>

                                    <div className="form-group" style={{ marginBottom: '20px' }}>
                                        <label style={{ display: 'block', color: 'var(--text-primary)', fontWeight: 600, marginBottom: '12px', fontSize: '0.95rem' }}>Styl kresby / Vizuál</label>
                                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                                            {cardStyles.map(s => (
                                                <button
                                                    key={s.value}
                                                    type="button"
                                                    onClick={(e) => { e.preventDefault(); setCustomThemeStyle(s.value); }}
                                                    style={{
                                                        padding: '8px 16px',
                                                        borderRadius: '20px',
                                                        cursor: 'pointer',
                                                        fontSize: '0.9rem',
                                                        fontWeight: 600,
                                                        transition: 'all 0.2s',
                                                        border: customThemeStyle === s.value ? '2px solid var(--accent-gold)' : '1px solid var(--glass-border)',
                                                        background: customThemeStyle === s.value ? 'rgba(212, 175, 55, 0.15)' : 'var(--glass-bg)',
                                                        color: customThemeStyle === s.value ? 'var(--accent-gold)' : 'var(--text-secondary)'
                                                    }}
                                                >
                                                    {s.label}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="form-group mb-0">
                                        <label>Popište styl, postavy, prostředí nebo celkovou vizi (např. Sci-fi kyberpunková města, roztomilá zvířata v lese...)</label>
                                        <textarea
                                            value={customThemeDesc}
                                            placeholder="Napište nám, jaké jsou vaše představy, a my vygenerujeme plně tematický balíček na mírů..."
                                            onChange={(e) => setCustomThemeDesc(e.target.value)}
                                            rows={4}
                                            style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid var(--glass-border)', background: 'var(--glass-bg)', color: 'var(--text-primary)', resize: 'vertical' }}
                                        />
                                    </div>
                                </div>
                            ) : (
                                <div className="k-themes-grid">
                                    {themes.map((theme) => (
                                        <div
                                            key={theme.id}
                                            className={`k-theme-option ${selectedTheme === theme.id ? 'active' : ''}`}
                                            onClick={() => setSelectedTheme(theme.id)}
                                        >
                                            <div className="k-theme-preview-card">
                                                <img src={theme.url} alt={theme.name} className="k-theme-preview-img" />
                                            </div>
                                            <div className="k-theme-label-panel">
                                                <span className="k-theme-label-text">{theme.name}</span>
                                            </div>
                                            {selectedTheme === theme.id && (
                                                <div className="k-theme-check"><CheckCircle size={20} fill="#000" /></div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </>
                    )}
                </div>

            </div>

            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: '2rem' }}>
                <div style={{ fontSize: '1.2rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
                    Celková cena: <strong style={{ fontSize: '2rem', color: 'var(--gold-primary)' }}>{getPrice()} Kč</strong>
                </div>
                <button
                    className="btn-primary btn-shine"
                    style={{
                        padding: '15px 40px',
                        fontSize: '1.2rem'
                    }}
                    onClick={handleAddToCart}
                >
                    <span style={{ position: 'relative', zIndex: 2 }}>Závazně objednat balíček</span>
                    <div style={{ position: 'absolute', top: 0, left: '-100%', width: '50%', height: '100%', background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.6), transparent)', transform: 'skewX(-20deg)', animation: 'btnShine 3s infinite', zIndex: 1 }}></div>
                </button>
            </div>
        </section>
    );
};

export default KartyCreator;
