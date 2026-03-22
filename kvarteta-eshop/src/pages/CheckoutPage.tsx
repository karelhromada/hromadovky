import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import type { CartItem } from '../App';
import './CheckoutPage.css';

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
        delivery: 'zasilkovna',
        payment: 'card',
        note: ''
    });
    const [isSuccess, setIsSuccess] = useState(false);
    const [pickupPoint, setPickupPoint] = useState<string | null>(null);
    const [showPickupModal, setShowPickupModal] = useState(false);

    useEffect(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }, []);

    const total = items.reduce((acc, item) => acc + (item.price * item.quantity), 0);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        const orderData = {
            customer: formData,
            items: items.map(item => ({
                id: item.id,
                name: item.name,
                quantity: item.quantity,
                price: item.price,
                total: item.price * item.quantity,
                options: {
                    back: item.selectedBack,
                    size: item.size,
                    note: item.note
                }
            })),
            totalAmount: total,
            timestamp: new Date().toISOString()
        };

        try {
            // TADY BUDE TVŮJ N8N WEBHOOK URL
            const N8N_WEBHOOK_URL = 'https://tvuj-n8n-na-hostingeru.com/webhook/objednavka';
            
            console.log(`Odesílám objednávku na: ${N8N_WEBHOOK_URL}`, orderData);
            
            // Odeslání do n8n (zatím jen s try/catch ochranou pro vývoj)
            try {
                /*
                await fetch(N8N_WEBHOOK_URL, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(orderData)
                });
                */
            } catch (fetchError) {
                console.warn('Síťová chyba (n8n pravděpodobně ještě není připojen):', fetchError);
            }
            
            await new Promise(resolve => setTimeout(resolve, 1500)); // Simulace sítě

            await new Promise(resolve => setTimeout(resolve, 1500)); // Simulace sítě

            onClearCart();
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
                        <span>Číslo objednávky: <strong>#{Math.floor(100000 + Math.random() * 900000)}</strong></span>
                        <span>Celkem k úhradě: <strong>{formatCurrency(total + (formData.delivery === 'osobni' ? 0 : (formData.delivery === 'zasilkovna' ? 79 : 99)))}</strong></span>
                    </div>
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
                    <h2>Kontaktní údaje</h2>
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

                        <h2>Doručovací adresa</h2>
                        <div className="form-group">
                            <label>Ulice a číslo popisné</label>
                            <input type="text" name="street" value={formData.street} onChange={handleChange} required placeholder="Vodičkova 123" />
                        </div>
                        <div className="form-row">
                            <div className="form-group" style={{ flex: 2 }}>
                                <label>Město</label>
                                <input type="text" name="city" value={formData.city} onChange={handleChange} required={formData.delivery !== 'zasilkovna'} placeholder="Praha" />
                            </div>
                            <div className="form-group" style={{ flex: 1 }}>
                                <label>PSČ</label>
                                <input type="text" name="zip" value={formData.zip} onChange={handleChange} required={formData.delivery !== 'zasilkovna'} placeholder="110 00" />
                            </div>
                        </div>

                        {formData.delivery === 'zasilkovna' && (
                            <div className="form-group checkout-pickup-section">
                                <label>Výdejní místo</label>
                                <div className="pickup-selector-container">
                                    {pickupPoint ? (
                                        <div className="selected-pickup-info">
                                            <span className="pickup-name">📍 {pickupPoint}</span>
                                            <button type="button" className="btn-text" onClick={() => setShowPickupModal(true)}>Změnit</button>
                                        </div>
                                    ) : (
                                        <button type="button" className="btn-secondary btn-pickup" onClick={() => setShowPickupModal(true)}>
                                            Vybrat výdejní místo
                                        </button>
                                    )}
                                    {!pickupPoint && <span className="error-text">Prosím vyberte výdejní místo</span>}
                                </div>
                            </div>
                        )}

                        <h2>Doprava a platba</h2>
                        <div className="form-row">
                            <div className="form-group">
                                <label>Doprava</label>
                                <select name="delivery" value={formData.delivery} onChange={handleChange}>
                                    <option value="zasilkovna">Zásilkovna (79 Kč)</option>
                                    <option value="ppl">PPL (99 Kč)</option>
                                    <option value="osobni">Osobní odběr (Zdarma)</option>
                                </select>
                            </div>
                            <div className="form-group">
                                <label>Platba</label>
                                <select name="payment" value={formData.payment} onChange={handleChange}>
                                    <option value="card">Kartou online</option>
                                    <option value="transfer">Bankovní převod</option>
                                    <option value="cod">Dobírka</option>
                                </select>
                            </div>
                        </div>

                        <div className="form-group">
                            <label>Poznámka k objednávce</label>
                            <textarea name="note" value={formData.note} onChange={handleChange} placeholder="Např. kód brány, specifické přání..." rows={3} />
                        </div>

                        <button 
                            type="submit" 
                            className="btn-primary btn-submit" 
                            disabled={isSubmitting || (formData.delivery === 'zasilkovna' && !pickupPoint)}
                        >
                            {isSubmitting ? 'Odesílám...' : `Dokončit objednávku (${formatCurrency(total + (formData.delivery === 'osobni' ? 0 : (formData.delivery === 'zasilkovna' ? 79 : 99)))})`}
                        </button>
                    </form>
                </div>

                <div className="order-summary-section glass-panel">
                    <h2>Shrnutí objednávky</h2>
                    <div className="summary-items">
                        {items.map(item => (
                            <div key={`${item.id}-${item.selectedBack}-${item.size}`} className="summary-item">
                                <div className="summary-info">
                                    <span className="summary-name">{item.name} <span className="qty">x{item.quantity}</span></span>
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
                        <div className="total-row grand-total">
                            <span>Celkem k úhradě:</span>
                            <span className="text-gradient-gold">{formatCurrency(total + (formData.delivery === 'osobni' ? 0 : (formData.delivery === 'zasilkovna' ? 79 : 99)))}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CheckoutPage;
