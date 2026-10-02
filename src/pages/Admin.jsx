import { useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api';
import { useAuth } from '../auth';
import { Badge, Err, Pager, btn2, fmt, input, useFetch } from '../ui';

const Table = ({ head, rows }) => (
  <div className="overflow-x-auto rounded-lg border bg-white">
    <table className="w-full text-left text-sm">
      <thead className="bg-stone-100 text-xs uppercase text-stone-500"><tr>{head.map((h) => <th key={h} className="px-3 py-2">{h}</th>)}</tr></thead>
      <tbody>{rows.map((r, i) => <tr key={i} className="border-t">{r.map((c, j) => <td key={j} className="px-3 py-2 align-top">{c}</td>)}</tr>)}</tbody>
    </table>
  </div>
);
const Sel = ({ v, set, opts, label }) => <select className={input + ' !w-36'} value={v} onChange={(e) => set(e.target.value)}><option value="">{label}</option>{opts.map((o) => <option key={o}>{o}</option>)}</select>;
const Btn = ({ children, ...p }) => <button className={btn2 + ' mr-1 !px-2 !py-0.5 !text-xs'} {...p}>{children}</button>;
const useAdmin = (path, query) => {
  const r = useFetch(path, query);
  const act = async (fn, ask) => { if (ask && !confirm(ask)) return; try { await fn(); r.reload(); } catch (e) { alert(e.message); } };
  return { ...r, act };
};

function Overview() {
  const { data: s, error } = useFetch('/admin/stats');
  if (error) return <Err e={{ message: error }} />;
  if (!s) return null;
  const cards = [['Users', s.users.total, `${s.users.suspended} suspended, ${s.users.newLast7Days} new (7d)`], ['Posts', s.posts.total, `${s.posts.published} published, ${s.posts.draft} draft, ${s.posts.hidden} hidden`], ['Comments', s.comments.total, `${s.comments.hidden} hidden`], ['Likes', s.likes, ''], ['Shares', s.shares, '']];
  return <div className="grid gap-3 sm:grid-cols-3">{cards.map(([t, n, sub]) => <div key={t} className="rounded-lg border bg-white p-4"><p className="text-sm text-stone-500">{t}</p><p className="text-3xl font-bold">{n}</p><p className="text-xs text-stone-500">{sub}</p></div>)}</div>;
}

function Users() {
  const { user: me } = useAuth();
  const [f, setF] = useState({ q: '', role: '', status: '', page: 1 });
  const { data, pagination, error, act } = useAdmin('/admin/users', { ...f, limit: 15 });
  const set = (k) => (v) => setF({ ...f, [k]: v, page: 1 });
  return (<>
    <div className="mb-3 flex flex-wrap gap-2"><input className={input + ' !w-56'} placeholder="Search…" value={f.q} onChange={(e) => set('q')(e.target.value)} /><Sel v={f.role} set={set('role')} opts={['user', 'admin']} label="Any role" /><Sel v={f.status} set={set('status')} opts={['active', 'suspended']} label="Any status" /></div>
    <Err e={error && { message: error }} />
    <Table head={['User', 'Role', 'Status', 'Posts', 'Comments', 'Actions']} rows={(data || []).map((u) => { const self = u.id === me.id; return [
      <><Link className="underline" to={`/u/${u.username}`}>{u.username}</Link><div className="text-xs text-stone-500">{u.email}</div></>,
      <Badge v={u.role} />, <Badge v={u.status} />, u.postCount, u.commentCount,
      <>
        <Btn disabled={self} onClick={() => act(() => api.patch(`/admin/users/${u.id}`, { status: u.status === 'active' ? 'suspended' : 'active' }))}>{u.status === 'active' ? 'Suspend' : 'Activate'}</Btn>
        <Btn disabled={self} onClick={() => act(() => api.patch(`/admin/users/${u.id}`, { role: u.role === 'admin' ? 'user' : 'admin' }))}>{u.role === 'admin' ? 'Demote' : 'Promote'}</Btn>
        <Btn disabled={self} onClick={() => act(() => api.del(`/admin/users/${u.id}`), `Delete ${u.username} and all their content?`)}>Delete</Btn>
      </>]; })} />
    <Pager p={pagination} setPage={(page) => setF({ ...f, page })} />
  </>);
}

function Posts() {
  const [f, setF] = useState({ q: '', status: '', page: 1 });
  const { data, pagination, error, act } = useAdmin('/admin/posts', { ...f, limit: 15 });
  const setStatus = (p, status) => act(() => api.patch(`/admin/posts/${p.id}/status`, { status }));
  return (<>
    <div className="mb-3 flex gap-2"><input className={input + ' !w-56'} placeholder="Search…" value={f.q} onChange={(e) => setF({ ...f, q: e.target.value, page: 1 })} /><Sel v={f.status} set={(v) => setF({ ...f, status: v, page: 1 })} opts={['draft', 'published', 'hidden']} label="Any status" /></div>
    <Err e={error && { message: error }} />
    <Table head={['Post', 'Author', 'Status', 'Actions']} rows={(data || []).map((p) => [
      <Link className="underline" to={`/posts/${p.slug}`}>{p.title}</Link>, p.author.username, <Badge v={p.status} />,
      <>{p.status !== 'hidden' && <Btn onClick={() => setStatus(p, 'hidden')}>Hide</Btn>}{p.status !== 'published' && <Btn onClick={() => setStatus(p, 'published')}>Publish</Btn>}<Btn onClick={() => act(() => api.del(`/admin/posts/${p.id}`), `Delete "${p.title}"?`)}>Delete</Btn></>])} />
    <Pager p={pagination} setPage={(page) => setF({ ...f, page })} />
  </>);
}

function Comments() {
  const [f, setF] = useState({ status: '', page: 1 });
  const { data, pagination, error, act } = useAdmin('/admin/comments', { ...f, limit: 15 });
  return (<>
    <div className="mb-3"><Sel v={f.status} set={(v) => setF({ status: v, page: 1 })} opts={['visible', 'hidden', 'deleted']} label="Any status" /></div>
    <Err e={error && { message: error }} />
    <Table head={['Comment', 'Post', 'Status', 'Actions']} rows={(data || []).map((c) => [
      <><div className="max-w-xs truncate">{c.content}</div><div className="text-xs text-stone-500">{c.author.username} · {fmt(c.createdAt)}</div></>,
      c.post.title, <Badge v={c.status} />,
      <>{c.status !== 'deleted' && <Btn onClick={() => act(() => api.patch(`/admin/comments/${c.id}/status`, { status: c.status === 'hidden' ? 'visible' : 'hidden' }))}>{c.status === 'hidden' ? 'Show' : 'Hide'}</Btn>}<Btn onClick={() => act(() => api.del(`/admin/comments/${c.id}`), 'Delete this comment?')}>Delete</Btn></>])} />
    <Pager p={pagination} setPage={(page) => setF({ ...f, page })} />
  </>);
}

function Audit() {
  const [page, setPage] = useState(1);
  const { data, pagination, error } = useFetch('/admin/audit-log', { page, limit: 20 });
  return (<><Err e={error && { message: error }} />
    <Table head={['When', 'Admin', 'Action', 'Target', 'Details']} rows={(data || []).map((a) => [new Date(a.createdAt).toLocaleString(), a.admin?.username || '—', a.action, `${a.targetType}`, <code className="text-xs">{JSON.stringify(a.details)}</code>])} />
    <Pager p={pagination} setPage={setPage} /></>);
}

const TABS = { Overview, Users, Posts, Comments, 'Audit log': Audit };
export default function Admin() {
  const [tab, setTab] = useState('Overview');
  const Tab = TABS[tab];
  return (<>
    <h1 className="mb-3 font-serif text-2xl font-bold">Admin</h1>
    <div className="mb-4 flex flex-wrap gap-2 border-b pb-2">{Object.keys(TABS).map((t) => <button key={t} className={`rounded px-3 py-1 text-sm ${t === tab ? 'bg-stone-900 text-white' : 'hover:bg-stone-200'}`} onClick={() => setTab(t)}>{t}</button>)}</div>
    <Tab />
  </>);
}
