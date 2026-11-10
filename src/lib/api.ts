import axios from 'axios';

/**
 * Browser API client.
 * baseURL '/api' goes through the Next.js rewrite to NestJS.
 * The auth cookie is sent automatically — the token is NEVER touched by JS.
 */
export const api = axios.create({
  baseURL: '/api',
  withCredentials: true,
  timeout: 60_000,
});

/** Tell the app the session is gone (expired or user was blocked) */
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error?.response?.status;
    const url: string = error?.config?.url ?? '';
    if (status === 401 && !url.startsWith('/auth/') && typeof window !== 'undefined') {
      window.dispatchEvent(new Event('auth:expired'));
    }
    return Promise.reject(error);
  },
);

/** Turns any error (API or local) into one readable sentence */
export function getErrorMessage(
  error: unknown,
  fallback = 'Something went wrong. Please try again.',
): string {
  if (axios.isAxiosError(error)) {
    if (error.code === 'ECONNABORTED') return 'The request timed out. Please try again.';
    if (!error.response) return 'Network error. Please check your connection.';

    const message = (error.response.data as { message?: unknown })?.message;
    if (Array.isArray(message) && typeof message[0] === 'string') return message[0];
    if (typeof message === 'string') return message;
    return fallback;
  }

  if (error instanceof Error && error.message) return error.message;
  return fallback;
}