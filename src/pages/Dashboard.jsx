import { useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api';
import { Badge, Err, Pager, btn, btn2, fmt, input, useFetch } from '../ui';

export default function Dashboard() {
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  const { data, pagination, error, reload } = useFetch('/me/posts', { status, page, limit: 10 });
  const act = async (fn) => { try { await fn(); reload(); } catch (e) { alert(e.message); } };
  return (
    <>
      <div className="mb-4 flex items-center gap-2">
        <h1 className="font-serif text-2xl font-bold">My posts</h1>
        <select className={input + ' ml-auto !w-36'} value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }}>
          <option value="">All</option><option>draft</option><option>published</option><option>hidden</option>
        </select>
        <Link className={btn} to="/dashboard/new">New post</Link>
      </div>
      <Err e={error && { message: error }} />
      <div className="space-y-2">
        {data?.map((p) => (
          <div key={p.id} className="flex flex-wrap items-center gap-2 rounded-lg border bg-white p-3">
            <div className="min-w-0 flex-1">
              <Link to={`/posts/${p.slug}`} className="font-medium">{p.title}</Link>
              <p className="text-xs text-stone-500">{fmt(p.createdAt)} · ♥ {p.counts.likes} · 💬 {p.counts.comments}</p>
              {p.status === 'hidden' && <p className="text-xs text-red-700">Hidden by a moderator</p>}
            </div>
            <Badge v={p.status} />
            <Link className={btn2} to={`/dashboard/${p.id}/edit`}>Edit</Link>
            {p.status !== 'hidden' && <button className={btn2} onClick={() => act(() => api.patch(`/posts/${p.id}`, { status: p.status === 'published' ? 'draft' : 'published' }))}>{p.status === 'published' ? 'Unpublish' : 'Publish'}</button>}
            <button className={btn2} onClick={() => confirm(`Delete "${p.title}"?`) && act(() => api.del(`/posts/${p.id}`))}>Delete</button>
          </div>
        ))}
        {data?.length === 0 && <p className="text-stone-500">Nothing here yet.</p>}
      </div>
      <Pager p={pagination} setPage={setPage} />
    </>
  );
}
