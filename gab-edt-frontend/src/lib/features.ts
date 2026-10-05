/**
 * Écrans encore en maquette (non branchés sur l'API) : masqués en production.
 * Pour les afficher en démonstration : NEXT_PUBLIC_SHOW_PREVIEW_FEATURES=true.
 */
export const SHOW_PREVIEW_FEATURES = process.env.NEXT_PUBLIC_SHOW_PREVIEW_FEATURES === 'true';

/** Routes des écrans en maquette, bloquées par le proxy tant que l'aperçu est désactivé. */
export const PREVIEW_ROUTES = [
  '/admin/reservations',
  '/admin/justificatifs',
  '/admin/audit',
  '/admin/settings',
  '/student/evaluations',
  '/student/settings',
  '/teacher/evaluations',
  '/teacher/requests',
  '/teacher/settings',
  '/super-admin/users',
  '/super-admin/billing',
  '/super-admin/stats',
  '/super-admin/logs',
  '/super-admin/settings',
  '/tv',
];

export function isPreviewRoute(pathname: string): boolean {
  return PREVIEW_ROUTES.some((route) => pathname === route || pathname.startsWith(route + '/'));
}

export type InstitutionType = 'UNIVERSITY' | 'GRANDE_ECOLE' | 'LYCEE' | 'COLLEGE';

export const HIGHER_EDUCATION: InstitutionType[] = ['UNIVERSITY', 'GRANDE_ECOLE'];
export const SECONDARY_EDUCATION: InstitutionType[] = ['LYCEE', 'COLLEGE'];
