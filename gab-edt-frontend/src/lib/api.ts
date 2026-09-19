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

export function extractArray(res: any): any[] {
  if (Array.isArray(res)) return res;
  if (res?.data?.content && Array.isArray(res.data.content)) return res.data.content;
  if (res?.content && Array.isArray(res.content)) return res.content;
  if (res?.data && Array.isArray(res.data)) return res.data;
  return [];
}

export function extractPageData(res: any) {
  const data = res?.data || res || {};
  return {
    totalElements: data.totalElements || 0,
    totalPages: data.totalPages || 1,
    size: data.size || 10,
    number: data.number || 0
  };
}
