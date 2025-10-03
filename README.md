
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

### Warehouse Sheet
- (Opsional) `GOOGLE_SHEETS_WAREHOUSE_SPREADSHEET_ID` bila menggunakan spreadsheet berbeda, default-nya memakai `GOOGLE_SHEETS_SPREADSHEET_ID`.
- Siapkan tab/range berikut atau override dengan ENV masing-masing:
  - `GOOGLE_SHEETS_WAREHOUSE_QUICK_STATS_RANGE` → default `WarehouseQuickStats!A1:D100`
  - `GOOGLE_SHEETS_WAREHOUSE_STOCK_ALERTS_RANGE` → default `WarehouseStockAlerts!A1:F1000`
  - `GOOGLE_SHEETS_WAREHOUSE_INBOUND_OUTBOUND_RANGE` → default `WarehouseMovements!A1:F1000`
  - `GOOGLE_SHEETS_WAREHOUSE_LOCATION_MAP_RANGE` → default `WarehouseLocations!A1:D500`
  - `GOOGLE_SHEETS_WAREHOUSE_NOTIFICATIONS_RANGE` → default `WarehouseNotifications!A1:C500`
  - `GOOGLE_SHEETS_WAREHOUSE_USERS_RANGE` → default `WarehouseUsers!A1:D500`
  - `GOOGLE_SHEETS_WAREHOUSE_REPORTS_RANGE` → default `WarehouseReports!A1:C500`
  - `GOOGLE_SHEETS_WAREHOUSE_OPNAME_PLANS_RANGE` → default `WarehouseOpname!A1:D500`
- Setiap tab menggunakan baris pertama sebagai header (misal: `title,value,trend,tone` untuk Quick Stats).

## Deploy Vercel
Tambahkan ENV, deploy, uji `/api/sales` & `/login`.

## Catatan UI
- Tombol di header otomatis **stack** di mobile (lebar kecil) dan **berderet** di layar besar.
- Kartu/grafik menggunakan tinggi adaptif: `h-[36vh]` / `h-[42vh]` agar pas di HP.
