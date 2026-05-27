import React, { useEffect, useMemo, useState } from 'react';

import {
  CollectionResponse,
  Ingredient,
  RecipeIngredient,
  createIngredient,
  deleteIngredient,
  getIngredient,
  getIngredients,
  getRecipeIngredients,
  readApiError,
  updateIngredient,
} from '../api';
import { PAGE_SIZE, formatDate, type PageProps } from '../app/shared';
import { Button } from '../components/button';
import { CollectionControls } from '../components/collection-controls';
import { DetailCard, DetailGrid, DetailSection } from '../components/detail';
import { Field, TextInput } from '../components/form';
import { PageHeader } from '../components/layout';
import { EntityListButton } from '../components/list';
import { ConfirmModal } from '../components/modal';
import { ContentList, DetailSkeleton, EmptyState, ListSkeleton, PanelHeader } from '../components/surface';

export function IngredientsPage({ onNavigate, onMessage }: PageProps) {
  const [ingredients, setIngredients] = useState<CollectionResponse<Ingredient> | null>(null);
  const [selectedIngredientId, setSelectedIngredientId] = useState<number | null>(null);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(PAGE_SIZE);
  const [createName, setCreateName] = useState('');
  const [editName, setEditName] = useState('');
  const [loading, setLoading] = useState(true);

  const selectedIngredient = useMemo(
    () => ingredients?.items.find((item) => item.id === selectedIngredientId) ?? null,
    [ingredients, selectedIngredientId],
  );

  useEffect(() => {
    setEditName(selectedIngredient?.name ?? '');
  }, [selectedIngredient]);

  async function loadIngredients(nextSearch = search, nextPage = page, nextPerPage = perPage) {
    setLoading(true);
    onMessage('error', null);

    try {
      const data = await getIngredients({ page: nextPage, perPage: nextPerPage, search: nextSearch });
      setIngredients(data);
      setSelectedIngredientId((current) => (data.items.some((item) => item.id === current) ? current : data.items[0]?.id ?? null));
    } catch (error) {
      onMessage('error', await readApiError(error));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadIngredients('', 1, PAGE_SIZE);
  }, []);

  async function handleCreate(event: React.FormEvent) {
    event.preventDefault();
    onMessage('error', null);

    try {
      await createIngredient(createName.trim());
      setCreateName('');
      onMessage('success', 'Інгредієнт успішно створено.');
      await loadIngredients();
    } catch (error) {
      onMessage('error', await readApiError(error));
    }
  }

  async function handleUpdate(event: React.FormEvent) {
    event.preventDefault();

    if (!selectedIngredient) {
      return;
    }

    onMessage('error', null);

    try {
      await updateIngredient(selectedIngredient.id, editName.trim());
      onMessage('success', 'Інгредієнт оновлено.');
      await loadIngredients();
    } catch (error) {
      onMessage('error', await readApiError(error));
    }
  }

  return (
    <>
      <PageHeader
        eyebrow="Інгредієнти"
        title="Реєстр кулінарних інгредієнтів"
        description="Керуйте словником інгредієнтів для зв'язку зі стравами та підтримуйте єдиний реєстр у робочому просторі."
      />

      <section className="content-grid">
        <div className="panel">
          <PanelHeader title="Список інгредієнтів" meta={`${ingredients?.metadata.totalItems ?? 0} всього`} />

          <form
            className="toolbar"
            onSubmit={(event) => {
              event.preventDefault();
              setPage(1);
              void loadIngredients(search, 1, perPage);
            }}
          >
            <TextInput value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Пошук інгредієнтів за назвою..." />
            <Button type="submit">Пошук</Button>
          </form>

          {loading ? <ListSkeleton rows={5} /> : null}

          <CollectionControls
            metadata={ingredients?.metadata}
            page={page}
            perPage={perPage}
            onPageChange={(nextPage) => {
              setPage(nextPage);
              void loadIngredients(search, nextPage, perPage);
            }}
            onPerPageChange={(nextPerPage) => {
              setPerPage(nextPerPage);
              setPage(1);
              void loadIngredients(search, 1, nextPerPage);
            }}
          />

          <ContentList>
            {(ingredients?.items ?? []).map((ingredient) => (
              <EntityListButton
                key={ingredient.id}
                selected={selectedIngredientId === ingredient.id}
                title={ingredient.name}
                subtitle={`#${ingredient.id}`}
                meta={formatDate(ingredient.updatedAt)}
                onClick={() => setSelectedIngredientId(ingredient.id)}
              />
            ))}
          </ContentList>
        </div>

        <div className="panel-stack">
          <form className="panel" onSubmit={handleCreate}>
            <PanelHeader title="Новий інгредієнт" meta="Створити" />

            <Field label="Назва інгредієнта">
              <TextInput value={createName} onChange={(event) => setCreateName(event.target.value)} required />
            </Field>

            <Button variant="primary" type="submit">Створити інгредієнт</Button>
          </form>

          <form className="panel" onSubmit={handleUpdate}>
            <PanelHeader title="Редактор інгредієнта" meta={selectedIngredient ? `#${selectedIngredient.id}` : 'Немає вибору'} />

            <Field label="Назва інгредієнта">
              <TextInput value={editName} onChange={(event) => setEditName(event.target.value)} disabled={!selectedIngredient} required />
            </Field>

            <div className="inline-actions">
              <Button type="button" disabled={!selectedIngredient} onClick={() => selectedIngredient && onNavigate(`/ingredients/${selectedIngredient.id}`)}>
                Переглянути деталі
              </Button>
              <Button variant="primary" type="submit" disabled={!selectedIngredient}>
                Зберегти зміни
              </Button>
            </div>
          </form>
        </div>
      </section>
    </>
  );
}

export function IngredientDetailPage({ id, onNavigate, onMessage }: PageProps & { id: number }) {
  const [ingredient, setIngredient] = useState<Ingredient | null>(null);
  const [recipeLinks, setRecipeLinks] = useState<RecipeIngredient[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);

  useEffect(() => {
    let active = true;

    async function loadPage() {
      setLoading(true);
      onMessage('error', null);

      try {
        const [ingredientData, recipeIngredientData] = await Promise.all([
          getIngredient(id),
          getRecipeIngredients({ page: 1, perPage: 200, ingredientId: id }),
        ]);

        if (!active) {
          return;
        }

        setIngredient(ingredientData);
        setRecipeLinks(recipeIngredientData.items);
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

  async function handleDelete() {
    setDeleting(true);
    onMessage('error', null);

    try {
      await deleteIngredient(id);
      onMessage('success', 'Інгредієнт видалено.');
      onNavigate('/ingredients');
    } catch (error) {
      onMessage('error', await readApiError(error));
    } finally {
      setDeleting(false);
    }
  }

  return (
    <section className="content-single">
      <PageHeader
        eyebrow="Інгредієнти"
        title={ingredient?.name ?? 'Деталі інгредієнта'}
        description="Перевірте використання цього інгредієнта у стравах перед внесенням змін чи його видаленням."
        actions={
          <div className="inline-actions">
            <Button type="button" onClick={() => onNavigate('/ingredients')}>Назад до списку</Button>
          </div>
        }
      />

      <section className="panel">
        <PanelHeader title="Деталі інгредієнта" meta={ingredient ? `#${ingredient.id}` : 'Завантаження...'} />

        {loading ? <DetailSkeleton cards={3} sections={1} /> : null}

        {ingredient ? (
          <>
            <DetailGrid>
              <DetailCard label="Назва" value={ingredient.name} />
              <DetailCard label="Створено" value={formatDate(ingredient.createdAt)} />
              <DetailCard label="Оновлено" value={formatDate(ingredient.updatedAt)} />
            </DetailGrid>

            <DetailSection title="Використовується в рецептах" meta={`${recipeLinks.length} зв'язків`}>

              {recipeLinks.length ? (
                <ContentList>
                  {recipeLinks.map((item) => (
                    <EntityListButton
                      key={item.id}
                      title={item.recipe?.name ?? `Рецепт #${item.recipeId}`}
                      subtitle={`${item.amount} ${item.unit}`}
                      onClick={() => onNavigate(`/recipes/${item.recipeId}`)}
                    />
                  ))}
                </ContentList>
              ) : (
                <EmptyState>Цей інгредієнт ще не додано до жодної страви.</EmptyState>
              )}
            </DetailSection>

            <div className="inline-actions">
              <Button type="button" variant="danger" onClick={() => setConfirmDeleteOpen(true)} disabled={deleting}>
                {deleting ? 'Видалення...' : 'Видалити'}
              </Button>
            </div>
          </>
        ) : null}
      </section>

      <ConfirmModal
        open={confirmDeleteOpen}
        title="Видалити інгредієнт"
        description="Це дія назавжди видалить інгредієнт із вашого словника і розірве зв'язки з рецептами."
        confirmLabel="Видалити"
        busy={deleting}
        onCancel={() => setConfirmDeleteOpen(false)}
        onConfirm={() => void handleDelete().finally(() => setConfirmDeleteOpen(false))}
      />
    </section>
  );
}
