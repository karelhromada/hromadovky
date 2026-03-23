import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { LogIn, UserPlus, Mail, Lock, Loader2, ArrowLeft, LogOut, User as UserIcon } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import './AuthPage.css';

const AuthPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, profile, signOut, loading: contextLoading } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState(false);
  const [orders, setOrders] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [editFormData, setEditFormData] = useState<any>({});
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: ''
  });

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({
          email: formData.email,
          password: formData.password,
        });
        if (error) throw error;
        navigate('/pokladna');
      } else {
        const { error } = await supabase.auth.signUp({
          email: formData.email,
          password: formData.password,
          options: {
            data: {
              first_name: formData.firstName,
              last_name: formData.lastName,
            }
          }
        });
        if (error) throw error;
        setSuccessMessage('Váš účet byl úspěšně vytvořen! Nyní se můžete přihlásit a využívat všech výhod.');
      }
    } catch (err: any) {
      setError(err.message || 'Nastala chyba při autentizaci');
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    setLoading(true);
    await signOut();
    setLoading(false);
  };

  useEffect(() => {
    if (user) {
      fetchOrders();
      if (profile) {
        setEditFormData({
          first_name: profile.first_name || '',
          last_name: profile.last_name || '',
          phone: profile.phone || '',
          street: profile.street || '',
          city: profile.city || '',
          zip: profile.zip || '',
          last_delivery: profile.last_delivery || 'gls'
        });
      }
    }
  }, [user, profile]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { error } = await supabase
        .from('profiles')
        .update(editFormData)
        .eq('id', user?.id);

      if (error) throw error;
      setEditing(false);
      // Wait for AuthContext to refresh profile automatically or manually trigge it if needed
    } catch (err: any) {
      setError(err.message || 'Chyba při ukládání profilu');
    } finally {
      setLoading(false);
    }
  };

  const fetchOrders = async () => {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setOrders(data || []);
    } catch (err) {
      console.error('Error fetching orders:', err);
    }
  };

  if (contextLoading) {
    return (
      <div className="auth-container">
        <Loader2 className="animate-spin" size={48} color="var(--accent-gold)" />
      </div>
    );
  }

  if (user) {
    return (
      <div className="auth-container">
        <button className="btn-back" onClick={() => navigate(-1)}>
          <ArrowLeft size={20} /> Zpět
        </button>

        <div className="auth-card glass-panel animate-fade-in">
          <div className="auth-header">
            <div className="auth-icon-wrap">
              <UserIcon size={32} />
            </div>
            <h1>Váš profil</h1>
            <p className="email-label">{user.email}</p>
          </div>

          {editing ? (
            <form onSubmit={handleUpdateProfile} className="profile-edit-form">
              <div className="form-row">
                <div className="form-group">
                  <label>Jméno</label>
                  <input 
                    type="text" 
                    value={editFormData.first_name} 
                    onChange={e => setEditFormData({...editFormData, first_name: e.target.value})} 
                  />
                </div>
                <div className="form-group">
                  <label>Příjmení</label>
                  <input 
                    type="text" 
                    value={editFormData.last_name} 
                    onChange={e => setEditFormData({...editFormData, last_name: e.target.value})} 
                  />
                </div>
              </div>
              <div className="form-group">
                <label>Telefon</label>
                <input 
                  type="text" 
                  value={editFormData.phone} 
                  onChange={e => setEditFormData({...editFormData, phone: e.target.value})} 
                />
              </div>

                <div className="form-group">
                <label>Způsob dopravy</label>
                <select 
                  value={editFormData.last_delivery} 
                  onChange={e => setEditFormData({...editFormData, last_delivery: e.target.value})}
                  className="profile-select"
                >
                  <option value="gls">GLS - na adresu</option>
                  <option value="zasilkovna">Zásilkovna - výdejní místo</option>
                  <option value="ppl">PPL ParcelShop - výdejní místo</option>
                  <option value="osobne">Osobní odběr (Liberec/Praha)</option>
                </select>
              </div>

              {editFormData.last_delivery === 'gls' && (
                <div className="address-fields animate-fade-in">
                  <div className="form-group">
                    <label>Ulice a č.p.</label>
                    <input 
                      type="text" 
                      value={editFormData.street} 
                      onChange={e => setEditFormData({...editFormData, street: e.target.value})} 
                    />
                  </div>
                  <div className="form-row">
                    <div className="form-group">
                      <label>Město</label>
                      <input 
                        type="text" 
                        value={editFormData.city} 
                        onChange={e => setEditFormData({...editFormData, city: e.target.value})} 
                      />
                    </div>
                    <div className="form-group">
                      <label>PSČ</label>
                      <input 
                        type="text" 
                        value={editFormData.zip} 
                        onChange={e => setEditFormData({...editFormData, zip: e.target.value})} 
                      />
                    </div>
                  </div>
                </div>
              )}

              <div className="edit-actions">
                <button type="submit" className="btn-primary" disabled={loading}>Uložit změny</button>
                <button type="button" className="btn-text" onClick={() => setEditing(false)}>Zrušit</button>
              </div>
            </form>
          ) : (
            <>
              <div className="profile-details">
                <div className="profile-row">
                  <div className="profile-item">
                    <label>Jméno a příjmení</label>
                    <p>{profile?.first_name} {profile?.last_name || '-'}</p>
                  </div>
                  <button className="edit-trigger" onClick={() => setEditing(true)}>Editovat profil</button>
                </div>
                {profile?.phone && (
                  <div className="profile-item">
                    <label>Telefon</label>
                    <p>{profile.phone}</p>
                  </div>
                )}
                {profile?.last_delivery && (
                  <div className="profile-item">
                    <label>Preferovaná doprava</label>
                    <p>
                      {profile.last_delivery === 'ppl' ? 'PPL ParcelShop' : 
                       profile.last_delivery === 'zasilkovna' ? 'Zásilkovna' :
                       profile.last_delivery === 'osobne' ? 'Osobní odběr' : 'GLS na adresu'}
                    </p>
                  </div>
                )}
                {profile?.last_delivery === 'gls' && profile?.street && (
                  <div className="profile-item">
                    <label>Dodací adresa</label>
                    <p>{profile.street}, {profile.city} {profile.zip}</p>
                  </div>
                )}
              </div>

              <div className="order-history-section">
                <h2 className="section-title">Historie objednávek</h2>
                {orders.length === 0 ? (
                  <p className="no-orders">Zatím jste neudělali žádnou objednávku.</p>
                ) : (
                  <div className="order-list">
                    {orders.map(order => (
                      <div key={order.id} className="order-card glass-panel">
                        <div className="order-header">
                          <span className="order-date">{new Date(order.created_at).toLocaleDateString('cs-CZ')}</span>
                          <span className="order-price">{order.total_price} Kč</span>
                        </div>
                        <div className="order-items-summary">
                          {order.items.map((item: any, idx: number) => (
                            <div key={idx} className="order-item-row">
                              <span className="item-name">{item.name} {item.size ? `(${item.size})` : ''}</span>
                              <span className="item-qty">{item.quantity} ks</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="auth-actions" style={{ display: 'flex', flexWrap: 'wrap', gap: '15px', marginTop: '30px' }}>
                <button className="btn-secondary" style={{ flex: 1 }} onClick={() => navigate('/pokladna')}>
                  Košík a pokladna
                </button>
                <button className="btn-secondary logout-btn" style={{ flex: 1 }} onClick={handleSignOut} disabled={loading}>
                  {loading ? <Loader2 className="animate-spin" /> : <><LogOut size={16} /> Odhlásit se</>}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    );
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  return (
    <div className="auth-container">
      <button className="btn-back" onClick={() => navigate(-1)}>
        <ArrowLeft size={20} /> Zpět
      </button>

      <div className="auth-card glass-panel animate-fade-in">
        <div className="auth-header">
          <div className="auth-icon-wrap">
            {isLogin ? <LogIn size={32} /> : <UserPlus size={32} />}
          </div>
          <h1>{isLogin ? 'Přihlášení' : 'Registrace'}</h1>
          <p>{isLogin ? 'Vítejte zpět v Hromadovkách' : 'Staňte se členem a nakupujte rychleji'}</p>
        </div>

        {successMessage ? (
          <div className="auth-success-view animate-fade-in">
            <div className="success-icon-check">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
            </div>
            <p>{successMessage}</p>
            <button className="btn-primary" onClick={() => {
              setSuccessMessage(null);
              setIsLogin(true);
            }}>
              Přejít k přihlášení
            </button>
          </div>
        ) : (
          <form onSubmit={handleAuth} className="auth-form">
          {!isLogin && (
            <div className="form-row">
              <div className="form-group">
                <label>Jméno</label>
                <input 
                  type="text" 
                  name="firstName" 
                  value={formData.firstName} 
                  onChange={handleChange} 
                  required={!isLogin} 
                  placeholder="Jan"
                />
              </div>
              <div className="form-group">
                <label>Příjmení</label>
                <input 
                  type="text" 
                  name="lastName" 
                  value={formData.lastName} 
                  onChange={handleChange} 
                  required={!isLogin} 
                  placeholder="Novák"
                />
              </div>
            </div>
          )}

          <div className="form-group">
            <label>E-mail</label>
            <div className="input-with-icon">
              <Mail size={18} className="input-icon" />
              <input 
                type="email" 
                name="email" 
                value={formData.email} 
                onChange={handleChange} 
                required 
                placeholder="vas@email.cz"
              />
            </div>
          </div>

          <div className="form-group">
            <label>Heslo</label>
            <div className="input-with-icon">
              <Lock size={18} className="input-icon" />
              <input 
                type="password" 
                name="password" 
                value={formData.password} 
                onChange={handleChange} 
                required 
                placeholder="••••••••"
                minLength={6}
              />
            </div>
          </div>

          {error && <div className="auth-error animate-shake">{error}</div>}

          <button type="submit" className="btn-primary auth-submit" disabled={loading}>
            {loading ? <Loader2 className="animate-spin" /> : (isLogin ? 'Přihlásit se' : 'Vytvořit účet')}
          </button>
        </form>
        )}

        {!successMessage && (
        <div className="auth-footer">
          <p>
            {isLogin ? 'Ještě nemáte účet?' : 'Již máte účet?'}
            <button className="btn-text" onClick={() => setIsLogin(!isLogin)}>
              {isLogin ? 'Zaregistrujte se' : 'Přihlaste se'}
            </button>
          </p>
        </div>
        )}
      </div>
    </div>
  );
};

export default AuthPage;
