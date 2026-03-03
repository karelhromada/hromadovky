import React from 'react';
import type { CartItem } from '../App';
import './Cart.css';

interface CartProps {
    isOpen: boolean;
    onClose: () => void;
    items: CartItem[];
    onRemove: (id: string, selectedBack?: string, size?: string) => void;
    onUpdateQuantity: (id: string, amount: number, selectedBack?: string, size?: string) => void;
}

const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('cs-CZ', { style: 'currency', currency: 'CZK', maximumFractionDigits: 0 }).format(amount);
};

const Cart: React.FC<CartProps> = ({ isOpen, onClose, items, onRemove, onUpdateQuantity }) => {
    const total = items.reduce((acc, item) => acc + (item.price * item.quantity), 0);

    return (
        <>
            <div className={`cart-overlay ${isOpen ? 'open' : ''}`} onClick={onClose} />
            <div className={`cart-drawer glass-panel ${isOpen ? 'open' : ''}`}>
                <div className="cart-header">
                    <h2>Váš Košík</h2>
                    <button className="close-btn" onClick={onClose} aria-label="Zavřít">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="18" y1="6" x2="6" y2="18"></line>
                            <line x1="6" y1="6" x2="18" y2="18"></line>
                        </svg>
                    </button>
                </div>

                <div className="cart-items">
                    {items.length === 0 ? (
                        <div className="empty-cart">
                            <p>Váš košík je zatím prázdný.</p>
                            <button className="btn-continue" onClick={onClose}>Zpět k výběru</button>
                        </div>
                    ) : (
                        items.map(item => (
                            <div key={`${item.id}-${item.selectedBack || 'default'}-${item.size || 'default'}`} className="cart-item glass-panel">
                                {item.image && (
                                    <div className="item-image">
                                        <img src={Array.isArray(item.image) ? item.image[0] : item.image} alt={item.name} className="cart-item-img" />
                                    </div>
                                )}
                                <div className="item-details" style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                    <h4 style={{ fontSize: '1.05rem', fontWeight: 700, margin: 0, color: 'var(--text-primary)', paddingRight: '2rem' }}>{item.name}</h4>

                                    {/* Mini Recap for Custom Cards */}
                                    {(item.groupName || item.statShape || item.style || item.note || item.hideStats || item.customPhotos) && (
                                        <div style={{ background: 'rgba(212,175,55,0.05)', borderRadius: '8px', padding: '10px', fontSize: '0.85rem', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '4px', border: '1px solid rgba(212,175,55,0.1)' }}>
                                            {item.groupName && <div><strong>Sada:</strong> {item.groupName}</div>}
                                            {item.statShape && item.statLayout && !item.hideStats && (
                                                <div><strong>Vlastnosti:</strong> {item.statShape} - {item.statLayout}</div>
                                            )}
                                            {item.hideStats && (
                                                <div style={{ color: '#d97706' }}><strong>Vlastnosti:</strong> Skryté (čisté fotky)</div>
                                            )}
                                            {item.customPhotos && Object.keys(item.customPhotos).length > 0 && (
                                                <div style={{ color: 'var(--accent-gold)' }}><strong>Fotografie:</strong> Vlastní ({Object.keys(item.customPhotos).length}/32)</div>
                                            )}
                                            {item.customCardNames && Object.keys(item.customCardNames).length > 0 && (
                                                <div style={{ color: 'var(--accent-gold)' }}><strong>Názvy karet:</strong> Vlastní ({Object.keys(item.customCardNames).length}/32)</div>
                                            )}
                                            {item.customDescriptions && Object.keys(item.customDescriptions).length > 0 && (
                                                <div style={{ color: 'var(--accent-gold)' }}><strong>Popisky karet:</strong> Vlastní ({Object.keys(item.customDescriptions).length}/32)</div>
                                            )}
                                            {item.customStatLayouts && Object.keys(item.customStatLayouts).length > 0 && !item.hideStats && (
                                                <div style={{ color: 'var(--accent-gold)' }}><strong>Rozložení vlastností:</strong> Vlastní ({Object.keys(item.customStatLayouts).length}/32)</div>
                                            )}
                                            {item.customStats && Object.keys(item.customStats).length > 0 && !item.hideStats && (
                                                <div style={{ color: 'var(--accent-gold)' }}><strong>Hodnoty vlastností:</strong> Upraveno pro {Object.keys(item.customStats).length}/32 karet</div>
                                            )}
                                            {item.style && <div><strong>Styl:</strong> {item.style}</div>}
                                            {item.note && <div style={{ marginTop: '4px', fontStyle: 'italic', color: '#64748b' }}>"{item.note}"</div>}
                                        </div>
                                    )}

                                    {item.selectedBack && (
                                        <div className="item-back-info" style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                                            <span style={{ fontWeight: 600 }}>Vybraný rub:</span>
                                            <img src={item.selectedBack} alt="Zadní strana" style={{ width: '24px', height: '34px', borderRadius: '4px', objectFit: 'cover', border: '1px solid rgba(0,0,0,0.1)', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }} />
                                        </div>
                                    )}
                                    {item.size && (
                                        <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                                            <span style={{ fontWeight: 600 }}>Rozměr karet:</span> {item.size}
                                        </div>
                                    )}
                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 'auto' }}>
                                        <div className="item-price" style={{ color: 'var(--accent-gold)', fontWeight: 800, fontSize: '1.1rem' }}>{formatCurrency(item.price)}</div>
                                        <div className="quantity-controls" style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'var(--glass-bg)', padding: '4px', borderRadius: '8px', border: '1px solid var(--glass-border)' }}>
                                            <button onClick={() => onUpdateQuantity(item.id, -1, item.selectedBack, item.size)} style={{ width: '28px', height: '28px', borderRadius: '6px', border: 'none', background: 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', color: 'var(--text-primary)' }}>-</button>
                                            <span style={{ fontWeight: 600, minWidth: '20px', textAlign: 'center' }}>{item.quantity}</span>
                                            <button onClick={() => onUpdateQuantity(item.id, 1, item.selectedBack, item.size)} style={{ width: '28px', height: '28px', borderRadius: '6px', border: 'none', background: 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', color: 'var(--text-primary)' }}>+</button>
                                        </div>
                                    </div>
                                </div>
                                <button className="remove-btn" onClick={() => onRemove(item.id, item.selectedBack, item.size)} aria-label="Smazat položku">
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <polyline points="3 6 5 6 21 6"></polyline>
                                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                                    </svg>
                                </button>
                            </div>
                        ))
                    )}
                </div>

                {items.length > 0 && (
                    <div className="cart-footer">
                        <div className="cart-total">
                            <span>Celkem:</span>
                            <span className="text-gradient-gold total-amount">{formatCurrency(total)}</span>
                        </div>
                        <button className="btn-checkout">Přejít k pokladně</button>
                    </div>
                )}
            </div>
        </>
    );
};

export default Cart;
