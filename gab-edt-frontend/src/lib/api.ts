/**
 * Client HTTP du navigateur.
 *
 * Toutes les requêtes passent par le proxy Next.js /api/backend (même origine) :
 * le jeton reste dans un cookie HttpOnly, inaccessible au JavaScript, et le proxy
 * se charge de l'ajouter et de le renouveler. Aucun jeton n'est stocké côté client.
 */
export const API_URL = '/api/backend';

/** Profil affiché dans l'interface (non sensible) — renvoyé par /api/auth/login. */
export interface SessionUser {
  email?: string;
  firstName?: string;
  lastName?: string;
  role?: string;
  institutionId?: string;
}

const USER_KEY = 'user_data';

export class ApiError extends Error {
  /** Code métier renvoyé par l'API (ex. CLOSED_PERIOD, SCHEDULE_CONFLICT) */
  constructor(public readonly status: number, message: string, public readonly code?: string) {
    super(message);
    this.name = 'ApiError';
  }
}

export function getStoredUser(): SessionUser {
  if (typeof window === 'undefined') return {};
  try {
    return JSON.parse(window.localStorage.getItem(USER_KEY) || '{}');
  } catch {
    return {};
  }
}

export function storeUser(user: SessionUser) {
  try {
    window.localStorage.setItem(USER_KEY, JSON.stringify(user));
  } catch {
    // stockage indisponible (navigation privée) : l'interface affichera un profil vide
  }
}

function redirectToLogin() {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.removeItem(USER_KEY);
  } catch {
    // ignoré
  }
  const next = encodeURIComponent(window.location.pathname);
  window.location.href = `/login?next=${next}`;
}

async function errorDetails(response: Response): Promise<{ message: string; code?: string }> {
  const text = await response.text().catch(() => '');
  try {
    const body = JSON.parse(text);
    if (body?.message) return { message: body.message, code: body.code };
  } catch {
    // réponse non JSON
  }
  return { message: text || `Erreur ${response.status}` };
}

/** Une séance tombe pendant une fermeture (férié, vacances) : l'API attend une confirmation explicite. */
export function isClosedPeriodError(error: unknown): error is ApiError {
  return error instanceof ApiError && error.code === 'CLOSED_PERIOD';
}

/**
 * Requête brute vers l'API (ex. téléchargement de fichiers). Gère la session expirée
 * (redirection vers la connexion) et l'accès refusé (erreur, sans déconnexion).
 */
export async function apiFetch(endpoint: string, options: RequestInit = {}): Promise<Response> {
  const headers = new Headers(options.headers);
  if (options.body && !(options.body instanceof FormData) && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
    credentials: 'same-origin',
  });

  if (response.status === 401) {
    redirectToLogin();
    throw new ApiError(401, 'Session expirée. Veuillez vous reconnecter.');
  }
  if (response.status === 503 && typeof window !== 'undefined') {
    window.location.href = '/maintenance';
    throw new ApiError(503, 'La plateforme est en maintenance.');
  }
  if (response.status === 403) {
    throw new ApiError(403, "Accès refusé : vous n'avez pas les droits pour cette action.");
  }
  if (!response.ok) {
    const { message, code } = await errorDetails(response);
    throw new ApiError(response.status, message, code);
  }
  return response;
}

/** Requête JSON vers l'API. Renvoie null pour une réponse sans contenu (204). */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function fetchWithAuth(endpoint: string, options: RequestInit = {}): Promise<any> {
  const response = await apiFetch(endpoint, options);
  if (response.status === 204) return null;
  const text = await response.text();
  return text ? JSON.parse(text) : null;
}

/** Télécharge un fichier renvoyé par l'API (PDF, Excel…). */
export async function downloadFile(endpoint: string, filename: string) {
  const response = await apiFetch(endpoint);
  const blob = await response.blob();
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
}

/** Déconnexion : révocation côté API, suppression des cookies et du profil local. */
export async function logout() {
  try {
    await fetch('/api/auth/logout', { method: 'POST', credentials: 'same-origin' });
  } finally {
    try {
      window.localStorage.removeItem(USER_KEY);
    } catch {
      // ignoré
    }
    window.location.href = '/login';
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function extractArray(res: any): any[] {
  if (Array.isArray(res)) return res;
  if (res?.data?.content && Array.isArray(res.data.content)) return res.data.content;
  if (res?.content && Array.isArray(res.content)) return res.content;
  if (res?.data && Array.isArray(res.data)) return res.data;
  return [];
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function extractPageData(res: any) {
  const data = res?.data || res || {};
  return {
    totalElements: data.totalElements || 0,
    totalPages: data.totalPages || 1,
    size: data.size || 10,
    number: data.number || 0
  };
}

export const formatDateLocal = (d: Date) => {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};
