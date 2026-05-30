import { useEffect, useMemo, useState } from 'react';

export type Route =
  | { name: 'auth' }
  | { name: 'dashboard' }
  | { name: 'recipes' }
  | { name: 'recipe-new' }
  | { name: 'recipe-detail'; id: number }
  | { name: 'recipe-edit'; id: number }
  | { name: 'recipe-ingredients'; id: number }
  | { name: 'ingredients' }
  | { name: 'ingredient-detail'; id: number }
  | { name: 'users' }
  | { name: 'user-detail'; id: number }
  | { name: 'profile' }
  | { name: 'about' }
  | { name: 'support' }
  | { name: 'settings' }
  | { name: 'notifications' };

export function parseRoute(pathname: string): Route {
  if (pathname === '/' || pathname === '') {
    return { name: 'dashboard' };
  }

  if (pathname === '/auth') {
    return { name: 'auth' };
  }

  if (pathname === '/dashboard') {
    return { name: 'dashboard' };
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

  if (pathname === '/about') {
    return { name: 'about' };
  }

  if (pathname === '/support') {
    return { name: 'support' };
  }

  if (pathname === '/profile') {
    return { name: 'profile' };
  }

  if (pathname === '/settings') {
    return { name: 'settings' };
  }

  if (pathname === '/notifications') {
    return { name: 'notifications' };
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
    if (path === `${window.location.pathname}${window.location.search}`) {
      return;
    }

    window.history.pushState({}, '', path);
    setPathname(window.location.pathname);
  }

  return { route, navigate };
}

export function getNavKey(route: Route) {
  if (route.name === 'dashboard') {
    return 'dashboard';
  }

  if (route.name === 'ingredients' || route.name === 'ingredient-detail') {
    return 'ingredients';
  }

  if (route.name === 'users' || route.name === 'user-detail') {
    return 'users';
  }

  if (route.name === 'profile') {
    return 'profile';
  }

  if (route.name === 'about') {
    return 'about';
  }

  if (route.name === 'support') {
    return 'support';
  }

  if (route.name === 'settings') {
    return 'settings';
  }

  if (route.name === 'notifications') {
    return 'notifications';
  }

  return 'recipes';
}
