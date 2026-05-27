import React, { useEffect, useState } from 'react';

import { Recipe, User, getRecipes, getUser, readApiError } from '../api';
import { useAuth } from '../auth';
import { formatDate, type PageProps } from '../app/shared';
import { DetailCard, DetailGrid, DetailSection } from '../components/detail';
import { PageHeader } from '../components/layout';
import { DetailSkeleton, EmptyState, PanelHeader } from '../components/surface';

export function ProfilePage({ onNavigate, onMessage }: PageProps) {
  const { sessionUser } = useAuth();
  const [user, setUser] = useState<User | null>(null);
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);

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
        const [userData, recipeData] = await Promise.all([
          getUser(sessionUser.id),
          getRecipes({ page: 1, perPage: 200 }),
        ]);

        if (!active) {
          return;
        }

        setUser(userData);
        setRecipes(recipeData.items.filter((recipe) => recipe.authorId === sessionUser.id));
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

  return (
    <section className="content-single">
      <PageHeader
        eyebrow="Профіль"
        title={user?.name ?? 'Профіль'}
        description="Переглядайте реєстраційні дані вашого облікового запису, статистику та список ваших рецептів."
      />

      <section className="panel">
        <PanelHeader title="Профіль" meta={user ? `#${user.id}` : 'Завантаження...'} />

        {loading ? <DetailSkeleton cards={4} sections={1} /> : null}

        {user ? (
          <>
            <DetailSection title="Мої рецепти" meta={`${recipes.length} страв`}>
              {recipes.length ? (
                <div className="recipes-grid">
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
            </DetailSection>

            <DetailGrid>
              <DetailCard label="Ім'я" value={user.name} />
              <DetailCard label="Електронна пошта" value={user.email} />
              <DetailCard label="Створено рецептів" value={recipes.length} />
              <DetailCard label="Дата реєстрації" value={formatDate(user.createdAt)} />
            </DetailGrid>

            <div style={{ marginTop: '2rem', marginBottom: '1rem' }}>
              <PanelHeader title="Статистика активності" meta="Показники" />
            </div>

            {/* Premium Stats Grid */}
            <div className="stats-grid">
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
          </>
        ) : null}
      </section>
    </section>
  );
}
