/**
 * For Server Components (public pages). Calls NestJS directly.
 * Every response is cache-tagged by resource so the backend can refresh it instantly.
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

/** /perfumes?x=1 -> ['perfumes'], /brands -> ['brands'], /settings/public -> ['settings'] */
function tagsFor(path: string): string[] {
  const resource = path.split('?')[0].split('/').filter(Boolean)[0];
  return resource ? [resource] : [];
}

export async function serverFetch<T>(
  path: string,
  options: { revalidate?: number; tags?: string[]; init?: RequestInit } = {},
): Promise<T> {
  const res = await fetch(`${BACKEND_URL}/api${path}`, {
    ...options.init,
    next: {
      revalidate: options.revalidate ?? 60,
      tags: options.tags ?? tagsFor(path),
    },
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