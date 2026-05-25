export const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:3000';

export async function apiFetch(path: string, opts: RequestInit = {}) {
  const token = localStorage.getItem('accessToken');
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(opts.headers as Record<string, string> || {}),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE}${path}`, {
    ...opts,
    headers,
  });

  if (!res.ok) {
    throw res;
  }

  // Try to parse JSON; some endpoints may return empty
  const text = await res.text();
  try {
    return text ? JSON.parse(text) : {};
  } catch (e) {
    return text;
  }
}
