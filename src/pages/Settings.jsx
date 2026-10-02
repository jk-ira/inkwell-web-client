import { useState } from 'react';
import { api, setToken } from '../api';
import { useAuth } from '../auth';
import { Err, btn, input } from '../ui';

export default function Settings() {
  const { user, setUser } = useAuth();
  const [p, setP] = useState({ displayName: user.displayName, bio: user.bio });
  const [pw, setPw] = useState({ currentPassword: '', newPassword: '' });
  const [err, setErr] = useState();
  const [msg, setMsg] = useState('');
  const run = (fn, ok) => async (e) => { e.preventDefault(); setErr(); setMsg(''); try { await fn(); setMsg(ok); } catch (x) { setErr(x); } };
  return (
    <div className="mx-auto max-w-md space-y-8">
      <Err e={err} />{msg && <p className="rounded bg-green-50 p-2 text-sm text-green-800">{msg}</p>}
      <form className="space-y-3" onSubmit={run(async () => setUser((await api.patch('/auth/me', p)).data.user), 'Profile saved')}>
        <h1 className="font-serif text-2xl font-bold">Profile</h1>
        <input className={input} required value={p.displayName} onChange={(e) => setP({ ...p, displayName: e.target.value })} />
        <textarea className={input} rows={3} maxLength={500} placeholder="Bio" value={p.bio} onChange={(e) => setP({ ...p, bio: e.target.value })} />
        <button className={btn}>Save profile</button>
      </form>
      <form className="space-y-3" onSubmit={run(async () => { setToken((await api.post('/auth/change-password', pw)).data.token); setPw({ currentPassword: '', newPassword: '' }); }, 'Password changed')}>
        <h2 className="font-serif text-xl font-bold">Change password</h2>
        <input className={input} type="password" required placeholder="Current password" value={pw.currentPassword} onChange={(e) => setPw({ ...pw, currentPassword: e.target.value })} />
        <input className={input} type="password" required minLength={8} placeholder="New password (8+, letter and number)" value={pw.newPassword} onChange={(e) => setPw({ ...pw, newPassword: e.target.value })} />
        <button className={btn}>Change password</button>
      </form>
    </div>
  );
}
