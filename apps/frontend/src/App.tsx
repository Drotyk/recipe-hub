import React, { useState } from 'react';
import { useAuth } from './auth';

export default function App() {
  const { accessToken, login, register, logout } = useAuth();
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      if (mode === 'login') await login(email, password);
      else await register(email, password);
    } catch (err: any) {
      try {
        const txt = await err.text();
        setError(txt || 'Request failed');
      } catch (e) {
        setError('Request failed');
      }
    }
  }

  if (accessToken) {
    return (
      <main className="app-shell">
        <section className="hero">
          <span className="eyebrow">Algoritm Lab</span>
          <h1>You're signed in</h1>
          <p>Access token stored in localStorage.</p>
          <button onClick={() => logout()}>Logout</button>
        </section>
      </main>
    );
  }

  return (
    <main className="app-shell">
      <section className="hero">
        <span className="eyebrow">Algoritm Lab</span>
        <h1>{mode === 'login' ? 'Login' : 'Register'}</h1>
        {error && <div style={{ color: 'red' }}>{error}</div>}
        <form onSubmit={submit}>
          <input placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
          <input placeholder="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
          <button type="submit">{mode === 'login' ? 'Login' : 'Register'}</button>
        </form>
        <p>
          <button onClick={() => setMode(mode === 'login' ? 'register' : 'login')}>
            {mode === 'login' ? 'Go to register' : 'Go to login'}
          </button>
        </p>
      </section>
    </main>
  );
}
