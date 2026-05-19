
const getHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

export const api = {
  get: async (url: string) => {
    const res = await fetch(url, { headers: getHeaders() });
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.error || 'Request failed');
    }
    return res.json();
  },
  post: async (url: string, data: any) => {
    const res = await fetch(url, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.error || 'Request failed');
    }
    return res.json();
  },
  patch: async (url: string, data: any) => {
    const res = await fetch(url, {
      method: 'PATCH',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.error || 'Request failed');
    }
    return res.json();
  },
};
