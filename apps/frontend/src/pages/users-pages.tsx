import React, { useEffect, useState } from 'react';

import { CollectionResponse, Recipe, User, getRecipes, getUser, getUsers, readApiError } from '../api';
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
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    async function loadPage() {
      setLoading(true);
      onMessage('error', null);

      try {
        const [userData, recipeData] = await Promise.all([
          getUser(id),
          getRecipes({ page: 1, perPage: 200 }),
        ]);

        if (!active) {
          return;
        }

        setUser(userData);
        setRecipes(recipeData.items.filter((recipe) => recipe.authorId === id));
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

  return (
    <section className="content-single">
      <PageHeader
        eyebrow="Користувачі"
        title={user?.name ?? 'Профіль користувача'}
        description="Переглядайте профіль користувача та переходьте до будь-якої страви, створеної цим автором."
        actions={
          <div className="inline-actions">
            <Button type="button" onClick={() => onNavigate('/users')}>Назад до списку</Button>
          </div>
        }
      />

      <section className="panel">
        <PanelHeader title="Профіль користувача" meta={user ? `#${user.id}` : 'Завантаження...'} />

        {loading ? <DetailSkeleton cards={4} sections={1} /> : null}

        {user ? (
          <>
            <DetailSection title="Створені рецепти" meta={`${recipes.length} страв`}>
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
            </DetailSection>

            <DetailGrid>
              <DetailCard label="Ім'я" value={user.name} />
              <DetailCard label="Електронна пошта" value={user.email} />
              <DetailCard label="Реєстрація" value={formatDate(user.createdAt)} />
              <DetailCard label="Оновлено" value={formatDate(user.updatedAt)} />
            </DetailGrid>
          </>
        ) : null}
      </section>
    </section>
  );
}
