import React, { useEffect, useState } from 'react';

import { CollectionResponse, Recipe, User, Comment, getRecipes, getUser, getUsers, getUserComments, readApiError } from '../api';
import { PAGE_SIZE, formatDate, type PageProps } from '../app/shared';
import { Button } from '../components/button';
import { CollectionControls } from '../components/collection-controls';
import { DetailCard, DetailGrid, DetailSection } from '../components/detail';
import { TextInput } from '../components/form';
import { PageHeader, TextLink } from '../components/layout';
import { EntityListButton } from '../components/list';
import { ContentList, DetailSkeleton, EmptyState, PanelHeader, TableSkeleton } from '../components/surface';

export function UsersPage({ onNavigate, onMessage }: PageProps) {
  const [users, setUsers] = useState<CollectionResponse<User> | null>(null);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(PAGE_SIZE);
  const [loading, setLoading] = useState(true);

  async function loadUsers(nextSearch = search, nextPage = page, nextPerPage = perPage) {
    setLoading(true);
    onMessage('error', null);

    try {
      const data = await getUsers({ page: nextPage, perPage: nextPerPage, search: nextSearch });
      setUsers(data);
    } catch (error) {
      onMessage('error', await readApiError(error));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadUsers('', 1, PAGE_SIZE);
  }, []);

  return (
    <section className="content-single">
      <PageHeader
        eyebrow="Користувачі"
        title="Користувачі системи"
        description="Переглядайте профілі користувачів системи та списки страв, які вони створили."
      />

      <section className="panel">
        <PanelHeader title="Список користувачів" meta={`${users?.metadata.totalItems ?? 0} всього`} />

        <form
        className="toolbar"
        onSubmit={(event) => {
          event.preventDefault();
          setPage(1);
          void loadUsers(search, 1, perPage);
        }}
      >
        <TextInput value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Пошук користувачів за іменем..." />
        <Button type="submit">Пошук</Button>
      </form>

      <CollectionControls
        metadata={users?.metadata}
        page={page}
        perPage={perPage}
        onPageChange={(nextPage) => {
          setPage(nextPage);
          void loadUsers(search, nextPage, perPage);
        }}
        onPerPageChange={(nextPerPage) => {
          setPerPage(nextPerPage);
          setPage(1);
          void loadUsers(search, 1, nextPerPage);
        }}
      />

      <div className="table-wrap">
          {loading ? (
            <TableSkeleton rows={6} columns={4} />
          ) : (
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Ім'я</th>
                  <th>Електронна пошта</th>
                  <th>Оновлено</th>
                </tr>
              </thead>
              <tbody>
                {(users?.items ?? []).map((user) => (
                  <tr key={user.id} className="table-row-link" onClick={() => onNavigate(`/users/${user.id}`)}>
                    <td>{user.id}</td>
                    <td>{user.name}</td>
                    <td>{user.email}</td>
                    <td>{formatDate(user.updatedAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </section>
    </section>
  );
}

export function UserDetailPage({ id, onNavigate, onMessage }: PageProps & { id: number }) {
  const [user, setUser] = useState<User | null>(null);
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'activity' | 'recipes'>('activity');

  useEffect(() => {
    let active = true;

    async function loadPage() {
      setLoading(true);
      onMessage('error', null);

      try {
        const [userData, recipeData, commentData] = await Promise.all([
          getUser(id),
          getRecipes({ page: 1, perPage: 200 }),
          getUserComments(id),
        ]);

        if (!active) {
          return;
        }

        setUser(userData);
        setRecipes(recipeData.items.filter((recipe) => recipe.authorId === id));
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
  }, [id]);

  // Parse social links
  type SocialContacts = {
    website?: string;
    twitter?: string;
    telegram?: string;
    linkedin?: string;
  };

  let social: SocialContacts = {};
  try {
    if (user?.social) {
      social = JSON.parse(user.social);
    }
  } catch {
    // ignore
  }

  const hasSocialLinks = social.website || social.twitter || social.telegram || social.linkedin;

  // Build activity timeline
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
      title: 'Приєднання до спільноти',
      date: formatDate(user.createdAt).split(',')[0],
      timestamp: new Date(user.createdAt).getTime(),
      body: 'Користувач зареєструвався в системі "Кулінарна лабораторія".',
    });

    recipes.forEach((recipe) => {
      activities.push({
        id: `recipe-${recipe.id}`,
        title: 'Опубліковано страву',
        date: formatDate(recipe.createdAt).split(',')[0],
        timestamp: new Date(recipe.createdAt).getTime(),
        body: `Опубліковано новий рецепт "${recipe.name}".`,
      });
    });

    comments.forEach((comment) => {
      const recipeName = comment.recipe?.name ?? `Рецепт #${comment.recipeId}`;
      activities.push({
        id: `comment-${comment.id}`,
        title: `Новий коментар у рецепті "${recipeName}"`,
        date: formatDate(comment.createdAt).split(',')[0],
        timestamp: new Date(comment.createdAt).getTime(),
        body: 'Користувач залишив відгук до страви:',
        commentBox: comment.text,
      });
    });
  }

  activities.sort((a, b) => b.timestamp - a.timestamp);

  const initialLetter = user?.name ? user.name.charAt(0).toUpperCase() : 'U';

  return (
    <section className="content-single">
      <PageHeader
        eyebrow="Користувачі"
        title={user?.name ?? 'Профіль користувача'}
        description="Переглядайте профіль кулінара, його контакти, історію публікацій та фірмові рецепти."
        actions={
          <div className="inline-actions">
            <Button type="button" onClick={() => onNavigate('/users')}>Назад до списку</Button>
          </div>
        }
      />

      {loading ? (
        <section className="panel">
          <DetailSkeleton cards={4} sections={1} />
        </section>
      ) : null}

      {!loading && user ? (
        <div className="profile-split-container">
          {/* Left Sidebar */}
          <section className="panel profile-sidebar-card">
            <div className="profile-avatar-wrapper">
              <div className="profile-large-avatar">
                {initialLetter}
              </div>
              <h2 className="profile-user-name">{user.name}</h2>
            </div>

            {/* About / Bio */}
            {user.bio ? (
              <div className="profile-sidebar-section">
                <h3 className="profile-section-title">Про себе</h3>
                <p className="profile-sidebar-bio">{user.bio}</p>
              </div>
            ) : null}

            {/* Connect / Social */}
            {hasSocialLinks ? (
              <div className="profile-sidebar-section">
                <h3 className="profile-section-title">Контакти</h3>
                <div className="connect-links-list">
                  {social.website ? (
                    <div className="connect-link-item">
                      <span className="connect-link-label">
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>
                        Веб-сайт
                      </span>
                      <a href={social.website} target="_blank" rel="noopener noreferrer" className="connect-link-value">{social.website.replace(/^https?:\/\//i, '')}</a>
                    </div>
                  ) : null}
                  {social.twitter ? (
                    <div className="connect-link-item">
                      <span className="connect-link-label">
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z"/></svg>
                        Twitter
                      </span>
                      <a href={`https://twitter.com/${social.twitter.replace(/^@/, '')}`} target="_blank" rel="noopener noreferrer" className="connect-link-value">{social.twitter.startsWith('@') ? social.twitter : `@${social.twitter}`}</a>
                    </div>
                  ) : null}
                  {social.telegram ? (
                    <div className="connect-link-item">
                      <span className="connect-link-label">
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
                        Telegram
                      </span>
                      <a href={`https://t.me/${social.telegram.replace(/^@/, '')}`} target="_blank" rel="noopener noreferrer" className="connect-link-value">{social.telegram.startsWith('@') ? social.telegram : `@${social.telegram}`}</a>
                    </div>
                  ) : null}
                  {social.linkedin ? (
                    <div className="connect-link-item">
                      <span className="connect-link-label">
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect x="2" y="9" width="4" height="12"/><circle cx="4" cy="4" r="2"/></svg>
                        LinkedIn
                      </span>
                      <a href={`https://linkedin.com/in/${social.linkedin}`} target="_blank" rel="noopener noreferrer" className="connect-link-value">{social.linkedin}</a>
                    </div>
                  ) : null}
                </div>
              </div>
            ) : null}

            <div className="profile-sidebar-section">
              <h3 className="profile-section-title">Системні дані</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', fontSize: '0.9rem', color: 'var(--fg-muted)' }}>
                <div>ID: #{user.id}</div>
                <div>Реєстрація: {formatDate(user.createdAt).split(',')[0]}</div>
              </div>
            </div>
          </section>

          {/* Right Content Column */}
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
            </div>

            {/* Tab: Activity */}
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

            {/* Tab: Recipes */}
            {activeTab === 'recipes' ? (
              <section className="panel" style={{ padding: '1.75rem 2rem' }}>
                <PanelHeader title="Рецепти автора" meta={`${recipes.length} страв`} />
                {recipes.length ? (
                  <ContentList>
                    {recipes.map((recipe) => (
                      <EntityListButton
                        key={recipe.id}
                        title={recipe.name}
                        subtitle={<TextLink>{formatDate(recipe.updatedAt)}</TextLink>}
                        onClick={() => onNavigate(`/recipes/${recipe.id}`)}
                      />
                    ))}
                  </ContentList>
                ) : (
                  <EmptyState>Цей користувач ще не опублікував жодної страви.</EmptyState>
                )}
              </section>
            ) : null}
          </div>
        </div>
      ) : null}
    </section>
  );
}
