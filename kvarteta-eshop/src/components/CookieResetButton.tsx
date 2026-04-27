import React, { useEffect, useState } from 'react';
import { getCookieConsent } from './CookieBanner';

const STORAGE_KEY = 'hromadovky_cookie_consent';

const labelFor = (value: 'all' | 'necessary' | null): string => {
    if (value === 'all') return 'Přijaty všechny cookies (nezbytné, analytické i marketingové)';
    if (value === 'necessary') return 'Přijaty pouze nezbytné cookies';
    return 'Souhlas zatím nebyl udělen — banner se zobrazí při příští návštěvě';
};

const CookieResetButton: React.FC = () => {
    const [current, setCurrent] = useState<'all' | 'necessary' | null>(null);

    useEffect(() => {
        setCurrent(getCookieConsent());
    }, []);

    const handleReset = () => {
        try {
            localStorage.removeItem(STORAGE_KEY);
        } catch {
            // localStorage nedostupný (private mode) — reload stejně banner ukáže
        }
        window.location.reload();
    };

    return (
        <div className="cookie-reset-box">
            <p className="cookie-reset-status">
                <strong>Aktuální stav:</strong> {labelFor(current)}
            </p>
            <button
                type="button"
                className="cookie-reset-btn"
                onClick={handleReset}
                disabled={current === null}
            >
                Změnit / odvolat souhlas s cookies
            </button>
        </div>
    );
};

export default CookieResetButton;
