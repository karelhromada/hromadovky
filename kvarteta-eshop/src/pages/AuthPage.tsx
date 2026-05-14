import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { LogIn, UserPlus, Mail, Lock, Loader2, ArrowLeft, LogOut, User as UserIcon, KeyRound } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { translateAuthError, isValidEmail, checkPassword } from '../lib/authErrors';
import { PageHead } from '../components/seo/PageHead';
import { SEO } from '../data/seo';
import './AuthPage.css';

type Mode = 'login' | 'signup' | 'forgot';

const AuthPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, profile, signOut, refreshProfile, loading: contextLoading } = useAuth();
  const [mode, setMode] = useState<Mode>('login');
  const [loading, setLoading] = useState(false);
  const [oauthLoading, setOauthLoading] = useState(false);
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

  // Password change (profile)
  const [changingPassword, setChangingPassword] = useState(false);
  const [pwData, setPwData] = useState({ newPassword: '', confirm: '' });
  const [pwError, setPwError] = useState<string | null>(null);
  const [pwSuccess, setPwSuccess] = useState<string | null>(null);
  const [pwLoading, setPwLoading] = useState(false);

  const passwordCheck = checkPassword(formData.password);
  const pwCheck = checkPassword(pwData.newPassword);

  const isLogin = mode === 'login';
  const isSignup = mode === 'signup';
  const isForgot = mode === 'forgot';

  const canSubmit = (() => {
    if (!isValidEmail(formData.email)) return false;
    if (isForgot) return true;
    if (isSignup) {
      if (!formData.firstName.trim() || !formData.lastName.trim()) return false;
      if (!passwordCheck.valid) return false;
      return true;
    }
    // login
    return formData.password.length >= 6;
  })();

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({
          email: formData.email.trim(),
          password: formData.password,
        });
        if (error) throw error;
        navigate('/pokladna');
        return;
      }

      if (isSignup) {
        if (!passwordCheck.valid) {
          setError(passwordCheck.message);
          return;
        }
        const { data, error } = await supabase.auth.signUp({
          email: formData.email.trim(),
          password: formData.password,
          options: {
            data: {
              first_name: formData.firstName.trim(),
              last_name: formData.lastName.trim(),
            },
            emailRedirectTo: `${window.location.origin}/login`,
          }
        });
        if (error) throw error;
        if (data.user && !data.session) {
          setSuccessMessage('Účet byl vytvořen. Na váš e-mail jsme poslali potvrzovací odkaz — klikněte na něj a poté se přihlaste.');
        } else {
          setSuccessMessage('Váš účet byl úspěšně vytvořen! Nyní se můžete přihlásit.');
        }
        return;
      }

      if (isForgot) {
        const { error } = await supabase.auth.resetPasswordForEmail(formData.email.trim(), {
          redirectTo: `${window.location.origin}/reset-password`,
        });
        if (error) throw error;
        setSuccessMessage('Pokud účet s tímto e-mailem existuje, zaslali jsme na něj odkaz pro obnovu hesla. Zkontrolujte prosím doručenou poštu i složku Spam.');
      }
    } catch (err) {
      setError(translateAuthError(err));
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError(null);
    setOauthLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/login`,
        },
      });
      if (error) throw error;
      // Redirect happens automatically
    } catch (err) {
      setError(translateAuthError(err));
      setOauthLoading(false);
    }
  };

  const handleSignOut = async () => {
    setLoading(true);
    try {
      await signOut();
    } catch (err) {
      setError(translateAuthError(err));
    } finally {
      setLoading(false);
    }
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
      await refreshProfile();
    } catch (err) {
      setError(translateAuthError(err));
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPwError(null);
    setPwSuccess(null);

    if (!pwCheck.valid) {
      setPwError(pwCheck.message);
      return;
    }
    if (pwData.newPassword !== pwData.confirm) {
      setPwError('Zadaná hesla se neshodují.');
      return;
    }

    setPwLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ password: pwData.newPassword });
      if (error) throw error;
      setPwSuccess('Heslo bylo úspěšně změněno.');
      setPwData({ newPassword: '', confirm: '' });
      setTimeout(() => {
        setChangingPassword(false);
        setPwSuccess(null);
      }, 2000);
    } catch (err) {
      setPwError(translateAuthError(err));
    } finally {
      setPwLoading(false);
    }
  };

  const fetchOrders = async () => {
    if (!user) return;
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setOrders(data || []);
    } catch (err) {
      // orders are non-critical for auth UI
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

              {error && <div className="auth-error animate-shake">{error}</div>}

              <div className="edit-actions">
                <button type="submit" className="btn-primary" disabled={loading}>Uložit změny</button>
                <button type="button" className="btn-text" onClick={() => { setEditing(false); setError(null); }}>Zrušit</button>
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

              <div className="profile-details" style={{ marginTop: 15 }}>
                <div className="profile-row">
                  <div className="profile-item">
                    <label>Bezpečnost</label>
                    <p style={{ fontSize: '0.95rem', opacity: 0.8 }}>Heslo je skryté</p>
                  </div>
                  {!changingPassword && (
                    <button className="edit-trigger" onClick={() => { setChangingPassword(true); setPwError(null); setPwSuccess(null); }}>
                      <KeyRound size={14} style={{ verticalAlign: 'middle', marginRight: 4 }} /> Změnit heslo
                    </button>
                  )}
                </div>

                {changingPassword && (
                  <form onSubmit={handleChangePassword} className="profile-edit-form" style={{ marginTop: 10 }}>
                    <div className="form-group">
                      <label>Nové heslo</label>
                      <div className="input-with-icon">
                        <Lock size={18} className="input-icon" />
                        <input
                          type="password"
                          value={pwData.newPassword}
                          onChange={e => setPwData({ ...pwData, newPassword: e.target.value })}
                          placeholder="••••••••"
                          autoComplete="new-password"
                          required
                        />
                      </div>
                      {pwData.newPassword.length > 0 && (
                        <p style={{ fontSize: '0.78rem', marginTop: 6, color: pwCheck.valid ? 'var(--accent-gold)' : '#ef4444', opacity: 0.85 }}>
                          {pwCheck.message}
                        </p>
                      )}
                    </div>
                    <div className="form-group">
                      <label>Potvrzení hesla</label>
                      <div className="input-with-icon">
                        <Lock size={18} className="input-icon" />
                        <input
                          type="password"
                          value={pwData.confirm}
                          onChange={e => setPwData({ ...pwData, confirm: e.target.value })}
                          placeholder="••••••••"
                          autoComplete="new-password"
                          required
                        />
                      </div>
                    </div>

                    {pwError && <div className="auth-error animate-shake">{pwError}</div>}
                    {pwSuccess && <div className="auth-error" style={{ background: 'rgba(212,175,55,0.1)', borderColor: 'rgba(212,175,55,0.3)', color: 'var(--accent-gold)' }}>{pwSuccess}</div>}

                    <div className="edit-actions">
                      <button type="submit" className="btn-primary" disabled={pwLoading || !pwCheck.valid || pwData.newPassword !== pwData.confirm}>
                        {pwLoading ? <Loader2 className="animate-spin" size={16} /> : 'Uložit heslo'}
                      </button>
                      <button type="button" className="btn-text" onClick={() => { setChangingPassword(false); setPwData({ newPassword: '', confirm: '' }); setPwError(null); }}>
                        Zrušit
                      </button>
                    </div>
                  </form>
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

  const switchMode = (next: Mode) => {
    setMode(next);
    setError(null);
    setSuccessMessage(null);
  };

  const headerTitle = isLogin ? 'Přihlášení' : isSignup ? 'Registrace' : 'Obnova hesla';
  const headerSubtitle = isLogin
    ? 'Vítejte zpět v Hromadovkách'
    : isSignup
    ? 'Staňte se členem a nakupujte rychleji'
    : 'Zadejte e-mail, na který vám pošleme odkaz pro obnovu hesla';
  const submitLabel = isLogin ? 'Přihlásit se' : isSignup ? 'Vytvořit účet' : 'Odeslat odkaz';

  return (
    <div className="auth-container">
      <PageHead {...SEO.login} />
      <button className="btn-back" onClick={() => navigate(-1)}>
        <ArrowLeft size={20} /> Zpět
      </button>

      <div className="auth-card glass-panel animate-fade-in">
        <div className="auth-header">
          <div className="auth-icon-wrap">
            {isLogin ? <LogIn size={32} /> : isSignup ? <UserPlus size={32} /> : <KeyRound size={32} />}
          </div>
          <h1>{headerTitle}</h1>
          <p>{headerSubtitle}</p>
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
              switchMode('login');
            }}>
              Přejít k přihlášení
            </button>
          </div>
        ) : (
          <form onSubmit={handleAuth} className="auth-form" noValidate>
            {isSignup && (
              <div className="form-row">
                <div className="form-group">
                  <label>Jméno</label>
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    required
                    placeholder="Jan"
                    autoComplete="given-name"
                  />
                </div>
                <div className="form-group">
                  <label>Příjmení</label>
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    required
                    placeholder="Novák"
                    autoComplete="family-name"
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
                  autoComplete="email"
                />
              </div>
            </div>

            {!isForgot && (
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
                    minLength={isSignup ? 8 : 6}
                    autoComplete={isLogin ? 'current-password' : 'new-password'}
                  />
                </div>
                {isSignup && formData.password.length > 0 && (
                  <p style={{ fontSize: '0.78rem', marginTop: 6, color: passwordCheck.valid ? 'var(--accent-gold)' : '#ef4444', opacity: 0.85 }}>
                    {passwordCheck.message}
                  </p>
                )}
                {isLogin && (
                  <div style={{ marginTop: 8, textAlign: 'right' }}>
                    <button type="button" className="btn-text" style={{ fontSize: '0.8rem', fontWeight: 500 }} onClick={() => switchMode('forgot')}>
                      Zapomněli jste heslo?
                    </button>
                  </div>
                )}
              </div>
            )}

            {error && <div className="auth-error animate-shake">{error}</div>}

            <button type="submit" className="btn-primary auth-submit" disabled={loading || oauthLoading || !canSubmit}>
              {loading ? <Loader2 className="animate-spin" /> : submitLabel}
            </button>

            {!isForgot && (
              <>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '8px 0', opacity: 0.5 }}>
                  <div style={{ flex: 1, height: 1, background: 'rgba(212,175,55,0.2)' }} />
                  <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '1px' }}>nebo</span>
                  <div style={{ flex: 1, height: 1, background: 'rgba(212,175,55,0.2)' }} />
                </div>
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={handleGoogleLogin}
                  disabled={loading || oauthLoading}
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, padding: '12px 15px' }}
                >
                  {oauthLoading ? <Loader2 className="animate-spin" size={18} /> : (
                    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
                      <path fill="#EA4335" d="M12 10.2v3.9h5.5c-.2 1.4-1.6 4.1-5.5 4.1-3.3 0-6-2.7-6-6.1s2.7-6.1 6-6.1c1.9 0 3.2.8 3.9 1.5l2.7-2.6C16.9 3.3 14.7 2.4 12 2.4 6.7 2.4 2.4 6.7 2.4 12s4.3 9.6 9.6 9.6c5.5 0 9.2-3.9 9.2-9.4 0-.6-.1-1.1-.2-1.6H12z" />
                    </svg>
                  )}
                  Pokračovat přes Google
                </button>
              </>
            )}
          </form>
        )}

        {!successMessage && (
          <div className="auth-footer">
            {isForgot ? (
              <p>
                Vzpomněli jste si?
                <button className="btn-text" onClick={() => switchMode('login')}>Zpět na přihlášení</button>
              </p>
            ) : (
              <p>
                {isLogin ? 'Ještě nemáte účet?' : 'Již máte účet?'}
                <button className="btn-text" onClick={() => switchMode(isLogin ? 'signup' : 'login')}>
                  {isLogin ? 'Zaregistrujte se' : 'Přihlaste se'}
                </button>
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AuthPage;
