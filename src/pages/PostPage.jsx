import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { api } from '../api';
import { useAuth } from '../auth';
import { Err, btn, btn2, fmt, input, useFetch } from '../ui';

function CommentForm({ postId, parentId, comment, onDone }) {
  const [text, setText] = useState(comment?.content || '');
  const [err, setErr] = useState();
  const submit = async (e) => {
    e.preventDefault(); setErr();
    try {
      if (comment) await api.patch(`/comments/${comment.id}`, { content: text });
      else await api.post(`/posts/${postId}/comments`, { content: text, parentId });
      setText(''); onDone();
    } catch (x) { setErr(x); }
  };
  return (
    <form onSubmit={submit} className="my-2 space-y-2">
      <Err e={err} />
      <textarea className={input} rows={2} required maxLength={2000} value={text} onChange={(e) => setText(e.target.value)} placeholder="Write a comment…" />
      <div className="flex gap-2"><button className={btn}>{comment ? 'Save' : 'Post'}</button>{(parentId || comment) && <button type="button" className={btn2} onClick={onDone}>Cancel</button>}</div>
    </form>
  );
}

function Comment({ c, postId, reload }) {
  const { user, isAdmin } = useAuth();
  const [mode, setMode] = useState(null); // 'reply' | 'edit'
  const done = () => { setMode(null); reload(); };
  const del = async () => { if (confirm('Delete this comment?')) { try { await api.del(`/comments/${c.id}`); reload(); } catch (e) { alert(e.message); } } };
  const mine = user && c.author.id === user.id;
  return (
    <div className="mt-3">
      <p className="text-xs text-stone-500"><Link to={`/u/${c.author.username}`} className="font-medium underline">{c.author.displayName}</Link> · {fmt(c.createdAt)}</p>
      {mode === 'edit' ? <CommentForm postId={postId} comment={c} onDone={done} /> : <p className={`whitespace-pre-wrap text-sm ${c.content === null ? 'italic text-stone-400' : ''}`}>{c.content ?? '[removed]'}</p>}
      {user && c.content !== null && mode !== 'edit' && (
        <div className="mt-1 flex gap-3 text-xs text-stone-500">
          <button onClick={() => setMode('reply')}>Reply</button>
          {mine && <button onClick={() => setMode('edit')}>Edit</button>}
          {(mine || isAdmin) && <button onClick={del}>Delete</button>}
        </div>
      )}
      {mode === 'reply' && <CommentForm postId={postId} parentId={c.id} onDone={done} />}
      {c.replies.length > 0 && <div className="ml-3 border-l pl-3">{c.replies.map((r) => <Comment key={r.id} c={r} postId={postId} reload={reload} />)}</div>}
    </div>
  );
}

export default function PostPage() {
  const { slug } = useParams();
  const { user } = useAuth();
  const { data: post, error, reload } = useFetch(`/posts/${slug}`);
  const comments = useFetch(post ? `/posts/${post.id}/comments` : null);
  const [msg, setMsg] = useState('');
  if (error) return <Err e={{ message: error }} />;
  if (!post) return <p className="text-stone-500">Loading…</p>;

  const like = async () => { try { await (post.likedByMe ? api.del : api.post)(`/posts/${post.id}/like`); reload(); } catch (e) { setMsg(e.message); } };
  const share = async (platform) => {
    try {
      const { data } = await api.post(`/posts/${post.id}/share`, { platform });
      if (platform === 'link') { await navigator.clipboard.writeText(data.shareUrl); setMsg('Link copied'); } else window.open(data.links[platform], '_blank');
      reload();
    } catch (e) { setMsg(e.message); }
  };
  const published = post.status === 'published';

  return (
    <article>
      {!published && <p className="mb-2 rounded bg-amber-100 p-2 text-sm">This post is {post.status} and not public.</p>}
      {post.coverImageUrl && <img src={post.coverImageUrl} alt="" className="mb-4 max-h-80 w-full rounded object-cover" />}
      <h1 className="font-serif text-3xl font-bold">{post.title}</h1>
      <p className="mt-1 text-sm text-stone-500"><Link className="underline" to={`/u/${post.author.username}`}>{post.author.displayName}</Link> · {fmt(post.publishedAt || post.createdAt)}</p>
      <div className="mt-6 whitespace-pre-wrap leading-7">{post.content}</div>
      <hr className="my-6" />
      {published && (user ? (
        <div className="flex flex-wrap items-center gap-3">
          <button className={btn2} onClick={like}>{post.likedByMe ? '♥' : '♡'} {post.counts.likes}</button>
          <details className="relative">
            <summary className={btn2 + ' cursor-pointer list-none'}>↗ Share ({post.counts.shares})</summary>
            <div className="absolute z-10 mt-1 flex w-40 flex-col rounded-md border bg-white p-1 text-sm shadow">
              {['link', 'twitter', 'facebook', 'whatsapp', 'linkedin', 'email'].map((p) => <button key={p} className="rounded px-2 py-1 text-left capitalize hover:bg-stone-100" onClick={() => share(p)}>{p === 'link' ? 'Copy link' : p}</button>)}
            </div>
          </details>
          {msg && <span className="text-sm text-stone-500">{msg}</span>}
        </div>
      ) : <p className="text-sm text-stone-500">♥ {post.counts.likes} · ↗ {post.counts.shares} · <Link className="underline" to="/login" state={{ from: `/posts/${slug}` }}>Log in</Link> to like, comment or share.</p>)}
      {published && (
        <section className="mt-6">
          <h2 className="font-semibold">Comments ({post.counts.comments})</h2>
          {user && <CommentForm postId={post.id} onDone={() => { comments.reload(); reload(); }} />}
          {comments.data?.map((c) => <Comment key={c.id} c={c} postId={post.id} reload={() => { comments.reload(); reload(); }} />)}
          {comments.data?.length === 0 && <p className="mt-2 text-sm text-stone-500">No comments yet.</p>}
        </section>
      )}
    </article>
  );
}
