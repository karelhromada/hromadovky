import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { KeyRound, Lock, Loader2, ArrowLeft } from 'lucide-react';
import { translateAuthError, checkPassword } from '../lib/authErrors';
import { PageHead } from '../components/seo/PageHead';
import { SEO } from '../data/seo';
import './AuthPage.css';

const ResetPasswordPage: React.FC = () => {
  const navigate = useNavigate();
  const [ready, setReady] = useState(false);
  const [initialCheck, setInitialCheck] = useState(true);
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const check = checkPassword(password);

  useEffect(() => {
    // Supabase fires PASSWORD_RECOVERY when user arrives via reset email.
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'PASSWORD_RECOVERY') {
        setReady(true);
        setInitialCheck(false);
      } else if (session) {
        // User already has a session (e.g. reload after recovery) — still allow update.
        setReady(true);
        setInitialCheck(false);
      }
    });

    // Fallback: if there's already a session within 1.5s, allow update.
    const timer = setTimeout(async () => {
      const { data } = await supabase.auth.getSession();
      if (data.session) {
        setReady(true);
      }
      setInitialCheck(false);
    }, 1500);

    return () => {
      subscription.unsubscribe();
      clearTimeout(timer);
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!check.valid) {
      setError(check.message);
      return;
    }
    if (password !== confirm) {
      setError('Zadaná hesla se neshodují.');
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;
      setSuccess('Heslo bylo úspěšně změněno. Za chvíli vás přesměrujeme na přihlášení.');
      setTimeout(async () => {
        await supabase.auth.signOut();
        navigate('/login');
      }, 2000);
    } catch (err) {
      setError(translateAuthError(err));
    } finally {
      setLoading(false);
    }
  };

  if (initialCheck) {
    return (
      <div className="auth-container">
        <Loader2 className="animate-spin" size={48} color="var(--accent-gold)" />
      </div>
    );
  }

  if (!ready) {
    return (
      <div className="auth-container">
        <button className="btn-back" onClick={() => navigate('/login')}>
          <ArrowLeft size={20} /> Zpět
        </button>
        <div className="auth-card glass-panel animate-fade-in">
          <div className="auth-header">
            <div className="auth-icon-wrap">
              <KeyRound size={32} />
            </div>
            <h1>Obnova hesla</h1>
            <p>Odkaz pro obnovu hesla je neplatný nebo vypršel.</p>
          </div>
          <button className="btn-primary auth-submit" onClick={() => navigate('/login')}>
            Vyžádat nový odkaz
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-container">
      <PageHead {...SEO.resetPassword} />
      <button className="btn-back" onClick={() => navigate('/login')}>
        <ArrowLeft size={20} /> Zpět
      </button>

      <div className="auth-card glass-panel animate-fade-in">
        <div className="auth-header">
          <div className="auth-icon-wrap">
            <KeyRound size={32} />
          </div>
          <h1>Nastavte nové heslo</h1>
          <p>Zadejte nové heslo, které chcete používat pro přihlášení.</p>
        </div>

        {success ? (
          <div className="auth-success-view animate-fade-in">
            <div className="success-icon-check">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
            </div>
            <p>{success}</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="auth-form" noValidate>
            <div className="form-group">
              <label>Nové heslo</label>
              <div className="input-with-icon">
                <Lock size={18} className="input-icon" />
                <input
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  autoComplete="new-password"
                  required
                />
              </div>
              {password.length > 0 && (
                <p style={{ fontSize: '0.78rem', marginTop: 6, color: check.valid ? 'var(--accent-gold)' : '#ef4444', opacity: 0.85 }}>
                  {check.message}
                </p>
              )}
            </div>

            <div className="form-group">
              <label>Potvrzení hesla</label>
              <div className="input-with-icon">
                <Lock size={18} className="input-icon" />
                <input
                  type="password"
                  value={confirm}
                  onChange={e => setConfirm(e.target.value)}
                  placeholder="••••••••"
                  autoComplete="new-password"
                  required
                />
              </div>
            </div>

            {error && <div className="auth-error animate-shake">{error}</div>}

            <button type="submit" className="btn-primary auth-submit" disabled={loading || !check.valid || password !== confirm}>
              {loading ? <Loader2 className="animate-spin" /> : 'Uložit nové heslo'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default ResetPasswordPage;
