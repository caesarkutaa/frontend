/** Change this to your store's real name */
export const SITE_NAME = 'Perfume Store';
export const SITE_TAGLINE = 'Authentic fragrances, verified by QR';
export const SITE_DESCRIPTION =
  'Shop authentic designer and niche perfumes in Nigeria. Every bottle carries a QR code that links to its official product page.';

export const AUTH_COOKIE = 'access_token';

/** Must match MAX_QUANTITY_PER_ITEM in the backend cart module */
export const MAX_QUANTITY_PER_ITEM = 10;

export const GALLERY_PAGE_SIZE = 12;
export const ORDERS_PAGE_SIZE = 10;

/** Must match the backend image upload limit */
export const MAX_IMAGE_SIZE_MB = 5;

/** Shown at the top of Terms & Privacy — update when you change them */
export const POLICY_LAST_UPDATED = '12 November 2026';

export const NAV_LINKS = [
  { href: '/perfumes', label: 'Shop All' },
  { href: '/perfumes?gender=men', label: 'Men' },
  { href: '/perfumes?gender=women', label: 'Women' },
  { href: '/perfumes?gender=unisex', label: 'Unisex' },
  { href: '/brands', label: 'Brands' },
] as const;

export const INFO_LINKS = [
  { href: '/about', label: 'About us' },
  { href: '/contact', label: 'Contact us' },
  { href: '/delivery-returns', label: 'Delivery & returns' },
  { href: '/faq', label: 'FAQ' },
] as const;

export const LEGAL_LINKS = [
  { href: '/terms', label: 'Terms of service' },
  { href: '/privacy', label: 'Privacy policy' },
] as const;

export const NIGERIAN_STATES = [
  'Abia', 'Adamawa', 'Akwa Ibom', 'Anambra', 'Bauchi', 'Bayelsa', 'Benue', 'Borno',
  'Cross River', 'Delta', 'Ebonyi', 'Edo', 'Ekiti', 'Enugu', 'FCT - Abuja', 'Gombe',
  'Imo', 'Jigawa', 'Kaduna', 'Kano', 'Katsina', 'Kebbi', 'Kogi', 'Kwara', 'Lagos',
  'Nasarawa', 'Niger', 'Ogun', 'Ondo', 'Osun', 'Oyo', 'Plateau', 'Rivers', 'Sokoto',
  'Taraba', 'Yobe', 'Zamfara',
] as const;