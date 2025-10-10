import crypto from 'crypto';

function parseCookie(header, name) {
  if (!header) return null;
  const cookies = header.split(';');
  for (const cookie of cookies) {
    const [key, ...rest] = cookie.split('=');
    if (key && key.trim() === name) {
      return decodeURIComponent(rest.join('=') || '').trim();
    }
  }
  return null;
}

export function verifySessionToken(token, secret) {
  if (!token || !secret) return null;
  const parts = token.split('.');
  if (parts.length !== 3) return null;
  const [username, expStr, signature] = parts;
  const exp = Number.parseInt(expStr, 10);
  if (!exp || Number.isNaN(exp) || Date.now() > exp) return null;
  const payload = `${username}.${exp}`;
  const expected = crypto.createHmac('sha256', secret).update(payload).digest('base64url');
  const sigBuffer = Buffer.from(signature);
  const expectedBuffer = Buffer.from(expected);
  if (sigBuffer.length !== expectedBuffer.length) return null;
  if (!crypto.timingSafeEqual(sigBuffer, expectedBuffer)) return null;
  return { username };
}

export function requireAuth(req) {
  const secret = process.env.SESSION_SECRET || '';
  if (!secret) return null;
  const cookieHeader = req.headers?.cookie || '';
  const token = parseCookie(cookieHeader, 'akay_session');
  if (!token) return null;
  return verifySessionToken(token, secret);
}
