import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { Err, PostList, fmt, useFetch } from '../ui';

export default function Profile() {
  const { username } = useParams();
  const [page, setPage] = useState(1);
  const { data: u, error } = useFetch(`/users/${username}`);
  if (error) return <Err e={{ message: error }} />;
  if (!u) return <p className="text-stone-500">Loading…</p>;
  return (
    <>
      <h1 className="font-serif text-3xl font-bold">{u.displayName}</h1>
      <p className="text-sm text-stone-500">@{u.username} · joined {fmt(u.createdAt)}</p>
      {u.bio && <p className="mt-2">{u.bio}</p>}
      <h2 className="mb-3 mt-6 font-semibold">Posts</h2>
      <PostList path={`/users/${username}/posts`} query={{ page, limit: 10 }} setPage={setPage} />
    </>
  );
}
