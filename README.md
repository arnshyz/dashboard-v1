

## Login UI tanpa database
- Halaman `/login` + `middleware.js` untuk proteksi seluruh halaman.
- ENV:
  - `ADMIN_UI_USER` (default: admin)
  - `ADMIN_UI_PASSWORD` (wajib)
  - `SESSION_SECRET` (wajib, tanda tangan HMAC cookie)
- API:
  - `POST /api/auth/login` → set cookie `akay_session` (masa berlaku 7 hari)
  - `GET /api/auth/logout` → hapus cookie
