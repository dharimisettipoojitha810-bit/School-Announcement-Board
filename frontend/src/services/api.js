const API_BASE_URL = import.meta.env.VITE_API_URL || '';
const API_URL = API_BASE_URL ? `${API_BASE_URL.replace(/\/$/, '')}/api` : '/api';

// Simple helper to perform API calls with auth token attachment
const fetchAPI = async (endpoint, options = {}) => {
  const token = localStorage.getItem('token');
  const headers = {
    ...options.headers
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  // Handle standard JSON payload vs FormData (multipart/form-data)
  if (options.body && !(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
    options.body = JSON.stringify(options.body);
  }

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers
  });

  const responseClone = response.clone();
  let data;
  try {
    data = await response.json();
  } catch (parseError) {
    const text = await responseClone.text();
    throw new Error(`Invalid JSON response from server: ${text || parseError.message}`);
  }

  if (!response.ok) {
    throw new Error(data?.message || `Request failed with status ${response.status}`);
  }

  return data;
};

const api = {
  auth: {
    login: (email, password) => 
      fetchAPI('/auth/login', { method: 'POST', body: { email, password } }),
    register: (userData) => 
      fetchAPI('/auth/register', { method: 'POST', body: userData }),
    getCurrentUser: () => 
      fetchAPI('/auth/me', { method: 'GET' }),
    bulkImport: (csvText) => 
      fetchAPI('/auth/import', { method: 'POST', body: { csvText } }),
    getAllUsers: () => 
      fetchAPI('/auth/users', { method: 'GET' })
  },
  categories: {
    getAll: () => 
      fetchAPI('/categories', { method: 'GET' }),
    create: (data) => 
      fetchAPI('/categories', { method: 'POST', body: data }),
    update: (id, data) => 
      fetchAPI(`/categories/${id}`, { method: 'PUT', body: data }),
    delete: (id) => 
      fetchAPI(`/categories/${id}`, { method: 'DELETE' })
  },
  announcements: {
    getFeed: () => 
      fetchAPI('/announcements/feed', { method: 'GET' }),
    getCalendar: () => 
      fetchAPI('/announcements/calendar', { method: 'GET' }),
    getArchive: () => 
      fetchAPI('/announcements/archive', { method: 'GET' }),
    getBookmarks: () => 
      fetchAPI('/announcements/bookmarks', { method: 'GET' }),
    getAnalytics: () => 
      fetchAPI('/announcements/analytics', { method: 'GET' }),
    getDetails: (id) => 
      fetchAPI(`/announcements/${id}`, { method: 'GET' }),
    create: (formData) => 
      fetchAPI('/announcements', { method: 'POST', body: formData }), // FormData is processed correctly by fetchAPI
    update: (id, formData) => 
      fetchAPI(`/announcements/${id}`, { method: 'PUT', body: formData }),
    delete: (id) => 
      fetchAPI(`/announcements/${id}`, { method: 'DELETE' }),
    signConsent: (id, signatureText) => 
      fetchAPI(`/announcements/${id}/sign`, { method: 'POST', body: { signatureText } }),
    toggleBookmark: (id) => 
      fetchAPI(`/announcements/${id}/bookmark`, { method: 'POST' })
  },
  comments: {
    getByAnnouncement: (announcementId) => 
      fetchAPI(`/comments/${announcementId}`, { method: 'GET' }),
    create: (announcementId, content) => 
      fetchAPI('/comments', { method: 'POST', body: { announcementId, content } }),
    delete: (id) => 
      fetchAPI(`/comments/${id}`, { method: 'DELETE' })
  },
  auditLogs: {
    getAll: () => 
      fetchAPI('/audit-logs', { method: 'GET' })
  }
};

export default api;
export { API_URL, API_BASE_URL };
