import React, { useState } from 'react';
import { Button } from '../components/button';
import { PageHeader } from '../components/layout';
import { useAuth } from '../auth';
import type { PageProps } from '../app/shared';
import { PanelHeader, EmptyState } from '../components/surface';

/* ==========================================
   PUBLIC HEADER / SHELL FOR LOGGED OUT USERS
   ========================================== */

function PublicShell({ children, onNavigate }: { children: React.ReactNode; onNavigate: (path: string) => void }) {
  return (
    <div className="shell-root" style={{ background: 'var(--bg-app)', color: 'var(--fg-app)', display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <header className="topbar" style={{ borderBottom: '1px solid var(--sidebar-border)', padding: '1.25rem 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer' }} onClick={() => onNavigate('/auth')}>
          <svg width="34" height="34" viewBox="0 0 42 42" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect width="42" height="42" rx="10" fill="currentColor"/>
            <circle cx="21" cy="21" r="10" fill="var(--bg-app)" />
            <circle cx="21" cy="21" r="5" fill="currentColor" />
          </svg>
          <span style={{ fontWeight: 700, fontSize: '1.1rem', letterSpacing: '0.02em' }}>Алгоритм Лаб</span>
        </div>
        <div>
          <Button type="button" variant="primary" onClick={() => onNavigate('/auth')} style={{ padding: '0.65rem 1.25rem' }}>Увійти до кабінету</Button>
        </div>
      </header>
      <main className="workspace layout-container" style={{ flex: 1, padding: '2rem 1.5rem', maxWidth: '1000px', margin: '0 auto', width: '100%' }}>
        {children}
      </main>
      <footer style={{ borderTop: '1px solid var(--sidebar-border)', padding: '1.5rem', textAlign: 'center', color: 'var(--fg-muted)', fontSize: '0.8rem' }}>
        © Алгоритм Лаб — Розроблено для кулінарів — Всі права захищені.
      </footer>
    </div>
  );
}

/* ==========================================
   ABOUT PAGE
   ========================================== */

export function AboutPage({ onNavigate, onMessage }: PageProps) {
  const { accessToken } = useAuth();

  const content = (
    <section className="content-single">
      <PageHeader
        eyebrow="Про проект"
        title="Алгоритм Лаб: Кулінарна лабораторія"
        description="Наша місія — структурувати кулінарні рецепти у зрозумілі покрокові алгоритми та надати зручні інструменти для управління інгредієнтами."
        actions={
          !accessToken ? (
            <Button type="button" onClick={() => onNavigate('/auth')}>Назад до входу</Button>
          ) : undefined
        }
      />

      <section className="panel" style={{ marginTop: '1.5rem', padding: '2rem' }}>
        <div style={{ display: 'grid', gap: '2rem' }}>
          <div>
            <h3 style={{ fontSize: '1.4rem', fontWeight: 600, color: 'var(--primary-accent)', marginBottom: '0.75rem' }}>Про проект</h3>
            <p style={{ color: 'var(--fg-muted)', lineHeight: 1.6, fontSize: '0.98rem' }}>
              <strong>Алгоритм Лаб</strong> — це не просто кулінарна книга, це справжня цифрова платформа для професійних кухарів та аматорів. Ми об'єднали кращі практики розробки програмного забезпечення та кулінарного мистецтва, щоб створити інтуїтивно зрозумілу та швидку систему управління рецептами.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem', marginTop: '1rem' }}>
            <div className="stat-card" style={{ textAlign: 'left', padding: '1.5rem' }}>
              <div style={{ color: '#ff9650', fontWeight: 700, fontSize: '1.2rem', marginBottom: '0.5rem' }}>Покрокові алгоритми</div>
              <p style={{ color: 'var(--fg-muted)', fontSize: '0.88rem', margin: 0, lineHeight: 1.5 }}>
                Кожен рецепт — це точна послідовність кроків з чітко розрахованими таймінгами та підказками щодо температурного режиму.
              </p>
            </div>

            <div className="stat-card" style={{ textAlign: 'left', padding: '1.5rem' }}>
              <div style={{ color: '#50dcab', fontWeight: 700, fontSize: '1.2rem', marginBottom: '0.5rem' }}>База інгредієнтів</div>
              <p style={{ color: 'var(--fg-muted)', fontSize: '0.88rem', margin: 0, lineHeight: 1.5 }}>
                Швидкий пошук інгредієнтів з можливістю додавання нових продуктів, розрахунку грамів та контролю кулінарних залишків.
              </p>
            </div>

            <div className="stat-card" style={{ textAlign: 'left', padding: '1.5rem' }}>
              <div style={{ color: '#007aff', fontWeight: 700, fontSize: '1.2rem', marginBottom: '0.5rem' }}>Режим приготування</div>
              <p style={{ color: 'var(--fg-muted)', fontSize: '0.88rem', margin: 0, lineHeight: 1.5 }}>
                Адаптивний інтерактивний екран приготування страв (Cooking Mode) із можливістю відзначати виконані етапи в реальному часі.
              </p>
            </div>
          </div>

          <div style={{ borderTop: '1px solid var(--sidebar-border)', paddingTop: '1.5rem', marginTop: '1rem' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 600, marginBottom: '0.75rem' }}>Наші технології</h3>
            <p style={{ color: 'var(--fg-muted)', lineHeight: 1.6, fontSize: '0.92rem' }}>
              Платформа побудована на базі сучасного та швидкого веб-стеку: NestJS у якості надійного серверного API, PostgreSQL для безпечного збереження даних користувачів, та React з компілятором Vite для блискавичного відображення сторінок та преміальних інтерфейсів.
            </p>
          </div>
        </div>
      </section>
    </section>
  );

  if (!accessToken) {
    return <PublicShell onNavigate={onNavigate}>{content}</PublicShell>;
  }

  return content;
}

/* ==========================================
   SUPPORT PAGE
   ========================================== */

export function SupportPage({ onNavigate, onMessage }: PageProps) {
  const { accessToken } = useAuth();
  
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('medium');
  const [ticketSuccess, setTicketSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  // Collapsible FAQ state
  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  const handleTicketSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Simulate sending ticket API request
    setTimeout(() => {
      setLoading(false);
      setTicketSuccess(true);
      setSubject('');
      setDescription('');
      onMessage('success', 'Ваше звернення успішно надіслано до служби підтримки! Очікуйте на відповідь.');
    }, 1200);
  };

  const faqItems = [
    {
      q: "Як додати новий рецепт до платформи?",
      a: "Увійдіть до кабінету, відкрийте розділ 'Панель' у лівому меню та натисніть кнопку '+ Створити рецепт' у правому верхньому кутку. Заповніть назву, опис, перелік інгредієнтів та кроки приготування."
    },
    {
      q: "Як працює перемикання тем оформлення?",
      a: "Ви можете миттєво змінювати оформлення інтерфейсу за допомогою спеціального перемикача тем ('Світла' та 'Темна') в самому низу лівої бічної панелі. Обрана тема автоматично синхронізується та зберігається у вашому браузері."
    },
    {
      q: "Чи можу я експортувати свої рецепти або редагувати інгредієнти?",
      a: "Так, автори рецептів мають повні права на їх редагування та видалення. Також у розділі 'База даних' -> 'Інгредієнти' ви можете переглядати наявність продуктів та додавати нові інгредієнти до загальної бази."
    }
  ];

  const content = (
    <section className="content-single" style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr)', gap: '1.5rem' }}>
      <PageHeader
        eyebrow="Підтримка"
        title="Служба кулінарної підтримки"
        description="Маєте запитання чи виявили технічну помилку? Надішліть звернення безпосередньо нашій технічній команді."
        actions={
          !accessToken ? (
            <Button type="button" onClick={() => onNavigate('/auth')}>Назад до входу</Button>
          ) : undefined
        }
      />

      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '1.5rem', alignItems: 'start' }}>
        {/* Ticket Submission Form Panel */}
        <section className="panel" style={{ padding: '2rem' }}>
          <PanelHeader title="Створити нове звернення" meta="Форма підтримки" />

          {ticketSuccess ? (
            <div className="message message-success" style={{ marginTop: '1rem', padding: '1.5rem', textAlign: 'center' }}>
              <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>✓</div>
              <h4 style={{ margin: '0 0 0.5rem', fontSize: '1.2rem', fontWeight: 600 }}>Дякуємо! Звернення надіслано</h4>
              <p style={{ fontSize: '0.9rem', color: 'var(--fg-muted)', margin: '0 0 1.25rem' }}>
                Вашому тікету присвоєно номер <strong>#{Math.floor(100000 + Math.random() * 900000)}</strong>. Ми зв'яжемося з вами за вашою електронною поштою найближчим часом.
              </p>
              <Button type="button" variant="secondary" onClick={() => setTicketSuccess(false)}>Створити ще один тікет</Button>
            </div>
          ) : (
            <form onSubmit={handleTicketSubmit} style={{ display: 'grid', gap: '1.25rem', marginTop: '1rem' }}>
              <div className="field">
                <span>Тема звернення</span>
                <input
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="Наприклад: Помилка додавання інгредієнта"
                  required
                  style={{ borderRadius: '6px' }}
                />
              </div>

              <div className="field">
                <span>Пріоритет звернення</span>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value)}
                  style={{ borderRadius: '6px', padding: '0.85rem 1rem', background: 'var(--input-bg)', border: '1px solid var(--input-border)', color: 'var(--fg-app)' }}
                >
                  <option value="low">Низький (Питання / Порада)</option>
                  <option value="medium">Середній (Помилка інтерфейсу)</option>
                  <option value="high">Високий (Критична помилка API)</option>
                </select>
              </div>

              <div className="field">
                <span>Детальний опис проблеми</span>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Опишіть вашу проблему або пропозицію якомога детальніше..."
                  required
                  style={{ borderRadius: '6px', minHeight: '8rem' }}
                />
              </div>

              <Button type="submit" variant="primary" disabled={loading} style={{ marginTop: '0.5rem' }}>
                {loading ? 'Надсилання...' : 'Надіслати звернення'}
              </Button>
            </form>
          )}
        </section>

        {/* Collapsible FAQ Widget Section */}
        <div style={{ display: 'grid', gap: '1.5rem' }}>
          <section className="panel" style={{ padding: '1.5rem' }}>
            <PanelHeader title="Часті запитання (FAQ)" meta="Швидкі відповіді" />

            <div style={{ display: 'grid', gap: '0.75rem', marginTop: '1.25rem' }}>
              {faqItems.map((item, idx) => {
                const isOpen = activeFaq === idx;
                return (
                  <div key={idx} style={{ border: '1px solid var(--sidebar-border)', borderRadius: '8px', background: 'rgba(255,255,255,0.01)', overflow: 'hidden' }}>
                    <button
                      type="button"
                      onClick={() => setActiveFaq(isOpen ? null : idx)}
                      style={{
                        width: '100%',
                        padding: '1rem',
                        background: 'transparent',
                        border: 'none',
                        textAlign: 'left',
                        fontWeight: 600,
                        fontSize: '0.88rem',
                        color: 'var(--fg-app)',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        cursor: 'pointer'
                      }}
                    >
                      <span>{item.q}</span>
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        style={{ transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }}
                      >
                        <polyline points="6 9 12 15 18 9"/>
                      </svg>
                    </button>
                    {isOpen && (
                      <div style={{ padding: '0 1rem 1rem', fontSize: '0.85rem', color: 'var(--fg-muted)', lineHeight: 1.5, borderTop: '1px solid var(--sidebar-border)', paddingTop: '0.75rem' }}>
                        {item.a}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </section>

          <section className="panel" style={{ padding: '1.5rem', display: 'grid', gap: '0.5rem' }}>
            <h4 style={{ margin: 0, fontSize: '0.98rem', fontWeight: 600 }}>Інші контакти</h4>
            <p style={{ color: 'var(--fg-muted)', fontSize: '0.85rem', margin: '0 0 0.5rem', lineHeight: 1.5 }}>
              Якщо вам потрібна миттєва допомога, ви можете зв'язатися з нашою командою напряму:
            </p>
            <div style={{ fontSize: '0.88rem', display: 'grid', gap: '0.4rem' }}>
              <div>📧 <strong>Email:</strong> support@algoritm-lab.com</div>
              <div>📞 <strong>Телефон:</strong> +380 (44) 123-45-67</div>
              <div>📍 <strong>Локація:</strong> Київ, Україна</div>
            </div>
          </section>
        </div>
      </div>
    </section>
  );

  if (!accessToken) {
    return <PublicShell onNavigate={onNavigate}>{content}</PublicShell>;
  }

  return content;
}
