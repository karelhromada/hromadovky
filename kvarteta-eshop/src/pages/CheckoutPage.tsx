import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import type { CartItem } from '../App';
import './CheckoutPage.css';
import { SHIPPING_CONFIG, AUTOMATION_CONFIG } from '../config/payment';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import { resetDraftRef } from '../lib/storage';
import { isValidIco, lookupAres } from '../lib/ares';
import { User, LogIn } from 'lucide-react';


// Declare Packeta global for TS
declare global {
    interface Window {
        Packeta: any;
    }
}

interface CheckoutPageProps {
    items: CartItem[];
    onClearCart: () => void;
}

const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('cs-CZ', { style: 'currency', currency: 'CZK', maximumFractionDigits: 0 }).format(amount);
};

const CheckoutPage: React.FC<CheckoutPageProps> = ({ items, onClearCart }) => {
    const navigate = useNavigate();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        street: '',
        city: '',
        zip: '',
        companyName: '',
        ico: '',
        dic: '',
        delivery: 'zasilkovna',
        payment: 'transfer',
        note: ''
    });
    const [isB2B, setIsB2B] = useState(false);
    const [aresStatus, setAresStatus] = useState<'idle' | 'loading' | 'ok' | 'invalid' | 'notfound'>('idle');
    const aresAbortRef = useRef<AbortController | null>(null);
    const [finalTotal, setFinalTotal] = useState(0);
    const [orderVS, setOrderVS] = useState<string>('');
    const [isSuccess, setIsSuccess] = useState(false);
    const { profile, user } = useAuth();
    const [pickupPoint, setPickupPoint] = useState<string | null>(null);
    const [showPickupModal, setShowPickupModal] = useState(false);
    const [agreedToTerms, setAgreedToTerms] = useState(false);

    // Pre-fill form from profile when it loads
    useEffect(() => {
        if (profile) {
            setFormData(prev => ({
                ...prev,
                firstName: profile.first_name || prev.firstName,
                lastName: profile.last_name || prev.lastName,
                email: profile.email || prev.email,
                phone: profile.phone || prev.phone,
                street: profile.street || prev.street,
                city: profile.city || prev.city,
                zip: profile.zip || prev.zip,
                delivery: profile.last_delivery || prev.delivery,
                payment: (profile.last_payment === 'card' ? 'transfer' : profile.last_payment) || prev.payment
            }));
            if (profile.last_delivery === 'ppl' || profile.last_delivery === 'zasilkovna') {
                // If we have saved pickup point in the future, we could prefill it here
            }
        }
    }, [profile]);

    useEffect(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' });

        // Load Zasilkovna script once on mount
        const packetaScript = document.createElement('script');
        packetaScript.src = 'https://widget.packeta.com/v6/www/js/library.js';
        packetaScript.async = true;
        document.body.appendChild(packetaScript);

        return () => {
            if (document.body.contains(packetaScript)) {
                document.body.removeChild(packetaScript);
            }
        };
    }, []);

    // Load PPL script and setup event listener
    useEffect(() => {
        if (formData.delivery === 'ppl') {
            const pplScript = document.createElement('script');
            pplScript.src = 'https://www.ppl.cz/sources/map/main.js';
            pplScript.async = true;
            document.body.appendChild(pplScript);

            const pplStyle = document.createElement('link');
            pplStyle.rel = 'stylesheet';
            pplStyle.href = 'https://www.ppl.cz/sources/map/main.css';
            document.head.appendChild(pplStyle);

            const handlePPLEvent = (e: any) => {
                const point = e.detail;
                if (point) {
                    const address = point.address || point.street || 
                                   (point.streetName ? `${point.streetName} ${point.streetNumber || ''}` : '') ||
                                   point.city;
                    
                    setPickupPoint(`PPL: ${point.name} ${address ? `(${address.trim()})` : ''}`);
                    setFormData((prev: any) => ({ 
                        ...prev, 
                        note: `${prev.note || ''} [PPL Point ID: ${point.code}]`.trim() 
                    }));
                }
            };
            window.addEventListener('ppl-parcelshop-map', handlePPLEvent);

            return () => {
                if (document.body.contains(pplScript)) document.body.removeChild(pplScript);
                if (document.head.contains(pplStyle)) document.head.removeChild(pplStyle);
                window.removeEventListener('ppl-parcelshop-map', handlePPLEvent);
            };
        }
    }, [formData.delivery]);

    const openZasilkovna = () => {
        if (!window.Packeta) {
            alert('Zásilkovna widget se ještě nenačetl, zkuste to prosím za sekundu.');
            return;
        }
        window.Packeta.Widget.pick(SHIPPING_CONFIG.ZASILKOVNA_API_KEY, (point: any) => {
            if (point) {
                setPickupPoint(`Zásilkovna: ${point.name} (${point.street})`);
                setFormData((prev: any) => ({ 
                    ...prev, 
                    note: prev.note + ` [Zásilkovna ID: ${point.id}]` 
                }));
            }
        }, {
            language: 'cs',
            primaryButtonColor: '#d4af37' // Matches gold theme
        });
    };

    const total = items.reduce((acc, item) => acc + (item.price * item.quantity), 0);
    const deliveryCost = formData.delivery === 'osobni' ? 0 : (formData.delivery === 'zasilkovna' ? 79 : 99);
    const paymentCost = formData.payment === 'cod' ? 39 : 0;
    const totalToPay = total + deliveryCost + paymentCost;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData((prev: any) => ({ ...prev, [name]: value }));
    };

    const handleIcoBlur = async () => {
        const ico = formData.ico.replace(/\s+/g, '');
        if (!ico) {
            setAresStatus('idle');
            return;
        }
        if (!isValidIco(ico)) {
            setAresStatus('invalid');
            return;
        }

        aresAbortRef.current?.abort();
        const controller = new AbortController();
        aresAbortRef.current = controller;

        setAresStatus('loading');
        try {
            const result = await lookupAres(ico, controller.signal);
            if (controller.signal.aborted) return;

            if (!result) {
                setAresStatus('notfound');
                return;
            }
            setFormData((prev: any) => ({
                ...prev,
                companyName: prev.companyName || result.companyName,
                dic: prev.dic || result.dic || '',
            }));
            setAresStatus('ok');
        } catch (error) {
            if (controller.signal.aborted) return;
            // Fail-soft — povolit pokračovat, jen oznámit, že ARES nedostupný.
            console.warn('ARES lookup failed:', error);
            setAresStatus('idle');
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        const photoPathsByItem = items.map(item => {
            const fromRecord = item.customPhotos ? Object.values(item.customPhotos) : [];
            const fromArray = item.customPhotoPaths ?? [];
            return [...fromArray, ...fromRecord];
        });
        const allPhotoPaths = photoPathsByItem.flat();
        const allRenderedPaths = items.flatMap(i => i.renderedCardPaths ?? []);

        const orderData = {
            customer: {
                ...formData,
                isB2B,
                companyName: isB2B ? formData.companyName : '',
                ico: isB2B ? formData.ico : '',
                dic: isB2B ? formData.dic : ''
            },
            items: items.map((item, idx) => ({
                id: item.id,
                name: item.name,
                quantity: item.quantity,
                price: item.price,
                total: item.price * item.quantity,
                options: {
                    back: item.selectedBack,
                    size: item.size,
                    note: item.note
                },
                customPhotos: item.customPhotos,
                customPhotoPaths: item.customPhotoPaths,
                photoPaths: photoPathsByItem[idx],
                renderedCardPaths: item.renderedCardPaths ?? [],
                cardBackRef: item.cardBackRef ?? null,
            })),
            allPhotoPaths,
            allRenderedPaths,
            totalAmount: total,
            timestamp: new Date().toISOString(),
            variableSymbol: Math.floor(Date.now() / 1000).toString()
        };

        try {
            // Odeslání do n8n (pro automatizaci emailů a evidenci)
            try {
                const response = await fetch(AUTOMATION_CONFIG.N8N_WEBHOOK_URL, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ 
                        ...orderData, 
                        totalToPay,
                        deliveryCost,
                        paymentCost,
                        pickupPoint 
                    }),
                });
                
                if (!response.ok) {
                    throw new Error(`N8N response error: ${response.status}`);
                }
            } catch (fetchError) {
                // Nechceme zastavit celou objednávku, pokud selže jen automatizace emailu,
                // ale chceme o tom vědět v logu.
                console.error('Chyba automatizace (n8n):', fetchError);
            }
            
            // Aktualizace profilu uživatele v Supabase (pokud je přihlášen)
            if (user) {
                try {
                    await supabase
                        .from('profiles')
                        .update({
                            first_name: formData.firstName,
                            last_name: formData.lastName,
                            phone: formData.phone,
                            street: formData.street,
                            city: formData.city,
                            zip: formData.zip,
                            last_delivery: formData.delivery,
                            last_payment: formData.payment,
                            updated_at: new Date().toISOString()
                        })
                        .eq('id', user.id);
                } catch (profileError) {
                    console.error('Chyba při aktualizaci profilu:', profileError);
                }

                // Uložení do historie objednávek (orders table)
                try {
                    await supabase
                        .from('orders')
                        .insert({
                            user_id: user.id,
                            items: items.map(item => ({
                                id: item.id,
                                name: item.name,
                                price: item.price,
                                quantity: item.quantity,
                                selectedBack: item.selectedBack,
                                size: item.size
                            })),
                            total_price: totalToPay,
                            delivery_info: {
                                method: formData.delivery,
                                pickupPoint: pickupPoint
                            },
                            payment_method: formData.payment
                        });
                } catch (orderError) {
                    console.error('Chyba při ukládání do historie objednávek:', orderError);
                }
            }
            
            await new Promise(resolve => setTimeout(resolve, 800)); // Simulace sítě

            setFinalTotal(totalToPay);
            setOrderVS(orderData.variableSymbol);

            onClearCart();
            resetDraftRef();
            setIsSuccess(true);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        } catch (error) {
            console.error('Chyba při odesílání objednávky:', error);
            alert('Nastala chyba při odesílání objednávky. Zkuste to prosím znovu.');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isSuccess) {
        return (
            <div className="checkout-success-container">
                <div className="success-card glass-panel animate-fade-in">
                    <div className="success-icon-wrap">
                        <div className="checkmark-circle">
                            <div className="checkmark draw"></div>
                        </div>
                    </div>
                    <h1>Objednávka odeslána!</h1>
                    <p>Děkujeme za váš nákup. Potvrzení jsme odeslali na <strong>{formData.email}</strong>.</p>
                    <div className="success-details">
                        <span>Číslo objednávky: <strong>#{orderVS}</strong></span>
                        <span>Celkem k úhradě: <strong>{formatCurrency(finalTotal)}</strong></span>
                    </div>

                    {formData.payment === 'transfer' && (
                        <div className="payment-transfer-instructions glass-panel">
                            <h3>🔍 Údaje pro platbu převodem</h3>
                            <div className="transfer-flex">
                                <div className="transfer-text">
                                    <p>Číslo účtu: <strong>670100-2202858274 / 6210</strong></p>
                                    <p>Variabilní symbol: <strong>{orderVS}</strong></p>
                                    <p>Částka: <strong>{formatCurrency(finalTotal)}</strong></p>
                                </div>
                                <div className="qr-code-wrap">
                                    <img 
                                        src={`https://api.paylibo.com/paylibo/generator/czech/image?accountNumber=2202858274&bankCode=6210&prefix=670100&amount=${finalTotal}&currency=CZK&vs=${orderVS}&size=250`}
                                        alt="QR Platba"
                                        className="qr-image"
                                    />
                                    <span>Naskenujte pro rychlou platbu</span>
                                </div>
                            </div>
                        </div>
                    )}

                    <button className="btn-primary" onClick={() => navigate('/')}>Zpět do obchodu</button>
                    <div className="confetti-container"></div>
                </div>
            </div>
        );
    }

    if (items.length === 0) {
        return (
            <div className="checkout-empty glass-panel">
                <h2>Váš košík je prázdný</h2>
                <p>Pro vytvoření objednávky musíte mít v košíku alespoň jednu položku.</p>
                <button className="btn-primary" onClick={() => navigate('/')}>Zpět do obchodu</button>
            </div>
        );
    }

    return (
        <div className="checkout-container">
            {showPickupModal && (
                <div className="modal-overlay" onClick={() => setShowPickupModal(false)}>
                    <div className="modal-content glass-panel" onClick={e => e.stopPropagation()}>
                        <h3>Vyberte výdejní místo</h3>
                        <div className="pickup-list">
                            {['AlzaBox - Praha 1 - Vodičkova', 'Z-BOX - Brno - Hlavní nádraží', 'Výdejní místo - Ostrava - Centrum', 'AlzaBox - Plzeň - Náměstí', 'Z-BOX - Liberec - OC Nisa'].map(point => (
                                <div key={point} className="pickup-option" onClick={() => {
                                    setPickupPoint(point);
                                    setShowPickupModal(false);
                                }}>
                                    <span>{point}</span>
                                    <span className="btn-text">Vybrat</span>
                                </div>
                            ))}
                        </div>
                        <button className="btn-text" onClick={() => setShowPickupModal(false)}>Zrušit</button>
                    </div>
                </div>
            )}
            <div className="checkout-layout">
                <div className="checkout-form-section glass-panel">
                    {!user && (
                        <div className="login-promo glass-panel animate-fade-in">
                            <div className="promo-content">
                                <LogIn size={20} className="promo-icon" />
                                <div>
                                    <p><strong>Ušetřete čas příště!</strong></p>
                                    <p className="small">Přihlaste se a my si vaše údaje zapamatujeme.</p>
                                </div>
                            </div>
                            <button type="button" className="btn-text" onClick={() => navigate('/login')}>Přihlásit se</button>
                        </div>
                    )}
                    <div className="section-header-flex">
                        <h2>Kontaktní údaje</h2>
                        {user && <span className="user-badge"><User size={14} /> Přihlášen: {profile?.first_name || user.email}</span>}
                    </div>
                    <form onSubmit={handleSubmit} className="checkout-form">
                        <div className="form-row">
                            <div className="form-group">
                                <label>Jméno</label>
                                <input type="text" name="firstName" value={formData.firstName} onChange={handleChange} required placeholder="Jan" />
                            </div>
                            <div className="form-group">
                                <label>Příjmení</label>
                                <input type="text" name="lastName" value={formData.lastName} onChange={handleChange} required placeholder="Novák" />
                            </div>
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <label>Email</label>
                                <input type="email" name="email" value={formData.email} onChange={handleChange} required placeholder="jan.novak@email.cz" />
                            </div>
                            <div className="form-group">
                                <label>Telefon</label>
                                <input type="tel" name="phone" value={formData.phone} onChange={handleChange} required placeholder="+420 123 456 789" />
                            </div>
                        </div>

                        <div className="form-group checkout-b2b-toggle">
                            <label className="checkout-consent-label">
                                <input
                                    type="checkbox"
                                    checked={isB2B}
                                    onChange={(e) => {
                                        setIsB2B(e.target.checked);
                                        if (!e.target.checked) {
                                            setAresStatus('idle');
                                        }
                                    }}
                                />
                                <span>Nakupuji na firmu (uvést IČO/DIČ na faktuře)</span>
                            </label>
                        </div>

                        {isB2B && (
                            <div className="b2b-section animate-fade-in">
                                <div className="form-group">
                                    <label>Název firmy</label>
                                    <input type="text" name="companyName" value={formData.companyName} onChange={handleChange} placeholder="ACME s.r.o." />
                                </div>
                                <div className="form-row">
                                    <div className="form-group">
                                        <label>IČO</label>
                                        <input
                                            type="text"
                                            name="ico"
                                            value={formData.ico}
                                            onChange={handleChange}
                                            onBlur={handleIcoBlur}
                                            placeholder="12345678"
                                            inputMode="numeric"
                                            maxLength={8}
                                        />
                                        {aresStatus === 'loading' && <span className="ares-status">Ověřuji v ARES…</span>}
                                        {aresStatus === 'ok' && <span className="ares-status ares-ok">✓ Údaje vyplněny z ARES</span>}
                                        {aresStatus === 'invalid' && <span className="error-text">Neplatné IČO</span>}
                                        {aresStatus === 'notfound' && <span className="error-text">IČO v ARES nenalezeno (lze pokračovat)</span>}
                                    </div>
                                    <div className="form-group">
                                        <label>DIČ (nepovinné)</label>
                                        <input type="text" name="dic" value={formData.dic} onChange={handleChange} placeholder="CZ12345678" />
                                    </div>
                                </div>
                            </div>
                        )}

                        {formData.delivery === 'gls' && (
                            <div className="address-section animate-fade-in">
                                <h2>Doručovací adresa</h2>
                                <div className="form-group">
                                    <label>Ulice a číslo popisné</label>
                                    <input type="text" name="street" value={formData.street} onChange={handleChange} required placeholder="Vodičkova 123" />
                                </div>
                                <div className="form-row">
                                    <div className="form-group" style={{ flex: 2 }}>
                                        <label>Město</label>
                                        <input type="text" name="city" value={formData.city} onChange={handleChange} required placeholder="Praha" />
                                    </div>
                                    <div className="form-group" style={{ flex: 1 }}>
                                        <label>PSČ</label>
                                        <input type="text" name="zip" value={formData.zip} onChange={handleChange} required placeholder="110 00" />
                                    </div>
                                </div>
                            </div>
                        )}

                        {formData.delivery === 'zasilkovna' && (
                            <div className="form-group checkout-pickup-section">
                                <label>Výdejní místo Zásilkovna</label>
                                <div className="pickup-selector-container">
                                    {pickupPoint && pickupPoint.includes('Zásilkovna') ? (
                                        <div className="selected-pickup-info">
                                            <span className="pickup-name">📍 {pickupPoint}</span>
                                            <button type="button" className="btn-text" onClick={openZasilkovna}>Změnit</button>
                                        </div>
                                    ) : (
                                        <button type="button" className="btn-secondary btn-pickup" onClick={openZasilkovna}>
                                            Vybrat výdejní místo na mapě
                                        </button>
                                    )}
                                    {(!pickupPoint || !pickupPoint.includes('Zásilkovna')) && <span className="error-text">Prosím vyberte výdejní místo</span>}
                                </div>
                            </div>
                        )}

                        {formData.delivery === 'ppl' && (
                            <div className="form-group checkout-pickup-section">
                                <label>PPL ParcelShop / Box</label>
                                <div className="pickup-selector-container" style={{ minHeight: pickupPoint ? 'auto' : '600px', display: 'block', padding: '10px' }}>
                                    {pickupPoint && pickupPoint.includes('PPL') && (
                                        <div className="selected-pickup-info" style={{ marginBottom: '15px' }}>
                                            <span className="pickup-name">📍 {pickupPoint}</span>
                                            <button type="button" className="btn-text" onClick={() => setPickupPoint(null)}>Změnit</button>
                                        </div>
                                    )}
                                    <div 
                                        className="ppl-container-wrapper" 
                                        style={{ display: pickupPoint && pickupPoint.includes('PPL') ? 'none' : 'block' }}
                                    >
                                        <div id="ppl-parcelshop-map" data-language="cs" style={{ height: '600px', width: '100%', borderRadius: '12px', border: '1px solid var(--glass-border)', background: 'rgba(0,0,0,0.1)' }}></div>
                                    </div>
                                    {(!pickupPoint || !pickupPoint.includes('PPL')) && <span className="error-text">Vyberte výdejní místo přímo na mapě</span>}
                                </div>
                            </div>
                        )}

                        <h2>Doprava a platba</h2>
                        <div className="form-row">
                            <div className="form-group">
                                <label>Doprava</label>
                                <select name="delivery" value={formData.delivery} onChange={handleChange}>
                                    <option value="gls">GLS - na adresu (99 Kč)</option>
                                    <option value="zasilkovna">Zásilkovna (79 Kč)</option>
                                    <option value="ppl">PPL ParcelShop (99 Kč)</option>
                                    <option value="osobni">Osobní odběr (Zdarma)</option>
                                </select>
                            </div>
                            <div className="form-group">
                                <label>Platba</label>
                                <select name="payment" value={formData.payment} onChange={handleChange}>
                                    <option value="transfer">QR kód / Bankovní převod</option>
                                    <option value="cod">Dobírka (+39 Kč)</option>
                                </select>
                            </div>
                        </div>

                        <div className="form-group">
                            <label>Poznámka k objednávce</label>
                            <textarea name="note" value={formData.note} onChange={handleChange} placeholder="Např. kód brány, specifické přání..." rows={3} />
                        </div>

                        <div className="form-group checkout-consent">
                            <label className="checkout-consent-label">
                                <input
                                    type="checkbox"
                                    checked={agreedToTerms}
                                    onChange={(e) => setAgreedToTerms(e.target.checked)}
                                    required
                                />
                                <span>
                                    Souhlasím s{' '}
                                    <a href="/obchodni-podminky" target="_blank" rel="noopener noreferrer">obchodními podmínkami</a>
                                    {' '}a{' '}
                                    <a href="/reklamacni-rad" target="_blank" rel="noopener noreferrer">reklamačním řádem</a>.
                                </span>
                            </label>
                            <p className="checkout-consent-info">
                                Odesláním objednávky berete na vědomí, že vaše osobní údaje budou zpracovány
                                pro účely vyřízení objednávky podle{' '}
                                <a href="/gdpr" target="_blank" rel="noopener noreferrer">Zásad ochrany osobních údajů</a>.
                            </p>
                        </div>

                        <button
                            type="submit"
                            className="btn-primary btn-submit"
                            disabled={isSubmitting || !agreedToTerms || (['zasilkovna', 'ppl'].includes(formData.delivery) && !pickupPoint)}
                        >
                            {isSubmitting ? 'Odesílám...' : `Dokončit objednávku (${formatCurrency(totalToPay)})`}
                        </button>
                    </form>
                </div>

                <div className="order-summary-section glass-panel">
                    <h2>Shrnutí objednávky</h2>
                    <div className="summary-items">
                        {items.map(item => (
                            <div key={`${item.id}-${item.selectedBack}-${item.size}`} className="summary-item">
                                <div className="summary-info">
                                    <span className="summary-name">
                                        {item.name} <span className="qty">x{item.quantity}</span>
                                        {item.selectedBack && (
                                            <div className="summary-option">Rub: {item.selectedBack}</div>
                                        )}
                                    </span>
                                    <span className="summary-price">{formatCurrency(item.price * item.quantity)}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="summary-total">
                        <div className="total-row">
                            <span>Mezisoučet:</span>
                            <span>{formatCurrency(total)}</span>
                        </div>
                        <div className="total-row">
                            <span>Doprava:</span>
                            <span>{formData.delivery === 'osobni' ? 'Zdarma' : (formData.delivery === 'zasilkovna' ? '79 Kč' : '99 Kč')}</span>
                        </div>
                        {formData.payment === 'cod' && (
                            <div className="total-row">
                                <span>Příplatek za dobírku:</span>
                                <span>39 Kč</span>
                            </div>
                        )}
                        <div className="total-row grand-total">
                            <span>Celkem k úhradě:</span>
                            <span className="text-gradient-gold">{formatCurrency(totalToPay)}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CheckoutPage;
