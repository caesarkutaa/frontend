/**
 * For Server Components (public pages like the gallery & perfume detail),
 * so they render with real data for SEO. Calls NestJS directly.
 */
const BACKEND_URL = process.env.BACKEND_URL ?? 'http://localhost:5000';

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
  }
}

export async function serverFetch<T>(
  path: string,
  options: { revalidate?: number; init?: RequestInit } = {},
): Promise<T> {
  const res = await fetch(`${BACKEND_URL}/api${path}`, {
    ...options.init,
    next: { revalidate: options.revalidate ?? 60 },
  });

  if (!res.ok) {
    let message = res.statusText;
    try {
      const body = await res.json();
      message = Array.isArray(body?.message) ? body.message[0] : body?.message ?? message;
    } catch {
      /* non-JSON error body */
    }
    throw new ApiError(res.status, message);
  }

  return res.json() as Promise<T>;
}