// ============================================================
// API Client Template
// Standardized fetch wrapper with typed responses
// ============================================================

const API_BASE = '/api';
const CLIENT_HEADER = { 'X-App-Client': 'web/1' };

interface ApiResponse<T> {
  data: T | null;
  error: string | null;
}

async function fetchApi<T>(endpoint: string, options?: RequestInit): Promise<ApiResponse<T>> {
  try {
    const response = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...CLIENT_HEADER,
        ...options?.headers,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      return { data: null, error: data.error || 'Request failed' };
    }

    return { data, error: null };
  } catch (error) {
    return { data: null, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

// ============================================================
// API Methods — Customize for your project
// ============================================================

export const api = {
  // Example: GET with query params
  getItems: (category = 'all'): Promise<ApiResponse<{ items: unknown[]; total: number }>> =>
    fetchApi(`/items?category=${encodeURIComponent(category)}`),

  // Example: POST with body
  createItem: (body: { name: string; value: number }) =>
    fetchApi<{ id: string }>('/items', {
      method: 'POST',
      body: JSON.stringify(body),
    }),

  // Example: External API (no proxy)
  getExternalData: async (): Promise<ApiResponse<{ price: number }>> => {
    try {
      const response = await fetch('https://api.example.com/data');
      if (!response.ok) return { data: null, error: 'Fetch failed' };
      const data = await response.json();
      return { data: { price: parseFloat(data.price || '0') }, error: null };
    } catch (error) {
      return { data: null, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  },
};
