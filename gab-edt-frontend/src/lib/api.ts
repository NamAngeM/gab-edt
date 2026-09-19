export const API_URL = 'http://localhost:8080/api/v1';

export async function fetchWithAuth(endpoint: string, options: RequestInit = {}) {
  // En Next.js (côté client), on lit le token depuis le localStorage
  let token = '';
  if (typeof window !== 'undefined') {
    token = localStorage.getItem('jwt_token') || '';
  }

  const headers = new Headers(options.headers);
  if (!(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }
  
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (response.status === 401 || response.status === 403) {
    // Rediriger vers login si le token est invalide
    if (typeof window !== 'undefined') {
      localStorage.removeItem('jwt_token');
      window.location.href = '/login';
    }
    throw new Error('Non autorisé');
  }

  if (!response.ok) {
    throw new Error('Erreur API');
  }

  return response.json();
}
