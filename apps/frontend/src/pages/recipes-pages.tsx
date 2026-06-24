import React, { useEffect, useMemo, useState } from 'react';

import {
  CollectionResponse,
  Ingredient,
  Recipe,
  RecipeIngredient,
  Comment,
  createIngredient,
  createRecipe,
  createRecipeIngredient,
  deleteRecipe,
  deleteRecipeIngredient,
  getIngredients,
  getRecipe,
  getRecipeIngredients,
  getRecipes,
  readApiError,
  updateRecipe,
  updateRecipeIngredient,
  getRecipeComments,
  createComment,
  deleteComment,
} from '../api';
import { useAuth } from '../auth';
import { PAGE_SIZE, formatDate, type PageProps } from '../app/shared';
import { Button } from '../components/button';
import { CollectionControls } from '../components/collection-controls';
import { DetailCard, DetailGrid } from '../components/detail';
import { Field, TextArea, TextInput } from '../components/form';
import { PageHeader } from '../components/layout';
import { EntityListButton } from '../components/list';
import { ConfirmModal } from '../components/modal';
import { ContentList, DetailSkeleton, EmptyState, ListSkeleton, PanelHeader, StatusMessage } from '../components/surface';

function getRecipeSearchFromUrl() {
  return new URLSearchParams(window.location.search).get('search') ?? '';
}

export function DashboardPage({ onNavigate, onMessage }: PageProps) {
  const [recipes, setRecipes] = useState<CollectionResponse<Recipe> | null>(null);
  const [search, setSearch] = useState('');
  const [suggestions, setSuggestions] = useState<Recipe[]>([]);
  const [ingredientSuggestions, setIngredientSuggestions] = useState<Ingredient[]>([]);
  const [suggestionsOpen, setSuggestionsOpen] = useState(false);

  useEffect(() => {
    async function loadSummary() {
      try {
        const data = await getRecipes({ page: 1, perPage: 1 });
        setRecipes(data);
      } catch (error) {
        onMessage('error', await readApiError(error));
      }
    }

    void loadSummary();
  }, []);

  useEffect(() => {
    const query = search.trim();

    if (query.length < 2) {
      setSuggestions([]);
      setSuggestionsOpen(false);
      return;
    }

    let active = true;
    const timer = window.setTimeout(async () => {
      try {
        const data = await getRecipes({ page: 1, perPage: 5, search: query });

        if (!active) {
          return;
        }

        setSuggestions(data.items);
        const ingredientData = await getIngredients({ page: 1, perPage: 5, search: query });

        if (!active) {
          return;
        }

        setIngredientSuggestions(ingredientData.items);
        setSuggestionsOpen(data.items.length > 0 || ingredientData.items.length > 0);
      } catch {
        if (active) {
          setSuggestions([]);
          setIngredientSuggestions([]);
          setSuggestionsOpen(false);
        }
      }
    }, 220);

    return () => {
      active = false;
      window.clearTimeout(timer);
    };
  }, [search]);

  return (
    <section className="command-hero dashboard-command-hero">
      <div className="command-hero-copy">
        <span className="command-eyebrow">Панель</span>
        <h2>Що готуємо сьогодні?</h2>
      </div>

      <div className="command-search-wrap">
        <form
          className="command-search"
          onSubmit={(event) => {
            event.preventDefault();
            const query = search.trim();

            setSuggestionsOpen(false);
            onNavigate(query ? `/recipes?search=${encodeURIComponent(query)}` : '/recipes');
          }}
        >
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            onFocus={() => setSuggestionsOpen(suggestions.length > 0 || ingredientSuggestions.length > 0)}
            placeholder="Введіть назву рецепта або інгредієнт, що у вас є"
          />
        </form>

        {suggestionsOpen ? (
          <div className="command-suggestions">
            {suggestions.length ? <div className="command-suggestion-label">Рецепти</div> : null}
            {suggestions.map((recipe) => (
              <button
                key={recipe.id}
                type="button"
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => {
                  setSuggestionsOpen(false);
                  onNavigate(`/recipes/${recipe.id}`);
                }}
              >
                <span>
                  <strong>{recipe.name}</strong>
                  <small>{recipe.author?.name ?? `Користувач #${recipe.authorId}`}</small>
                </span>
                <small>{formatDate(recipe.updatedAt)}</small>
              </button>
            ))}
            {ingredientSuggestions.length ? <div className="command-suggestion-label">Інгредієнти</div> : null}
            {ingredientSuggestions.map((ingredient) => (
              <button
                key={ingredient.id}
                type="button"
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => {
                  setSuggestionsOpen(false);
                  onNavigate(`/ingredients/${ingredient.id}`);
                }}
              >
                <span>
                  <strong>{ingredient.name}</strong>
                  <small>Інгредієнт у вашій базі</small>
                </span>
                <small>{formatDate(ingredient.updatedAt)}</small>
              </button>
            ))}
          </div>
        ) : null}
      </div>

      <div className="command-actions" aria-label="Швидкі дії">
        <button type="button" onClick={() => onNavigate('/recipes/new')}>
          <span className="command-action-icon">+</span>
          Створити рецепт
        </button>
        <button type="button" onClick={() => onNavigate('/ingredients')}>
          <span className="command-action-icon">#</span>
          Внести інгредієнти
        </button>
        <button type="button" onClick={() => onNavigate('/recipes')}>
          <span className="command-action-icon">?</span>
          Відкрити рецепти
        </button>
      </div>

      <div className="command-stats">
        <span>{recipes?.metadata.totalItems ?? 0} рецептів</span>
        <span>База даних</span>
        <span>Окрема сторінка</span>
      </div>
    </section>
  );
}

export function RecipesPage({ onNavigate, onMessage }: PageProps) {
  const [recipes, setRecipes] = useState<CollectionResponse<Recipe> | null>(null);
  const [search, setSearch] = useState(getRecipeSearchFromUrl);
  const [debouncedSearch, setDebouncedSearch] = useState(getRecipeSearchFromUrl);
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(PAGE_SIZE);
  const [loading, setLoading] = useState(true);

  async function loadRecipes(nextSearch = debouncedSearch, nextPage = page, nextPerPage = perPage) {
    setLoading(true);
    onMessage('error', null);

    try {
      const data = await getRecipes({ page: nextPage, perPage: nextPerPage, search: nextSearch });
      setRecipes(data);
    } catch (error) {
      onMessage('error', await readApiError(error));
    } finally {
      setLoading(false);
    }
  }

  // Debounce search input changes
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  // Load recipes when page, perPage, or debounced search changes
  useEffect(() => {
    void loadRecipes(debouncedSearch, page, perPage);
  }, [debouncedSearch, page, perPage]);

  return (
    <>
      <PageHeader
        eyebrow="База даних"
        title="Рецепти"
        description="Окрема сторінка для пошуку, перегляду та керування рецептами."
        actions={
          <Button variant="primary" type="button" onClick={() => onNavigate('/recipes/new')}>
            Створити рецепт
          </Button>
        }
      />

      <section className="content-grid command-content-grid">
        <div className="panel command-results-panel">
          <PanelHeader title="База даних рецептів" meta={`${recipes?.metadata.totalItems ?? 0} всього`} />

          <form
            className="toolbar"
            onSubmit={(event) => {
              event.preventDefault();
              setPage(1);
              setDebouncedSearch(search);
              void loadRecipes(search, 1, perPage);
            }}
          >
            <TextInput
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Пошук рецептів за назвою..."
            />
            <Button type="submit">Пошук</Button>
          </form>

          {loading ? <ListSkeleton rows={5} /> : null}

          {!loading && (recipes?.items ?? []).length > 0 ? (
            <div className="recipes-grid">
              {(recipes?.items ?? []).map((recipe) => (
                <div
                  key={recipe.id}
                  className="recipe-card"
                  onClick={() => onNavigate(`/recipes/${recipe.id}`)}
                >
                  <div>
                    <h3 className="recipe-card-title">{recipe.name}</h3>
                    <div className="recipe-card-author">
                      <span>Автор: {recipe.author?.name ?? `Користувач #${recipe.authorId}`}</span>
                    </div>
                  </div>
                  <div className="recipe-card-meta">
                    <span className="recipe-card-tag">Рецепт</span>
                    <span>{formatDate(recipe.updatedAt)}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            !loading && <EmptyState>Рецептів не знайдено.</EmptyState>
          )}

          <CollectionControls
            metadata={recipes?.metadata}
            page={page}
            perPage={perPage}
            onPageChange={(nextPage) => {
              setPage(nextPage);
            }}
            onPerPageChange={(nextPerPage) => {
              setPerPage(nextPerPage);
              setPage(1);
            }}
          />
        </div>
      </section>
    </>
  );
}

export function RecipeCreatePage({ onNavigate, onMessage }: PageProps) {
  const { sessionUser } = useAuth();
  const [name, setName] = useState('');
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const [nameWarning, setNameWarning] = useState('');

  // Ingredients and weights state
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [localIngredients, setLocalIngredients] = useState<Array<{ id: number; name: string; amount: number; unit: string }>>([]);

  // Add row autocomplete states
  const [searchIngredient, setSearchIngredient] = useState('');
  const [selectedIngredientId, setSelectedIngredientId] = useState<number | ''>('');
  const [amount, setAmount] = useState('100');
  const [unit, setUnit] = useState('г');
  const [dropdownOpen, setDropdownOpen] = useState(false);

  // Load ingredients list from api on mount
  useEffect(() => {
    async function loadIngredientsList() {
      try {
        const data = await getIngredients({ page: 1, perPage: 200 });
        setIngredients(data.items);
      } catch (e) {
        // ignore errors
      }
    }
    void loadIngredientsList();
  }, []);

  // Global click to safely dismiss autocomplete dropdowns
  useEffect(() => {
    function handleGlobalClick() {
      setTimeout(() => {
        setDropdownOpen(false);
      }, 180);
    }
    document.addEventListener('click', handleGlobalClick);
    return () => document.removeEventListener('click', handleGlobalClick);
  }, []);

  // Client-side real-time uniqueness validation
  useEffect(() => {
    if (!name.trim()) {
      setNameWarning('');
      return;
    }
    const checkUniqueness = async () => {
      try {
        const res = await getRecipes({ page: 1, perPage: 200, search: name.trim() });
        const exists = res.items.some(
          (r) => r.name.toLowerCase() === name.trim().toLowerCase() && r.authorId === sessionUser?.id
        );
        if (exists) {
          setNameWarning('У вас вже є рецепт з такою назвою. Створення створить дублікат.');
        } else {
          setNameWarning('');
        }
      } catch (e) {
        // ignore validation errors silently
      }
    };
    const timer = setTimeout(checkUniqueness, 400);
    return () => clearTimeout(timer);
  }, [name, sessionUser?.id]);

  // Autocomplete search filtering
  const filteredIngredients = useMemo(() => {
    const query = searchIngredient.toLowerCase().trim();
    if (!query) return ingredients;
    return ingredients.filter((ing) => ing.name.toLowerCase().includes(query));
  }, [ingredients, searchIngredient]);

  const exactMatchExists = useMemo(() => {
    const query = searchIngredient.toLowerCase().trim();
    return ingredients.some((ing) => ing.name.toLowerCase() === query);
  }, [ingredients, searchIngredient]);

  function selectIngredient(ing: Ingredient) {
    setSelectedIngredientId(ing.id);
    setSearchIngredient(ing.name);
    setDropdownOpen(false);
  }

  async function handleQuickCreate() {
    if (!searchIngredient.trim()) return;
    onMessage('error', null);
    try {
      const created = await createIngredient(searchIngredient.trim());
      onMessage('success', `Інгредієнт "${created.name}" успішно створено!`);

      // Reload ingredients list
      const data = await getIngredients({ page: 1, perPage: 200 });
      setIngredients(data.items);

      // Auto-select
      setSelectedIngredientId(created.id);
      setSearchIngredient(created.name);
      setDropdownOpen(false);
    } catch (error) {
      onMessage('error', await readApiError(error));
    }
  }

  function addLocalIngredient() {
    if (!selectedIngredientId) {
      onMessage('error', 'Будь ласка, оберіть інгредієнт із випадаючого списку.');
      return;
    }
    const ing = ingredients.find((i) => i.id === selectedIngredientId);
    if (!ing) return;

    if (localIngredients.some((i) => i.id === ing.id)) {
      onMessage('error', 'Цей інгредієнт вже додано.');
      return;
    }

    setLocalIngredients((prev) => [
      ...prev,
      {
        id: ing.id,
        name: ing.name,
        amount: Number(amount),
        unit: unit.trim(),
      },
    ]);

    // Reset row inputs
    setSearchIngredient('');
    setSelectedIngredientId('');
    setAmount('100');
    setUnit('г');
    onMessage('error', null);
  }

  function removeLocalIngredient(id: number) {
    setLocalIngredients((prev) => prev.filter((i) => i.id !== id));
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();

    if (!sessionUser?.id) {
      onMessage('error', 'Сесія користувача відсутня.');
      return;
    }

    if (localIngredients.length === 0) {
      onMessage('error', 'Будь ласка, додайте хоча б один інгредієнт (грамовку) до рецепта.');
      return;
    }

    setLoading(true);
    onMessage('error', null);

    try {
      // 1. Create recipe
      const created = await createRecipe({
        name: name.trim(),
        text: text.trim(),
      });

      // 2. Attach ingredients sequentially
      for (const ing of localIngredients) {
        await createRecipeIngredient({
          recipeId: created.id,
          ingredientId: ing.id,
          amount: ing.amount,
          unit: ing.unit,
        });
      }

      onMessage('success', 'Рецепт та його грамовки успішно збережено.');
      onNavigate(`/recipes/${created.id}`);
    } catch (error) {
      onMessage('error', await readApiError(error));
    } finally {
      setLoading(false);
    }
  }

  // Parse instructions on the fly for live preview
  const previewSteps = useMemo(() => {
    return text
      .split('\n')
      .map((step) => step.trim())
      .filter((step) => step.length > 0);
  }, [text]);

  return (
    <>
      <PageHeader
        eyebrow="Рецепти"
        title="Створення рецепта"
        description="Напишіть назву, додайте склад та грамовки інгредієнтів, а також інструкції. Все буде збережено автоматично."
      />

      <section className="content-grid" style={{ gridTemplateColumns: 'minmax(320px, 0.55fr) minmax(320px, 0.45fr)', gap: '1.5rem' }}>
        <form className="panel" onSubmit={handleSubmit}>
          <PanelHeader title="Новий рецепт" meta={`Автор #${sessionUser?.id ?? '—'}`} />

          <Field label="Назва страви">
            <TextInput
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Наприклад: Млинці класичні..."
              required
            />
            {nameWarning ? (
              <span style={{ fontSize: '0.82rem', color: '#ffb3b3', marginTop: '0.25rem', display: 'block' }}>
                ⚠️ {nameWarning}
              </span>
            ) : null}
          </Field>

          {/* Local Ingredients Builder Section */}
          <div style={{ border: '1px solid var(--border-panel)', padding: '1.25rem', borderRadius: '6px', background: 'rgba(255,255,255,0.01)', display: 'grid', gap: '0.75rem' }}>
            <PanelHeader title="Склад та грамовки інгредієнтів" meta={`${localIngredients.length} додано`} />

            {localIngredients.length > 0 ? (
              <div style={{ display: 'grid', gap: '0.5rem', marginBottom: '0.5rem' }}>
                {localIngredients.map((item) => (
                  <div
                    key={item.id}
                    className="list-item"
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '0.65rem 0.85rem',
                      background: 'rgba(255, 255, 255, 0.02)',
                    }}
                  >
                    <div>
                      <strong style={{ color: '#fff' }}>{item.name}</strong>
                      <span style={{ marginLeft: '0.75rem', color: 'var(--primary-accent)', fontWeight: 600 }}>
                        {item.amount} {item.unit}
                      </span>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      style={{
                        padding: '0.25rem 0.5rem',
                        fontSize: '0.8rem',
                        border: '1px solid rgba(255,0,0,0.2)',
                        color: '#ffb3b3'
                      }}
                      onClick={() => removeLocalIngredient(item.id)}
                    >
                      Вилучити
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <p style={{ margin: '0 0 0.5rem', fontSize: '0.9rem', color: '#888' }}>
                Додайте інгредієнти до складу страви за допомогою форми нижче.
              </p>
            )}

            {/* Quick Add Ingredient Row Form */}
            <div style={{ display: 'grid', gap: '0.75rem', background: 'rgba(255,255,255,0.02)', padding: '1rem', borderRadius: '4px', border: '1px solid #222' }}>
              <div className="autocomplete-container" onClick={(e) => e.stopPropagation()}>
                <TextInput
                  value={searchIngredient}
                  onChange={(event) => {
                    setSearchIngredient(event.target.value);
                    setDropdownOpen(true);
                    const found = ingredients.find(i => i.name.toLowerCase() === event.target.value.toLowerCase());
                    setSelectedIngredientId(found ? found.id : '');
                  }}
                  onFocus={() => setDropdownOpen(true)}
                  placeholder="Шукайте інгредієнт або введіть нову назву..."
                />
                {dropdownOpen && (
                  <div className="autocomplete-dropdown">
                    {filteredIngredients.map((ing) => (
                      <div
                        key={ing.id}
                        className="autocomplete-option"
                        onClick={() => selectIngredient(ing)}
                      >
                        {ing.name}
                      </div>
                    ))}
                    {!exactMatchExists && searchIngredient.trim().length > 0 && (
                      <div
                        className="autocomplete-option create-option"
                        onClick={() => void handleQuickCreate()}
                      >
                        Створити та вибрати: "{searchIngredient.trim()}"
                      </div>
                    )}
                    {filteredIngredients.length === 0 && !searchIngredient.trim() && (
                      <div className="autocomplete-option" style={{ color: '#777', cursor: 'default' }}>
                        Інгредієнтів не знайдено
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <TextInput
                  type="number"
                  min="0.000001"
                  step="any"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="Кількість..."
                />
                <TextInput
                  value={unit}
                  onChange={(e) => setUnit(e.target.value)}
                  placeholder="Одиниця виміру (напр. г)..."
                />
              </div>

              <Button
                type="button"
                variant="secondary"
                style={{ padding: '0.6rem' }}
                disabled={!selectedIngredientId}
                onClick={addLocalIngredient}
              >
                Додати інгредієнт до складу
              </Button>
            </div>
          </div>

          <Field label="Інструкції / Опис кроків (Кожен крок з нового рядка)">
            <TextArea
              value={text}
              onChange={(event) => setText(event.target.value)}
              placeholder="Крок 1: Змішати борошно з яйцями та молоком.&#10;Крок 2: Добре перемішати вінчиком до однорідності.&#10;Крок 3: Смажити на розігрітій пательні з двох сторін..."
              rows={10}
              required
            />
          </Field>

          <div className="inline-actions">
            <Button type="button" onClick={() => onNavigate('/recipes')}>
              Скасувати
            </Button>
            <Button variant="primary" type="submit" disabled={loading}>
              {loading ? 'Збереження...' : 'Створити рецепт'}
            </Button>
          </div>
        </form>

        <div className="panel-stack">
          {/* Live Ingredients Preview */}
          <section className="panel" style={{ padding: '1.25rem' }}>
            <PanelHeader title="Склад страви (Живий перегляд)" meta={`${localIngredients.length} одиниць`} />
            {localIngredients.length > 0 ? (
              <div style={{ display: 'grid', gap: '0.5rem', marginTop: '0.5rem' }}>
                {localIngredients.map((item) => (
                  <div
                    key={item.id}
                    className="list-item"
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '0.75rem 1rem',
                    }}
                  >
                    <span style={{ fontWeight: 600, color: '#fff' }}>{item.name}</span>
                    <span style={{ color: 'var(--primary-accent)', fontWeight: 600 }}>{item.amount} {item.unit}</span>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState>
                Додайте інгредієнти зліва, щоб побачити склад страви на цій панелі.
              </EmptyState>
            )}
          </section>

          {/* Live Steps Preview */}
          <section className="panel" style={{ padding: '1.25rem' }}>
            <PanelHeader title="Живий перегляд інструкції" meta={`${previewSteps.length} кроків`} />

            {previewSteps.length > 0 ? (
              <div style={{ display: 'grid', gap: '0.75rem', marginTop: '0.5rem' }}>
                {previewSteps.map((step, idx) => (
                  <div
                    key={idx}
                    className="list-item"
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.35rem',
                      padding: '0.85rem 1rem',
                      borderLeft: '3px solid var(--secondary-accent)',
                    }}
                  >
                    <span style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: '1.5rem',
                      height: '1.5rem',
                      borderRadius: '50%',
                      background: 'rgba(255, 255, 255, 0.08)',
                      color: '#fff',
                      fontSize: '0.76rem',
                      fontWeight: 'bold'
                    }}>
                      {idx + 1}
                    </span>
                    <p style={{ margin: 0, color: '#eee', fontSize: '0.92rem', lineHeight: '1.4' }}>
                      {step}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState>
                Почніть писати кроки інструкції зліва (кожен крок з нового рядка), щоб побачити їх покроковий розбір тут у реальному часі.
              </EmptyState>
            )}
          </section>
        </div>
      </section>
    </>
  );
}

export function RecipeDetailPage({ id, onNavigate, onMessage }: PageProps & { id: number }) {
  const { sessionUser } = useAuth();
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [recipeIngredients, setRecipeIngredients] = useState<RecipeIngredient[]>([]);
  const [comments, setComments] = useState<Comment[]>([]);
  const [commentText, setCommentText] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);

  // Cooking mode interactive state
  const [cookingMode, setCookingMode] = useState(false);
  const [checkedIngredients, setCheckedIngredients] = useState<Set<number>>(new Set());
  const [checkedSteps, setCheckedSteps] = useState<Set<number>>(new Set());

  async function loadRecipe() {
    setLoading(true);
    onMessage('error', null);

    try {
      const [recipeData, recipeIngredientData, commentData] = await Promise.all([
        getRecipe(id),
        getRecipeIngredients({ page: 1, perPage: 200, recipeId: id }),
        getRecipeComments(id),
      ]);

      setRecipe(recipeData);
      setRecipeIngredients(recipeIngredientData.items);
      setComments(commentData);
    } catch (error) {
      onMessage('error', await readApiError(error));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadRecipe();
    // Reset cooking state when recipe changes
    setCheckedIngredients(new Set());
    setCheckedSteps(new Set());
    setCookingMode(false);
  }, [id]);

  async function handleDelete() {
    setDeleting(true);
    onMessage('error', null);

    try {
      await deleteRecipe(id);
      onMessage('success', 'Рецепт видалено.');
      onNavigate('/recipes');
    } catch (error) {
      onMessage('error', await readApiError(error));
    } finally {
      setDeleting(false);
    }
  }

  async function handlePostComment(e: React.FormEvent) {
    e.preventDefault();
    if (!commentText.trim() || !sessionUser?.id) return;

    setSubmittingComment(true);
    onMessage('error', null);

    try {
      const newComment = await createComment(id, {
        text: commentText.trim(),
      });
      setComments((prev) => [newComment, ...prev]);
      setCommentText('');
      onMessage('success', 'Коментар додано.');
    } catch (error) {
      onMessage('error', await readApiError(error));
    } finally {
      setSubmittingComment(false);
    }
  }

  async function handleDeleteComment(commentId: number) {
    onMessage('error', null);
    try {
      await deleteComment(commentId);
      setComments((prev) => prev.filter((c) => c.id !== commentId));
      onMessage('success', 'Коментар видалено.');
    } catch (error) {
      onMessage('error', await readApiError(error));
    }
  }

  function toggleIngredientCheck(ingId: number) {
    if (!cookingMode) return;
    setCheckedIngredients((prev) => {
      const next = new Set(prev);
      if (next.has(ingId)) {
        next.delete(ingId);
      } else {
        next.add(ingId);
      }
      return next;
    });
  }

  function toggleStepCheck(stepIndex: number) {
    if (!cookingMode) return;
    setCheckedSteps((prev) => {
      const next = new Set(prev);
      if (next.has(stepIndex)) {
        next.delete(stepIndex);
      } else {
        next.add(stepIndex);
      }
      return next;
    });
  }

  // Parse instruction paragraphs/sentences as distinct steps
  const steps = useMemo(() => {
    if (!recipe?.text) return [];
    return recipe.text
      .split('\n')
      .map((step) => step.trim())
      .filter((step) => step.length > 0);
  }, [recipe?.text]);

  return (
    <section className="content-single" style={{ maxWidth: '960px', width: '100%', margin: '0 auto' }}>
      <PageHeader
        eyebrow="Рецепти"
        title={recipe?.name ?? 'Деталі рецепта'}
        description="Переглядайте вміст рецепта, список задіяних інгредієнтів або переходьте до інтерактивного режиму швидкого приготування."
        actions={
          <div className="inline-actions">
            <Button type="button" onClick={() => onNavigate('/recipes')}>Назад до списку</Button>
            <Button type="button" onClick={() => onNavigate(`/recipes/${id}/edit`)}>Редагувати</Button>
            <Button type="button" onClick={() => onNavigate(`/recipes/${id}/ingredients`)}>Керувати інгредієнтами</Button>
          </div>
        }
      />

      {loading ? (
        <section className="panel">
          <PanelHeader title="Огляд рецепта" meta="Завантаження..." />
          <DetailSkeleton cards={4} sections={2} />
        </section>
      ) : null}

      {recipe ? (
        <div style={{ display: 'grid', gap: '1.5rem', width: '100%' }}>
          
          {/* Metadata Card */}
          <section className="panel">
            <PanelHeader title="Огляд рецепта" meta={`#${recipe.id}`} />
            <DetailGrid>
              <DetailCard label="Назва" value={recipe.name} />
              <DetailCard
                label="Автор"
                value={
                  <a
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      onNavigate(`/users/${recipe.authorId}`);
                    }}
                    style={{
                      color: 'var(--primary-accent)',
                      textDecoration: 'none',
                      borderBottom: '1px dashed var(--fg-muted)',
                      paddingBottom: '2px',
                      transition: 'all 0.2s',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.25rem'
                    }}
                    onMouseOver={(e) => {
                      e.currentTarget.style.color = 'var(--primary-accent-hover)';
                      e.currentTarget.style.borderBottomColor = 'var(--primary-accent-hover)';
                    }}
                    onMouseOut={(e) => {
                      e.currentTarget.style.color = 'var(--primary-accent)';
                      e.currentTarget.style.borderBottomColor = 'var(--fg-muted)';
                    }}
                    title="Перейти до профілю автора"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ transform: 'translateY(-0.5px)' }}>
                      <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/>
                      <circle cx="12" cy="7" r="4"/>
                    </svg>
                    {recipe.author?.name ?? `Користувач #${recipe.authorId}`}
                  </a>
                }
              />
              <DetailCard label="Створено" value={formatDate(recipe.createdAt)} />
              <DetailCard label="Оновлено" value={formatDate(recipe.updatedAt)} />
            </DetailGrid>
          </section>

          {/* Cooking Mode Toggle Switch */}
          <section className="panel" style={{ padding: '1.25rem' }}>
            <div className="cooking-toggle-container" style={{ margin: 0, border: 'none', background: 'transparent', padding: 0, width: '100%', display: 'flex', flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: '1rem' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', userSelect: 'none' }}>
                <input
                  type="checkbox"
                  checked={cookingMode}
                  onChange={(e) => setCookingMode(e.target.checked)}
                  style={{ width: '1.25rem', height: '1.25rem', accentColor: 'var(--primary-accent)', cursor: 'pointer' }}
                />
                <span style={{ fontWeight: 600, color: 'var(--primary-accent)', fontSize: '1rem' }}>
                  {cookingMode ? 'Режим приготування активний' : 'Активувати режим приготування'}
                </span>
              </label>
              <span style={{ fontSize: '0.85rem', color: 'var(--fg-muted)' }}>
                (Відмічайте готові кроки та інгредієнти під час готування!)
              </span>
            </div>
          </section>

          {/* Split Grid for ingredients vs steps */}
          <div className={`recipe-split-grid ${cookingMode ? 'cooking-mode-list' : ''}`}>
            
            {/* Ingredients Column */}
            <div className="panel" style={{ minHeight: 'auto', padding: '1.5rem' }}>
              <PanelHeader title="Список інгредієнтів" meta={`${recipeIngredients.length} одиниць`} />
              {recipeIngredients.length ? (
                <ContentList>
                  {recipeIngredients.map((item) => {
                    const isChecked = checkedIngredients.has(item.id);
                    return (
                      <div
                        key={item.id}
                        onClick={() => toggleIngredientCheck(item.id)}
                        className={`list-item ${isChecked ? 'item-checked' : ''}`}
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          cursor: cookingMode ? 'pointer' : 'default',
                          padding: '0.85rem 1rem',
                          borderLeft: cookingMode && !isChecked ? '3px solid var(--secondary-accent)' : 'none'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                          {cookingMode && (
                            <input
                              type="checkbox"
                              checked={isChecked}
                              readOnly
                              style={{ width: '1.1rem', height: '1.1rem', accentColor: 'var(--primary-accent)', cursor: 'pointer' }}
                            />
                          )}
                          {cookingMode ? (
                            <strong style={{ color: isChecked ? 'var(--fg-muted)' : 'var(--fg-app)' }}>
                              {item.ingredient?.name ?? `Інгредієнт #${item.ingredientId}`}
                            </strong>
                          ) : (
                            <strong style={{ color: 'var(--fg-app)' }}>
                              <a
                                href="#"
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  onNavigate(`/ingredients/${item.ingredientId}`);
                                }}
                                style={{
                                  color: 'var(--fg-app)',
                                  textDecoration: 'none',
                                  borderBottom: '1px dashed var(--fg-muted)',
                                  paddingBottom: '1px',
                                  transition: 'all 0.2s',
                                  cursor: 'pointer'
                                }}
                                onMouseOver={(e) => {
                                  e.currentTarget.style.color = 'var(--primary-accent-hover)';
                                  e.currentTarget.style.borderBottomColor = 'var(--primary-accent-hover)';
                                }}
                                onMouseOut={(e) => {
                                  e.currentTarget.style.color = 'var(--fg-app)';
                                  e.currentTarget.style.borderBottomColor = 'var(--fg-muted)';
                                }}
                                title="Переглянути деталі інгредієнта"
                              >
                                {item.ingredient?.name ?? `Інгредієнт #${item.ingredientId}`}
                              </a>
                            </strong>
                          )}
                        </div>
                        <span style={{ color: isChecked ? 'var(--fg-muted)' : 'var(--primary-accent)', fontWeight: 500 }}>
                          {item.amount} {item.unit}
                        </span>
                      </div>
                    );
                  })}
                </ContentList>
              ) : (
                <EmptyState>Інгредієнти ще не додані.</EmptyState>
              )}
            </div>

            {/* Instructions Column */}
            <div className="panel" style={{ minHeight: 'auto', padding: '1.5rem' }}>
              <PanelHeader title="Покрокова інструкція" meta={`${steps.length} кроків`} />
              {steps.length ? (
                <ContentList>
                  {steps.map((step, idx) => {
                    const isChecked = checkedSteps.has(idx);
                    return (
                      <div
                        key={idx}
                        onClick={() => toggleStepCheck(idx)}
                        className={`list-item ${isChecked ? 'item-checked' : ''}`}
                        style={{
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '0.5rem',
                          cursor: cookingMode ? 'pointer' : 'default',
                          padding: '1rem',
                          borderLeft: cookingMode && !isChecked ? '3px solid var(--primary-accent)' : 'none'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                          {cookingMode && (
                            <input
                              type="checkbox"
                              checked={isChecked}
                              readOnly
                              style={{ width: '1.1rem', height: '1.1rem', accentColor: 'var(--primary-accent)', cursor: 'pointer' }}
                            />
                          )}
                          <span style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            width: '1.6rem',
                            height: '1.6rem',
                            borderRadius: '50%',
                            background: isChecked ? '#222' : 'rgba(255, 255, 255, 0.08)',
                            color: isChecked ? '#666' : '#fff',
                            fontSize: '0.8rem',
                            fontWeight: 'bold'
                          }}>
                            {idx + 1}
                          </span>
                        </div>
                        <p style={{ margin: 0, paddingLeft: cookingMode ? '2rem' : '0', color: isChecked ? 'var(--fg-muted)' : 'var(--fg-app)', lineHeight: '1.6', fontSize: '0.98rem' }}>
                          {step}
                        </p>
                      </div>
                    );
                  })}
                </ContentList>
              ) : (
                <EmptyState>Інструкції відсутні.</EmptyState>
              )}
            </div>

          </div>

          <section className="panel" style={{ padding: '1.5rem', display: 'grid', gap: '1.25rem' }}>
            <PanelHeader title="Коментарі спільноти" meta={`${comments.length} відгуків`} />

            <form onSubmit={handlePostComment} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <TextArea
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Поділіться своїми враженнями від приготування страви..."
                rows={3}
                disabled={submittingComment}
                style={{ width: '100%' }}
              />
              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <Button type="submit" variant="primary" disabled={submittingComment || !commentText.trim()}>
                  {submittingComment ? 'Надсилання...' : 'Опублікувати коментар'}
                </Button>
              </div>
            </form>

            {comments.length ? (
              <ContentList>
                {comments.map((comment) => {
                  const authorName = comment.author?.name || `Користувач #${comment.authorId}`;
                  const authorInitials = authorName.charAt(0).toUpperCase();
                  const isAuthor = comment.authorId === sessionUser?.id;

                  return (
                    <div
                      key={comment.id}
                      className="list-item"
                      style={{
                        display: 'flex',
                        gap: '1rem',
                        padding: '1.25rem',
                        background: 'rgba(255, 255, 255, 0.01)',
                        border: '1px solid var(--sidebar-border)',
                        borderRadius: '8px',
                        alignItems: 'flex-start'
                      }}
                    >
                      <div
                        style={{
                          width: '2.5rem',
                          height: '2.5rem',
                          borderRadius: '50%',
                          background: 'linear-gradient(135deg, var(--primary-accent), var(--secondary-accent))',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: 'bold',
                          color: '#000',
                          fontSize: '1rem',
                          flexShrink: 0
                        }}
                      >
                        {authorInitials}
                      </div>

                      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
                          <span style={{ fontWeight: 600, color: 'var(--fg-app)' }}>
                            {authorName}
                          </span>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            <span style={{ fontSize: '0.8rem', color: 'var(--fg-muted)' }}>
                              {formatDate(comment.createdAt)}
                            </span>
                            {isAuthor && (
                              <button
                                type="button"
                                onClick={() => void handleDeleteComment(comment.id)}
                                style={{
                                  background: 'transparent',
                                  border: 'none',
                                  color: '#ff6b6b',
                                  cursor: 'pointer',
                                  display: 'flex',
                                  alignItems: 'center',
                                  padding: '0.2rem',
                                  opacity: 0.8,
                                  transition: 'opacity 0.2s'
                                }}
                                title="Видалити коментар"
                              >
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                  <line x1="18" y1="6" x2="6" y2="18"/>
                                  <line x1="6" y1="6" x2="18" y2="18"/>
                                </svg>
                              </button>
                            )}
                          </div>
                        </div>
                        <p style={{ margin: 0, fontSize: '0.94rem', color: 'var(--fg-app)', opacity: 0.95, lineHeight: '1.5', whiteSpace: 'pre-wrap' }}>
                          {comment.text}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </ContentList>
            ) : (
              <EmptyState>Коментарів до цього рецепта ще немає. Будьте першим, хто поділиться своєю думкою!</EmptyState>
            )}
          </section>

          {/* Actions Bar */}
          <div className="inline-actions" style={{ marginTop: '0.5rem' }}>
            <Button type="button" variant="danger" onClick={() => setConfirmDeleteOpen(true)} disabled={deleting}>
              {deleting ? 'Видалення...' : 'Видалити рецепт'}
            </Button>
          </div>
          
        </div>
      ) : null}

      <ConfirmModal
        open={confirmDeleteOpen}
        title="Видалити рецепт"
        description="Ця дія назавжди видалить рецепт з вашої кулінарної книги."
        confirmLabel="Видалити рецепт"
        busy={deleting}
        onCancel={() => setConfirmDeleteOpen(false)}
        onConfirm={() => void handleDelete().finally(() => setConfirmDeleteOpen(false))}
      />
    </section>
  );
}

export function RecipeEditPage({ id, onNavigate, onMessage }: PageProps & { id: number }) {
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let active = true;

    async function loadRecipe() {
      setLoading(true);
      onMessage('error', null);

      try {
        const data = await getRecipe(id);

        if (!active) {
          return;
        }

        setRecipe(data);
        setText(data.text);
      } catch (error) {
        onMessage('error', await readApiError(error));
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    void loadRecipe();

    return () => {
      active = false;
    };
  }, [id]);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setSaving(true);
    onMessage('error', null);

    try {
      await updateRecipe(id, text.trim());
      onMessage('success', 'Рецепт оновлено.');
      onNavigate(`/recipes/${id}`);
    } catch (error) {
      onMessage('error', await readApiError(error));
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="content-single">
      <PageHeader
        eyebrow="Рецепти"
        title={recipe?.name ? `Редагування: ${recipe.name}` : 'Редактор рецепта'}
        description="У цьому вікні ви можете відкоригувати кроки інструкції страви."
      />

      <form className="panel" onSubmit={handleSubmit}>
        <PanelHeader title="Редактор рецепта" meta={recipe ? `#${recipe.id}` : 'Завантаження...'} />

        {loading ? <StatusMessage>Завантаження рецепта...</StatusMessage> : null}

        <Field label="Назва страви">
          <TextInput value={recipe?.name ?? ''} readOnly />
        </Field>

        <Field label="Інструкції / Опис кроків">
          <TextArea
            value={text}
            onChange={(event) => setText(event.target.value)}
            rows={10}
            disabled={!recipe || loading}
            required
          />
        </Field>

        <div className="inline-actions">
          <Button type="button" onClick={() => onNavigate(`/recipes/${id}`)}>Скасувати</Button>
          <Button variant="primary" type="submit" disabled={!recipe || saving}>
            {saving ? 'Збереження...' : 'Зберегти зміни'}
          </Button>
        </div>
      </form>
    </section>
  );
}

export function RecipeIngredientsPage({ id, onNavigate, onMessage }: PageProps & { id: number }) {
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [items, setItems] = useState<RecipeIngredient[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [createIngredientId, setCreateIngredientId] = useState<number | ''>('');
  const [createAmount, setCreateAmount] = useState('1');
  const [createUnit, setCreateUnit] = useState('г');
  const [editIngredientId, setEditIngredientId] = useState<number | ''>('');
  const [editAmount, setEditAmount] = useState('1');
  const [editUnit, setEditUnit] = useState('');
  const [loading, setLoading] = useState(true);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);

  // Autocomplete search states
  const [createSearch, setCreateSearch] = useState('');
  const [createDropdownOpen, setCreateDropdownOpen] = useState(false);
  const [editSearch, setEditSearch] = useState('');
  const [editDropdownOpen, setEditDropdownOpen] = useState(false);

  const selectedItem = useMemo(
    () => items.find((item) => item.id === selectedId) ?? null,
    [items, selectedId],
  );

  // Sync edits when selection changes
  useEffect(() => {
    setEditIngredientId(selectedItem?.ingredientId ?? '');
    setEditAmount(selectedItem ? String(selectedItem.amount) : '1');
    setEditUnit(selectedItem?.unit ?? '');
    setEditSearch(selectedItem?.ingredient?.name ?? '');
  }, [selectedItem]);

  // Click outside to close dropdowns safely
  useEffect(() => {
    function handleGlobalClick() {
      setTimeout(() => {
        setCreateDropdownOpen(false);
        setEditDropdownOpen(false);
      }, 180);
    }
    document.addEventListener('click', handleGlobalClick);
    return () => document.removeEventListener('click', handleGlobalClick);
  }, []);

  async function loadPage() {
    setLoading(true);
    onMessage('error', null);

    try {
      const [recipeData, ingredientData, recipeIngredientData] = await Promise.all([
        getRecipe(id),
        getIngredients({ page: 1, perPage: 200 }),
        getRecipeIngredients({ page: 1, perPage: 200, recipeId: id }),
      ]);

      const nextItems = recipeIngredientData.items;
      setRecipe(recipeData);
      setIngredients(ingredientData.items);
      setItems(nextItems);
      setSelectedId((current) => (nextItems.some((item) => item.id === current) ? current : nextItems[0]?.id ?? null));

      // Preset first ingredient in select state if exists
      const firstIng = ingredientData.items[0];
      if (firstIng) {
        setCreateIngredientId(firstIng.id);
        setCreateSearch(firstIng.name);
      }
    } catch (error) {
      onMessage('error', await readApiError(error));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadPage();
  }, [id]);

  // Autocomplete Filtering logic
  const filteredCreateIngredients = useMemo(() => {
    const query = createSearch.toLowerCase().trim();
    if (!query) return ingredients;
    return ingredients.filter((ing) => ing.name.toLowerCase().includes(query));
  }, [ingredients, createSearch]);

  const exactCreateMatchExists = useMemo(() => {
    const query = createSearch.toLowerCase().trim();
    return ingredients.some((ing) => ing.name.toLowerCase() === query);
  }, [ingredients, createSearch]);

  const filteredEditIngredients = useMemo(() => {
    const query = editSearch.toLowerCase().trim();
    if (!query) return ingredients;
    return ingredients.filter((ing) => ing.name.toLowerCase().includes(query));
  }, [ingredients, editSearch]);

  const exactEditMatchExists = useMemo(() => {
    const query = editSearch.toLowerCase().trim();
    return ingredients.some((ing) => ing.name.toLowerCase() === query);
  }, [ingredients, editSearch]);

  function selectCreateIngredient(ing: Ingredient) {
    setCreateIngredientId(ing.id);
    setCreateSearch(ing.name);
    setCreateDropdownOpen(false);
  }

  function selectEditIngredient(ing: Ingredient) {
    setEditIngredientId(ing.id);
    setEditSearch(ing.name);
    setEditDropdownOpen(false);
  }

  async function handleQuickCreateIngredient() {
    if (!createSearch.trim()) return;
    onMessage('error', null);
    try {
      const created = await createIngredient(createSearch.trim());
      onMessage('success', `Інгредієнт "${created.name}" успішно створено!`);
      
      // Reload ingredients list from API
      const ingredientData = await getIngredients({ page: 1, perPage: 200 });
      setIngredients(ingredientData.items);
      
      // Auto select the new ingredient
      setCreateIngredientId(created.id);
      setCreateSearch(created.name);
      setCreateDropdownOpen(false);
    } catch (error) {
      onMessage('error', await readApiError(error));
    }
  }

  async function handleQuickCreateEditIngredient() {
    if (!editSearch.trim()) return;
    onMessage('error', null);
    try {
      const created = await createIngredient(editSearch.trim());
      onMessage('success', `Інгредієнт "${created.name}" успішно створено!`);
      
      // Reload ingredients list from API
      const ingredientData = await getIngredients({ page: 1, perPage: 200 });
      setIngredients(ingredientData.items);
      
      // Auto select the new ingredient
      setEditIngredientId(created.id);
      setEditSearch(created.name);
      setEditDropdownOpen(false);
    } catch (error) {
      onMessage('error', await readApiError(error));
    }
  }

  async function handleCreate(event: React.FormEvent) {
    event.preventDefault();

    if (!createIngredientId) {
      onMessage('error', 'Будь ласка, спершу оберіть інгредієнт.');
      return;
    }

    onMessage('error', null);

    try {
      await createRecipeIngredient({
        recipeId: id,
        ingredientId: Number(createIngredientId),
        amount: Number(createAmount),
        unit: createUnit.trim(),
      });

      onMessage('success', 'Інгредієнт успішно додано до страви.');
      await loadPage();
    } catch (error) {
      onMessage('error', await readApiError(error));
    }
  }

  async function handleUpdate(event: React.FormEvent) {
    event.preventDefault();

    if (!selectedItem || !editIngredientId) {
      return;
    }

    onMessage('error', null);

    try {
      await updateRecipeIngredient(selectedItem.id, {
        recipeId: id,
        ingredientId: Number(editIngredientId),
        amount: Number(editAmount),
        unit: editUnit.trim(),
      });

      onMessage('success', 'Кількість інгредієнта оновлено.');
      await loadPage();
    } catch (error) {
      onMessage('error', await readApiError(error));
    }
  }

  async function handleDelete() {
    if (!selectedItem) {
      return;
    }

    onMessage('error', null);

    try {
      await deleteRecipeIngredient(selectedItem.id);
      onMessage('success', 'Інгредієнт вилучено зі страви.');
      await loadPage();
    } catch (error) {
      onMessage('error', await readApiError(error));
    }
  }

  return (
    <>
      <PageHeader
        eyebrow="Рецепти"
        title={recipe?.name ? `Інгредієнти страви: ${recipe.name}` : 'Інгредієнти рецепта'}
        description="Призначайте інгредієнти із вказанням кількості та одиниць вимірювання, а також редагуйте або видаляйте вибрані елементи."
      />

      <section className="content-grid">
        <div className="panel">
          <PanelHeader title="Інгредієнти страви" meta={recipe ? recipe.name : 'Завантаження...'} />

          {loading ? <ListSkeleton rows={4} /> : null}

          <ContentList>
            {items.map((item) => (
              <EntityListButton
                key={item.id}
                selected={selectedId === item.id}
                title={item.ingredient?.name ?? `Інгредієнт #${item.ingredientId}`}
                subtitle={`${item.amount} ${item.unit}`}
                meta={formatDate(item.updatedAt)}
                onClick={() => setSelectedId(item.id)}
              />
            ))}
          </ContentList>
        </div>

        <div className="panel-stack">
          {/* Add Ingredient Autocomplete Form */}
          <form className="panel" onSubmit={handleCreate}>
            <PanelHeader title="Додати інгредієнт" meta={`Рецепт #${id}`} />

            <Field label="Інгредієнт (Пошук / Напишіть для створення)">
              <div className="autocomplete-container" onClick={(e) => e.stopPropagation()}>
                <TextInput
                  value={createSearch}
                  onChange={(event) => {
                    setCreateSearch(event.target.value);
                    setCreateDropdownOpen(true);
                    const found = ingredients.find(i => i.name.toLowerCase() === event.target.value.toLowerCase());
                    setCreateIngredientId(found ? found.id : '');
                  }}
                  onFocus={() => setCreateDropdownOpen(true)}
                  placeholder="Пошук інгредієнта або нова назва..."
                  required
                />
                {createDropdownOpen && (
                  <div className="autocomplete-dropdown">
                    {filteredCreateIngredients.map((ingredient) => (
                      <div
                        key={ingredient.id}
                        className="autocomplete-option"
                        onClick={() => selectCreateIngredient(ingredient)}
                      >
                        {ingredient.name}
                      </div>
                    ))}
                    {!exactCreateMatchExists && createSearch.trim().length > 0 && (
                      <div
                        className="autocomplete-option create-option"
                        onClick={() => void handleQuickCreateIngredient()}
                      >
                        Створити та додати: "{createSearch.trim()}"
                      </div>
                    )}
                    {filteredCreateIngredients.length === 0 && !createSearch.trim() && (
                      <div className="autocomplete-option" style={{ color: '#777', cursor: 'default' }}>
                        Інгредієнтів не знайдено
                      </div>
                    )}
                  </div>
                )}
              </div>
            </Field>

            <Field label="Кількість">
              <TextInput value={createAmount} onChange={(event) => setCreateAmount(event.target.value)} type="number" min="0.000001" step="any" required />
            </Field>

            <Field label="Одиниця виміру">
              <TextInput value={createUnit} onChange={(event) => setCreateUnit(event.target.value)} required />
            </Field>

            <Button variant="primary" type="submit" disabled={!createIngredientId}>Додати до рецепта</Button>
          </form>

          {/* Edit Selection Autocomplete Form */}
          <form className="panel" onSubmit={handleUpdate}>
            <PanelHeader title="Редагувати вибране" meta={selectedItem ? `#${selectedItem.id}` : 'Немає вибору'} />

            <Field label="Інгредієнт (Пошук / Напишіть для створення)">
              <div className="autocomplete-container" onClick={(e) => e.stopPropagation()}>
                <TextInput
                  value={editSearch}
                  onChange={(event) => {
                    setEditSearch(event.target.value);
                    setEditDropdownOpen(true);
                    const found = ingredients.find(i => i.name.toLowerCase() === event.target.value.toLowerCase());
                    setEditIngredientId(found ? found.id : '');
                  }}
                  onFocus={() => setEditDropdownOpen(true)}
                  disabled={!selectedItem}
                  placeholder="Спершу оберіть рядок інгредієнта вище..."
                  required
                />
                {editDropdownOpen && selectedItem && (
                  <div className="autocomplete-dropdown">
                    {filteredEditIngredients.map((ingredient) => (
                      <div
                        key={ingredient.id}
                        className="autocomplete-option"
                        onClick={() => selectEditIngredient(ingredient)}
                      >
                        {ingredient.name}
                      </div>
                    ))}
                    {!exactEditMatchExists && editSearch.trim().length > 0 && (
                      <div
                        className="autocomplete-option create-option"
                        onClick={() => void handleQuickCreateEditIngredient()}
                      >
                        Створити та додати: "{editSearch.trim()}"
                      </div>
                    )}
                    {filteredEditIngredients.length === 0 && !editSearch.trim() && (
                      <div className="autocomplete-option" style={{ color: '#777', cursor: 'default' }}>
                        Інгредієнтів не знайдено
                      </div>
                    )}
                  </div>
                )}
              </div>
            </Field>

            <Field label="Кількість">
              <TextInput
                value={editAmount}
                onChange={(event) => setEditAmount(event.target.value)}
                type="number"
                min="0.000001"
                step="any"
                disabled={!selectedItem}
                required
              />
            </Field>

            <Field label="Одиниця виміру">
              <TextInput value={editUnit} onChange={(event) => setEditUnit(event.target.value)} disabled={!selectedItem} required />
            </Field>

            <div className="inline-actions">
              <Button type="button" onClick={() => onNavigate(`/recipes/${id}`)}>Назад</Button>
              <Button type="button" variant="danger" onClick={() => setConfirmDeleteOpen(true)} disabled={!selectedItem}>
                Видалити
              </Button>
              <Button variant="primary" type="submit" disabled={!selectedItem || !editIngredientId}>
                Зберегти
              </Button>
            </div>
          </form>
        </div>
      </section>

      <ConfirmModal
        open={confirmDeleteOpen}
        title="Вилучити інгредієнт"
        description="Це дія вилучить вибраний інгредієнт зі складу цієї страви."
        confirmLabel="Видалити рядок"
        onCancel={() => setConfirmDeleteOpen(false)}
        onConfirm={() => void handleDelete().finally(() => setConfirmDeleteOpen(false))}
      />
    </>
  );
}
