import React, { useEffect, useState } from 'react';

import { API_BASE, readApiError } from '../api';
import { useAuth } from '../auth';
import type { PageProps } from '../app/shared';

/* ==========================================
   AUTH SCREEN REDESIGNED ICONS
   ========================================== */

const LogoIcon = () => (
  <svg width="40" height="40" viewBox="0 0 42 42" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="42" height="42" rx="12" fill="currentColor"/>
    <circle cx="21" cy="21" r="10" fill="#000000" />
    <circle cx="21" cy="21" r="5" fill="currentColor" />
  </svg>
);

const GoogleIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"/>
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335"/>
  </svg>
);

const EyeIcon = ({ visible }: { visible: boolean }) => {
  if (visible) {
    return (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"/>
        <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"/>
        <path d="M6.61 6.61A13.52 13.52 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"/>
        <line x1="2" y1="2" x2="22" y2="22"/>
      </svg>
    );
  }
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/>
      <circle cx="12" cy="12" r="3"/>
    </svg>
  );
};

/* ==========================================
   MAIN REDESIGNED AUTH PAGE
   ========================================== */

export function AuthPage({ onNavigate, onMessage }: PageProps) {
  const { login, register, acceptTokens } = useAuth();
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [repeatedPassword, setRepeatedPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showRepeatedPassword, setShowRepeatedPassword] = useState(false);
  const [receiveNews, setReceiveNews] = useState(true);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const accessToken = params.get('accessToken');
    const refreshToken = params.get('refreshToken');
    const oauthError = params.get('oauthError');

    if (accessToken && refreshToken) {
      acceptTokens({ accessToken, refreshToken });
      window.history.replaceState({}, '', '/auth');
      onNavigate('/dashboard');
      return;
    }

    if (oauthError) {
      window.history.replaceState({}, '', '/auth');
      onMessage('error', 'Не вдалося увійти через Google. Перевірте налаштування OAuth і спробуйте ще раз.');
    }
  }, []);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setLoading(true);
    onMessage('error', null);

    try {
      if (mode === 'login') {
        await login(email, password);
      } else {
        await register({
          email,
          name,
          password,
          repeatedPassword,
        });
      }

      onNavigate('/recipes');
    } catch (error) {
      onMessage('error', await readApiError(error));
    } finally {
      setLoading(false);
    }
  }

  const handleGoogleLogin = () => {
    setLoading(true);
    window.location.href = `${API_BASE}/auth/google`;
  };

  return (
    <main className="auth-layout layout-container">
      <section className="auth-band">
        
        {/* Left Half: branding and details */}
        <div className="auth-copy">
          {/* Back link */}
          <a href="#" className="auth-back-link" onClick={(e) => { e.preventDefault(); onNavigate('/recipes'); }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="19" y1="12" x2="5" y2="12"/>
              <polyline points="12 19 5 12 12 5"/>
            </svg>
            <span>На головну</span>
          </a>

          {/* Core Brand Logo */}
          <div className="auth-logo-row">
            <LogoIcon />
            <span className="auth-logo-title">Алгоритм Лаб</span>
          </div>

          <p className="auth-brand-desc">
            Алгоритм Лаб — ваша повноцінна кулінарна платформа, розроблена для керування рецептами, інгредієнтами та оптимізації кулінарних процесів. Створюйте шедеври ефективніше.
          </p>

          {/* Left Footer Links */}
          <div className="auth-footer-links">
            <a href="#" className="auth-footer-link" onClick={(e) => { e.preventDefault(); onNavigate('/about'); }}>Про проект</a>
            <a href="#" className="auth-footer-link" onClick={(e) => { e.preventDefault(); onNavigate('/support'); }}>FAQ</a>
            <a href="#" className="auth-footer-link" onClick={(e) => { e.preventDefault(); onNavigate('/support'); }}>Підтримка</a>
          </div>
        </div>

        {/* Right Half: Form panel */}
        <div className="auth-form-panel">
          
          <form className="auth-premium-form" onSubmit={handleSubmit}>
            {/* Title & Subtitle */}
            <h2 className="auth-panel-title" style={{ fontSize: '1.85rem', fontWeight: 600, letterSpacing: 'normal', margin: '0 0 0.5rem' }}>
              {mode === 'login' ? 'Вхід або реєстрація' : 'Реєстрація акаунта'}
            </h2>
            <p style={{ color: '#666668', fontSize: '0.85rem', lineHeight: 1.5, margin: '0 0 2rem' }}>
              {mode === 'login' 
                ? 'Щоб спростити процес, увійдіть за допомогою електронної пошти або скористайтеся кнопками нижче.'
                : 'Заповніть форму нижче для створення вашого облікового кулінарного запису.'}
            </p>

            {/* Social logins */}
            <div className="auth-social-buttons">
              <button type="button" className="auth-social-btn" onClick={handleGoogleLogin} disabled={loading}>
                <GoogleIcon />
                <span>Увійти за допомогою Google</span>
              </button>
            </div>

            {/* Separator */}
            <div className="auth-separator">або</div>

            {/* Input Stack */}
            <div className="auth-fields-stack">
              {mode === 'register' ? (
                <div className="premium-field">
                  <label>Ваше ім'я</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    placeholder="Олександр"
                    required
                  />
                </div>
              ) : null}

              <div className="premium-field">
                <label>Електронна пошта</label>
                <input
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="example@gmail.com"
                  required
                />
              </div>

              <div className="premium-field">
                <label>Пароль</label>
                <div className="auth-input-wrapper">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    placeholder="••••••••"
                    required
                  />
                  <button
                    type="button"
                    className="auth-eye-btn"
                    onClick={() => setShowPassword(!showPassword)}
                    tabIndex={-1}
                    aria-label="Toggle Password Visibility"
                  >
                    <EyeIcon visible={showPassword} />
                  </button>
                </div>
              </div>

              {mode === 'register' ? (
                <div className="premium-field">
                  <label>Повторіть пароль</label>
                  <div className="auth-input-wrapper">
                    <input
                      type={showRepeatedPassword ? 'text' : 'password'}
                      value={repeatedPassword}
                      onChange={(event) => setRepeatedPassword(event.target.value)}
                      placeholder="••••••••"
                      required
                    />
                    <button
                      type="button"
                      className="auth-eye-btn"
                      onClick={() => setShowRepeatedPassword(!showRepeatedPassword)}
                      tabIndex={-1}
                      aria-label="Toggle Password Visibility"
                    >
                      <EyeIcon visible={showRepeatedPassword} />
                    </button>
                  </div>
                </div>
              ) : null}
            </div>

            {/* Form actions and helper links */}
            <div className="auth-panel-bottom-row" style={{ display: 'none' }}></div> {/* Hide default to keep grid clean */}

            {/* Redesigned Switch Toggles */}
            <div className="auth-toggle-row">
              <div className="auth-toggle-desc">
                <strong>Отримувати кулінарні новини</strong>
                <span>Оновлення платформи та свіжі рецепти від шефів.</span>
              </div>
              <label className="switch-container">
                <input type="checkbox" checked={receiveNews} onChange={() => setReceiveNews(!receiveNews)} />
                <span className="switch-slider"></span>
              </label>
            </div>

            {mode === 'login' ? (
              <div style={{ textAlign: 'right', marginTop: '-1.5rem', marginBottom: '2rem' }}>
                <span 
                  className="auth-forgot-link" 
                  onClick={() => onMessage('success', 'Зверніться до адміністратора для відновлення доступу.')}
                  style={{ fontSize: '0.85rem', color: '#666668', fontWeight: 500 }}
                >
                  Забули пароль?
                </span>
              </div>
            ) : null}

            {/* Wide Filled Submission Button */}
            <button type="submit" className="auth-submit-btn" disabled={loading}>
              {loading ? 'Завантаження...' : mode === 'login' ? 'Увійти' : 'Зареєструватися'}
            </button>

            {/* Redesigned Bottom Mode Toggle helper */}
            <div className="auth-helper-link" onClick={() => {
              setMode(mode === 'login' ? 'register' : 'login');
              onMessage('error', null);
            }}>
              {mode === 'login' ? (
                <>Ще немає акаунта? <span>Зареєструватися зараз</span></>
              ) : (
                <>Вже маєте акаунт? <span>Увійти</span></>
              )}
            </div>

            {/* Right side footer credit text */}
            <p style={{ color: '#444446', fontSize: '0.75rem', textAlign: 'center', margin: '1rem 0 0' }}>
              Алгоритм Лаб — Розроблено для кулінарів — Всі права захищені.
            </p>
          </form>
        </div>

      </section>
    </main>
  );
}
