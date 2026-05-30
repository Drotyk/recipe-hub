import React, { useEffect, useState } from 'react';

import { Recipe, User, Comment, getRecipes, getUser, getUserComments, readApiError, updateUser } from '../api';
import { useAuth } from '../auth';
import { formatDate, type PageProps } from '../app/shared';
import { DetailCard, DetailGrid, DetailSection } from '../components/detail';
import { PageHeader } from '../components/layout';
import { DetailSkeleton, EmptyState, PanelHeader } from '../components/surface';
import { Button } from '../components/button';

type SocialContacts = {
  website?: string;
  twitter?: string;
  telegram?: string;
  linkedin?: string;
};

type SocialValidationResult =
  | { valid: true; contacts: Required<SocialContacts> }
  | { valid: false; message: string };

function isHttpUrl(value: string) {
  try {
    const url = new URL(value);

    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
}

function normalizeWebsite(value: string) {
  const trimmed = value.trim();

  if (!trimmed) {
    return '';
  }

  const withProtocol = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;

  return isHttpUrl(withProtocol) ? withProtocol : null;
}

function normalizeHandle(value: string, domain: 'twitter' | 'telegram' | 'linkedin') {
  const trimmed = value.trim();

  if (!trimmed) {
    return '';
  }

  const urlPrefixPatterns = {
    twitter: /^(?:https?:\/\/)?(?:www\.)?(?:twitter\.com|x\.com)\//i,
    telegram: /^(?:https?:\/\/)?(?:www\.)?(?:t\.me|telegram\.me)\//i,
    linkedin: /^(?:https?:\/\/)?(?:www\.)?linkedin\.com\/in\//i,
  };

  const rawHandle = trimmed
    .replace(urlPrefixPatterns[domain], '')
    .replace(/^@/, '')
    .replace(/\/+$/, '')
    .trim();

  const handlePatterns = {
    twitter: /^[A-Za-z0-9_]{1,15}$/,
    telegram: /^[A-Za-z0-9_]{5,32}$/,
    linkedin: /^[A-Za-z0-9-]{3,100}$/,
  };

  return handlePatterns[domain].test(rawHandle) ? rawHandle : null;
}

function validateSocialContacts({
  website,
  twitter,
  telegram,
  linkedin,
}: Required<SocialContacts>): SocialValidationResult {
  const normalizedWebsite = normalizeWebsite(website);
  const normalizedTwitter = normalizeHandle(twitter, 'twitter');
  const normalizedTelegram = normalizeHandle(telegram, 'telegram');
  const normalizedLinkedin = normalizeHandle(linkedin, 'linkedin');

  if (normalizedWebsite === null) {
    return { valid: false, message: 'Веб-сайт має бути коректним http або https посиланням.' };
  }

  if (normalizedTwitter === null) {
    return { valid: false, message: 'Twitter/X має бути username, @username або посиланням twitter.com/x.com.' };
  }

  if (normalizedTelegram === null) {
    return { valid: false, message: 'Telegram має бути username, @username або посиланням t.me.' };
  }

  if (normalizedLinkedin === null) {
    return { valid: false, message: 'LinkedIn має бути username або посиланням linkedin.com/in/username.' };
  }

  return {
    valid: true,
    contacts: {
      website: normalizedWebsite,
      twitter: normalizedTwitter,
      telegram: normalizedTelegram,
      linkedin: normalizedLinkedin,
    },
  };
}

function getContactHref(type: keyof SocialContacts, value?: string) {
  if (!value) {
    return '';
  }

  if (type === 'website') {
    return normalizeWebsite(value) || '';
  }

  if (type === 'twitter') {
    const handle = normalizeHandle(value, 'twitter');

    return handle ? `https://twitter.com/${handle}` : '';
  }

  if (type === 'telegram') {
    const handle = normalizeHandle(value, 'telegram');

    return handle ? `https://t.me/${handle}` : '';
  }

  const handle = normalizeHandle(value, 'linkedin');

  return handle ? `https://linkedin.com/in/${handle}` : '';
}

export function ProfilePage({ onNavigate, onMessage }: PageProps) {
  const { sessionUser } = useAuth();
  const [user, setUser] = useState<User | null>(null);
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'activity' | 'recipes' | 'stats'>('activity');

  // Bio Editing State
  const [isEditingBio, setIsEditingBio] = useState(false);
  const [tempBio, setTempBio] = useState('');

  // Social Editing State
  const [isEditingSocial, setIsEditingSocial] = useState(false);
  const [tempWebsite, setTempWebsite] = useState('');
  const [tempTwitter, setTempTwitter] = useState('');
  const [tempTelegram, setTempTelegram] = useState('');
  const [tempLinkedin, setTempLinkedin] = useState('');

  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let active = true;

    async function loadPage() {
      if (!sessionUser?.id) {
        setLoading(false);
        return;
      }

      setLoading(true);
      onMessage('error', null);

      try {
        const [userData, recipeData, commentData] = await Promise.all([
          getUser(sessionUser.id),
          getRecipes({ page: 1, perPage: 200 }),
          getUserComments(sessionUser.id),
        ]);

        if (!active) {
          return;
        }

        setUser(userData);
        setRecipes(recipeData.items.filter((recipe) => recipe.authorId === sessionUser.id));
        setComments(commentData);
      } catch (error) {
        onMessage('error', await readApiError(error));
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    void loadPage();

    return () => {
      active = false;
    };
  }, [sessionUser?.id]);

  async function handleSaveBio() {
    if (!user) return;
    setSaving(true);
    onMessage('error', null);
    try {
      const updatedUser = await updateUser(user.id, { bio: tempBio });
      setUser(updatedUser);
      setIsEditingBio(false);
      onMessage('success', 'Опис профілю успішно оновлено.');
    } catch (error) {
      onMessage('error', await readApiError(error));
    } finally {
      setSaving(false);
    }
  }

  async function handleSaveSocial() {
    if (!user) return;
    const validation = validateSocialContacts({
      website: tempWebsite,
      twitter: tempTwitter,
      telegram: tempTelegram,
      linkedin: tempLinkedin,
    });

    if (!validation.valid) {
      onMessage('error', validation.message);
      return;
    }

    setSaving(true);
    onMessage('error', null);
    try {
      const socialJson = JSON.stringify(validation.contacts);
      const updatedUser = await updateUser(user.id, { social: socialJson });
      setUser(updatedUser);
      setIsEditingSocial(false);
      onMessage('success', 'Контактні дані успішно оновлено.');
    } catch (error) {
      onMessage('error', await readApiError(error));
    } finally {
      setSaving(false);
    }
  }

  // Parse social links
  let social: SocialContacts = {};
  try {
    if (user?.social) {
      social = JSON.parse(user.social);
    }
  } catch {
    // ignore parsing errors
  }

  // Build chronological activity timeline
  type ActivityItem = {
    id: string;
    title: string;
    date: string;
    timestamp: number;
    body: string;
    commentBox?: string;
  };

  const activities: ActivityItem[] = [];
  if (user) {
    activities.push({
      id: 'reg',
      title: 'Реєстрація на платформі',
      date: formatDate(user.createdAt),
      timestamp: new Date(user.createdAt).getTime(),
      body: 'Вітаємо! Ваш обліковий запис було успішно активовано у системі "Кулінарна лабораторія".',
    });

    recipes.forEach((recipe) => {
      activities.push({
        id: `recipe-${recipe.id}`,
        title: 'Створення рецепта',
        date: formatDate(recipe.createdAt),
        timestamp: new Date(recipe.createdAt).getTime(),
        body: `Ви успішно опублікували новий рецепт страви "${recipe.name}".`,
      });
    });

    comments.forEach((comment) => {
      const recipeName = comment.recipe?.name ?? `Рецепт #${comment.recipeId}`;
      activities.push({
        id: `comment-${comment.id}`,
        title: `Новий коментар у рецепті "${recipeName}"`,
        date: formatDate(comment.createdAt),
        timestamp: new Date(comment.createdAt).getTime(),
        body: 'Ви залишили відгук до страви:',
        commentBox: comment.text,
      });
    });
  }

  // Newest first
  activities.sort((a, b) => b.timestamp - a.timestamp);

  const initialLetter = user?.name ? user.name.charAt(0).toUpperCase() : 'U';

  return (
    <section className="content-single">
      <PageHeader
        eyebrow="Особистий кабінет"
        title="Мій профіль"
        description="Керуйте своїми контактами, переглядайте хронологію своєї активності та створюйте шедеври."
      />

      {loading ? (
        <section className="panel">
          <DetailSkeleton cards={4} sections={1} />
        </section>
      ) : null}

      {!loading && user ? (
        <div className="profile-split-container">
          {/* Left Column - User Details Sidebar */}
          <section className="panel profile-sidebar-card">
            <div className="profile-avatar-wrapper">
              <div className="profile-large-avatar">
                {initialLetter}
              </div>
              <h2 className="profile-user-name">{user.name}</h2>
            </div>

            {/* About / Bio Section */}
            <div className="profile-sidebar-section">
              <h3 className="profile-section-title">Про себе</h3>
              {isEditingBio ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                  <textarea
                    value={tempBio}
                    onChange={(e) => setTempBio(e.target.value)}
                    placeholder="Розкажіть трохи про себе..."
                    rows={4}
                    style={{
                      width: '100%',
                      background: 'var(--input-bg)',
                      border: '1px solid var(--input-border)',
                      borderRadius: '6px',
                      padding: '0.5rem 0.65rem',
                      color: 'var(--fg-app)',
                      fontFamily: 'inherit',
                      fontSize: '0.9rem',
                      resize: 'vertical',
                      outline: 'none',
                    }}
                  />
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <Button variant="primary" style={{ padding: '0.4rem 0.75rem', fontSize: '0.85rem' }} onClick={handleSaveBio} disabled={saving}>
                      Зберегти
                    </Button>
                    <Button variant="ghost" style={{ padding: '0.4rem 0.75rem', fontSize: '0.85rem' }} onClick={() => setIsEditingBio(false)} disabled={saving}>
                      Скасувати
                    </Button>
                  </div>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', alignItems: 'flex-start' }}>
                  {user.bio ? (
                    <p className="profile-sidebar-bio">{user.bio}</p>
                  ) : (
                    <p className="profile-sidebar-bio-empty">Біографія порожня. Розкажіть щось про себе спільноті!</p>
                  )}
                  <Button variant="ghost" style={{ padding: '0.3rem 0', fontSize: '0.85rem', color: 'var(--primary-accent)' }} onClick={() => { setIsEditingBio(true); setTempBio(user.bio || ''); }}>
                    Редагувати опис
                  </Button>
                </div>
              )}
            </div>

            {/* Connect / Social Section */}
            <div className="profile-sidebar-section">
              <h3 className="profile-section-title">Контакти</h3>
              {isEditingSocial ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                  <div>
                    <span style={{ fontSize: '0.8rem', color: 'var(--fg-muted)', display: 'block', marginBottom: '0.2rem' }}>Веб-сайт:</span>
                    <input
                      type="text"
                      value={tempWebsite}
                      onChange={(e) => setTempWebsite(e.target.value)}
                      placeholder="https://mywebsite.com"
                      style={{ background: 'var(--input-bg)', border: '1px solid var(--input-border)', borderRadius: '6px', padding: '0.4rem 0.6rem', color: 'var(--fg-app)', fontSize: '0.85rem', width: '100%' }}
                    />
                  </div>
                  <div>
                    <span style={{ fontSize: '0.8rem', color: 'var(--fg-muted)', display: 'block', marginBottom: '0.2rem' }}>Twitter:</span>
                    <input
                      type="text"
                      value={tempTwitter}
                      onChange={(e) => setTempTwitter(e.target.value)}
                      placeholder="@handle або https://x.com/handle"
                      style={{ background: 'var(--input-bg)', border: '1px solid var(--input-border)', borderRadius: '6px', padding: '0.4rem 0.6rem', color: 'var(--fg-app)', fontSize: '0.85rem', width: '100%' }}
                    />
                  </div>
                  <div>
                    <span style={{ fontSize: '0.8rem', color: 'var(--fg-muted)', display: 'block', marginBottom: '0.2rem' }}>Telegram:</span>
                    <input
                      type="text"
                      value={tempTelegram}
                      onChange={(e) => setTempTelegram(e.target.value)}
                      placeholder="@username або https://t.me/username"
                      style={{ background: 'var(--input-bg)', border: '1px solid var(--input-border)', borderRadius: '6px', padding: '0.4rem 0.6rem', color: 'var(--fg-app)', fontSize: '0.85rem', width: '100%' }}
                    />
                  </div>
                  <div>
                    <span style={{ fontSize: '0.8rem', color: 'var(--fg-muted)', display: 'block', marginBottom: '0.2rem' }}>LinkedIn:</span>
                    <input
                      type="text"
                      value={tempLinkedin}
                      onChange={(e) => setTempLinkedin(e.target.value)}
                      placeholder="username або https://linkedin.com/in/username"
                      style={{ background: 'var(--input-bg)', border: '1px solid var(--input-border)', borderRadius: '6px', padding: '0.4rem 0.6rem', color: 'var(--fg-app)', fontSize: '0.85rem', width: '100%' }}
                    />
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.2rem' }}>
                    <Button variant="primary" style={{ padding: '0.4rem 0.75rem', fontSize: '0.85rem' }} onClick={handleSaveSocial} disabled={saving}>
                      Зберегти
                    </Button>
                    <Button variant="ghost" style={{ padding: '0.4rem 0.75rem', fontSize: '0.85rem' }} onClick={() => setIsEditingSocial(false)} disabled={saving}>
                      Скасувати
                    </Button>
                  </div>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', alignItems: 'stretch' }}>
                  <div className="connect-links-list">
                    {/* Website */}
                    <div className="connect-link-item">
                      <span className="connect-link-label">
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>
                        Веб-сайт
                      </span>
                      {social.website ? (
                        <a href={getContactHref('website', social.website)} target="_blank" rel="noopener noreferrer" className="connect-link-value">{social.website.replace(/^https?:\/\//i, '')}</a>
                      ) : (
                        <span className="connect-link-value connect-link-value-empty">—</span>
                      )}
                    </div>
                    {/* Twitter */}
                    <div className="connect-link-item">
                      <span className="connect-link-label">
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z"/></svg>
                        Twitter
                      </span>
                      {social.twitter ? (
                        <a href={getContactHref('twitter', social.twitter)} target="_blank" rel="noopener noreferrer" className="connect-link-value">{social.twitter.startsWith('@') ? social.twitter : `@${social.twitter}`}</a>
                      ) : (
                        <span className="connect-link-value connect-link-value-empty">—</span>
                      )}
                    </div>
                    {/* Telegram */}
                    <div className="connect-link-item">
                      <span className="connect-link-label">
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
                        Telegram
                      </span>
                      {social.telegram ? (
                        <a href={getContactHref('telegram', social.telegram)} target="_blank" rel="noopener noreferrer" className="connect-link-value">{social.telegram.startsWith('@') ? social.telegram : `@${social.telegram}`}</a>
                      ) : (
                        <span className="connect-link-value connect-link-value-empty">—</span>
                      )}
                    </div>
                    {/* LinkedIn */}
                    <div className="connect-link-item">
                      <span className="connect-link-label">
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect x="2" y="9" width="4" height="12"/><circle cx="4" cy="4" r="2"/></svg>
                        LinkedIn
                      </span>
                      {social.linkedin ? (
                        <a href={getContactHref('linkedin', social.linkedin)} target="_blank" rel="noopener noreferrer" className="connect-link-value">{social.linkedin}</a>
                      ) : (
                        <span className="connect-link-value connect-link-value-empty">—</span>
                      )}
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    style={{ padding: '0.3rem 0', fontSize: '0.85rem', color: 'var(--primary-accent)', marginTop: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}
                    onClick={() => {
                      setIsEditingSocial(true);
                      setTempWebsite(social.website || '');
                      setTempTwitter(social.twitter || '');
                      setTempTelegram(social.telegram || '');
                      setTempLinkedin(social.linkedin || '');
                    }}
                  >
                    Редагувати контакти
                  </Button>
                </div>
              )}
            </div>
          </section>

          {/* Right Column - Tabs and Interactive Data Content */}
          <div className="profile-content">
            {/* Tabs Header */}
            <div className="profile-tabs-header">
              <button
                className={`profile-tab-button ${activeTab === 'activity' ? 'active' : ''}`}
                onClick={() => setActiveTab('activity')}
              >
                Активність
              </button>
              <button
                className={`profile-tab-button ${activeTab === 'recipes' ? 'active' : ''}`}
                onClick={() => setActiveTab('recipes')}
              >
                Рецепти ({recipes.length})
              </button>
              <button
                className={`profile-tab-button ${activeTab === 'stats' ? 'active' : ''}`}
                onClick={() => setActiveTab('stats')}
              >
                Статистика
              </button>
            </div>

            {/* Tab Panel: Activity */}
            {activeTab === 'activity' ? (
              <section className="panel" style={{ padding: '1.75rem 2rem' }}>
                <PanelHeader title="Історія активності" meta="Стрічка подій" />
                {activities.length ? (
                  <div className="timeline-container">
                    {activities.map((act) => (
                      <div key={act.id} className="timeline-item">
                        <div className="timeline-dot"></div>
                        <div className="timeline-header">
                          <h4 className="timeline-title">{act.title}</h4>
                          <span className="timeline-date">{act.date}</span>
                        </div>
                        <p className="timeline-body">{act.body}</p>
                        {act.commentBox ? (
                          <div className="timeline-comment-box">
                            "{act.commentBox}"
                          </div>
                        ) : null}
                      </div>
                    ))}
                  </div>
                ) : (
                  <EmptyState>Активність відсутня.</EmptyState>
                )}
              </section>
            ) : null}

            {/* Tab Panel: Recipes */}
            {activeTab === 'recipes' ? (
              <section className="panel" style={{ padding: '1.75rem 2rem' }}>
                <PanelHeader title="Мої рецепти" meta={`${recipes.length} страв`} />
                {recipes.length ? (
                  <div className="recipes-grid" style={{ marginTop: '1rem' }}>
                    {recipes.map((recipe) => (
                      <div
                        key={recipe.id}
                        className="recipe-card"
                        onClick={() => onNavigate(`/recipes/${recipe.id}`)}
                      >
                        <div>
                          <h3 className="recipe-card-title">{recipe.name}</h3>
                          <div className="recipe-card-author">
                            <span>Ви</span>
                          </div>
                        </div>
                        <div className="recipe-card-meta">
                          <span className="recipe-card-tag" style={{ background: 'rgba(255, 255, 255, 0.05)', color: '#a3a3a3', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
                            Власний рецепт
                          </span>
                          <span>{formatDate(recipe.updatedAt)}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <EmptyState>Ви ще не створили жодного рецепта.</EmptyState>
                )}
              </section>
            ) : null}

            {/* Tab Panel: Stats */}
            {activeTab === 'stats' ? (
              <div style={{ display: 'grid', gap: '1.5rem' }}>
                <section className="panel" style={{ padding: '1.75rem 2rem' }}>
                  <PanelHeader title="Статистика активності" meta="Показники" />
                  <div className="stats-grid" style={{ marginTop: '1.5rem' }}>
                    <div className="stat-card">
                      <div className="stat-card-value">{recipes.length}</div>
                      <div className="stat-card-label">Створено рецептів</div>
                    </div>
                    <div className="stat-card">
                      <div className="stat-card-value">
                        {recipes.reduce((acc, r) => acc + r.text.split('\n').filter(s => s.trim().length > 0).length, 0)}
                      </div>
                      <div className="stat-card-label">Кроків приготування</div>
                    </div>
                    <div className="stat-card">
                      <div className="stat-card-value">
                        {recipes.length ? Math.round(recipes.reduce((acc, r) => acc + r.text.length, 0) / recipes.length) : 0}
                      </div>
                      <div className="stat-card-label">Сер. довжина рецепта</div>
                    </div>
                    <div className="stat-card">
                      <div className="stat-card-value">
                        {Math.max(0, Math.floor((Date.now() - new Date(user.createdAt).getTime()) / (1000 * 60 * 60 * 24)))}
                      </div>
                      <div className="stat-card-label">Днів на кухні</div>
                    </div>
                  </div>
                </section>

                <section className="panel" style={{ padding: '1.75rem 2rem' }}>
                  <PanelHeader title="Параметри облікового запису" meta="Технічні дані" />
                  <div style={{ marginTop: '1rem' }}>
                    <DetailGrid>
                      <DetailCard label="Електронна пошта" value={user.email} />
                      <DetailCard label="Ідентифікатор користувача" value={`#${user.id}`} />
                      <DetailCard label="Дата створення профілю" value={formatDate(user.createdAt)} />
                    </DetailGrid>
                  </div>
                </section>
              </div>
            ) : null}
          </div>
        </div>
      ) : null}
    </section>
  );
}
