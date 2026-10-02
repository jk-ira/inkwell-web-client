import { useCallback, useEffect, useState } from 'react';
import { Link, Outlet } from 'react-router-dom';
import { api } from './api';
import { useAuth } from './auth';

export const APP_NAME = 'Inkwell';
export const btn = 'rounded-md bg-stone-900 px-3 py-1.5 text-sm text-white hover:bg-stone-700 disabled:opacity-50';
export const btn2 = 'rounded-md border border-stone-300 px-3 py-1.5 text-sm hover:bg-stone-100 disabled:opacity-50';
export const input = 'w-full rounded-md border border-stone-300 bg-white px-3 py-2 text-sm';
export const fmt = (d) => (d ? new Date(d).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' }) : '');

// GET helper: { data, pagination, error, loading, reload }. Pass path = null to skip.
export function useFetch(path, query) {
  const [s, setS] = useState({ loading: !!path });
  const key = path ? path + JSON.stringify(query || {}) : '';
  const reload = useCallback(() => {
    if (!path) return;
    api.get(path, query).then((r) => setS({ data: r.data, pagination: r.pagination })).catch((e) => setS({ error: e.message }));
  }, [key]);
  useEffect(() => { setS((p) => ({ ...p, loading: !!path })); reload(); }, [reload]);
  return { ...s, reload };
}

export const Err = ({ e }) => e ? (
  <div className="rounded-md bg-red-50 p-2 text-sm text-red-700">
    {e.message || String(e)}
    {e.details?.map((d, i) => <div key={i}>• {d.field}: {d.message}</div>)}
  </div>
) : null;

export const Pager = ({ p, setPage }) => p && p.totalPages > 1 ? (
  <div className="mt-4 flex items-center justify-center gap-3 text-sm">
    <button className={btn2} disabled={p.page <= 1} onClick={() => setPage(p.page - 1)}>Prev</button>
    <span>Page {p.page} / {p.totalPages}</span>
    <button className={btn2} disabled={p.page >= p.totalPages} onClick={() => setPage(p.page + 1)}>Next</button>
  </div>
) : null;

const colors = { published: 'bg-green-100 text-green-800', draft: 'bg-stone-200 text-stone-700', hidden: 'bg-red-100 text-red-800', active: 'bg-green-100 text-green-800', suspended: 'bg-red-100 text-red-800', visible: 'bg-green-100 text-green-800', deleted: 'bg-stone-200 text-stone-700', admin: 'bg-purple-100 text-purple-800', user: 'bg-stone-200 text-stone-700' };
export const Badge = ({ v }) => <span className={`rounded px-2 py-0.5 text-xs ${colors[v] || ''}`}>{v}</span>;

export function PostCard({ p }) {
  return (
    <article className="rounded-lg border bg-white p-4">
      {p.coverImageUrl && <img src={p.coverImageUrl} alt="" className="mb-3 h-48 w-full rounded object-cover" />}
      <h2 className="font-serif text-xl font-bold"><Link to={`/posts/${p.slug}`}>{p.title}</Link></h2>
      <p className="mt-1 text-sm text-stone-600">{p.excerpt}</p>
      <p className="mt-2 text-xs text-stone-500">
        <Link to={`/u/${p.author.username}`} className="underline">{p.author.displayName}</Link> · {fmt(p.publishedAt || p.createdAt)} · ♥ {p.counts.likes} · 💬 {p.counts.comments} · ↗ {p.counts.shares}
      </p>
    </article>
  );
}

export function PostList({ path, query, setPage }) {
  const { data, pagination, error, loading } = useFetch(path, query);
  if (error) return <Err e={{ message: error }} />;
  if (loading && !data) return <p className="text-stone-500">Loading…</p>;
  if (!data?.length) return <p className="text-stone-500">No posts yet.</p>;
  return <><div className="space-y-4">{data.map((p) => <PostCard key={p.id} p={p} />)}</div><Pager p={pagination} setPage={setPage} /></>;
}

export function Layout() {
  const { user, isAdmin, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const link = 'text-sm hover:underline';
  return (
    <div className="min-h-screen bg-stone-50 text-stone-900">
      <header className="border-b bg-white">
        <nav className="mx-auto flex max-w-4xl flex-wrap items-center gap-4 px-4 py-3">
          <Link to="/" className="font-serif text-xl font-bold">{APP_NAME}</Link>
          <button className="ml-auto md:hidden" onClick={() => setOpen(!open)}>☰</button>
          <div className={`${open ? 'flex' : 'hidden'} w-full flex-col gap-2 md:ml-auto md:flex md:w-auto md:flex-row md:items-center md:gap-4`} onClick={() => setOpen(false)}>
            {user ? (<>
              <Link className={link} to="/dashboard/new">New post</Link>
              <Link className={link} to="/dashboard">Dashboard</Link>
              {isAdmin && <Link className={link} to="/admin">Admin</Link>}
              <Link className={link} to="/settings">{user.displayName}</Link>
              <button className={link} onClick={logout}>Logout</button>
            </>) : (<>
              <Link className={link} to="/login">Log in</Link>
              <Link className={btn} to="/register">Sign up</Link>
            </>)}
          </div>
        </nav>
      </header>
      <main className="mx-auto max-w-4xl px-4 py-6"><Outlet /></main>
    </div>
  );
}
