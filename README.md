
# AKAY Sales Dashboard – Next.js + Google Sheets

Fitur:
- Baca data dari Google Sheets via `/api/sales` (GET)
- Tulis (append) data ke Google Sheets via `/api/sales` (POST) – butuh header `x-api-key: ADMIN_API_KEY`
- Metrik tambahan: pajak, diskon, codFee, biayaPengiriman, biayaLainnya
- Export laporan: `/api/export?format=csv|xlsx|pdf`
- Role sederhana: Viewer (default) dan Admin (pakai API key)
- Branding logo AKAY (public/akay-logo.png)
- UI pakai Tailwind + Recharts + Framer Motion

## Setup
1. `cp .env.example .env.local` lalu isi variabel.
2. Buat Service Account di Google Cloud, beri akses ke Google Sheets API.
3. Share Google Sheet ke email service account dengan role `Editor`.
4. Buat sheet/tab (misal `Sales`) dengan header berikut di baris pertama:
   ```
   date,channel,marketplace,qty,penjualan,modal,biayaIklan,potonganMarketplace,biayaOperasional,gajiKaryawan,pajak,diskon,codFee,biayaPengiriman,biayaLainnya
   ```
5. Install & jalan:
   ```bash
   npm i
   npm run dev
   ```

## Deploy (Vercel)
- Tambahkan semua env dari `.env.local` ke Project Settings -> Environment Variables
- `vercel --prod` atau Connect repo Git -> Deploy
- `vercel.json` sudah menyetel Node 18 untuk API routes

## Catatan
- Penjualan Net = Penjualan - Diskon
- Total Biaya = Modal + Iklan + Potongan MP + Operasional + Gaji + Pajak + COD + Pengiriman + Lainnya
- Laba = Penjualan Net - Total Biaya
