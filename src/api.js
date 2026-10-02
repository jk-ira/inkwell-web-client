const BASE = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';
export const getToken = () => localStorage.getItem('token');
export const setToken = (t) => (t ? localStorage.setItem('token', t) : localStorage.removeItem('token'));

export class ApiError extends Error {
  constructor(status, message, details) { super(message); this.status = status; this.details = details; }
}

async function req(method, path, body) {
  const t = getToken();
  const res = await fetch(BASE + path, {
    method,
    headers: { 'Content-Type': 'application/json', ...(t && { Authorization: `Bearer ${t}` }), 'ngrok-skip-browser-warning': 'true' },
    body: body ? JSON.stringify(body) : undefined,
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) {
    if (res.status === 401 && t) { setToken(null); window.dispatchEvent(new Event('auth:expired')); }
    throw new ApiError(res.status, json.error?.message || 'Request failed', json.error?.details);
  }
  return json;
}

const qs = (o) => {
  const p = new URLSearchParams();
  Object.entries(o || {}).forEach(([k, v]) => v !== '' && v != null && p.set(k, v));
  const s = p.toString();
  return s ? `?${s}` : '';
};

export const api = {
  get: (p, q) => req('GET', p + qs(q)),
  post: (p, b) => req('POST', p, b || {}),
  patch: (p, b) => req('PATCH', p, b),
  del: (p) => req('DELETE', p),
};
