
import crypto from 'crypto';
export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });
  const { username, password } = req.body || {};
  const expectedUser = process.env.ADMIN_UI_USER || 'admin';
  const expectedPass = process.env.ADMIN_UI_PASSWORD || '';
  const secret = process.env.SESSION_SECRET || '';
  if (!secret) return res.status(500).json({ error: 'SESSION_SECRET not set' });
  if (username !== expectedUser || password !== expectedPass) {
    return res.status(401).json({ error: 'Username atau password salah' });
  }
  const exp = Date.now() + 7*24*60*60*1000;
  const payload = `${username}.${exp}`;
  const sig = crypto.createHmac('sha256', secret).update(payload).digest('base64url');
  const token = `${payload}.${sig}`;
  const secure = process.env.NODE_ENV === 'production' ? ' Secure;' : '';
  res.setHeader('Set-Cookie', [`akay_session=${token}; HttpOnly;${secure} SameSite=Lax; Path=/; Max-Age=${7*24*60*60}`]);
  return res.status(200).json({ ok: true });
}
