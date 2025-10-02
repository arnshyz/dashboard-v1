
import React, { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  ResponsiveContainer, AreaChart, Area, CartesianGrid, XAxis, YAxis, Tooltip, Legend,
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell
} from "recharts";

/**
 * Next.js Page – Sales Dashboard (AKAY)
 * - Fetch from /api/sales (Google Sheets)
 * - Import CSV (local) & optional write-back (POST /api/sales) for Admin
 * - Extra metrics: pajak, diskon, codFee, biayaPengiriman, biayaLainnya
 * - Roles: Viewer (default), Admin (enter API key) – Admin required for write-back
 * - Export: CSV/XLSX/PDF via /api/export
 */

const allChannels = ["Website", "Shopee", "Tokopedia"];
const allMarketplaces = ["Website", "Shopee", "Tokopedia"];

const fmtIDR = (n) =>
  new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(
    isFinite(n) ? n : 0
  );
const fmtNum = (n) => new Intl.NumberFormat("id-ID").format(isFinite(n) ? n : 0);
const parseNumber = (v) => {
  if (v === null || v === undefined || v === "") return 0;
  const x = String(v).replace(/[^0-9.-]/g, "");
  const n = parseFloat(x);
  return isNaN(n) ? 0 : n;
};

// Seed fallback (if API not configured)
const seed = [
  { date: "2025-09-20", channel: "Website", marketplace: "Website", qty: 12, penjualan: 2500000, modal: 1200000, biayaIklan: 250000, potonganMarketplace: 0, biayaOperasional: 150000, gajiKaryawan: 300000, pajak: 25000, diskon: 50000, codFee: 0, biayaPengiriman: 40000, biayaLainnya: 0 },
  { date: "2025-09-21", channel: "Shopee", marketplace: "Shopee", qty: 10, penjualan: 2100000, modal: 980000, biayaIklan: 240000, potonganMarketplace: 160000, biayaOperasional: 90000, gajiKaryawan: 120000, pajak: 30000, diskon: 0, codFee: 10000, biayaPengiriman: 60000, biayaLainnya: 0 },
  { date: "2025-09-22", channel: "Tokopedia", marketplace: "Tokopedia", qty: 9, penjualan: 1890000, modal: 900000, biayaIklan: 200000, potonganMarketplace: 140000, biayaOperasional: 80000, gajiKaryawan: 120000, pajak: 25000, diskon: 0, codFee: 0, biayaPengiriman: 30000, biayaLainnya: 0 },
  { date: "2025-09-23", channel: "Website", marketplace: "Website", qty: 8, penjualan: 1680000, modal: 820000, biayaIklan: 120000, potonganMarketplace: 0, biayaOperasional: 85000, gajiKaryawan: 120000, pajak: 20000, diskon: 50000, codFee: 0, biayaPengiriman: 30000, biayaLainnya: 20000 },
];

function sumBy(arr, key) { return arr.reduce((a, b) => a + parseNumber(b[key]), 0); }

function groupByDate(arr) {
  const map = {};
  arr.forEach((r) => { const d = r.date; if (!map[d]) map[d] = []; map[d].push(r); });
  return Object.entries(map)
    .map(([date, rows]) => {
      const qty = sumBy(rows, "qty");
      const penjualan = sumBy(rows, "penjualan");
      const modal = sumBy(rows, "modal");
      const biayaIklan = sumBy(rows, "biayaIklan");
      const potonganMarketplace = sumBy(rows, "potonganMarketplace");
      const biayaOperasional = sumBy(rows, "biayaOperasional");
      const gajiKaryawan = sumBy(rows, "gajiKaryawan");
      const pajak = sumBy(rows, "pajak");
      const diskon = sumBy(rows, "diskon"); // treat as revenue reduction
      const codFee = sumBy(rows, "codFee");
      const biayaPengiriman = sumBy(rows, "biayaPengiriman");
      const biayaLainnya = sumBy(rows, "biayaLainnya");
      const totalBiaya = modal + biayaIklan + potonganMarketplace + biayaOperasional + gajiKaryawan + pajak + codFee + biayaPengiriman + biayaLainnya;
      const penjualanNet = penjualan - diskon;
      const laba = penjualanNet - totalBiaya;
      const margin = penjualanNet ? laba / penjualanNet : 0;
      return {
        date, qty, penjualan, diskon, penjualanNet, modal, biayaIklan, potonganMarketplace,
        biayaOperasional, gajiKaryawan, pajak, codFee, biayaPengiriman, biayaLainnya,
        totalBiaya, laba, margin
      };
    })
    .sort((a, b) => new Date(a.date) - new Date(b.date));
}

const COLORS = ["#3b82f6", "#f97316", "#22c55e", "#a855f7", "#ef4444", "#14b8a6", "#eab308", "#06b6d4"];

export default function IndexPage() {
  const [rows, setRows] = useState(seed);
  const [apiOK, setApiOK] = useState(false);
  const [replaceOnImport, setReplaceOnImport] = useState(true);
  const [adminKey, setAdminKey] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);

  // Filters state
  const [dateFrom, setDateFrom] = useState(() => {
    const d = new Date(); d.setDate(d.getDate() - 14); return d.toISOString().slice(0,10);
  });
  const [dateTo, setDateTo] = useState(() => new Date().toISOString().slice(0,10));
  const [channels, setChannels] = useState(new Set(allChannels));
  const [marketplaces, setMarketplaces] = useState(new Set(allMarketplaces));

  useEffect(() => {
    const key = localStorage.getItem('AKAY_ADMIN_KEY') || '';
    if (key) setAdminKey(key);
  }, []);

  useEffect(() => {
    // Attempt to fetch from API
    const fetcher = async () => {
      try {
        const params = new URLSearchParams({ from: dateFrom, to: dateTo });
        const res = await fetch(`/api/sales?${params.toString()}`);
        const js = await res.json();
        if (js && Array.isArray(js.rows)) {
          setRows(js.rows);
          setApiOK(true);
          setIsAdmin(Boolean(js.isAdmin));
        }
      } catch (e) {
        setApiOK(false);
      }
    };
    fetcher();
  }, [dateFrom, dateTo]);

  const filtered = useMemo(() => rows.filter(r => {
    const t = new Date(r.date);
    const min = new Date(dateFrom); const max = new Date(dateTo); max.setHours(23,59,59,999);
    return t >= min && t <= max && channels.has(r.channel) && marketplaces.has(r.marketplace);
  }), [rows, dateFrom, dateTo, channels, marketplaces]);

  const daily = useMemo(() => groupByDate(filtered), [filtered]);

  const totals = useMemo(() => {
    const qty = sumBy(daily, "qty");
    const penjualan = sumBy(daily, "penjualan");
    const diskon = sumBy(daily, "diskon");
    const penjualanNet = sumBy(daily, "penjualanNet");
    const modal = sumBy(daily, "modal");
    const biayaIklan = sumBy(daily, "biayaIklan");
    const potonganMarketplace = sumBy(daily, "potonganMarketplace");
    const biayaOperasional = sumBy(daily, "biayaOperasional");
    const gajiKaryawan = sumBy(daily, "gajiKaryawan");
    const pajak = sumBy(daily, "pajak");
    const codFee = sumBy(daily, "codFee");
    const biayaPengiriman = sumBy(daily, "biayaPengiriman");
    const biayaLainnya = sumBy(daily, "biayaLainnya");
    const totalBiaya = sumBy(daily, "totalBiaya");
    const laba = sumBy(daily, "laba");
    const margin = penjualanNet ? laba / penjualanNet : 0;
    const roas = biayaIklan ? penjualanNet / biayaIklan : 0;
    const aov = qty ? penjualanNet / qty : 0;
    return { qty, penjualan, diskon, penjualanNet, modal, biayaIklan, potonganMarketplace, biayaOperasional,
      gajiKaryawan, pajak, codFee, biayaPengiriman, biayaLainnya, totalBiaya, laba, margin, roas, aov };
  }, [daily]);

  const pieData = useMemo(() => [
    { name: "Modal", value: totals.modal },
    { name: "Biaya Iklan", value: totals.biayaIklan },
    { name: "Potongan MP", value: totals.potonganMarketplace },
    { name: "Operasional", value: totals.biayaOperasional },
    { name: "Gaji", value: totals.gajiKaryawan },
    { name: "Pajak", value: totals.pajak },
    { name: "COD Fee", value: totals.codFee },
    { name: "Pengiriman", value: totals.biayaPengiriman },
    { name: "Lainnya", value: totals.biayaLainnya },
  ], [totals]);

  // CSV import -> to local state; Admin can then sync to Sheets
  const onImportCSV = async (file) => {
    const text = await file.text();
    const lines = text.split(/\\r?\\n/).map((l) => l.trim()).filter(Boolean);
    if (!lines.length) return;
    const headers = lines[0].split(",").map((h) => h.trim());
    const need = ["date","channel","marketplace","qty","penjualan","modal","biayaIklan","potonganMarketplace","biayaOperasional","gajiKaryawan","pajak","diskon","codFee","biayaPengiriman","biayaLainnya"];
    const hasAll = need.every(h => headers.includes(h));
    if (!hasAll) { alert("Header CSV tidak lengkap. Wajib ada: " + need.join(", ")); return; }
    const idx = Object.fromEntries(headers.map((h,i)=>[h,i]));
    const parsed = [];
    for (let i=1;i<lines.length;i++){
      const cols = lines[i].split(",");
      if (!cols || cols.length < headers.length) continue;
      const row = Object.fromEntries(need.map(h => [h, cols[idx[h]] ?? ""]));
      // cast numeric:
      ["qty","penjualan","modal","biayaIklan","potonganMarketplace","biayaOperasional","gajiKaryawan","pajak","diskon","codFee","biayaPengiriman","biayaLainnya"]
        .forEach(k => row[k] = parseNumber(row[k]));
      parsed.push(row);
    }
    setRows((prev) => (replaceOnImport ? parsed : [...prev, ...parsed]));
  };

  const toggleSet = (setState, hasFn, value) => {
    setState((prev) => { const next = new Set(prev); if (hasFn(prev, value)) next.delete(value); else next.add(value); return next; });
  };
  const inSet = (set, value) => set.has(value);

  const doExport = (fmt) => {
    const params = new URLSearchParams({ from: dateFrom, to: dateTo });
    const url = `/api/export?format=${fmt}&` + params.toString();
    const a = document.createElement("a");
    a.href = url;
    if (adminKey) a.setAttribute('x-api-key', adminKey);
    a.click();
  };

  const loginAdmin = async () => {
    if (!adminKey) return;
    localStorage.setItem('AKAY_ADMIN_KEY', adminKey);
    // simple check: call /api/sales with header
    const res = await fetch('/api/sales', { headers: { 'x-api-key': adminKey }});
    if (res.ok) { setIsAdmin(true); alert('Admin aktif'); }
    else { alert('API key salah'); }
  };

  const syncToSheets = async () => {
    if (!adminKey) return alert('Masukkan Admin API Key dulu');
    const res = await fetch('/api/sales', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-api-key': adminKey },
      body: JSON.stringify({ rows })
    });
    const js = await res.json();
    if (res.ok) alert('Terkirim ke Google Sheets: ' + js.inserted + ' baris');
    else alert('Gagal: ' + js.error);
  };

  return (
    <div className="min-h-screen w-full bg-neutral-50 text-neutral-900">
      {/* Header */}
      <div className="sticky top-0 z-30 backdrop-blur bg-white/70 border-b border-neutral-200">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <img src="/akay-logo.png" alt="AKAY" className="w-9 h-9 rounded" />
            <div>
              <h1 className="text-xl font-semibold leading-tight">AKAY Sales Dashboard</h1>
              <p className="text-xs text-neutral-500">Google Sheets ↔ Next.js • Admin/Viewer • Export</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <label className="text-sm text-neutral-600">Dari</label>
            <input type="date" value={dateFrom} onChange={(e)=>setDateFrom(e.target.value)} className="px-2 py-1 rounded border border-neutral-300 text-sm" />
            <label className="text-sm text-neutral-600">Sampai</label>
            <input type="date" value={dateTo} onChange={(e)=>setDateTo(e.target.value)} className="px-2 py-1 rounded border border-neutral-300 text-sm" />

            <button onClick={()=>doExport('csv')} className="px-3 py-1.5 rounded-full border text-sm bg-white hover:bg-neutral-50">Export CSV</button>
            <button onClick={()=>doExport('xlsx')} className="px-3 py-1.5 rounded-full border text-sm bg-white hover:bg-neutral-50">Export XLSX</button>
            <button onClick={()=>doExport('pdf')} className="px-3 py-1.5 rounded-full border text-sm bg-white hover:bg-neutral-50">Export PDF</button>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="grid md:grid-cols-2 gap-3">
          <div className="rounded-2xl border border-neutral-200 bg-white p-3">
            <div className="text-sm font-medium mb-2">Filter Channel</div>
            <div className="flex flex-wrap gap-2">
              {allChannels.map((c) => (
                <button key={c} onClick={() => toggleSet(setChannels, (s,v)=>s.has(v), c)}
                  className={`px-3 py-1.5 rounded-full border text-sm transition ${inSet(channels, c) ? "bg-neutral-900 text-white border-neutral-900" : "bg-white text-neutral-700 border-neutral-300 hover:border-neutral-400"}`}>
                  {c}
                </button>
              ))}
            </div>
          </div>
          <div className="rounded-2xl border border-neutral-200 bg-white p-3">
            <div className="text-sm font-medium mb-2">Filter Marketplace</div>
            <div className="flex flex-wrap gap-2">
              {allMarketplaces.map((m) => (
                <button key={m} onClick={() => toggleSet(setMarketplaces, (s,v)=>s.has(v), m)}
                  className={`px-3 py-1.5 rounded-full border text-sm transition ${inSet(marketplaces, m) ? "bg-neutral-900 text-white border-neutral-900" : "bg-white text-neutral-700 border-neutral-300 hover:border-neutral-400"}`}>
                  {m}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* KPI cards */}
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <KPI title="Penjualan (Gross)" value={fmtIDR(totals.penjualan)} sub={"Diskon " + fmtIDR(totals.diskon)} />
          <KPI title="Penjualan Net" value={fmtIDR(totals.penjualanNet)} sub={"Qty " + fmtNum(totals.qty)} />
          <KPI title="Total Biaya" value={fmtIDR(totals.totalBiaya)} sub={`Modal ${fmtIDR(totals.modal)}`} />
          <KPI title="Laba" value={fmtIDR(totals.laba)} sub={`Margin ${(totals.margin * 100).toFixed(1)}% • ROAS ${totals.roas.toFixed(2)}x`} />
        </div>
      </div>

      {/* Charts */}
      <div className="max-w-7xl mx-auto px-4 py-6 grid lg:grid-cols-3 gap-4">
        <div className="rounded-2xl border border-neutral-200 bg-white p-4 lg:col-span-2">
          <div className="text-sm font-medium mb-3">Pendapatan Net vs Total Biaya (Harian)</div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={daily} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="g1" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.02} />
                  </linearGradient>
                  <linearGradient id="g2" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis tickFormatter={(v) => fmtNum(v / 1000) + "k"} />
                <Tooltip formatter={(v) => fmtIDR(v)} />
                <Legend />
                <Area type="monotone" dataKey="penjualanNet" name="Pendapatan Net" stroke="#3b82f6" fill="url(#g1)" strokeWidth={2} />
                <Area type="monotone" dataKey="totalBiaya" name="Total Biaya" stroke="#ef4444" fill="url(#g2)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="rounded-2xl border border-neutral-200 bg-white p-4">
          <div className="text-sm font-medium mb-3">Breakdown Biaya</div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={pieData} dataKey="value" nameKey="name" outerRadius={90}>
                  {pieData.map((entry, i) => (<Cell key={`cell-${i}`} fill={COLORS[i % COLORS.length]} />))}
                </Pie>
                <Tooltip formatter={(v) => fmtIDR(v)} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 pb-6 grid lg:grid-cols-3 gap-4">
        <div className="rounded-2xl border border-neutral-200 bg-white p-4">
          <div className="text-sm font-medium mb-3">Qty Terjual (Harian)</div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={daily}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="qty" name="Qty" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="rounded-2xl border border-neutral-200 bg-white p-4 lg:col-span-2">
          <div className="text-sm font-medium mb-3">Laba per Hari</div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={daily}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis tickFormatter={(v) => fmtNum(v / 1000) + "k"} />
                <Tooltip formatter={(v) => fmtIDR(v)} />
                <Legend />
                <Line type="monotone" dataKey="laba" name="Laba" stroke="#22c55e" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="max-w-7xl mx-auto px-4 pb-10">
        <div className="rounded-2xl border border-neutral-200 bg-white overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b gap-3">
            <div className="text-sm font-medium">Rangkuman Harian</div>
            <div className="flex items-center gap-2">
              <label className="flex items-center gap-2 text-sm text-neutral-600">
                <input type="checkbox" checked={replaceOnImport} onChange={(e) => setReplaceOnImport(e.target.checked)} />
                Ganti data saat import CSV
              </label>
              <label className="text-sm px-3 py-1.5 rounded-full bg-neutral-900 text-white cursor-pointer">
                Import CSV
                <input type="file" accept=".csv" className="hidden" onChange={(e)=>{ const f = e.target.files?.[0]; if (f) onImportCSV(f); }} />
              </label>
              <input placeholder="Admin API Key" value={adminKey} onChange={(e)=>setAdminKey(e.target.value)} className="px-2 py-1 rounded border border-neutral-300 text-sm" />
              <button onClick={loginAdmin} className="px-3 py-1.5 rounded-full border text-sm bg-white hover:bg-neutral-50">Login Admin</button>
              <button onClick={syncToSheets} className="px-3 py-1.5 rounded-full border text-sm bg-white hover:bg-neutral-50">Upload CSV → Sheets</button>
            </div>
          </div>
          <div className="overflow-auto">
            <table className="w-full text-sm">
              <thead className="bg-neutral-50">
                <tr>
                  <Th>Tanggal</Th>
                  <Th>Channel</Th>
                  <Th>MP</Th>
                  <Th className="text-right">Qty</Th>
                  <Th className="text-right">Penj. Gross</Th>
                  <Th className="text-right">Diskon</Th>
                  <Th className="text-right">Penj. Net</Th>
                  <Th className="text-right">Modal</Th>
                  <Th className="text-right">Iklan</Th>
                  <Th className="text-right">Pot. MP</Th>
                  <Th className="text-right">Operasional</Th>
                  <Th className="text-right">Gaji</Th>
                  <Th className="text-right">Pajak</Th>
                  <Th className="text-right">COD</Th>
                  <Th className="text-right">Pengiriman</Th>
                  <Th className="text-right">Lainnya</Th>
                  <Th className="text-right">Total Biaya</Th>
                  <Th className="text-right">Laba</Th>
                  <Th className="text-right">Margin</Th>
                </tr>
              </thead>
              <tbody>
                {daily.map((r) => (
                  <tr key={r.date} className="border-t hover:bg-neutral-50/60">
                    <Td>{r.date}</Td>
                    <Td>{/* assume same across day */}</Td>
                    <Td></Td>
                    <Td className="text-right">{fmtNum(r.qty)}</Td>
                    <Td className="text-right">{fmtIDR(r.penjualan)}</Td>
                    <Td className="text-right">{fmtIDR(r.diskon)}</Td>
                    <Td className="text-right">{fmtIDR(r.penjualanNet)}</Td>
                    <Td className="text-right">{fmtIDR(r.modal)}</Td>
                    <Td className="text-right">{fmtIDR(r.biayaIklan)}</Td>
                    <Td className="text-right">{fmtIDR(r.potonganMarketplace)}</Td>
                    <Td className="text-right">{fmtIDR(r.biayaOperasional)}</Td>
                    <Td className="text-right">{fmtIDR(r.gajiKaryawan)}</Td>
                    <Td className="text-right">{fmtIDR(r.pajak)}</Td>
                    <Td className="text-right">{fmtIDR(r.codFee)}</Td>
                    <Td className="text-right">{fmtIDR(r.biayaPengiriman)}</Td>
                    <Td className="text-right">{fmtIDR(r.biayaLainnya)}</Td>
                    <Td className="text-right">{fmtIDR(r.totalBiaya)}</Td>
                    <Td className={`text-right font-medium ${r.laba < 0 ? 'text-red-600' : ''}`}>{fmtIDR(r.laba)}</Td>
                    <Td className="text-right">{(r.margin * 100).toFixed(1)}%</Td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-neutral-50 border-t">
                <tr>
                  <Td className="font-medium">TOTAL</Td>
                  <Td></Td><Td></Td>
                  <Td className="text-right font-medium">{fmtNum(totals.qty)}</Td>
                  <Td className="text-right font-medium">{fmtIDR(totals.penjualan)}</Td>
                  <Td className="text-right font-medium">{fmtIDR(totals.diskon)}</Td>
                  <Td className="text-right font-medium">{fmtIDR(totals.penjualanNet)}</Td>
                  <Td className="text-right font-medium">{fmtIDR(totals.modal)}</Td>
                  <Td className="text-right font-medium">{fmtIDR(totals.biayaIklan)}</Td>
                  <Td className="text-right font-medium">{fmtIDR(totals.potonganMarketplace)}</Td>
                  <Td className="text-right font-medium">{fmtIDR(totals.biayaOperasional)}</Td>
                  <Td className="text-right font-medium">{fmtIDR(totals.gajiKaryawan)}</Td>
                  <Td className="text-right font-medium">{fmtIDR(totals.pajak)}</Td>
                  <Td className="text-right font-medium">{fmtIDR(totals.codFee)}</Td>
                  <Td className="text-right font-medium">{fmtIDR(totals.biayaPengiriman)}</Td>
                  <Td className="text-right font-medium">{fmtIDR(totals.biayaLainnya)}</Td>
                  <Td className="text-right font-medium">{fmtIDR(totals.totalBiaya)}</Td>
                  <Td className="text-right font-medium">{fmtIDR(totals.laba)}</Td>
                  <Td className="text-right font-medium">{(totals.margin * 100).toFixed(1)}%</Td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 pb-16 text-xs text-neutral-500">
        <p>
          Header Google Sheet yang didukung: <b>date, channel, marketplace, qty, penjualan, modal, biayaIklan, potonganMarketplace, biayaOperasional, gajiKaryawan, pajak, diskon, codFee, biayaPengiriman, biayaLainnya</b>.
          Perhitungan: <b>Penjualan Net = Penjualan - Diskon</b>, <b>Total Biaya = Modal + Iklan + Pot. MP + Operasional + Gaji + Pajak + COD + Pengiriman + Lainnya</b>, <b>Laba = Penjualan Net - Total Biaya</b>.
        </p>
      </div>
    </div>
  );
}

function KPI({ title, value, sub }) {
  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="rounded-2xl border border-neutral-200 bg-white p-4">
      <div className="text-sm text-neutral-600">{title}</div>
      <div className="text-2xl font-semibold mt-1">{value}</div>
      {sub ? <div className="text-xs text-neutral-500 mt-1">{sub}</div> : null}
    </motion.div>
  );
}

function Th({ children, className = "" }) {
  return <th className={`text-left px-3 py-2 font-medium text-neutral-600 ${className}`}>{children}</th>;
}
function Td({ children, className = "" }) {
  return <td className={`px-3 py-2 ${className}`}>{children}</td>;
}
