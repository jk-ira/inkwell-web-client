import { useState } from 'react';
import { PostList, input } from '../ui';

export default function Feed() {
  const [q, setQ] = useState('');
  const [sort, setSort] = useState('newest');
  const [page, setPage] = useState(1);
  return (
    <>
      <div className="mb-4 flex gap-2">
        <input className={input} placeholder="Search posts…" value={q} onChange={(e) => { setQ(e.target.value); setPage(1); }} />
        <select className={input + ' !w-40'} value={sort} onChange={(e) => { setSort(e.target.value); setPage(1); }}>
          <option value="newest">Newest</option><option value="oldest">Oldest</option><option value="popular">Popular</option>
        </select>
      </div>
      <PostList path="/posts" query={{ q, sort, page, limit: 10 }} setPage={setPage} />
    </>
  );
}
