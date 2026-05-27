import React, { useState } from 'react';

import { readApiError } from '../api';
import { useAuth } from '../auth';
import type { PageProps } from '../app/shared';

export function AuthPage({ onNavigate, onMessage }: PageProps) {
  const { login, register } = useAuth();
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [repeatedPassword, setRepeatedPassword] = useState('');

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

  return (
    <main className="auth-layout layout-container">
      <section className="auth-band">
        {/* Left Half: branding and geometry */}
        <div className="auth-copy">
          <div className="auth-brand-header">
            <span className="brand-mark-logo">Алгоритм Лаб</span>
          </div>
          
          {/* Centered Premium geometric cross logo */}
          <div className="premium-logo-container">
            <div className="logo-star-mark">
              <div className="star-line l1"></div>
              <div className="star-line l2"></div>
              <div className="star-line l3"></div>
              <div className="star-line l4"></div>
              <div className="star-line l5"></div>
              <div className="star-line l6"></div>
              <div className="star-line l7"></div>
              <div className="star-line l8"></div>
            </div>
          </div>

          <div className="auth-brand-footer">
            <span>© Алгоритм Лаб 2026. Всі права захищені.</span>
          </div>
        </div>

        {/* Right Half: Form panel */}
        <div className="auth-form-panel">
          <div className="auth-panel-top-nav">
            <span className="auth-switch-link" onClick={() => {
              setMode(mode === 'login' ? 'register' : 'login');
              onMessage('error', null);
            }}>
              {mode === 'login' ? 'Створити акаунт' : 'Вхід для користувачів'}
            </span>
          </div>

          <form className="auth-premium-form" onSubmit={handleSubmit}>
            <h2 className="auth-panel-title">
              {mode === 'login' ? 'Вхід' : 'Реєстрація'}
            </h2>

            <div className="auth-fields-stack">
              {mode === 'register' ? (
                <div className="premium-field">
                  <label>Ваше ім'я</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    placeholder="Олександр..."
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
                  placeholder="mark.johnson@gmail.com"
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: mode === 'register' ? '1fr 1fr' : '1fr', gap: '1.5rem' }}>
                <div className="premium-field">
                  <label>Пароль</label>
                  <input
                    type="password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    placeholder="••••••••"
                    required
                  />
                </div>

                {mode === 'register' ? (
                  <div className="premium-field">
                    <label>Повторіть пароль</label>
                    <input
                      type="password"
                      value={repeatedPassword}
                      onChange={(event) => setRepeatedPassword(event.target.value)}
                      placeholder="••••••••"
                      required
                    />
                  </div>
                ) : null}
              </div>
            </div>

            <div className="auth-panel-bottom-row">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#888', fontSize: '0.85rem' }}>
                <input type="checkbox" id="remember-me" style={{ width: 'auto', display: 'inline', accentColor: '#fff' }} />
                <label htmlFor="remember-me" style={{ cursor: 'pointer' }}>Запам'ятати мене</label>
              </div>
              
              <span className="auth-forgot-link" onClick={() => onMessage('success', 'Зверніться до адміністратора для відновлення доступу.')}>
                Забули?
              </span>
            </div>

            <button type="submit" className="premium-circle-button" disabled={loading}>
              {loading ? '...' : mode === 'login' ? 'УВІЙТИ' : 'СТВОРИТИ'}
            </button>
          </form>
        </div>
      </section>
    </main>
  );
}
