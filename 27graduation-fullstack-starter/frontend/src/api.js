export const API = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export async function api(path, options={}) {
  const token = localStorage.getItem('token');
  const headers = {...(options.headers || {})};

  if (!(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${API}${path}`, {...options, headers});
  const data = await res.json().catch(() => ({}));

  if (!res.ok) throw new Error(data.message || 'Có lỗi xảy ra');
  return data;
}
