
import { NextResponse } from 'next/server';

function toBase64Url(arrBuf) {
  const bytes = new Uint8Array(arrBuf);
  let binary = '';
  for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]);
  const base64 = btoa(binary);
  return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}
async function hmacSha256Base64Url(secret, data) {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey('raw', enc.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  const sig = await crypto.subtle.sign('HMAC', key, enc.encode(data));
  return toBase64Url(sig);
}
async function verify(token, secret) {
  if (!token) return false;
  const parts = token.split('.');
  if (parts.length !== 3) return false;
  const [username, expStr, sig] = parts;
  const exp = parseInt(expStr, 10);
  if (!exp || Date.now() > exp) return false;
  const data = `${username}.${exp}`;
  const expect = await hmacSha256Base64Url(secret, data);
  return sig === expect;
}

const STATIC_EXT = /\.(png|jpe?g|gif|svg|webp|ico|css|js|map|txt|xml|json|woff2?|ttf|eot|otf|mp4|webm|ogg|mp3|wav|pdf|csv|xlsx)$/i;

export async function middleware(req) {
  const { pathname } = req.nextUrl;

  if (
    pathname.startsWith('/api') ||
    pathname.startsWith('/_next') ||
    pathname === '/favicon.ico' ||
    pathname.startsWith('/public') ||
    STATIC_EXT.test(pathname)
  ) {
    return NextResponse.next();
  }
  if (pathname === '/login') return NextResponse.next();

  const secret = process.env.SESSION_SECRET || '';
  if (!secret) return NextResponse.next();

  const token = req.cookies.get('akay_session')?.value;
  const ok = await verify(token, secret);
  if (ok) return NextResponse.next();

  const url = req.nextUrl.clone();
  url.pathname = '/login';
  if (!STATIC_EXT.test(pathname)) {
    url.searchParams.set('next', pathname);
  }
  return NextResponse.redirect(url);
}

export const config = {
  matcher: ['/((?!api|_next|favicon.ico|.*\..*).*)'],
};
