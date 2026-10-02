import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { api } from '../api';
import { useAuth } from '../auth';
import { Err, btn, btn2, input } from '../ui';

export default function PostForm() {
  const { id } = useParams();
  const nav = useNavigate();
  const { isAdmin } = useAuth();
  const [f, setF] = useState({ title: '', content: '', coverImageUrl: '' });
  const [hidden, setHidden] = useState(false);
  const [err, setErr] = useState();
  useEffect(() => {
    if (id) api.get(`/posts/${id}`).then(({ data: p }) => { setF({ title: p.title, content: p.content, coverImageUrl: p.coverImageUrl || '' }); setHidden(p.status === 'hidden'); }).catch(setErr);
  }, [id]);
  const save = async (status) => {
    setErr();
    const body = { title: f.title, content: f.content, coverImageUrl: f.coverImageUrl || null };
    if (!(hidden && !isAdmin)) body.status = status;
    try { await (id ? api.patch(`/posts/${id}`, body) : api.post('/posts', body)); nav('/dashboard'); } catch (e) { setErr(e); }
  };
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });
  return (
    <div className="space-y-3">
      <h1 className="font-serif text-2xl font-bold">{id ? 'Edit post' : 'New post'}</h1>
      <Err e={err} />
      <input className={input} placeholder="Title" value={f.title} onChange={set('title')} />
      <input className={input} placeholder="Cover image URL (optional, https://…)" value={f.coverImageUrl} onChange={set('coverImageUrl')} />
      <textarea className={input} rows={16} placeholder="Write your post…" value={f.content} onChange={set('content')} />
      {hidden && !isAdmin && <p className="text-sm text-red-700">Hidden by a moderator: you can edit the text but not the status.</p>}
      <div className="flex gap-2"><button className={btn2} onClick={() => save('draft')}>Save as draft</button><button className={btn} onClick={() => save('published')}>Publish</button></div>
    </div>
  );
}
