import { createContext, useContext, useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { api, getToken, setToken } from './api';

const Ctx = createContext(null);
export const useAuth = () => useContext(Ctx);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(!!getToken());
  useEffect(() => {
    if (getToken()) api.get('/auth/me').then((r) => setUser(r.data.user)).catch(() => setToken(null)).finally(() => setLoading(false));
    const out = () => setUser(null);
    window.addEventListener('auth:expired', out);
    return () => window.removeEventListener('auth:expired', out);
  }, []);
  const authenticate = (d) => { setToken(d.token); setUser(d.user); };
  const logout = () => { setToken(null); setUser(null); };
  return <Ctx.Provider value={{ user, setUser, loading, isAdmin: user?.role === 'admin', authenticate, logout }}>{children}</Ctx.Provider>;
}

export function Guard({ admin, children }) {
  const { user, loading, isAdmin } = useAuth();
  const loc = useLocation();
  if (loading) return <p className="p-8 text-center text-stone-500">Loading…</p>;
  if (!user) return <Navigate to="/login" state={{ from: loc.pathname }} replace />;
  if (admin && !isAdmin) return <Navigate to="/" replace />;
  return children;
}
