export const API_BASE = import.meta.env.VITE_API_BASE || 'http://127.0.0.1:3000';

export type CollectionMetadata = {
  page: number;
  perPage: number;
  totalPages: number;
  totalItems: number;
};

export type CollectionResponse<T> = {
  items: T[];
  metadata: CollectionMetadata;
};

export type SessionTokens = {
  accessToken: string;
  refreshToken: string;
};

export type User = {
  id: number;
  name: string;
  email: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
};

export type Ingredient = {
  id: number;
  name: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
};

export type Recipe = {
  id: number;
  name: string;
  text: string;
  authorId: number;
  author?: User | null;
  recipeIngredients?: RecipeIngredient[] | null;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
};

export type RecipeIngredient = {
  id: number;
  recipeId: number;
  recipe?: Recipe | null;
  ingredientId: number;
  ingredient?: Ingredient | null;
  amount: number;
  unit: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
};

export type CollectionQuery = {
  page?: number;
  perPage?: number;
  search?: string;
  recipeId?: number;
  ingredientId?: number;
};

export async function apiFetch<T>(path: string, opts: RequestInit = {}): Promise<T> {
  const token = localStorage.getItem('accessToken');
  const headers: Record<string, string> = {
    ...(opts.body ? { 'Content-Type': 'application/json' } : {}),
    ...((opts.headers as Record<string, string>) || {}),
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE}${path}`, {
    ...opts,
    headers,
  });

  if (!res.ok) {
    throw res;
  }

  const text = await res.text();

  if (!text) {
    return {} as T;
  }

  return JSON.parse(text) as T;
}

export async function readApiError(error: unknown) {
  if (error instanceof Response) {
    const text = await error.text();

    if (!text) {
      return `Request failed with status ${error.status}`;
    }

    try {
      const parsed = JSON.parse(text) as { message?: string | string[] };

      if (Array.isArray(parsed.message)) {
        return parsed.message.join(', ');
      }

      return parsed.message || text;
    } catch {
      return text;
    }
  }

  if (error instanceof Error) {
    return error.message;
  }

  return 'Request failed';
}

function buildCollectionQuery({ page = 1, perPage = 12, search = '', recipeId, ingredientId }: CollectionQuery) {
  const query = new URLSearchParams({
    page: String(page),
    perPage: String(perPage),
  });

  const trimmedSearch = search.trim();

  if (trimmedSearch) {
    query.set('search', trimmedSearch);
  }

  if (recipeId) {
    query.set('recipeId', String(recipeId));
  }

  if (ingredientId) {
    query.set('ingredientId', String(ingredientId));
  }

  return query.toString();
}

export function getUsers(query: CollectionQuery = {}) {
  return apiFetch<CollectionResponse<User>>(`/user/collection?${buildCollectionQuery(query)}`);
}

export function getIngredients(query: CollectionQuery = {}) {
  return apiFetch<CollectionResponse<Ingredient>>(`/ingredient/collection?${buildCollectionQuery(query)}`);
}

export function getRecipes(query: CollectionQuery = {}) {
  return apiFetch<CollectionResponse<Recipe>>(`/recipe/collection?${buildCollectionQuery(query)}`);
}

export function getRecipe(id: number) {
  return apiFetch<Recipe>(`/recipe/${id}`);
}

export function createIngredient(name: string) {
  return apiFetch<Ingredient>('/ingredient', {
    method: 'POST',
    body: JSON.stringify({ name }),
  });
}

export function updateIngredient(id: number, name: string) {
  return apiFetch<Ingredient>(`/ingredient/${id}`, {
    method: 'PATCH',
    body: JSON.stringify({ name }),
  });
}

export function getIngredient(id: number) {
  return apiFetch<Ingredient>(`/ingredient/${id}`);
}

export function deleteIngredient(id: number) {
  return apiFetch<Ingredient>(`/ingredient/${id}`, {
    method: 'DELETE',
  });
}

export function createRecipe(input: { name: string; text: string; authorId: number }) {
  return apiFetch<Recipe>('/recipe', {
    method: 'POST',
    body: JSON.stringify(input),
  });
}

export function updateRecipe(id: number, text: string) {
  return apiFetch<Recipe>(`/recipe/${id}`, {
    method: 'PATCH',
    body: JSON.stringify({ text }),
  });
}

export function deleteRecipe(id: number) {
  return apiFetch<Recipe>(`/recipe/${id}`, {
    method: 'DELETE',
  });
}

export function getUser(id: number) {
  return apiFetch<User>(`/user/${id}`);
}

export function getRecipeIngredients(query: CollectionQuery = {}) {
  return apiFetch<CollectionResponse<RecipeIngredient>>(
    `/recipeIngredient/collection?${buildCollectionQuery(query)}`,
  );
}

export function createRecipeIngredient(input: {
  recipeId: number;
  ingredientId: number;
  amount: number;
  unit: string;
}) {
  return apiFetch<RecipeIngredient>('/recipeIngredient', {
    method: 'POST',
    body: JSON.stringify(input),
  });
}

export function updateRecipeIngredient(
  id: number,
  input: Partial<Pick<RecipeIngredient, 'recipeId' | 'ingredientId' | 'amount' | 'unit'>>,
) {
  return apiFetch<RecipeIngredient>(`/recipeIngredient/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(input),
  });
}

export function deleteRecipeIngredient(id: number) {
  return apiFetch<RecipeIngredient>(`/recipeIngredient/${id}`, {
    method: 'DELETE',
  });
}
