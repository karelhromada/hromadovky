// ===== GENERATOR.JS (POKROČILÉ ROZVRŽENÍ SYMBOLŮ V2) ===== //

const SYMBOL_LAYOUTS = {
    '7': [
        { x: 20, y: 18 }, { x: 20, y: 48 }, { x: 20, y: 78 },
        { x: 80, y: 18 }, { x: 80, y: 48 }, { x: 80, y: 78 },
        { x: 50, y: 4.5 }
    ],
    '8': [
        { x: 20, y: 14 }, { x: 20, y: 36 }, { x: 20, y: 58 }, { x: 20, y: 80 },
        { x: 80, y: 14 }, { x: 80, y: 36 }, { x: 80, y: 58 }, { x: 80, y: 80 }
    ],
    '9': [
        { x: 20, y: 12 }, { x: 20, y: 36 }, { x: 20, y: 60 }, { x: 20, y: 84 },
        { x: 80, y: 12 }, { x: 80, y: 36 }, { x: 80, y: 60 }, { x: 80, y: 84 },
        { x: 50, y: 4.5 }
    ],
    '10': [
        { x: 20, y: 8 }, { x: 20, y: 27 }, { x: 20, y: 46 }, { x: 20, y: 65 }, { x: 20, y: 84 },
        { x: 80, y: 8 }, { x: 80, y: 27 }, { x: 80, y: 46 }, { x: 80, y: 65 }, { x: 80, y: 84 }
    ],
    'Eso': [ { x: 20, y: 4.5 }, { x: 80, y: 4.5 } ],
    'Král': [ { x: 20, y: 4.5 }, { x: 80, y: 4.5 } ],
    'Svršek': [ { x: 20, y: 4.5 } ],
    'Spodek': [ { x: 20, y: 82.5 } ],
    // Aliasy
    'A': [ { x: 20, y: 4.5 }, { x: 80, y: 4.5 } ],
    'K': [ { x: 20, y: 4.5 }, { x: 80, y: 4.5 } ],
    'Q': [ { x: 20, y: 4.5 } ],
    'J': [ { x: 20, y: 82.5 } ]
};

function renderGrid() {
    const grid = document.getElementById('cards-grid');
    if (!grid) return;
    grid.innerHTML = '';
    const scaleUi = 3.8; 

    AppState.cards.forEach(card => {
        const cardEl = document.createElement('div');
        cardEl.className = 'preview-card';
        if (AppState.activeCardId === card.id) cardEl.classList.add('active');
        if (card.isLocked) cardEl.classList.add('is-locked');
        cardEl.id = 'card-el-' + card.id;
        cardEl.style.width = Math.round(AppState.cardWidth * scaleUi) + 'px';
        cardEl.style.height = Math.round(AppState.cardHeight * scaleUi) + 'px';
        cardEl.style.borderRadius = Math.round(AppState.cardRadius * scaleUi) + 'px';

        // ZÁKLADNÍ VRSTVY ZÁVISÍ NA REŽIMU (Front vs Back)
        if (AppState.viewMode === 'back') {
            const bs = AppState.backSideSettings;
            
            // BACK VRSTVA 0: ILUSTRACE (Rub)
            const bgLayer = document.createElement('div');
            bgLayer.className = 'card-bg';
            if (bs && bs.image) {
                const img = document.createElement('img');
                img.src = bs.image;
                const c = bs.crop;
                img.style.transform = `translate(calc(-50% + ${c.x}px), calc(-50% + ${c.y}px)) scale(${c.scale * (c.stretchX || 1)}, ${c.scale * (c.stretchY || 1)})`;
                bgLayer.appendChild(img);
            }
            cardEl.appendChild(bgLayer);

            // BACK VRSTVA 1: LOGO
            if (bs && bs.logo && bs.logo.image) {
                const logo = document.createElement('div');
                logo.className = 'card-logo';
                logo.style.backgroundImage = `url(${bs.logo.image})`;
                logo.style.opacity = bs.logo.opacity;
                const l = bs.logo;
                logo.style.transform = `translate(calc(-50% + ${l.x}px), calc(-50% + ${l.y}px)) scale(${l.scale * l.stretchX}, ${l.scale * l.stretchY})`;
                cardEl.appendChild(logo);
            }

            // BACK VRSTVA 2: OVERLAY
            if (bs && bs.overlay) {
                const overlay = document.createElement('div');
                overlay.className = 'card-overlay';
                cardEl.appendChild(overlay); 
                
                const gO = bs.overlay;
                overlay.style.opacity = gO.opacity;
                overlay.style.border = (gO.borderWidth > 0) ? `${gO.borderWidth * scaleUi}px solid ${gO.borderColor}` : 'none';
                overlay.style.boxSizing = 'border-box';

                const insetPx = gO.inset * (scaleUi * 3.78);
                const brPx = gO.borderRadius * (scaleUi * 3.78);
                
                overlay.style.top = insetPx + 'px';
                overlay.style.left = insetPx + 'px';
                overlay.style.width = `calc(100% - ${2 * insetPx}px)`;
                overlay.style.height = `calc(100% - ${2 * insetPx}px)`;
                overlay.style.borderRadius = brPx + 'px';
                overlay.style.transform = 'none';

                if (gO.image) {
                    overlay.style.backgroundImage = `url(${gO.image})`;
                    overlay.style.transform = `translate(${gO.x * scaleUi}px, ${gO.y * scaleUi}px) scale(${gO.scale * gO.stretchX}, ${gO.scale * gO.stretchY})`;
                    overlay.style.transformOrigin = 'center';
                }
            }
        } else {
            // FRONT VRSTVA 0: ILUSTRACE
            const bgLayer = document.createElement('div');
            bgLayer.className = 'card-bg';
            if (card.image) {
                const img = document.createElement('img');
                img.src = card.image;
                const c = card.crop;
                img.style.transform = `translate(calc(-50% + ${c.x}px), calc(-50% + ${c.y}px)) scale(${c.scale * c.stretchX}, ${c.scale * c.stretchY})`;
                bgLayer.appendChild(img);
            }
            cardEl.appendChild(bgLayer);

            // FRONT VRSTVA 1: GLOBÁLNÍ LOGO
            if (AppState.globalLogo.image) {
                const logo = document.createElement('div');
                logo.className = 'card-logo';
                logo.style.backgroundImage = `url(${AppState.globalLogo.image})`;
                logo.style.opacity = AppState.globalLogo.opacity;
                const l = AppState.globalLogo;
                logo.style.transform = `translate(calc(-50% + ${l.x}px), calc(-50% + ${l.y}px)) scale(${l.scale * l.stretchX}, ${l.scale * l.stretchY})`;
                cardEl.appendChild(logo);
            }

            // FRONT VRSTVA 2: GLOBÁLNÍ RÁM (s prioritou barvy)
            const overlay = document.createElement('div');
            overlay.className = 'card-overlay';
            cardEl.appendChild(overlay); 
            
            const suit = card.id.split('_')[0];
            const sS = AppState.suitSettings[suit];
            const gO = AppState.globalOverlay;
            
            const activeBorderWidth = (sS && sS.borderWidth > 0) ? sS.borderWidth : gO.borderWidth;
            const activeBorderColor = (sS && sS.borderWidth > 0) ? sS.borderColor : gO.borderColor;
            const activeInset = (sS && sS.borderWidth > 0) ? sS.inset : gO.inset;
            const activeBorderRadius = (sS && sS.borderWidth > 0) ? sS.borderRadius : gO.borderRadius;
            
            overlay.style.opacity = gO.opacity;
            overlay.style.border = (activeBorderWidth > 0) ? `${activeBorderWidth * scaleUi}px solid ${activeBorderColor}` : 'none';
            overlay.style.boxSizing = 'border-box';

            const insetPx = activeInset * (scaleUi * 3.78);
            const brPx = activeBorderRadius * (scaleUi * 3.78);
            
            overlay.style.top = insetPx + 'px';
            overlay.style.left = insetPx + 'px';
            overlay.style.width = `calc(100% - ${2 * insetPx}px)`;
            overlay.style.height = `calc(100% - ${2 * insetPx}px)`;
            overlay.style.borderRadius = brPx + 'px';
            overlay.style.transform = 'none';

            if (gO.image) {
                overlay.style.backgroundImage = `url(${gO.image})`;
                overlay.style.transform = `translate(${gO.x * scaleUi}px, ${gO.y * scaleUi}px) scale(${gO.scale * gO.stretchX}, ${gO.scale * gO.stretchY})`;
                overlay.style.transformOrigin = 'center';
            }
            
            // FRONT VRSTVA 3: DYNAMICKÉ SYMBOLY
            if (AppState.gameMode === 'quartet') {
                drawQuartetOverlay(cardEl, card);
            } else if (AppState.gameMode === 'pexeso') {
                drawPexesoOverlay(cardEl, card);
            } else if (AppState.showSymbols) {
                drawSymbols(cardEl, card);
            }
        }

        const label = document.createElement('div');
        label.className = 'card-label'; label.innerText = card.label;
        cardEl.appendChild(label);

        const dropZone = document.createElement('div');
        dropZone.className = 'drop-zone-overlay';
        cardEl.appendChild(dropZone);

        cardEl.addEventListener('mousedown', (e) => setActiveCard(card.id, e));
        cardEl.addEventListener('dragover', (e) => { e.preventDefault(); cardEl.classList.add('drag-over'); });
        cardEl.addEventListener('dragleave', () => cardEl.classList.remove('drag-over'));
        cardEl.addEventListener('drop', (e) => handleImageDrop(card.id, e));
        grid.appendChild(cardEl);
    });
}

function drawSymbols(cardEl, card) {
    const symbolsCont = document.createElement('div');
    symbolsCont.className = 'card-symbols';
    
    const parts = card.id.split('_');
    const suit = parts[0];
    const val = parts[1];
    
    // Konfigurace Barvy (Suit)
    const suitCfg = AppState.suitSettings[suit] || { opacity: 1, scale: 0.18, color: '#fff', offsetY:0, spacingY:1, columnX:0 };
    
    // Konfigurace Hodnoty (Value) - Globální nebo Individuální
    let valCfg = AppState.valueSettings[val] || { offsetY:0, spacingY:1, columnX:0, scale: null, opacity: null };
    if (card.symbolOverride) valCfg = card.symbolOverride;

    const layout = SYMBOL_LAYOUTS[val] || [];
    if (layout.length === 0) console.warn("No layout for val:", val, "cardId:", card.id);

    layout.forEach(pos => {
        const symbol = document.createElement('div');
        symbol.className = 'symbol-instance';
        symbol.style.position = 'absolute';
        
        // KOMBINACE TRANSFORMACÍ (Global + Value + Suit) nebo Individuální Override
        let fScale, fOpacity, fOffsetX, fOffsetY, fSpacingY, fColumnX;
        const gS = AppState.globalSymbolSettings;

        if (card.symbolOverride) {
            // TOTÁLNÍ IZOLACE: Pokud existuje override (zámek/vlastní), ignorujeme suit-level posuny
            fScale    = card.symbolOverride.scale;
            fOpacity  = card.symbolOverride.opacity;
            fOffsetX  = card.symbolOverride.offsetX || 0;
            fOffsetY  = card.symbolOverride.offsetY;
            fSpacingY = card.symbolOverride.spacingY;
            fColumnX  = card.symbolOverride.columnX;
        } else {
            // STANDARDNÍ KOMBINACE: Globální * (Hodnota + Barva)
            // Scale a Opacity jsou multiplikativní pro globální level
            const baseScale = (valCfg.scale !== null && valCfg.scale !== undefined) ? valCfg.scale : suitCfg.scale;
            fScale = baseScale * gS.scale;
            
            const baseOpacity = (valCfg.opacity !== null && valCfg.opacity !== undefined) ? valCfg.opacity : suitCfg.opacity;
            fOpacity = baseOpacity * gS.opacity;

            // Offsety jsou aditivní
            fOffsetX  = (valCfg.offsetX || 0) + (suitCfg.offsetX || 0) + gS.offsetX;
            fOffsetY  = (valCfg.offsetY || 0) + (suitCfg.offsetY || 0) + gS.offsetY;
            
            // Spacing je multiplikativní
            fSpacingY = (valCfg.spacingY !== undefined ? valCfg.spacingY : 1) * (suitCfg.spacingY !== undefined ? suitCfg.spacingY : 1) * gS.spacingY;
            
            // Kolony jsou aditivní
            fColumnX  = (valCfg.columnX || 0) + (suitCfg.columnX || 0) + gS.columnX;
        }

        // --- VÝPOČET FINÁLNÍ POZICE ---
        // Y: Relativně k polovině karty (50%)
        let finalY = 50 + (pos.y - 50) * fSpacingY + (fOffsetY / AppState.cardHeight * 100);
        
        // X: Relativně k šířce karty
        let finalX = pos.x + (fOffsetX / AppState.cardWidth * 100);
        
        // X: Výpočet symetrie kolem 50% (pro vícesloupcové rozvržení)
        if (pos.x < 45) finalX -= (fColumnX / AppState.cardWidth * 100);
        else if (pos.x > 55) finalX += (fColumnX / AppState.cardWidth * 100);

        symbol.style.left = finalX + '%';
        symbol.style.top = finalY + '%';
        symbol.style.transform = 'translate(-50%, -50%)'; // Klíč k dokonalému centrování
        
        symbol.style.opacity = fOpacity;
        
        if (suitCfg.image) {
            const img = document.createElement('img');
            img.src = suitCfg.image;
            img.style.width = (fScale * 600) + 'px'; 
            symbol.appendChild(img);
        } else {
            const iconMap = { 'Srdce':'♥', 'Piky':'♠', 'Kule':'♦', 'Žaludy':'♣', 
                             'zelene':'♠', 'kule':'♦', 'zaludy':'♣', 'srdce':'♥' };
            symbol.innerText = iconMap[suit] || iconMap[suit.toLowerCase()] || '';
            symbol.style.color = suitCfg.color;
            symbol.style.fontSize = (fScale * 300) + 'px';
        }
        symbolsCont.appendChild(symbol);
    });

    cardEl.appendChild(symbolsCont);
}

function drawQuartetOverlay(cardEl, card) {
    const data = card.quartetData || { name: "", description: "", stats: ["", "", "", ""] };
    const parts = card.id.split('_'); // e.g. 'q_1A'
    const subStr = parts.length > 1 ? parts[1] : '1A';
    const group = subStr[0] || '1';
    
    // Group settings
    const groupSettings = AppState.quartetSettings.sets[group] || { color: '#ff4444' };
    const cssColor = groupSettings.color;

    const borderSettings = AppState.quartetSettings.border || { width: 0, inset: 0, radius: 4 };

    // Optional Border
    if (borderSettings.width && borderSettings.width > 0) {
        const borderEl = document.createElement('div');
        borderEl.className = 'kvarteta-border';
        borderEl.style.position = 'absolute';
        borderEl.style.pointerEvents = 'none';
        borderEl.style.boxSizing = 'border-box';
        const inset = borderSettings.inset || 0;
        borderEl.style.left = `${inset}mm`;
        borderEl.style.right = `${inset}mm`;
        borderEl.style.top = `${inset}mm`;
        borderEl.style.bottom = `${inset}mm`;
        borderEl.style.border = `${borderSettings.width}mm solid ${cssColor}`;
        borderEl.style.borderRadius = `${borderSettings.radius !== undefined ? borderSettings.radius : 4}mm`;
        borderEl.style.zIndex = 10;
        cardEl.appendChild(borderEl);
    }

    // Overlay Bottom
    const overlayBottom = document.createElement('div');
    overlayBottom.className = 'kvarteta-overlay-bottom';
    cardEl.appendChild(overlayBottom);

    // ID Badge
    const idBadge = document.createElement('div');
    idBadge.className = 'kvarteta-id-badge';
    idBadge.style.color = cssColor;
    const useSetColorId = AppState.quartetSettings.useSetColorId || false;
    const useSetColorName = AppState.quartetSettings.useSetColorName !== false;
    const useSetColorDesc = AppState.quartetSettings.useSetColorDesc || false;
    const useSetColorStatName = AppState.quartetSettings.useSetColorStatName || false;
    const useSetColorStatValue = AppState.quartetSettings.useSetColorStatValue || false;
    const useSetColorStatBorder = AppState.quartetSettings.useSetColorStatBorder || false;
    const idOffsetX = AppState.quartetSettings.idOffsetX ?? 50;
    const idOffsetY = AppState.quartetSettings.idOffsetY ?? 2;
    const nameOffsetX = AppState.quartetSettings.nameOffsetX ?? 50;
    const nameOffsetY = AppState.quartetSettings.nameOffsetY ?? 12;
    const descOffsetX = AppState.quartetSettings.descOffsetX ?? 50;
    const descOffsetY = AppState.quartetSettings.descOffsetY ?? 5;

    idBadge.style.borderColor = cssColor;
    idBadge.style.color = useSetColorId ? cssColor : '#fff';
    idBadge.style.left = `${idOffsetX}%`;
    idBadge.style.top = `${idOffsetY}%`;
    idBadge.innerText = subStr;
    cardEl.appendChild(idBadge);

    // Layout configuration
    const lOut = AppState.quartetSettings.layout || { offsetX: 2, offsetY: 2 };
    const offX = lOut.offsetX;
    const offY = lOut.offsetY;
    
    // Typografie a herní prvky
    const hideStats = AppState.quartetSettings.hideStats || false;
    const fontFamily = AppState.quartetSettings.fontFamily || "'Cinzel', serif";
    const statShape = AppState.quartetSettings.statShape || 'hexagon';
    const statLayout = AppState.quartetSettings.statLayout || 'corners';
    
    // Nové detaily
    const statSize = AppState.quartetSettings.statSize || 1.0;
    const fontSizeValue = AppState.quartetSettings.fontSizeValue || 1.2;
    const fontSizeLabel = AppState.quartetSettings.fontSizeLabel || 0.4;
    const statValueOffset = AppState.quartetSettings.statValueOffset || 0;
    const statLabelOffset = AppState.quartetSettings.statLabelOffset || 0;
    const statBgColor = AppState.quartetSettings.statBgColor || '#000000';
    const statOpacity = AppState.quartetSettings.statOpacity || 0.4;
    const statSpacing = AppState.quartetSettings.statSpacing || 5;
    
    idBadge.style.fontFamily = fontFamily;

    // 4 Stats in Hexagons
    if (!hideStats) {
        const positions = ['pos-tl', 'pos-tr', 'pos-bl', 'pos-br'];
        const attrNames = AppState.quartetSettings.attributeNames || ["Výška", "Váha", "Věk", "Síla"];
        
        const statsWrapper = document.createElement('div');
        statsWrapper.className = `layout-wrapper-${statLayout}`;
        
        if (statLayout === 'bottom-row' || statLayout === 'left-column' || statLayout === 'right-column' || statLayout === 'grid-2x2') {
            statsWrapper.style.gap = `${statSpacing}px`;
        }
        statsWrapper.style.textRendering = 'optimizeLegibility';

        for(let i=0; i<4; i++) {
            const hexContainer = document.createElement('div');
            let posClass = '';
            if (statLayout === 'corners') posClass = positions[i];
            
            hexContainer.className = `hex-container shape-${statShape} ${posClass}`;
            
            // Apply scale via dimensions to avoid transform blur
            // Sjednocené rozměry napříč všemi rozvrženími pro zachování tvaru a poměru stran
            const baseW = 22; 
            const baseH = 16.5; 

            hexContainer.style.width = `${baseW * statSize}%`;
            hexContainer.style.height = `${baseH * statSize}%`;
            
            // Apply shape and border coloring
            if (statShape !== 'golden-hexagon') {
                const hex = statBgColor.replace('#', '');
                const r = parseInt(hex.substring(0, 2), 16);
                const g = parseInt(hex.substring(2, 4), 16);
                const b = parseInt(hex.substring(4, 6), 16);
                hexContainer.style.backgroundColor = `rgba(${r}, ${g}, ${b}, ${statOpacity})`;
                if (useSetColorStatBorder) {
                    hexContainer.style.borderColor = cssColor;
                }
            }
            
            // Apply inline layout offsets ONLY for corners
            if (statLayout === 'corners') {
                if (i === 0) { hexContainer.style.left = `${offX}%`; hexContainer.style.top = `${offY}%`; }
                if (i === 1) { hexContainer.style.right = `${offX}%`; hexContainer.style.top = `${offY}%`; }
                if (i === 2) { hexContainer.style.left = `${offX}%`; hexContainer.style.bottom = `${offY + 5}%`; }
                if (i === 3) { hexContainer.style.right = `${offX}%`; hexContainer.style.bottom = `${offY + 5}%`; }
            }
            
            const statHex = document.createElement('div');
            statHex.className = 'stat-hex';

            const statValue = document.createElement('div');
            statValue.className = 'stat-value';
            statValue.innerText = data.stats[i] || '-';
            statValue.style.fontFamily = fontFamily;
            statValue.style.fontSize = `${fontSizeValue}rem`;
            // Using margin instead of translate avoids sub-pixel fuzziness
            statValue.style.marginTop = `${statValueOffset}px`;
            statValue.style.color = useSetColorStatValue ? cssColor : '#fff';

            const statLabel = document.createElement('div');
            statLabel.className = 'stat-label';
            statLabel.innerText = attrNames[i] || `Atribut ${i+1}`;
            statLabel.style.fontFamily = fontFamily;
            statLabel.style.fontSize = `${fontSizeLabel}rem`;
            statLabel.style.marginTop = `${statLabelOffset}px`;
            statLabel.style.color = useSetColorStatName ? cssColor : '#fff';

            statHex.appendChild(statValue);
            statHex.appendChild(statLabel);
            hexContainer.appendChild(statHex);
            
            // Golden hex needs custom color injection
            if (statShape === 'golden-hexagon') {
                statLabel.style.color = '#fff';
            }
            
            statsWrapper.appendChild(hexContainer);
        }
        cardEl.appendChild(statsWrapper);
    }

    // Name and Description
    const cardName = document.createElement('h1');
    cardName.className = 'kvarteta-card-name';
    cardName.style.position = 'absolute';
    cardName.style.left = `${nameOffsetX}%`;
    cardName.style.bottom = `${nameOffsetY}%`;
    cardName.style.transform = 'translateX(-50%)';
    cardName.style.width = '90%';
    cardName.style.color = useSetColorName ? cssColor : '#fff';
    cardName.innerText = data.name || `Karta ${subStr}`;
    cardName.style.fontFamily = fontFamily;
    cardEl.appendChild(cardName);
    
    const cardDesc = document.createElement('p');
    cardDesc.className = 'kvarteta-card-desc';
    cardDesc.style.position = 'absolute';
    cardDesc.style.left = `${descOffsetX}%`;
    cardDesc.style.bottom = `${descOffsetY}%`;
    cardDesc.style.transform = 'translateX(-50%)';
    cardDesc.style.width = '80%';
    cardDesc.style.margin = '0';
    cardDesc.innerText = data.description || '';
    cardDesc.style.fontFamily = fontFamily;
    cardDesc.style.color = useSetColorDesc ? cssColor : '#ddd';
    cardEl.appendChild(cardDesc);
}

// --- LAYOUT HANDLERS ---

function handleLayoutValueChange() {
    renderUIFromState(); // Načte hodnoty ze stavu do sliderů pro nově vybranou hodnotu
}

function updateLayoutParam(param, value) {
    const valSelect = document.getElementById('layout-value-select');
    if(!valSelect) return;
    const val = valSelect.value;
    const cfg = AppState.valueSettings[val];
    if (!cfg) return;
    
    const v = parseFloat(value);
    if (param === 'offsetX') cfg.offsetX = v;
    else if (param === 'offsetY') cfg.offsetY = v;
    else if (param === 'spacingY') cfg.spacingY = v / 100;
    else if (param === 'columnX') cfg.columnX = v;
    
    saveState();
    renderGrid();
}

function updateIndividualParam(param, value) {
    if (!AppState.activeCardId) return;
    const card = AppState.cards.find(c => c.id === AppState.activeCardId);
    if (!card) return;

    // Pokud override neexistuje, vytvoříme ho na základě aktuální hodnoty/barvy
    if (!card.symbolOverride) {
        const parts = card.id.split('_');
        const suit = parts[0];
        const val = parts[1] || '7';
        const gV = AppState.valueSettings[val] || {offsetY:0, spacingY:1, columnX:0};
        const gS = AppState.suitSettings[suit] || {scale: 0.18, opacity: 1, offsetY:0, spacingY:1, columnX:0};
        card.symbolOverride = { 
            offsetX: gV.offsetX || 0,
            offsetY: gV.offsetY,
            spacingY: gV.spacingY,
            columnX: gV.columnX,
            scale: gS.scale, 
            opacity: gS.opacity 
        };
    }

    const val = parseFloat(value);
    if (param === 'scale') card.symbolOverride.scale = val / 100;
    else if (param === 'opacity') card.symbolOverride.opacity = val / 100;
    else if (param === 'spacingY') card.symbolOverride.spacingY = val / 100;
    else if (['offsetX', 'offsetY', 'columnX'].includes(param)) card.symbolOverride[param] = val;
    
    saveState();
    renderGrid();
}

function toggleCardLock(checked) {
    if (!AppState.activeCardId) return;
    const card = AppState.cards.find(c => c.id === AppState.activeCardId);
    if (card) {
        card.isLocked = checked;
        saveState();
        renderUIFromState();
    }
}

function resetIndividualOverride() {
    if (!AppState.activeCardId) return;
    const card = AppState.cards.find(c => c.id === AppState.activeCardId);
    if (card) {
        card.symbolOverride = null;
        saveState();
        renderUIFromState();
    }
}

function resetIndividualLayout() {
    resetIndividualOverride();
}

// --- SUIT HANDLERS ---

function handleSuitUpload(suit, event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = (e) => { AppState.suitSettings[suit].image = e.target.result; saveState(); renderGrid(); };
        reader.readAsDataURL(file);
    }
}

function updateSuitParam(suit, param, value) {
    if (param === 'scale') {
        AppState.suitSettings[suit].scale = parseFloat(value) / 100;
    } else if (param === 'opacity') {
        AppState.suitSettings[suit].opacity = parseFloat(value) / 100;
    } else if (param === 'spacingY') {
        AppState.suitSettings[suit].spacingY = parseFloat(value) / 100;
    } else if (['borderColor'].includes(param)) {
        AppState.suitSettings[suit][param] = value;
    } else if (['offsetX', 'offsetY', 'columnX', 'borderWidth', 'inset', 'borderRadius'].includes(param)) {
        AppState.suitSettings[suit][param] = parseFloat(value);
    }
    saveState();
    renderGrid();
}

function updateGlobalSymbolParam(param, value) {
    const gs = AppState.globalSymbolSettings;
    if (param === 'scale' || param === 'opacity' || param === 'spacingY') {
        gs[param] = parseFloat(value) / 100;
    } else {
        gs[param] = parseFloat(value);
    }
    saveState();
    renderGrid();
}

// --- STANDARD HANDLERS ---

function handleOverlayUpload(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = (e) => { AppState.globalOverlay.image = e.target.result; renderGrid(); };
        reader.readAsDataURL(file);
    }
}

function updateOverlay() {
    AppState.globalOverlay.opacity = (parseFloat(document.getElementById('overlay-opacity').value) || 0) / 100;
    AppState.globalOverlay.x = parseFloat(document.getElementById('overlay-x').value) || 0;
    AppState.globalOverlay.y = parseFloat(document.getElementById('overlay-y').value) || 0;
    AppState.globalOverlay.scale = (parseFloat(document.getElementById('overlay-scale').value) || 100) / 100;
    saveState(); renderGrid();
}

function updateGlobalOverlayParam(param, value) {
    if (param === 'opacity') {
        AppState.globalOverlay.opacity = parseFloat(value) / 100;
    } else if (param === 'scale') {
        AppState.globalOverlay.scale = parseFloat(value) / 100;
    } else if (param === 'borderWidth' || param === 'inset' || param === 'borderRadius') {
        AppState.globalOverlay[param] = parseFloat(value);
    } else if (param === 'borderColor') {
        AppState.globalOverlay[param] = value;
    } else { // For x, y, stretchX, stretchY
        AppState.globalOverlay[param] = parseFloat(value);
    }
    saveState(); 
    renderGrid();
}

function handleLogoUpload(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = (e) => { AppState.globalLogo.image = e.target.result; renderGrid(); };
        reader.readAsDataURL(file);
    }
}

function updateLogo() {
    const l = AppState.globalLogo;
    l.opacity = document.getElementById('logo-opacity').value / 100;
    l.x = parseFloat(document.getElementById('logo-x').value) || 0;
    l.y = parseFloat(document.getElementById('logo-y').value) || 0;
    l.scale = (parseFloat(document.getElementById('logo-zoom').value) || 30) / 100;
    renderGrid();
}

// --- ZADNÍ STRANA HANDLERS ---
function switchViewMode(mode) {
    if (AppState.viewMode === mode) return;
    AppState.viewMode = mode;
    
    // Update tabs UI
    document.getElementById('tab-front').classList.toggle('active', mode === 'front');
    document.getElementById('tab-back').classList.toggle('active', mode === 'back');
    document.getElementById('tab-front').style.borderBottom = mode === 'front' ? '2px solid var(--accent)' : '2px solid transparent';
    document.getElementById('tab-back').style.borderBottom = mode === 'back' ? '2px solid var(--accent)' : '2px solid transparent';
    document.getElementById('tab-front').style.color = mode === 'front' ? '#121212' : '#aaa';
    document.getElementById('tab-front').style.background = mode === 'front' ? 'var(--accent)' : 'transparent';
    document.getElementById('tab-back').style.color = mode === 'back' ? '#121212' : '#aaa';
    document.getElementById('tab-back').style.background = mode === 'back' ? 'var(--accent)' : 'transparent';

    // Show/hide panels
    document.getElementById('front-side-panels').style.display = mode === 'front' ? 'block' : 'none';
    document.getElementById('back-side-panels').style.display = mode === 'back' ? 'block' : 'none';

    renderGrid();
}

function handleBackImageUpload(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = (e) => { 
            AppState.backSideSettings.image = e.target.result; 
            saveState();
            renderGrid(); 
        };
        reader.readAsDataURL(file);
    }
}

function updateBackImageParam(param, value) {
    if (param === 'scale') AppState.backSideSettings.crop.scale = parseFloat(value) / 100;
    else AppState.backSideSettings.crop[param] = parseFloat(value);
    saveState();
    renderGrid();
}

function resetBackImage() {
    AppState.backSideSettings.image = null;
    AppState.backSideSettings.crop = { x: 0, y: 0, scale: 1, stretchX: 1, stretchY: 1 };
    saveState();
    renderUIFromState(); // reset sliders
}

function updateBackOverlayParam(param, value) {
    if (param === 'borderColor') AppState.backSideSettings.overlay[param] = value;
    else AppState.backSideSettings.overlay[param] = parseFloat(value);
    saveState();
    renderGrid();
}

function handleBackOverlayUpload(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = (e) => { AppState.backSideSettings.overlay.image = e.target.result; saveState(); renderGrid(); };
        reader.readAsDataURL(file);
    }
}

function updateBackOverlay() {
    const o = AppState.backSideSettings.overlay;
    o.opacity = (parseFloat(document.getElementById('back-overlay-opacity').value) || 0) / 100;
    o.x = parseFloat(document.getElementById('back-overlay-x').value) || 0;
    o.y = parseFloat(document.getElementById('back-overlay-y').value) || 0;
    saveState();
    renderGrid();
}

function handleBackLogoUpload(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = (e) => { AppState.backSideSettings.logo.image = e.target.result; saveState(); renderGrid(); };
        reader.readAsDataURL(file);
    }
}

function updateBackLogo() {
    const l = AppState.backSideSettings.logo;
    l.opacity = (parseFloat(document.getElementById('back-logo-opacity').value) || 0) / 100;
    l.x = parseFloat(document.getElementById('back-logo-x').value) || 0;
    l.y = parseFloat(document.getElementById('back-logo-y').value) || 0;
    l.scale = (parseFloat(document.getElementById('back-logo-zoom').value) || 30) / 100;
    saveState();
    renderGrid();
}

function toggleSymbols(show) { AppState.showSymbols = show; renderGrid(); }

function fillActiveCard() {
    if (!AppState.activeCardId) return;
    const card = AppState.cards.find(c => c.id === AppState.activeCardId);
    if (!card || !card.image) return;
    const img = new Image();
    img.src = card.image;
    img.onload = () => {
        const targetW = AppState.cardWidth; const targetH = AppState.cardHeight;
        const ratioImg = img.naturalWidth / img.naturalHeight;
        const ratioTarget = targetW / targetH;
        let finalScale = (ratioImg > ratioTarget) ? (targetH * 3.8 / img.naturalHeight) : (targetW * 3.8 / img.naturalWidth);
        card.crop.scale = finalScale; card.crop.x = 0; card.crop.y = 0;
        saveState(); renderUIFromState();
    };
}

function updateGlobalDimensions() {
    AppState.cardWidth = parseFloat(document.getElementById('card-width').value) || 63;
    AppState.cardHeight = parseFloat(document.getElementById('card-height').value) || 88;
    AppState.cardRadius = parseFloat(document.getElementById('card-radius').value) || 4;
    saveState(); renderGrid();
}

function toggleCardLock(locked) {
    if (!AppState.activeCardId) return;
    const card = AppState.cards.find(c => c.id === AppState.activeCardId);
    if (card) {
        card.isLocked = locked;
        // Pokud zamykáme a karta nemá vlastní override, vytvoříme snapshot globálního nastavení,
        // aby byla chráněna před budoucími hromadnými změnami.
        if (locked && !card.symbolOverride) {
            const parts = card.id.split('_');
            const suit = parts[0];
            const val = parts[1] || '7';
            const vS = AppState.valueSettings[val] || {offsetY:0, spacingY:1, columnX:0};
            const sS = AppState.suitSettings[suit] || {scale: 0.18, opacity: 1, offsetY:0, spacingY:1, columnX:0};
            
            // Snapshot musí být kombinací obou (Value + Suit) pro zachování aktuálního vzhledu
            card.symbolOverride = {
                 offsetY: vS.offsetY + sS.offsetY,
                 spacingY: vS.spacingY * sS.spacingY,
                 columnX: vS.columnX + sS.columnX,
                 scale: (vS.scale !== null && vS.scale !== undefined) ? vS.scale : sS.scale,
                 opacity: (vS.opacity !== null && vS.opacity !== undefined) ? vS.opacity : sS.opacity
            };
        }
        saveState();
        renderUIFromState();
    }
}

async function exportSingleCard() {
    if (!AppState.activeCardId) return;
    const cardEl = document.getElementById('card-el-' + AppState.activeCardId);
    if (!cardEl) return;

    try {
        // html2canvas bere element a vytvoří z něj canvas
        const canvas = await html2canvas(cardEl, {
            backgroundColor: null,
            scale: 4, // Vysoká kvalita pro tisk
            useCORS: true
        });
        
        const link = document.createElement('a');
        link.download = `karta_${AppState.activeCardId}.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();
    } catch (err) {
        console.error("Export selhal:", err);
        alert("Při exportu karty došlo k chybě.");
    }
}

function setActiveCard(id, e) {
    AppState.activeCardId = id;
    const card = AppState.cards.find(c => c.id === id);
    // Vybíráme pouze kartu, neovlivňujeme její zámek (ten je plně manuální)
    document.querySelectorAll('.preview-card').forEach(el => el.classList.remove('active'));
    document.getElementById('card-el-' + id).classList.add('active');
    renderUIFromState(); 
}

function handleImageDrop(cardId, e) {
    e.preventDefault();
    const card = AppState.cards.find(c => c.id === cardId);
    if (!card) {
        return;
    }
    
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (ev) => {
            if (AppState.viewMode === 'back') {
                if (!AppState.backSideSettings.crop) {
                    AppState.backSideSettings.crop = { scale: 1, x: 0, y: 0, opacity: 1 };
                }
                AppState.backSideSettings.image = ev.target.result;
                AppState.backSideSettings.crop = { scale: 1, x: 0, y: 0, opacity: 1 };
                saveState();
                renderGrid();
                renderUIFromState();
            } else {
                card.image = ev.target.result; 
                card.crop = { x: 0, y: 0, scale: 1, stretchX: 1, stretchY: 1 }; 
                AppState.activeCardId = cardId; // Nastavíme jako aktivní, aby se UI chytlo
                saveState(); 
                renderUIFromState(); 
                renderGrid();
            }
        };
        reader.readAsDataURL(file);
    }
}

function updateGlobalStretch() {
    const sx = (parseFloat(document.getElementById('global-stretch-x').value) || 100) / 100;
    const sy = (parseFloat(document.getElementById('global-stretch-y').value) || 100) / 100;
    AppState.cards.forEach(card => { 
        if (!card.isLocked) {
           card.crop.stretchX = sx; card.crop.stretchY = sy; 
        }
    });
    saveState(); renderGrid();
}

function updateGlobalZoom() {
    const zoom = (parseFloat(document.getElementById('global-zoom').value) || 100) / 100;
    AppState.cards.forEach(card => { 
        if (!card.isLocked) {
            card.crop.scale = zoom; 
        }
    });
    saveState(); renderGrid();
}

function handleIndividualImageUpload(event) {
    const file = event.target.files[0];
    if (file && file.type.startsWith('image/') && AppState.activeCardId) {
        const reader = new FileReader();
        reader.onload = (e) => {
            const card = AppState.cards.find(c => c.id === AppState.activeCardId);
            if (card) {
                card.image = e.target.result;
                card.crop = { x: 0, y: 0, scale: 1, stretchX: 1, stretchY: 1 };
                saveState();
                renderUIFromState();
            }
        };
        reader.readAsDataURL(file);
    }
}

function updateIndividualImageParam(param, value) {
    if (!AppState.activeCardId) return;
    const card = AppState.cards.find(c => c.id === AppState.activeCardId);
    if (!card || !card.image) return;
    
    let val = parseFloat(value);
    if (param === 'scale') card.crop.scale = val / 100;
    if (param === 'x') card.crop.x = val;
    if (param === 'y') card.crop.y = val;
    
    saveState();
    renderGrid();
}

function resetIndividualImage() {
    if (!AppState.activeCardId) return;
    const card = AppState.cards.find(c => c.id === AppState.activeCardId);
    if (card) {
        card.image = null;
        saveState();
        renderUIFromState();
    }
}

function renderUIFromState() {
    // 1. ZÁKLADNÍ NASTAVENÍ PROJEKTU
    const setVal = (id, val) => { const el = document.getElementById(id); if (el) el.value = val; };
    const setChecked = (id, val) => { const el = document.getElementById(id); if (el) el.checked = val; };

    setVal('project-name', AppState.projectName);
    setVal('game-mode-select', AppState.gameMode);
    setChecked('show-symbols', AppState.showSymbols);
    setVal('card-width', AppState.cardWidth);
    setVal('card-height', AppState.cardHeight);
    setVal('card-radius', AppState.cardRadius);

    // 1b. GLOBÁLNÍ SYMBOLY
    const gS = AppState.globalSymbolSettings;
    setVal('global-sym-scale', Math.round(gS.scale * 100));
    setVal('global-sym-opacity', Math.round(gS.opacity * 100));
    setVal('global-sym-offsetX', gS.offsetX);
    setVal('global-sym-offsetY', gS.offsetY);
    setVal('global-sym-spacingY', Math.round(gS.spacingY * 100));
    setVal('global-sym-columnX', gS.columnX);

    // 2. GLOBÁLNÍ OVERLAY (VRSTVA 2)
    const gO = AppState.globalOverlay;
    setVal('overlay-opacity', Math.round(gO.opacity * 100));
    setVal('overlay-x', gO.x);
    setVal('overlay-y', gO.y);
    setVal('overlay-scale', Math.round(gO.scale * 100));
    setVal('overlay-border-color', gO.borderColor);
    setVal('overlay-border-width', gO.borderWidth);
    setVal('overlay-inset', gO.inset);
    setVal('overlay-border-radius', gO.borderRadius);

    // 3. GLOBÁLNÍ LOGO (VRSTVA 1)
    const gL = AppState.globalLogo;
    setVal('logo-opacity', Math.round(gL.opacity * 100));

    // 4. PER-SUIT NASTAVENÍ (SYMBOLŮ A OHRANIČENÍ)
    ['Srdce', 'Piky', 'Kule', 'Žaludy'].forEach(suit => {
        const s = AppState.suitSettings[suit];
        if (!s) return;
        const p = `suit-${suit}-`;
        setVal(p + 'scale', Math.round(s.scale * 100));
        setVal(p + 'opacity', Math.round(s.opacity * 100));
        setVal(p + 'offsetX', s.offsetX);
        setVal(p + 'offsetY', s.offsetY);
        setVal(p + 'spacingY', s.spacingY * 100);
        setVal(p + 'columnX', s.columnX);
        setVal(p + 'borderColor', s.borderColor);
        setVal(p + 'borderWidth', s.borderWidth);
        setVal(p + 'inset', s.inset);
        setVal(p + 'borderRadius', s.borderRadius);
    });

    // 5. GLOBÁLNÍ ROZVRŽENÍ HODNOT
    const valSelect = document.getElementById('layout-value-select');
    if (valSelect) {
        const v = AppState.valueSettings[valSelect.value];
        if (v) {
            setVal('layout-offset-x', v.offsetX);
            setVal('layout-offset-y', v.offsetY);
            setVal('layout-spacing-y', Math.round(v.spacingY * 100));
            setVal('layout-column-x', v.columnX);
        }
    }

    // 6. INDIVIDUÁLNÍ NASTAVENÍ KARTY
    const indPanel = document.getElementById('individual-layout-panel');
    if (AppState.activeCardId) {
        const card = AppState.cards.find(c => c.id === AppState.activeCardId);
        if (card) {
            indPanel.style.display = 'block';
            const labelEl = document.getElementById('active-card-label');
            if (labelEl) labelEl.innerText = card.label;

            setChecked('card-lock-toggle', card.isLocked);
            
            const ctrls = document.getElementById('individual-layout-controls');
            if (ctrls) {
                ctrls.style.opacity = 1;
                ctrls.style.pointerEvents = 'auto';
            }

            if (card.symbolOverride) {
                setVal('ind-scale', Math.round(card.symbolOverride.scale * 100));
                setVal('ind-offset-x', card.symbolOverride.offsetX);
                setVal('ind-offset-y', card.symbolOverride.offsetY);
                setVal('ind-spacing-y', Math.round(card.symbolOverride.spacingY * 100));
                setVal('ind-column-x', card.symbolOverride.columnX);
                setVal('ind-opacity', Math.round(card.symbolOverride.opacity * 100));
            }

            // Sync individuální ilustrace
            const imgControls = document.getElementById('ind-img-controls');
            if (imgControls) {
                imgControls.style.display = card.image ? 'block' : 'none';
                if (card.image) {
                    setVal('ind-img-scale', Math.round(card.crop.scale * 100));
                    setVal('ind-img-x', card.crop.x);
                    setVal('ind-img-y', card.crop.y);
                    imgControls.style.opacity = card.isLocked ? 0.5 : 1;
                    imgControls.style.pointerEvents = card.isLocked ? 'none' : 'auto';
                }
            }

            // Sync Kvarteta data if mode is quartet
            if (AppState.gameMode === 'quartet') {
                const qd = card.quartetData || { name: "", description: "", stats: ["", "", "", ""] };
                setVal('ind-q-name', qd.name);
                setVal('ind-q-desc', qd.description);
                for(let i=0; i<4; i++) {
                    setVal(`ind-q-stat${i}`, qd.stats[i] || '');
                }
            }
        }
    } else {
        indPanel.style.display = 'none';
    }

    // 7. GLOBÁLNÍ DEFORMACE (SAMPLE Z PRVNÍ KARTY)
    if (AppState.cards.length > 0) {
        const sample = AppState.cards[0].crop;
        setVal('global-stretch-x', Math.round(sample.stretchX * 100));
        setVal('global-stretch-y', Math.round(sample.stretchY * 100));
        setVal('global-zoom', Math.round(sample.scale * 100));
    }

    // 8. KVARTETA GLOBAL UI
    if (AppState.gameMode === 'quartet') {
        const setVal = (id, val) => { const el = document.getElementById(id); if (el) el.value = val; };
        for(let i=0; i<4; i++) {
            setVal(`quartet-attr-${i}`, AppState.quartetSettings.attributeNames[i] || '');
        }
        setVal('quartet-layout-x', AppState.quartetSettings.layout?.offsetX ?? 2);
        setVal('quartet-layout-y', AppState.quartetSettings.layout?.offsetY ?? 2);
        
        if (AppState.quartetSettings.hideStats !== undefined) {
             const chk = document.getElementById('quartet-hide-stats');
             if (chk) chk.checked = AppState.quartetSettings.hideStats;
        }
        setVal('quartet-font-family', AppState.quartetSettings.fontFamily || "'Cinzel', serif");
        setVal('quartet-stat-shape', AppState.quartetSettings.statShape || 'hexagon');
        setVal('quartet-stat-layout', AppState.quartetSettings.statLayout || 'corners');
        
        // Detailní styl
        setVal('quartet-stat-size', AppState.quartetSettings.statSize || 1.0);
        setVal('quartet-font-size-value', AppState.quartetSettings.fontSizeValue || 1.2);
        setVal('quartet-font-size-label', AppState.quartetSettings.fontSizeLabel || 0.4);
        setVal('quartet-stat-value-offset', AppState.quartetSettings.statValueOffset || 0);
        setVal('quartet-stat-label-offset', AppState.quartetSettings.statLabelOffset || 0);
        setVal('quartet-stat-bg-color', AppState.quartetSettings.statBgColor || '#000000');
        setVal('quartet-stat-opacity', (AppState.quartetSettings.statOpacity || 0.4) * 100);
        
        updateQuartetGroupColorUI();
    }

    // 9. ZADNÍ STRANA SYNC
    if (AppState.backSideSettings) {
        const bs = AppState.backSideSettings;
        setVal('back-img-scale', Math.round(bs.crop.scale * 100));
        setVal('back-img-x', bs.crop.x);
        setVal('back-img-y', bs.crop.y);
        
        const bo = bs.overlay;
        if (bo) {
            setVal('back-overlay-opacity', Math.round(bo.opacity * 100));
            setVal('back-overlay-x', bo.x);
            setVal('back-overlay-y', bo.y);
            setVal('back-overlay-border-color', bo.borderColor);
            setVal('back-overlay-border-width', bo.borderWidth);
            setVal('back-overlay-inset', bo.inset);
            setVal('back-overlay-border-radius', bo.borderRadius);
        }
        
        const bl = bs.logo;
        if (bl) {
            setVal('back-logo-opacity', Math.round(bl.opacity * 100));
            setVal('back-logo-x', bl.x);
            setVal('back-logo-y', bl.y);
            setVal('back-logo-zoom', Math.round(bl.scale * 100));
        }
    }

    renderGrid();
    // Aktualizace info o tisku
    if (typeof updatePrintSettings === 'function') updatePrintSettings();
}

// --- KVARTETA SPECIFIC LOGIC ---

function importKvartetaJSON(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
        try {
            const parsed = JSON.parse(e.target.result);
            if (!Array.isArray(parsed)) throw new Error("JSON musí být pole objektů");
            
            let cardIndex = 0;
            // Iterate over all active cards and populate data sequentially
            AppState.cards.forEach(card => {
                if (cardIndex < parsed.length && card.id.startsWith('q_')) {
                    const row = parsed[cardIndex];
                    if (!card.quartetData) {
                        card.quartetData = {name: "", description: "", stats: ["", "", "", ""]};
                    }
                    
                    card.quartetData.name = row['Jméno'] || row['Name'] || '';
                    card.quartetData.description = row['Český popis'] || row['Popis'] || row['Description'] || '';
                    
                    // Fetch up to 4 arbitrary numerical stats from the object depending on the keys
                    let sidx = 0;
                    for (const [key, value] of Object.entries(row)) {
                        if (key !== 'Jméno' && key !== 'Name' && key !== 'Český popis' && key !== 'Popis' && key !== 'Description' && key !== 'Skupina' && key !== 'Group' && key !== '#') {
                             if (sidx < 4) {
                                  card.quartetData.stats[sidx] = value;
                                  // Update general attribute names if they haven't been customized fully yet (optional enhancement)
                                  if (cardIndex === 0 && document.getElementById(`quartet-attr-${sidx}`)) {
                                      AppState.quartetSettings.attributeNames[sidx] = key;
                                  }
                                  sidx++;
                             }
                        }
                    }
                    cardIndex++;
                }
            });
            
            saveState();
            renderUIFromState();
            alert(`Úspěšně naimportováno ${cardIndex} karet z JSON.`);
        } catch (err) {
            console.error(err);
            alert("Chyba při čtení JSON. Zkontrolujte formát souboru.");
        }
    };
    reader.readAsText(file);
    // Reset input
    event.target.value = null;
}

function updateQuartetConfig(prop, value) {
    if (prop === 'statOpacity') value = parseFloat(value) / 100;
    AppState.quartetSettings[prop] = value;
    saveState();
    renderGrid();
}

function updateQuartetGroupColorUI() {
    const groupSelect = document.getElementById('quartet-group-select');
    const colorPicker = document.getElementById('quartet-color-picker');
    const widthSlider = document.getElementById('quartet-border-width');
    const insetSlider = document.getElementById('quartet-border-inset');
    const radiusSlider = document.getElementById('quartet-border-radius');
    
    if (groupSelect && colorPicker) {
        const group = groupSelect.value;
        const settings = AppState.quartetSettings.sets[group] || { color: '#ffffff' };
        colorPicker.value = settings.color;
    }
    
    const border = AppState.quartetSettings.border || { width: 0, inset: 0, radius: 4 };
    if (widthSlider) widthSlider.value = border.width || 0;
    if (insetSlider) insetSlider.value = border.inset || 0;
    if (radiusSlider) radiusSlider.value = border.radius !== undefined ? border.radius : 4;
}

function updateQuartetColor(color) {
    const groupSelect = document.getElementById('quartet-group-select');
    if (!groupSelect) return;
    const group = groupSelect.value;
    if (!AppState.quartetSettings.sets[group]) {
         AppState.quartetSettings.sets[group] = { color: '#ffffff', borderWidth: 0, inset: 0, borderRadius: 4 };
    }
    AppState.quartetSettings.sets[group].color = color;
    saveState();
    renderGrid();
}

function updateQuartetBorder(prop, value) {
    if (!AppState.quartetSettings.border) {
         AppState.quartetSettings.border = { width: 0, inset: 0, radius: 4 };
    }
    let mappedProp = prop;
    if (prop === 'borderWidth') mappedProp = 'width';
    if (prop === 'borderRadius') mappedProp = 'radius';

    AppState.quartetSettings.border[mappedProp] = parseFloat(value);
    saveState();
    renderGrid();
}

function updateQuartetLayout(prop, value) {
    if (!AppState.quartetSettings.layout) AppState.quartetSettings.layout = { offsetX: 2, offsetY: 2 };
    AppState.quartetSettings.layout[prop] = parseFloat(value);
    saveState();
    renderGrid();
}

function updateQuartetAttr(index, value) {
    AppState.quartetSettings.attributeNames[index] = value;
    saveState();
    renderGrid();
}

function updateActiveQuartetData(field, value, statIndex = 0) {
    if (!AppState.activeCardId) return;
    const card = AppState.cards.find(c => c.id === AppState.activeCardId);
    if (!card) return;
    if (!card.quartetData) card.quartetData = { name: "", description: "", stats: ["", "", "", ""] };
    
    if (field === 'stats') {
         card.quartetData.stats[statIndex] = value;
    } else {
         card.quartetData[field] = value;
    }
    
    saveState();
    renderGrid();
}

// --- PEXESO LOGIC ---

function updatePexesoConfig(prop, value) {
    if (!AppState.pexesoSettings) {
        AppState.pexesoSettings = {
            pairsCount: 16,
            showName: true,
            showDesc: false,
            nameOffsetX: 50, nameOffsetY: 10,
            descOffsetX: 50, descOffsetY: 5,
            fontFamily: "'Roboto', sans-serif"
        };
    }
    AppState.pexesoSettings[prop] = value;
    saveState();
    renderGrid();
}

function drawPexesoOverlay(cardEl, card) {
    const cfg = AppState.pexesoSettings || {};
    const fontFamily = cfg.fontFamily || "'Roboto', sans-serif";
    const data = card.quartetData || { name: "", description: "" };

    if (cfg.showName) {
        const nameEl = document.createElement('h1');
        nameEl.className = 'kvarteta-card-name';
        nameEl.style.position = 'absolute';
        nameEl.style.left = `${cfg.nameOffsetX || 50}%`;
        nameEl.style.bottom = `${cfg.nameOffsetY || 10}%`;
        nameEl.style.transform = 'translateX(-50%)';
        nameEl.style.width = '90%';
        nameEl.style.fontFamily = fontFamily;
        nameEl.style.fontSize = '1.1rem';
        nameEl.innerText = data.name || card.label;
        cardEl.appendChild(nameEl);
    }

    if (cfg.showDesc) {
        const descEl = document.createElement('p');
        descEl.className = 'kvarteta-card-desc';
        descEl.style.position = 'absolute';
        descEl.style.left = `${cfg.descOffsetX || 50}%`;
        descEl.style.bottom = `${cfg.descOffsetY || 5}%`;
        descEl.style.transform = 'translateX(-50%)';
        descEl.style.width = '80%';
        descEl.style.fontFamily = fontFamily;
        descEl.innerText = data.description || '';
        cardEl.appendChild(descEl);
    }
}

function applyGlobalCropToAllCards() {
    if (!AppState.activeCardId) {
        alert("Nejdříve vyberte kartu (kliknutím), jejíž ořez chcete kopírovat.");
        return;
    }
    const activeCard = AppState.cards.find(c => c.id === AppState.activeCardId);
    if (!activeCard) return;

    if (!confirm("Opravdu chcete ořez této karty (přiblížení a posun) aplikovat na všechny ostatní karty v sadě?")) {
        return;
    }

    const sourceCrop = JSON.parse(JSON.stringify(activeCard.crop));
    
    AppState.cards.forEach(card => {
        card.crop = JSON.parse(JSON.stringify(sourceCrop));
    });

    saveState();
    renderGrid();
    alert("Ořez byl sjednocen pro celou sadu.");
}

// --- NASTAVENÍ TISKU ---

function setPrintOrientation(orientation) {
    AppState.printSettings.orientation = orientation;
    document.getElementById('orient-portrait').style.background = orientation === 'portrait' ? 'var(--accent)' : 'transparent';
    document.getElementById('orient-portrait').style.color = orientation === 'portrait' ? '#000' : '#aaa';
    document.getElementById('orient-portrait').style.borderColor = orientation === 'portrait' ? 'var(--accent)' : 'var(--border)';
    document.getElementById('orient-landscape').style.background = orientation === 'landscape' ? 'var(--accent)' : 'transparent';
    document.getElementById('orient-landscape').style.color = orientation === 'landscape' ? '#000' : '#aaa';
    document.getElementById('orient-landscape').style.borderColor = orientation === 'landscape' ? 'var(--accent)' : 'var(--border)';
    updatePrintSettings();
}

function updatePrintSettings() {
    const ps = AppState.printSettings;
    ps.orientation = ps.orientation || 'portrait';
    ps.colsAuto = document.getElementById('cols-auto').checked;
    ps.rowsAuto = document.getElementById('rows-auto').checked;
    if (!ps.colsAuto) ps.cols = parseInt(document.getElementById('print-cols').value) || 3;
    if (!ps.rowsAuto) ps.rows = parseInt(document.getElementById('print-rows').value) || 3;
    ps.gapX = parseFloat(document.getElementById('print-gap-x').value) || 0;
    ps.gapY = parseFloat(document.getElementById('print-gap-y').value) || 0;

    // Disable/enable number inputs based on Auto checkbox
    document.getElementById('print-cols').disabled = ps.colsAuto;
    document.getElementById('print-rows').disabled = ps.rowsAuto;
    document.getElementById('print-cols').style.opacity = ps.colsAuto ? '0.4' : '1';
    document.getElementById('print-rows').style.opacity = ps.rowsAuto ? '0.4' : '1';

    // Calculate preview info
    const pageW = ps.orientation === 'portrait' ? 210 : 297;
    const pageH = ps.orientation === 'portrait' ? 297 : 210;
    const usableW = pageW - 20; // 10mm margins each side
    const usableH = pageH - 20;
    const w = AppState.cardWidth;
    const h = AppState.cardHeight;
    
    const autoCols = ps.colsAuto ? Math.floor(usableW / (w + ps.gapX)) : ps.cols;
    const autoRows = ps.rowsAuto ? Math.floor(usableH / (h + ps.gapY)) : ps.rows;
    const perPage = autoCols * autoRows;
    const totalCards = AppState.cards.length;
    const pages = Math.ceil(totalCards / perPage);

    const info = document.getElementById('print-layout-info');
    if (info) {
        info.innerHTML = `📐 <b>${autoCols} sl. × ${autoRows} řád.</b> = ${perPage} karet/strana<br>📄 Celkem <b>${pages} listů</b> (${pages * 2} stran oboustranně)<br>📏 Stránka: ${pageW}×${pageH} mm`;
    }
    
    // Store effective values
    ps._effectiveCols = autoCols;
    ps._effectiveRows = autoRows;
}

// --- DUPLEX PRINT EXPORT ---

// Globální proměnná pro tiskový HTML
let _printHtmlContent = '';

function closePrintPreview() {
    const overlay = document.getElementById('print-preview-overlay');
    if (overlay) overlay.style.display = 'none';
}

function printFromPreview() {
    // Otevřeme nové okno s čistým HTML pro tisk
    const printWin = window.open('', '_blank');
    if (!printWin) { alert("Povolte prosím vyskakovací okna pro tisk."); return; }
    printWin.document.open();
    printWin.document.write(_printHtmlContent);
    printWin.document.close();
}

async function exportPrintSheets() {

    // --- 1. Přepočítat nastavení tisku (čerstvé hodnoty z UI) ---
    const ps = AppState.printSettings || {};
    const orientation = ps.orientation || 'portrait';
    const pageW = orientation === 'portrait' ? 210 : 297;
    const pageH = orientation === 'portrait' ? 297 : 210;
    const marginMm = 10;
    const usableW = pageW - marginMm * 2;
    const usableH = pageH - marginMm * 2;

    const w = AppState.cardWidth;
    const h = AppState.cardHeight;
    const gapX = parseFloat(document.getElementById('print-gap-x')?.value) || 0;
    const gapY = parseFloat(document.getElementById('print-gap-y')?.value) || 0;
    
    const colsAutoEl = document.getElementById('cols-auto');
    const rowsAutoEl = document.getElementById('rows-auto');
    const colsAuto = colsAutoEl ? colsAutoEl.checked : true;
    const rowsAuto = rowsAutoEl ? rowsAutoEl.checked : true;
    
    const cols = colsAuto
        ? Math.max(1, Math.floor(usableW / (w + gapX)))
        : Math.max(1, parseInt(document.getElementById('print-cols')?.value) || 3);
    const rows = rowsAuto
        ? Math.max(1, Math.floor(usableH / (h + gapY)))
        : Math.max(1, parseInt(document.getElementById('print-rows')?.value) || 3);
    const perPage = cols * rows;

    if (perPage < 1) {
        alert("Karty jsou příliš velké na tento formát stránky.");
        return;
    }

    // --- 2. Vygenerovat HTML karet pro líc a rub ---
    const modeBackup = AppState.viewMode;
    const activeBackup = AppState.activeCardId;
    AppState.activeCardId = null;

    AppState.viewMode = 'front';
    renderGrid();
    await new Promise(r => setTimeout(r, 300));
    const frontEls = Array.from(document.getElementById('cards-grid').children)
        .map(el => el.outerHTML);

    AppState.viewMode = 'back';
    renderGrid();
    await new Promise(r => setTimeout(r, 300));
    const backEls = Array.from(document.getElementById('cards-grid').children)
        .map(el => el.outerHTML);

    AppState.viewMode = modeBackup;
    AppState.activeCardId = activeBackup;
    renderGrid();

    // --- 3. Sestavit čisté tiskové HTML (bez editačních CSS) ---
    // Sesbíráme jen externí CSS soubory (ne inline editorové styly)
    let linkTags = '';
    for (const sheet of document.styleSheets) {
        try { if (sheet.href) linkTags += `<link rel="stylesheet" href="${sheet.href}">\n`; } catch(e) {}
    }

    const totalCards = AppState.cards.length;
    const totalPages = Math.ceil(totalCards / perPage);

    // CSS pro tisk - izolovaný, přepíše vše co přijde z editoru
    const printCss = `
        *, *::before, *::after { box-sizing: border-box; }
        @page { size: ${pageW}mm ${pageH}mm; margin: ${marginMm}mm; }
        body { background: white; margin: 0; padding: 0; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
        .print-page {
            width: ${usableW}mm; height: ${usableH}mm; 
            margin: 0; padding: 0;
            display: flex; flex-wrap: wrap;
            align-content: flex-start; justify-content: flex-start;
            gap: ${gapY}mm ${gapX}mm;
            page-break-after: always; break-after: page;
            overflow: hidden; position: relative;
        }
        .print-page > * {
            width: ${w}mm !important;
            height: ${h}mm !important;
            min-width: ${w}mm !important;
            min-height: ${h}mm !important;
            max-width: ${w}mm !important;
            max-height: ${h}mm !important;
            flex-shrink: 0 !important;
            flex-grow: 0 !important;
            overflow: hidden !important;
            position: relative !important;
            /* Reset editor positioning */
            cursor: default !important;
        }
        /* Reset editor specific classes that would mess up mm sizing */
        .preview-card {
            width: ${w}mm !important;
            height: ${h}mm !important;
            border-radius: ${AppState.cardRadius}mm !important;
        }
        .card-label { display: none !important; }
        .drop-zone-overlay { display: none !important; }
        .card-bg img {
            width: 100% !important; height: 100% !important;
            object-fit: cover !important;
        }
    `;

    let pagesHtml = '';
    for (let p = 0; p < totalPages; p++) {
        const startIdx = p * perPage;
        const endIdx = Math.min(startIdx + perPage, totalCards);

        // LÍC
        pagesHtml += `<div class="print-page front-page">\n`;
        for (let i = startIdx; i < endIdx; i++) {
            pagesHtml += frontEls[i] + '\n';
        }
        pagesHtml += `</div>\n`;

        // RUB – horizontální zrcadlení po řádcích
        pagesHtml += `<div class="print-page back-page">\n`;
        let backItems = backEls.slice(startIdx, endIdx);
        let mirrored = [];
        const completeRows = Math.floor(backItems.length / cols);
        for (let r = 0; r < completeRows; r++) {
            mirrored.push(...backItems.slice(r * cols, (r+1) * cols).reverse());
        }
        const remaining = backItems.length % cols;
        if (remaining > 0) {
            const lastRow = backItems.slice(completeRows * cols).reverse();
            const pad = cols - remaining;
            const emptyCard = `<div style="width:${w}mm;height:${h}mm;flex-shrink:0;"></div>`;
            mirrored.push(...new Array(pad).fill(emptyCard), ...lastRow);
        }
        pagesHtml += mirrored.join('\n') + '\n';
        pagesHtml += `</div>\n`;
    }

    _printHtmlContent = `<!DOCTYPE html>
<html lang="cs">
<head>
    <meta charset="UTF-8">
    <title>Tiskové archy – ${AppState.projectName}</title>
    ${linkTags}
    <style>${printCss}</style>
</head>
<body>
${pagesHtml}
<script>window.onload = () => { setTimeout(() => { window.print(); }, 800); };<\/script>
</body></html>`;

    // --- 4. Zobrazit in-page preview ---
    const PX_PER_MM = 3.0; // měřítko pro náhled (menší než tisk)
    const previewPages = document.getElementById('print-preview-pages');
    previewPages.innerHTML = '';

    for (let p = 0; p < totalPages; p++) {
        const startIdx = p * perPage;
        const endIdx = Math.min(startIdx + perPage, totalCards);

        // LÍC stránka – karta stránky
        ['front', 'back'].forEach((side, sideIdx) => {
            const pageWrapper = document.createElement('div');
            pageWrapper.style.cssText = `
                background: white; 
                width: ${pageW * PX_PER_MM}px; height: ${pageH * PX_PER_MM}px;
                box-shadow: 0 8px 32px rgba(0,0,0,0.5);
                position: relative; overflow: hidden; flex-shrink: 0;
            `;

            // Štítek stránky
            const label = document.createElement('div');
            label.style.cssText = `position:absolute; top:-28px; left:0; font-size:12px; color:#aaa; font-weight:bold;`;
            label.textContent = `Strana ${p * 2 + sideIdx + 1} – ${side === 'front' ? 'LÍC' : 'RUB'}`;
            pageWrapper.appendChild(label);

            // Vnitřní oblast karet (s marginy)
            const inner = document.createElement('div');
            inner.style.cssText = `
                position: absolute;
                top: ${marginMm * PX_PER_MM}px; left: ${marginMm * PX_PER_MM}px;
                width: ${usableW * PX_PER_MM}px; height: ${usableH * PX_PER_MM}px;
                display: flex; flex-wrap: wrap;
                align-content: flex-start; justify-content: flex-start;
                gap: ${gapY * PX_PER_MM}px ${gapX * PX_PER_MM}px;
                overflow: hidden;
            `;

            let items = (side === 'front') ? frontEls.slice(startIdx, endIdx) : backEls.slice(startIdx, endIdx);
            
            if (side === 'back') {
                // Zrcadit
                let mirrored = [];
                const completeR = Math.floor(items.length / cols);
                for (let r = 0; r < completeR; r++) {
                    mirrored.push(...items.slice(r * cols, (r+1) * cols).reverse());
                }
                const rem = items.length % cols;
                if (rem > 0) {
                    const lastR = items.slice(completeR * cols).reverse();
                    const emptyHtml = `<div></div>`;
                    mirrored.push(...new Array(cols - rem).fill(emptyHtml), ...lastR);
                }
                items = mirrored;
            }

            items.forEach(html => {
                const wrapper = document.createElement('div');
                wrapper.style.cssText = `
                    width: ${w * PX_PER_MM}px !important;
                    height: ${h * PX_PER_MM}px !important;
                    min-width: ${w * PX_PER_MM}px; min-height: ${h * PX_PER_MM}px;
                    flex-shrink: 0; flex-grow: 0;
                    overflow: hidden; position: relative;
                    border-radius: ${AppState.cardRadius * PX_PER_MM}px;
                    outline: 1px solid rgba(0,0,0,0.15);
                `;
                wrapper.innerHTML = html;
                // Odstranit label a drop-zónu z preview
                wrapper.querySelectorAll('.card-label, .drop-zone-overlay').forEach(el => el.remove());
                // Škálujeme vnitřní obsah (karty jsou v UI renderované > v px)
                const inner2 = wrapper.querySelector('.preview-card');
                if (inner2) {
                    const scaleRatio = (w * PX_PER_MM) / inner2.offsetWidth || 1;
                    // Necháme přirozené přizpůsobení přes wrapper size
                }
                inner.appendChild(wrapper);
            });

            pageWrapper.appendChild(inner);
            previewPages.appendChild(pageWrapper);
        });
    }

    // Info lišta
    const infoBar = document.getElementById('preview-info-bar');
    if (infoBar) {
        infoBar.textContent = `${AppState.projectName} · ${totalPages} listů (${totalPages * 2} stran) · ${cols}×${rows} karet/strana · ${pageW}×${pageH} mm`;
    }

    // Zobrazit overlay
    const overlay = document.getElementById('print-preview-overlay');
    overlay.style.display = 'flex';
}

