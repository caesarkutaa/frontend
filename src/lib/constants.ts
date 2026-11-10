/** Change this to your store's real name */
export const SITE_NAME = 'Perfume Store';
export const SITE_TAGLINE = 'Authentic fragrances, verified by QR';

export const AUTH_COOKIE = 'access_token';

/** Must match MAX_QUANTITY_PER_ITEM in the backend cart module */
export const MAX_QUANTITY_PER_ITEM = 10;

export const GALLERY_PAGE_SIZE = 12;

export const NAV_LINKS = [
  { href: '/perfumes', label: 'Shop All' },
  { href: '/perfumes?gender=men', label: 'Men' },
  { href: '/perfumes?gender=women', label: 'Women' },
  { href: '/perfumes?gender=unisex', label: 'Unisex' },
  { href: '/brands', label: 'Brands' },
] as const;