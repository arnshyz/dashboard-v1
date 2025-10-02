# AKAY Sales Dashboard – Next.js + Google Sheets (Dark/Light + Logout)

Fitur:
- Baca data dari Google Sheets via `/api/sales` (GET)
- Tulis (append) ke Google Sheets via `/api/sales` (POST, `x-api-key`)
- Metrik: pajak, diskon, codFee, biayaPengiriman, biayaLainnya
- Export: `/api/export?format=csv|xlsx|pdf`
- Login UI tanpa DB (cookie 7 hari) + middleware Edge (Web Crypto)
- **Tema Gelap/Terang (switch di header)** + **Logout** di header
- Dashboard responsif (mobile-first), login animasi (Framer Motion)

## Setup
1. `cp .env.example .env.local` → isi semua variabel.
2. Share Sheet ke `client_email` service account (Editor).
3. Header Sheet (baris 1):
   `date,channel,marketplace,qty,penjualan,modal,biayaIklan,potonganMarketplace,biayaOperasional,gajiKaryawan,pajak,diskon,codFee,biayaPengiriman,biayaLainnya`
4. Install & run: `npm i && npm run dev`

## Deploy Vercel
Tambahkan ENV dari `.env.local` → Deploy → Tes `/api/sales` dan `/login`.
