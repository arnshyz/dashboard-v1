
# AKAY Sales Dashboard – Responsive Header + Ads/Marketplace Charts

Perubahan:
- Header & tombol **lebih responsif** (grid/flex, w-full di mobile, wrap rapi).
- Tambah chart **Pengeluaran Iklan (Harian)** dan **Potongan Marketplace (Harian)**.
- Tetap: tema **Gelap/Terang**, tombol **Logout**, export CSV/XLSX/PDF, login animasi, middleware aman.

## Setup
1) `cp .env.example .env.local` → isi ENV
2) `npm i && npm run dev`
3) Share Google Sheet ke service account (Editor)
4) Header sheet baris 1: `date,channel,marketplace,qty,penjualan,modal,biayaIklan,potonganMarketplace,biayaOperasional,gajiKaryawan,pajak,diskon,codFee,biayaPengiriman,biayaLainnya`

## Deploy Vercel
Tambahkan ENV, deploy, uji `/api/sales` & `/login`.

## Catatan UI
- Tombol di header otomatis **stack** di mobile (lebar kecil) dan **berderet** di layar besar.
- Kartu/grafik menggunakan tinggi adaptif: `h-[36vh]` / `h-[42vh]` agar pas di HP.
