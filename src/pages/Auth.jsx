import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { api } from '../api';
import { useAuth } from '../auth';
import { Err, btn, input } from '../ui';

function AuthForm({ mode }) {
  const { authenticate } = useAuth();
  const nav = useNavigate();
  const loc = useLocation();
  const [f, setF] = useState({});
  const [err, setErr] = useState();
  const [busy, setBusy] = useState(false);
  const reg = mode === 'register';
  const fields = reg
    ? [{ k: 'username', label: 'Username (3-30 letters, numbers, _)', pattern: '[A-Za-z0-9_]{3,30}' }, { k: 'email', label: 'Email', type: 'email' }, { k: 'displayName', label: 'Display name (optional)', optional: true }, { k: 'password', label: 'Password (8+, letter and number)', type: 'password', minLength: 8 }]
    : [{ k: 'identifier', label: 'Email or username' }, { k: 'password', label: 'Password', type: 'password' }];
  const submit = async (e) => {
    e.preventDefault(); setBusy(true); setErr();
    try {
      const body = { ...f }; if (!body.displayName) delete body.displayName;
      const r = await api.post(reg ? '/auth/register' : '/auth/login', body);
      authenticate(r.data); nav(loc.state?.from || '/', { replace: true });
    } catch (x) { setErr(x); } finally { setBusy(false); }
  };
  return (
    <form onSubmit={submit} className="mx-auto max-w-sm space-y-3">
      <h1 className="font-serif text-2xl font-bold">{reg ? 'Create account' : 'Log in'}</h1>
      <Err e={err} />
      {fields.map(({ k, label, optional, ...rest }) => (
        <label key={k} className="block text-sm">{label}
          <input className={input + ' mt-1'} required={!optional} value={f[k] || ''} onChange={(e) => setF({ ...f, [k]: e.target.value })} {...rest} />
        </label>
      ))}
      <button className={btn + ' w-full'} disabled={busy}>{reg ? 'Sign up' : 'Log in'}</button>
      <p className="text-center text-sm">{reg ? <>Have an account? <Link className="underline" to="/login">Log in</Link></> : <>New here? <Link className="underline" to="/register">Sign up</Link></>}</p>
    </form>
  );
}
export const Login = () => <AuthForm mode="login" />;
export const Register = () => <AuthForm mode="register" />;
