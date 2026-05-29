import React, { useEffect, useState } from 'react';

import { useAuth } from './auth';
import { useRoute } from './app/routing';
import { Shell } from './components/layout';
import { ToastItem, ToastStack } from './components/toast';
import { AuthPage } from './pages/auth-page';
import { IngredientDetailPage, IngredientsPage } from './pages/ingredients-pages';
import { ProfilePage } from './pages/profile-page';
import {
  RecipeCreatePage,
  RecipeDetailPage,
  RecipeEditPage,
  RecipeIngredientsPage,
  RecipesPage,
} from './pages/recipes-pages';
import { UserDetailPage, UsersPage } from './pages/users-pages';
import { AboutPage, SupportPage } from './pages/info-pages';
import { SettingsPage, NotificationsPage } from './pages/settings-notifications-pages';

export default function App() {
  const { accessToken, sessionUser, logout } = useAuth();
  const { route, navigate } = useRoute();
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  function handleMessage(type: 'error' | 'success', text: string | null) {
    if (!text) {
      return;
    }

    const nextToast: ToastItem = {
      id: Date.now() + Math.floor(Math.random() * 1000),
      tone: type,
      text,
    };

    setToasts((current) => [...current.slice(-2), nextToast]);
  }

  function dismissToast(id: number) {
    setToasts((current) => current.filter((item) => item.id !== id));
  }

  useEffect(() => {
    if (!accessToken && route.name !== 'auth' && route.name !== 'about' && route.name !== 'support') {
      navigate('/auth');
      return;
    }

    if (accessToken && route.name === 'auth') {
      navigate('/recipes');
    }
  }, [accessToken, route.name]);

  useEffect(() => {
    if (!toasts.length) {
      return;
    }

    const timers = toasts.map((toast) =>
      window.setTimeout(() => {
        dismissToast(toast.id);
      }, toast.tone === 'error' ? 5200 : 3200),
    );

    return () => {
      timers.forEach((timer) => window.clearTimeout(timer));
    };
  }, [toasts]);

  if (!accessToken) {
    if (route.name === 'about') {
      return (
        <>
          <ToastStack items={toasts} onDismiss={dismissToast} />
          <AboutPage onNavigate={navigate} onMessage={handleMessage} />
        </>
      );
    }
    
    if (route.name === 'support') {
      return (
        <>
          <ToastStack items={toasts} onDismiss={dismissToast} />
          <SupportPage onNavigate={navigate} onMessage={handleMessage} />
        </>
      );
    }

    return (
      <>
        <ToastStack items={toasts} onDismiss={dismissToast} />
        <AuthPage onNavigate={navigate} onMessage={handleMessage} />
      </>
    );
  }

  if (route.name === 'auth') {
    return (
      <>
        <ToastStack items={toasts} onDismiss={dismissToast} />
        <AuthPage onNavigate={navigate} onMessage={handleMessage} />
      </>
    );
  }

  let page: React.ReactNode;

  switch (route.name) {
    case 'recipes':
      page = <RecipesPage onNavigate={navigate} onMessage={handleMessage} />;
      break;
    case 'recipe-new':
      page = <RecipeCreatePage onNavigate={navigate} onMessage={handleMessage} />;
      break;
    case 'recipe-detail':
      page = <RecipeDetailPage id={route.id} onNavigate={navigate} onMessage={handleMessage} />;
      break;
    case 'recipe-edit':
      page = <RecipeEditPage id={route.id} onNavigate={navigate} onMessage={handleMessage} />;
      break;
    case 'recipe-ingredients':
      page = <RecipeIngredientsPage id={route.id} onNavigate={navigate} onMessage={handleMessage} />;
      break;
    case 'ingredients':
      page = <IngredientsPage onNavigate={navigate} onMessage={handleMessage} />;
      break;
    case 'ingredient-detail':
      page = <IngredientDetailPage id={route.id} onNavigate={navigate} onMessage={handleMessage} />;
      break;
    case 'users':
      page = <UsersPage onNavigate={navigate} onMessage={handleMessage} />;
      break;
    case 'user-detail':
      page = <UserDetailPage id={route.id} onNavigate={navigate} onMessage={handleMessage} />;
      break;
    case 'profile':
      page = <ProfilePage onNavigate={navigate} onMessage={handleMessage} />;
      break;
    case 'about':
      page = <AboutPage onNavigate={navigate} onMessage={handleMessage} />;
      break;
    case 'support':
      page = <SupportPage onNavigate={navigate} onMessage={handleMessage} />;
      break;
    case 'settings':
      page = <SettingsPage onNavigate={navigate} onMessage={handleMessage} />;
      break;
    case 'notifications':
      page = <NotificationsPage onNavigate={navigate} onMessage={handleMessage} />;
      break;
    default:
      page = <RecipesPage onNavigate={navigate} onMessage={handleMessage} />;
      break;
  }

  return (
    <>
      <ToastStack items={toasts} onDismiss={dismissToast} />
      <Shell route={route} sessionUser={sessionUser} onLogout={logout} onNavigate={navigate}>
        {page}
      </Shell>
    </>
  );
}
