import { auth } from './firebase';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

async function getAuthHeaders(): Promise<Record<string, string>> {
  const user = auth.currentUser;
  if (!user) return {};
  const token = await user.getIdToken();
  return { Authorization: `Bearer ${token}` };
}

async function apiRequest(endpoint: string, options: RequestInit = {}) {
  const headers = await getAuthHeaders();
  const res = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers: {
      ...headers,
      ...options.headers,
    },
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(error.error || 'Request failed');
  }

  return res.json();
}

// User API
export const userApi = {
  sync: (name?: string) =>
    apiRequest('/users/sync', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name }),
    }),
  getMe: () => apiRequest('/users/me'),
  updateProfile: (formData: FormData) =>
    apiRequest('/users/me', {
      method: 'PATCH',
      body: formData,
    }),
  getImageUrl: (id: string) => `${API_URL}/users/${id}/image`,
};

// Reports API
export const reportApi = {
  list: (params?: { category?: string; status?: string; lat?: number; lng?: number; radius?: number; query?: string }) => {
    const urlQuery = new URLSearchParams();
    if (params?.category) urlQuery.set('category', params.category);
    if (params?.status) urlQuery.set('status', params.status);
    if (params?.lat) urlQuery.set('lat', String(params.lat));
    if (params?.lng) urlQuery.set('lng', String(params.lng));
    if (params?.radius) urlQuery.set('radius', String(params.radius));
    if (params?.query) urlQuery.set('query', params.query);
    return apiRequest(`/reports?${urlQuery.toString()}`);
  },

  get: (id: string) => apiRequest(`/reports/${id}`),

  getImageUrl: (id: string) => `${API_URL}/reports/${id}/image`,

  create: (formData: FormData) =>
    apiRequest('/reports', {
      method: 'POST',
      body: formData,
      // Don't set Content-Type - let browser set it with boundary for multipart
    }),

  updateStatus: (id: string, status: 'ACTIVE' | 'RESOLVED') =>
    apiRequest(`/reports/${id}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    }),

  update: (id: string, formData: FormData) =>
    apiRequest(`/reports/${id}`, {
      method: 'PATCH',
      body: formData,
    }),

  delete: (id: string) =>
    apiRequest(`/reports/${id}`, { method: 'DELETE' }),

  getMyReports: () => apiRequest('/reports/user/me'),
};

// Comments API
export const commentApi = {
  list: (reportId: string) => apiRequest(`/comments/${reportId}`),

  create: (reportId: string, text: string) =>
    apiRequest('/comments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reportId, text }),
    }),

  delete: (id: string) =>
    apiRequest(`/comments/${id}`, { method: 'DELETE' }),
};

// Notifications API
export const notificationApi = {
  check: (latitude: number, longitude: number, radiusKm: number, since?: string) =>
    apiRequest('/notifications/check', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ latitude, longitude, radiusKm, since }),
    }),
};
