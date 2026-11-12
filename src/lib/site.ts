/** Public site URL — used for canonical links, sitemap and structured data */
export const getSiteUrl = () =>
  (process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000').replace(/\/+$/, '');

export const absoluteUrl = (path = '/') => `${getSiteUrl()}${path.startsWith('/') ? path : `/${path}`}`;