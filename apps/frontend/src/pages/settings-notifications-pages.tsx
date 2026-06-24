import React, { useEffect, useState } from 'react';
import { type PageProps } from '../app/shared';
import { Button } from '../components/button';
import { Field, TextInput } from '../components/form';
import { PageHeader } from '../components/layout';
import { ContentList, PanelHeader } from '../components/surface';
import { useAuth } from '../auth';

const SIDEBAR_COLLAPSED_EVENT = 'sidebar-collapsed-change';

export function SettingsPage({ onNavigate, onMessage }: PageProps) {
  const { sessionUser } = useAuth();
  const [themeMode, setThemeMode] = useState(() => localStorage.getItem('app-theme') || 'dark');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(() => localStorage.getItem('sidebar-collapsed') === 'true');
  const [emailNotify, setEmailNotify] = useState(true);

  useEffect(() => {
    function handleSidebarCollapsedEvent(event: Event) {
      const detail = (event as CustomEvent<boolean>).detail;

      if (typeof detail === 'boolean') {
        setIsSidebarCollapsed(detail);
      }
    }

    window.addEventListener(SIDEBAR_COLLAPSED_EVENT, handleSidebarCollapsedEvent);

    return () => {
      window.removeEventListener(SIDEBAR_COLLAPSED_EVENT, handleSidebarCollapsedEvent);
    };
  }, []);
  
  function handleThemeChange(mode: 'light' | 'dark') {
    setThemeMode(mode);
    localStorage.setItem('app-theme', mode);
    if (mode === 'light') {
      document.body.classList.add('theme-light');
    } else {
      document.body.classList.remove('theme-light');
    }
    onMessage('success', `Тему успішно змінено на ${mode === 'light' ? 'світлу' : 'темну'}.`);
  }

  function handleSidebarCollapsedChange(next: boolean) {
    setIsSidebarCollapsed(next);
    localStorage.setItem('sidebar-collapsed', String(next));
    window.dispatchEvent(new CustomEvent(SIDEBAR_COLLAPSED_EVENT, { detail: next }));
    onMessage('success', next ? 'Бічне меню згорнуто.' : 'Бічне меню розгорнуто.');
  }

  function handleSaveSettings(e: React.FormEvent) {
    e.preventDefault();
    onMessage('success', 'Налаштування інтерфейсу успішно збережено!');
  }

  return (
    <section className="content-single" style={{ maxWidth: '800px', width: '100%', margin: '0 auto' }}>
      <PageHeader
        eyebrow="Налаштування"
        title="Параметри робочого простору"
        description="Керуйте налаштуваннями інтерфейсу, теми та сповіщень у реальному часі."
      />

      <div style={{ display: 'grid', gap: '1.5rem', width: '100%' }}>
        
        {/* Profile Settings */}
        <form className="panel" onSubmit={handleSaveSettings}>
          <PanelHeader title="Профіль та сесія" meta="Параметри" />
          
          <div style={{ display: 'grid', gap: '1rem', marginTop: '0.5rem' }}>
            <Field label="Активний користувач">
              <TextInput value={sessionUser?.email ?? 'Користувач'} disabled />
            </Field>
          </div>
        </form>

        {/* Interface Settings */}
        <form className="panel" onSubmit={handleSaveSettings}>
          <PanelHeader title="Зовнішній вигляд" meta="Тема" />
          
          <div style={{ display: 'grid', gap: '1.25rem', marginTop: '0.5rem' }}>
            
            {/* Theme selector */}
            <Field label="Тема оформлення">
              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.25rem' }}>
                <Button 
                  type="button" 
                  variant={themeMode === 'light' ? 'primary' : 'secondary'}
                  onClick={() => handleThemeChange('light')}
                  style={{ flex: 1 }}
                >
                  Світла тема
                </Button>
                <Button 
                  type="button" 
                  variant={themeMode === 'dark' ? 'primary' : 'secondary'}
                  onClick={() => handleThemeChange('dark')}
                  style={{ flex: 1 }}
                >
                  Темна тема
                </Button>
              </div>
            </Field>

            {/* Sidebar collapse switch */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.75rem 0', borderBottom: '1px solid var(--sidebar-border)' }}>
              <div>
                <strong style={{ display: 'block', fontSize: '0.95rem' }}>Згорнути бічне меню</strong>
                <span style={{ fontSize: '0.82rem', color: 'var(--fg-muted)' }}>Ховає назви навігації та залишає лише іконки</span>
              </div>
              <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                <input 
                  type="checkbox" 
                  checked={isSidebarCollapsed} 
                  onChange={(e) => handleSidebarCollapsedChange(e.target.checked)}
                  style={{ width: '1.25rem', height: '1.25rem', accentColor: 'var(--primary-accent)', cursor: 'pointer' }}
                />
              </label>
            </div>

          </div>
        </form>

        {/* Notifications Config */}
        <form className="panel" onSubmit={handleSaveSettings}>
          <PanelHeader title="Налаштування сповіщень" meta="Канали зв'язку" />
          
          <div style={{ display: 'grid', gap: '1rem', marginTop: '0.5rem' }}>
            
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.5rem 0' }}>
              <div>
                <strong style={{ display: 'block', fontSize: '0.95rem' }}>Email сповіщення</strong>
                <span style={{ fontSize: '0.82rem', color: 'var(--fg-muted)' }}>Отримувати листи при появі нових рецептів від спільноти</span>
              </div>
              <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                <input 
                  type="checkbox" 
                  checked={emailNotify} 
                  onChange={(e) => setEmailNotify(e.target.checked)}
                  style={{ width: '1.25rem', height: '1.25rem', accentColor: 'var(--primary-accent)', cursor: 'pointer' }}
                />
              </label>
            </div>

          </div>
        </form>

        {/* Save Bar */}
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
          <Button type="button" onClick={() => onNavigate('/recipes')}>Назад</Button>
          <Button type="submit" variant="primary" onClick={handleSaveSettings}>Зберегти параметри</Button>
        </div>

      </div>
    </section>
  );
}

interface Notification {
  id: number;
  title: string;
  body: string;
  time: string;
  category: 'social' | 'system' | 'recipe';
  read: boolean;
}

export function NotificationsPage({ onNavigate, onMessage }: PageProps) {
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: 1,
      title: 'Нова страва у базі даних',
      body: 'Користувач Drotyk опублікував новий кулінарний рецепт: "картопля смажена".',
      time: 'Сьогодні, 10:48',
      category: 'recipe',
      read: false,
    },
    {
      id: 2,
      title: 'Реакція на ваш рецепт',
      body: 'Користувачу John Doe сподобався ваш рецепт "Pancakes".',
      time: 'Вчора, 19:53',
      category: 'social',
      read: false,
    },
    {
      id: 3,
      title: 'Оновлення системи Алгоритм Лаб',
      body: 'Вітаємо в оновленому інтерфейсі версії 2.0! Додано бічний преміум-панель та мобільну адаптацію.',
      time: '28 Травня, 14:15',
      category: 'system',
      read: true,
    },
  ]);

  function markAllRead() {
    setNotifications(prev => prev.map(item => ({ ...item, read: true })));
    onMessage('success', 'Усі сповіщення позначено як прочитані.');
  }

  function deleteNotification(id: number) {
    setNotifications(prev => prev.filter(item => item.id !== id));
    onMessage('success', 'Сповіщення успішно видалено.');
  }

  return (
    <section className="content-single" style={{ maxWidth: '800px', width: '100%', margin: '0 auto' }}>
      <PageHeader
        eyebrow="Сповіщення"
        title="Ваш центр активності"
        description="Переглядайте системні оновлення, реакції від користувачів та нові кулінарні рецепти нашої спільноти."
        actions={
          <div className="inline-actions">
            <Button type="button" onClick={markAllRead} disabled={notifications.every(n => n.read)}>
              Позначити всі як прочитані
            </Button>
          </div>
        }
      />

      <div style={{ display: 'grid', gap: '1rem', width: '100%' }}>
        <div className="panel" style={{ padding: '1.5rem' }}>
          <PanelHeader title="Список подій" meta={`${notifications.filter(n => !n.read).length} нових`} />
          
          {notifications.length ? (
            <ContentList>
              {notifications.map((item) => (
                <div
                  key={item.id}
                  className="list-item"
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.4rem',
                    padding: '1.25rem',
                    borderLeft: !item.read ? '3px solid var(--primary-accent)' : '1px solid var(--sidebar-border)',
                    background: !item.read ? 'rgba(255, 255, 255, 0.02)' : 'transparent',
                    position: 'relative',
                    borderRadius: '6px'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      {!item.read && (
                        <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--primary-accent)' }} />
                      )}
                      <strong style={{ fontSize: '0.98rem', color: 'var(--fg-app)' }}>{item.title}</strong>
                      <span 
                        style={{
                          fontSize: '0.72rem',
                          padding: '0.15rem 0.45rem',
                          borderRadius: '4px',
                          background: item.category === 'system' ? 'rgba(92, 107, 192, 0.15)' : item.category === 'social' ? 'rgba(236, 64, 122, 0.15)' : 'rgba(76, 175, 80, 0.15)',
                          color: item.category === 'system' ? '#7986cb' : item.category === 'social' ? '#f06292' : '#81c784',
                          fontWeight: 600,
                          textTransform: 'uppercase'
                        }}
                      >
                        {item.category === 'system' ? 'Система' : item.category === 'social' ? 'Соціальні' : 'Рецепти'}
                      </span>
                    </div>
                    
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <span style={{ fontSize: '0.8rem', color: 'var(--fg-muted)' }}>{item.time}</span>
                      <button 
                        type="button" 
                        onClick={() => deleteNotification(item.id)}
                        style={{ background: 'transparent', border: 'none', color: '#ff6b6b', cursor: 'pointer', display: 'flex', alignItems: 'center', padding: '0.2rem' }}
                        title="Видалити"
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                          <line x1="18" y1="6" x2="6" y2="18"/>
                          <line x1="6" y1="6" x2="18" y2="18"/>
                        </svg>
                      </button>
                    </div>
                  </div>
                  
                  <p style={{ margin: 0, fontSize: '0.92rem', color: 'var(--fg-app)', opacity: 0.9, lineHeight: '1.5' }}>
                    {item.body}
                  </p>
                </div>
              ))}
            </ContentList>
          ) : (
            <div style={{ padding: '3rem 1rem', textAlign: 'center', color: 'var(--fg-muted)' }}>
              <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ marginBottom: '0.75rem', opacity: 0.5 }}>
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9z"/>
                <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
              </svg>
              <p style={{ margin: 0, fontSize: '0.95rem' }}>У вас немає нових сповіщень.</p>
            </div>
          )}
        </div>
        
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <Button type="button" onClick={() => onNavigate('/recipes')}>Назад до рецептів</Button>
        </div>
      </div>
    </section>
  );
}
