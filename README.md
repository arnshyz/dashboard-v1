# Build Fix – Next.js: "pages without a React Component as default export"

Paket ini berisi **pages/index.jsx** dan **pages/login.jsx** minimal yang PASTI memiliki `export default` React component.

## Cara memakai
1. Hapus sisa file bermasalah di repo Anda:
   - Pastikan **TIDAK** ada `pages/index.tsx` / `pages/index.ts` / `pages/index.js` lain yang menimpa.
   - Pastikan **TIDAK** ada folder `pages/login/` (gunakan file tunggal `pages/login.jsx`).
   - Hapus file asing di folder `pages/` (misal `.md`, `.json`, `.DS_Store`).

2. Salin **pages/index.jsx** dan **pages/login.jsx** dari paket ini ke repo Anda (timpa versi lama).
3. Tambahkan ke repo Anda file `next.config.js` dari paket ini (opsional, tapi membantu karena `pageExtensions` eksplisit).
4. Jalankan:
   ```bash
   rm -rf .next node_modules
   npm i
   npm run build
   ```

Jika build sudah sukses dengan placeholder ini, gantilah isi `pages/index.jsx` dan `pages/login.jsx` dengan halaman dashboard/login Anda yang sebenarnya (pastikan masing‑masing ada `export default`).
