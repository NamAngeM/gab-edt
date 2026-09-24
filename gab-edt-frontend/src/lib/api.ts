export const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api/v1';

export async function fetchWithAuth(endpoint: string, options: RequestInit = {}) {
  const headers = new Headers(options.headers);
  if (!(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }

  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('jwt_token');
    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }
  }

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (response.status === 401 || response.status === 403) {
    // Rediriger vers login si le token est invalide
    if (typeof window !== 'undefined') {
      localStorage.removeItem('jwt_token');
      // eslint-disable-next-line @next/next/no-location-assign-relative-destination
      window.location.href = '/login';
    }
    throw new Error('Non autorisé');
  }

  if (!response.ok) {
    const errorText = await response.text();
    console.error('Erreur API backend:', response.status, response.statusText, errorText);
    throw new Error(`Erreur API: ${response.status} - ${errorText}`);
  }

  return response.json();
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
