const DEFAULT_API_URL = 'https://quest-vr39.onrender.com';

export const API_BASE_URL =
  (import.meta.env.VITE_API_URL as string | undefined)?.replace(/\/$/, '') ||
  (typeof window !== 'undefined' && window.location.hostname === 'localhost'
    ? ''
    : DEFAULT_API_URL);

export const apiUrl = (path: string) => {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${API_BASE_URL}${normalizedPath}`;
};
