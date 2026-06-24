import React, { useState, useEffect } from 'react';

import type { SessionUser } from '../auth';
import { getNavKey, type Route } from '../app/routing';
import { getUser } from '../api';

const SIDEBAR_COLLAPSED_EVENT = 'sidebar-collapsed-change';

/* ==========================================
   PREMIUM VECTOR CUSTOM SVG ICONS
   ========================================== */

const LogoIcon = () => (
  <svg width="42" height="42" viewBox="0 0 42 42" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="42" height="42" rx="12" fill="currentColor"/>
    <circle cx="21" cy="21" r="10" fill="var(--bg-app)" />
    <circle cx="21" cy="21" r="5" fill="currentColor" />
  </svg>
);

const HomeIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
    <polyline points="9 22 9 12 15 12 15 22"/>
  </svg>
);

const LabIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4.7 22h14.6c.5 0 .9-.4.9-.9V19c0-.4-.2-.8-.5-1l-5.7-5V4H10v9.1l-5.8 5c-.3.2-.5.6-.5 1v2.1c0 .5.4.9.9.9z"/>
    <path d="M10 2h4"/>
    <path d="M8.5 13h7"/>
  </svg>
);

const UsersIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
    <circle cx="9" cy="7" r="4"/>
    <path d="M22 21v-2a4 4 0 0 0-3-3.87"/>
    <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
  </svg>
);

const UserIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/>
    <circle cx="12" cy="7" r="4"/>
  </svg>
);

const ChevronIcon = ({ direction = 'down', size = 16 }: { direction?: 'up' | 'down' | 'right' | 'left'; size?: number }) => {
  const rotations = {
    up: 'rotate(180deg)',
    down: 'rotate(0deg)',
    right: 'rotate(-90deg)',
    left: 'rotate(90deg)'
  };
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      style={{ transform: rotations[direction], transition: 'transform 0.2s' }}
    >
      <polyline points="6 9 12 15 18 9"/>
    </svg>
  );
};
const SunIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="4"/>
    <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"/>
  </svg>
);

const MoonIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/>
  </svg>
);

/* ==========================================
   HIGH FIDELITY SIDEBAR COMPONENT
   ========================================== */

function Sidebar({
  route,
  onNavigate,
}: {
  route: Route;
  onNavigate: (path: string) => void;
}) {
  const [isCollapsed, setIsCollapsed] = useState(() => localStorage.getItem('sidebar-collapsed') === 'true');
  const [theme, setTheme] = useState(() => localStorage.getItem('app-theme') || 'dark');
  const [isDatabaseOpen, setIsDatabaseOpen] = useState(true);

  const navKey = getNavKey(route);

  useEffect(() => {
    if (theme === 'light') {
      document.body.classList.add('theme-light');
    } else {
      document.body.classList.remove('theme-light');
    }
    localStorage.setItem('app-theme', theme);
  }, [theme]);

  useEffect(() => {
    function handleSidebarCollapsedChange(event: Event) {
      const detail = (event as CustomEvent<boolean>).detail;

      if (typeof detail === 'boolean') {
        setIsCollapsed(detail);
      }
    }

    window.addEventListener(SIDEBAR_COLLAPSED_EVENT, handleSidebarCollapsedChange);

    return () => {
      window.removeEventListener(SIDEBAR_COLLAPSED_EVENT, handleSidebarCollapsedChange);
    };
  }, []);

  const toggleCollapse = () => {
    setIsCollapsed(prev => {
      const next = !prev;
      localStorage.setItem('sidebar-collapsed', String(next));
      window.dispatchEvent(new CustomEvent(SIDEBAR_COLLAPSED_EVENT, { detail: next }));
      return next;
    });
  };

  return (
    <aside className={`sidebar-container ${isCollapsed ? 'is-collapsed' : ''}`}>
      {/* Collapse/Expand Toggle Button */}
      <button className="sidebar-toggle" onClick={toggleCollapse} aria-label="Toggle Sidebar">
        <ChevronIcon direction={isCollapsed ? 'right' : 'left'} size={12} />
      </button>

      {/* Brand logo */}
      <a href="#" className="sidebar-brand" onClick={(e) => { e.preventDefault(); onNavigate('/dashboard'); }}>
        <LogoIcon />
        <span className="nav-item-btn-label">Алгоритм Лаб</span>
      </a>

      {/* Navigation List */}
      <nav className="sidebar-nav">
        {/* Dashboard / Recipes overview */}
        <div className="nav-item-wrapper">
          <button
            type="button"
            className={`nav-item-btn ${navKey === 'dashboard' ? 'is-active' : ''}`}
            onClick={() => onNavigate('/dashboard')}
          >
            <span className="nav-item-btn-icon"><HomeIcon /></span>
            <span className="nav-item-btn-label">Панель</span>
          </button>
          {isCollapsed && <div className="nav-tooltip">Панель</div>}
        </div>

        {/* Database collapsible section */}
        <div className="nav-item-wrapper">
          <button
            type="button"
            className={`nav-item-btn ${navKey === 'recipes' || navKey === 'ingredients' ? 'is-active' : ''}`}
            onClick={() => setIsDatabaseOpen(!isDatabaseOpen)}
          >
            <span className="nav-item-btn-icon"><LabIcon /></span>
            <span className="nav-item-btn-label">База даних</span>
            <span className={`nav-item-btn-chevron ${isDatabaseOpen ? 'is-open' : ''}`}>
              <ChevronIcon size={14} />
            </span>
          </button>
          
          {/* Tooltip for collapsed state */}
          {isCollapsed && <div className="nav-tooltip">База даних</div>}
          
          {/* Floating Flyout Menu for collapsed state */}
          {isCollapsed && (
            <div className="flyout-menu">
              <div className="flyout-menu-header">База даних</div>
              <button
                type="button"
                className={`nav-sub-item-btn ${route.name === 'recipes' ? 'is-active' : ''}`}
                onClick={() => onNavigate('/recipes')}
              >
                Рецепти
              </button>
              <button
                type="button"
                className={`nav-sub-item-btn ${route.name === 'ingredients' ? 'is-active' : ''}`}
                onClick={() => onNavigate('/ingredients')}
              >
                Інгредієнти
              </button>
            </div>
          )}

          {/* Sub level connected list in expanded state */}
          {!isCollapsed && isDatabaseOpen && (
            <div className="nav-sub-list">
              <div className="nav-sub-item-wrapper">
                <button
                  type="button"
                  className={`nav-sub-item-btn ${navKey === 'recipes' ? 'is-active' : ''}`}
                  onClick={() => onNavigate('/recipes')}
                >
                  <span className="nav-item-btn-label">Рецепти</span>
                  <span className="nav-badge mint">8</span>
                </button>
              </div>

              <div className="nav-sub-item-wrapper">
                <button
                  type="button"
                  className={`nav-sub-item-btn ${navKey === 'ingredients' ? 'is-active' : ''}`}
                  onClick={() => onNavigate('/ingredients')}
                >
                  <span className="nav-item-btn-label">Інгредієнти</span>
                  <span className="nav-badge orange">3</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Users category */}
        <div className="nav-item-wrapper">
          <button
            type="button"
            className={`nav-item-btn ${navKey === 'users' ? 'is-active' : ''}`}
            onClick={() => onNavigate('/users')}
          >
            <span className="nav-item-btn-icon"><UsersIcon /></span>
            <span className="nav-item-btn-label">Користувачі</span>
          </button>
          {isCollapsed && <div className="nav-tooltip">Користувачі</div>}
        </div>

        {/* Profile */}
        <div className="nav-item-wrapper">
          <button
            type="button"
            className={`nav-item-btn ${navKey === 'profile' ? 'is-active' : ''}`}
            onClick={() => onNavigate('/profile')}
          >
            <span className="nav-item-btn-icon"><UserIcon /></span>
            <span className="nav-item-btn-label">Профіль</span>
          </button>
          {isCollapsed && <div className="nav-tooltip">Профіль</div>}
        </div>

        {/* Separator / Divider */}
        <div style={{ height: '1px', background: 'var(--sidebar-border)', margin: '0.75rem 0', opacity: 0.5 }} />

        {/* About */}
        <div className="nav-item-wrapper">
          <button
            type="button"
            className={`nav-item-btn ${navKey === 'about' ? 'is-active' : ''}`}
            onClick={() => onNavigate('/about')}
          >
            <span className="nav-item-btn-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"/>
                <line x1="12" y1="16" x2="12" y2="12"/>
                <line x1="12" y1="8" x2="12.01" y2="8"/>
              </svg>
            </span>
            <span className="nav-item-btn-label">Про проект</span>
          </button>
          {isCollapsed && <div className="nav-tooltip">Про проект</div>}
        </div>

        {/* Support */}
        <div className="nav-item-wrapper">
          <button
            type="button"
            className={`nav-item-btn ${navKey === 'support' ? 'is-active' : ''}`}
            onClick={() => onNavigate('/support')}
          >
            <span className="nav-item-btn-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/>
              </svg>
            </span>
            <span className="nav-item-btn-label">Підтримка</span>
          </button>
          {isCollapsed && <div className="nav-tooltip">Підтримка</div>}
        </div>
      </nav>

      {/* Light / Dark Mode Toggle */}
      <div className="sidebar-theme-switch">
        {isCollapsed ? (
          <button
            type="button"
            className="theme-pill-btn"
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            title={`Перемкнути на ${theme === 'dark' ? 'світлу' : 'темну'} тему`}
          >
            {theme === 'dark' ? <MoonIcon /> : <SunIcon />}
          </button>
        ) : (
          <>
            <button
              type="button"
              className={`theme-pill-btn ${theme === 'light' ? 'is-active' : ''}`}
              onClick={() => setTheme('light')}
            >
              <SunIcon />
              <span>Світла</span>
            </button>
            <button
              type="button"
              className={`theme-pill-btn ${theme === 'dark' ? 'is-active' : ''}`}
              onClick={() => setTheme('dark')}
            >
              <MoonIcon />
              <span>Темна</span>
            </button>
          </>
        )}
      </div>
    </aside>
  );
}

/* ==========================================
   PAGE HEADERS AND AUXILIARY EXPORTS
   ========================================== */

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

/* ==========================================
   MAIN SHELL COMPONENT
   ========================================== */

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
  const [userName, setUserName] = useState<string | null>(null);

  useEffect(() => {
    if (!sessionUser?.id) {
      setUserName(null);
      return;
    }
    
    let active = true;
    getUser(sessionUser.id)
      .then((user) => {
        if (active) {
          setUserName(user.name);
        }
      })
      .catch(() => {
        if (active) {
          setUserName(null);
        }
      });
      
    return () => {
      active = false;
    };
  }, [sessionUser?.id]);

  return (
    <div className="shell-root">
      <Sidebar route={route} onNavigate={onNavigate} />
      
      <div className="main-viewport">
        <main className="workspace layout-container">
          {/* Hide tab-band but preserve it in structural layout */}
          <section className="tab-band" style={{ display: 'none' }}></section>

          <header className="topbar">
            <div>
              <span className="brand-mark">Алгоритм Лаб</span>
              <h1>Кулінарна лабораторія</h1>
            </div>

             <div className="topbar-actions">
               {/* Reference notification bell */}
               <button type="button" className="topbar-icon-btn" title="Сповіщення" onClick={() => onNavigate('/notifications')}>
                 <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                   <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9z"/>
                   <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
                 </svg>
               </button>

               {/* Reference question/support mark */}
               <button type="button" className="topbar-icon-btn" title="Підтримка" onClick={() => onNavigate('/support')}>
                 <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                   <circle cx="12" cy="12" r="10"/>
                   <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/>
                   <line x1="12" y1="17" x2="12.01" y2="17"/>
                 </svg>
               </button>

               {/* Reference settings gear */}
               <button type="button" className="topbar-icon-btn" title="Налаштування" onClick={() => onNavigate('/settings')}>
                 <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                   <circle cx="12" cy="12" r="3"/>
                   <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06-.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l.06-.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
                 </svg>
               </button>


               {/* Reference circular User Avatar & name tag */}
               <div className="topbar-profile-wrapper" onClick={() => onNavigate('/profile')} title="Перейти до профілю">
                 <div className="topbar-avatar">
                   {userName ? userName.charAt(0).toUpperCase() : 'U'}
                 </div>
                 <strong className="topbar-username">{userName ?? 'Користувач'}</strong>
               </div>

               {/* Reference circular exit cross */}
               <button type="button" className="topbar-logout-btn" title="Вийти" onClick={onLogout}>
                 <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                   <line x1="18" y1="6" x2="6" y2="18"/>
                   <line x1="6" y1="6" x2="18" y2="18"/>
                 </svg>
               </button>
             </div>
          </header>

          {children}
        </main>
      </div>
    </div>
  );
}
