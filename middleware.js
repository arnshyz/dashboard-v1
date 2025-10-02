
import { NextResponse } from 'next/server';
import crypto from 'crypto';
function verify(token, secret) {
  if (!token) return false;
  const parts = token.split('.');
  if (parts.length !== 3) return false;
  const [username, expStr, sig] = parts;
  const exp = parseInt(expStr, 10);
  if (!exp || Date.now() > exp) return false;
  const data = `${username}.${exp}`;
  const expect = crypto.createHmac('sha256', secret).update(data).digest('base64url');
  return sig === expect;
}
export function middleware(req) {
  const { pathname } = req.nextUrl;
  if (pathname.startsWith('/api') || pathname.startsWith('/_next') || pathname === '/login') return NextResponse.next();
  const secret = process.env.SESSION_SECRET || '';
  if (!secret) return NextResponse.next();
  const token = req.cookies.get('akay_session')?.value;
  if (verify(token, secret)) return NextResponse.next();
  const url = req.nextUrl.clone(); url.pathname = '/login'; url.searchParams.set('next', pathname);
  return NextResponse.redirect(url);
}
export const config = { matcher: ['/((?!api|_next|static|favicon.ico).*)'] };
