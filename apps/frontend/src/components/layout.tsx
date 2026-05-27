import React from 'react';

import type { SessionUser } from '../auth';
import { getNavKey, type Route } from '../app/routing';
import { Button } from './button';

function NavButton({
  active,
  label,
  path,
  onNavigate,
}: {
  active: boolean;
  label: string;
  path: string;
  onNavigate: (path: string) => void;
}) {
  return (
    <Button type="button" variant="ghost" className={active ? 'is-active' : ''} onClick={() => onNavigate(path)}>
      {label}
    </Button>
  );
}

export function PageHeader({
  eyebrow,
  title,
  description,
  actions,
}: {
  eyebrow?: string;
  title: string;
  description: string;
  actions?: React.ReactNode;
}) {
  return (
    <section className="page-header">
      <div className="page-header-copy">
        {eyebrow ? <span className="page-eyebrow">{eyebrow}</span> : null}
        <h2>{title}</h2>
        <p>{description}</p>
      </div>

      {actions ? <div className="page-header-actions">{actions}</div> : null}
    </section>
  );
}

export function TextLink({ children }: { children: React.ReactNode }) {
  return <span className="text-link">{children}</span>;
}

export function Shell({
  route,
  sessionUser,
  onLogout,
  onNavigate,
  children,
}: {
  route: Route;
  sessionUser: SessionUser | null;
  onLogout: () => void;
  onNavigate: (path: string) => void;
  children: React.ReactNode;
}) {
  const navKey = getNavKey(route);

  return (
    <main className="workspace layout-container">
      <section className="tab-band">
        <div className="mode-switch" role="tablist" aria-label="Навігація по кабінету">
          <NavButton active={navKey === 'recipes'} label="Рецепти" path="/recipes" onNavigate={onNavigate} />
          <NavButton active={navKey === 'ingredients'} label="Інгредієнти" path="/ingredients" onNavigate={onNavigate} />
          <NavButton active={navKey === 'users'} label="Користувачі" path="/users" onNavigate={onNavigate} />
          <NavButton active={navKey === 'profile'} label="Профіль" path="/profile" onNavigate={onNavigate} />
        </div>
      </section>

      <header className="topbar">
        <div>
          <span className="brand-mark">Алгоритм Лаб</span>
          <h1>Кулінарна лабораторія</h1>
        </div>

        <div className="topbar-actions">
          <div className="session-chip">
            <span>{sessionUser?.email ?? 'Активна сесія'}</span>
            <strong>#{sessionUser?.id ?? '—'}</strong>
          </div>
          <Button type="button" variant="secondary" onClick={() => onNavigate('/profile')}>Профіль</Button>
          <Button type="button" variant="secondary" onClick={onLogout}>Вийти</Button>
        </div>
      </header>

      {children}
    </main>
  );
}
