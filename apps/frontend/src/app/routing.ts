import { useEffect, useMemo, useState } from 'react';

export type Route =
  | { name: 'auth' }
  | { name: 'recipes' }
  | { name: 'recipe-new' }
  | { name: 'recipe-detail'; id: number }
  | { name: 'recipe-edit'; id: number }
  | { name: 'recipe-ingredients'; id: number }
  | { name: 'ingredients' }
  | { name: 'ingredient-detail'; id: number }
  | { name: 'users' }
  | { name: 'user-detail'; id: number }
  | { name: 'profile' };

export function parseRoute(pathname: string): Route {
  if (pathname === '/' || pathname === '') {
    return { name: 'recipes' };
  }

  if (pathname === '/auth') {
    return { name: 'auth' };
  }

  if (pathname === '/recipes') {
    return { name: 'recipes' };
  }

  if (pathname === '/recipes/new') {
    return { name: 'recipe-new' };
  }

  const recipeIngredientsMatch = pathname.match(/^\/recipes\/(\d+)\/ingredients$/);
  if (recipeIngredientsMatch) {
    return { name: 'recipe-ingredients', id: Number(recipeIngredientsMatch[1]) };
  }

  const recipeEditMatch = pathname.match(/^\/recipes\/(\d+)\/edit$/);
  if (recipeEditMatch) {
    return { name: 'recipe-edit', id: Number(recipeEditMatch[1]) };
  }

  const recipeDetailMatch = pathname.match(/^\/recipes\/(\d+)$/);
  if (recipeDetailMatch) {
    return { name: 'recipe-detail', id: Number(recipeDetailMatch[1]) };
  }

  if (pathname === '/ingredients') {
    return { name: 'ingredients' };
  }

  const ingredientDetailMatch = pathname.match(/^\/ingredients\/(\d+)$/);
  if (ingredientDetailMatch) {
    return { name: 'ingredient-detail', id: Number(ingredientDetailMatch[1]) };
  }

  if (pathname === '/users') {
    return { name: 'users' };
  }

  const userDetailMatch = pathname.match(/^\/users\/(\d+)$/);
  if (userDetailMatch) {
    return { name: 'user-detail', id: Number(userDetailMatch[1]) };
  }

  if (pathname === '/profile') {
    return { name: 'profile' };
  }

  return { name: 'recipes' };
}

export function useRoute() {
  const [pathname, setPathname] = useState(window.location.pathname);

  useEffect(() => {
    const handlePopState = () => setPathname(window.location.pathname);
    window.addEventListener('popstate', handlePopState);

    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const route = useMemo(() => parseRoute(pathname), [pathname]);

  function navigate(path: string) {
    if (path === window.location.pathname) {
      return;
    }

    window.history.pushState({}, '', path);
    setPathname(path);
  }

  return { route, navigate };
}

export function getNavKey(route: Route) {
  if (route.name === 'ingredients' || route.name === 'ingredient-detail') {
    return 'ingredients';
  }

  if (route.name === 'users' || route.name === 'user-detail') {
    return 'users';
  }

  if (route.name === 'profile') {
    return 'profile';
  }

  return 'recipes';
}
