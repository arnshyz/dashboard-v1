
export default async function handler(req, res) {
  res.setHeader('Set-Cookie', ['akay_session=; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=0']);
  return res.status(200).json({ ok: true });
}
