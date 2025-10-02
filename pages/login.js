
import { useState } from 'react';
export default function Login() {
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const submit = async (e) => {
    e.preventDefault(); setLoading(true); setError('');
    try {
      const res = await fetch('/api/auth/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ username, password })});
      const js = await res.json();
      if (!res.ok) throw new Error(js.error || 'Login gagal');
      const next = new URLSearchParams(window.location.search).get('next') || '/';
      window.location.href = next;
    } catch (e) { setError(e.message); } finally { setLoading(false); }
  };
  return (
    <div className="min-h-screen grid place-items-center bg-neutral-50">
      <form onSubmit={submit} className="w-full max-w-sm bg-white rounded-2xl border border-neutral-200 p-6 shadow-sm">
        <div className="text-lg font-semibold mb-1">Masuk Dashboard</div>
        <div className="text-xs text-neutral-500 mb-4">AKAY Sales Dashboard</div>
        <label className="block text-sm mb-1">Username</label>
        <input className="w-full border rounded px-3 py-2 mb-3" value={username} onChange={e=>setUsername(e.target.value)} />
        <label className="block text-sm mb-1">Password</label>
        <input type="password" className="w-full border rounded px-3 py-2 mb-4" value={password} onChange={e=>setPassword(e.target.value)} />
        {error && <div className="text-red-600 text-sm mb-3">{error}</div>}
        <button disabled={loading} className="w-full rounded-lg bg-neutral-900 text-white py-2">{loading ? 'Memproses...' : 'Login'}</button>
        <div className="text-xs text-neutral-400 mt-3">Set ENV <code>ADMIN_UI_USER</code>, <code>ADMIN_UI_PASSWORD</code>, <code>SESSION_SECRET</code></div>
      </form>
    </div>
  );
}
