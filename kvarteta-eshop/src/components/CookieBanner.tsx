import React, { useEffect, useState } from 'react';
import { updateConsent, type ConsentValue } from '../lib/analytics';
import { safeStorageGet } from '../lib/browserCompat';
import './CookieBanner.css';

const STORAGE_KEY = 'hromadovky_cookie_consent';

export const getCookieConsent = (): ConsentValue | null => {
    if (typeof window === 'undefined') return null;
    // safeStorage: volá se i z App při startu (nad ErrorBoundary) — Safari s blokovaným úložištěm hází
    const value = safeStorageGet('local', STORAGE_KEY);
    if (value === 'all' || value === 'necessary') return value;
    return null;
};

const CookieBanner: React.FC = () => {
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        if (getCookieConsent() === null) {
            setVisible(true);
        }
    }, []);

    const persistAndClose = (value: ConsentValue) => {
        try {
            localStorage.setItem(STORAGE_KEY, value);
        } catch {
            // Pokud localStorage není dostupný (private mode), prostě zavři banner.
        }
        updateConsent(value);
        setVisible(false);
    };

    if (!visible) return null;

    return (
        <div className="cookie-banner glass-panel" role="dialog" aria-label="Souhlas s cookies">
            <div className="cookie-banner-content">
                <div className="cookie-banner-text">
                    <h3>🍪 Tato stránka používá cookies</h3>
                    <p>
                        Pro nezbytné fungování e-shopu (košík, přihlášení) používáme jen technické cookies.
                        Pokud souhlasíte i s analytickými a marketingovými cookies, pomůžete nám web zlepšovat.
                        Více najdete v{' '}
                        <a href="/gdpr" target="_blank" rel="noopener noreferrer">
                            Zásadách ochrany osobních údajů
                        </a>.
                    </p>
                </div>
                <div className="cookie-banner-actions">
                    <button
                        type="button"
                        className="cookie-btn cookie-btn-secondary"
                        onClick={() => persistAndClose('necessary')}
                    >
                        Pouze nezbytné
                    </button>
                    <button
                        type="button"
                        className="cookie-btn cookie-btn-primary"
                        onClick={() => persistAndClose('all')}
                    >
                        Přijmout vše
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CookieBanner;
