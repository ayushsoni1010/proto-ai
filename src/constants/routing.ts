// Routing constants
export const ROUTE_GROUPS = {
  AUTH: '(auth)',
  ROOT: '(root)',
} as const;

export const PROTECTED_ROUTES = [
  '/dashboard',
  '/images',
  '/profile',
] as const;

export const PUBLIC_ROUTES = [
  '/',
  '/login',
  '/signup',
  '/forgot-password',
] as const;

export const AUTH_ROUTES = [
  '/login',
  '/signup',
  '/forgot-password',
  '/update-password',
] as const;
