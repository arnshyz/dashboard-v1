
import React, { useEffect, useMemo, useState } from "react";
import Head from "next/head";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  ResponsiveContainer, AreaChart, Area, CartesianGrid, XAxis, YAxis, Tooltip, Legend,
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell
} from "recharts";

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

const seed = [
  { date: "2025-09-20", channel: "Website", marketplace: "Website", qty: 12, penjualan: 2500000, modal: 1200000, biayaIklan: 250000, potonganMarketplace: 0, biayaOperasional: 150000, gajiKaryawan: 300000, pajak: 25000, diskon: 50000, codFee: 0, biayaPengiriman: 40000, biayaLainnya: 0 },
  { date: "2025-09-21", channel: "Website", marketplace: "Website", qty: 8, penjualan: 1800000, modal: 900000, biayaIklan: 200000, potonganMarketplace: 0, biayaOperasional: 130000, gajiKaryawan: 300000, pajak: 20000, diskon: 30000, codFee: 0, biayaPengiriman: 30000, biayaLainnya: 0 }
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
      const diskon = sumBy(rows, "diskon");
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

const formatAxisValue = (value) => {
  const abs = Math.abs(value);
  if (abs >= 1_000_000_000) return fmtNum(value / 1_000_000_000) + "B";
  if (abs >= 1_000_000) return fmtNum(value / 1_000_000) + "M";
  if (abs >= 1_000) return fmtNum(value / 1_000) + "k";
  return fmtNum(value);
};

const defaultPageSettings = {
  pageTitle: "AKAY Sales Dashboard",
  description: "Pantau performa penjualan AKAY Digital Nusantara secara real-time.",
};

export default function IndexPage({ initialSettings }) {
  const [rows, setRows] = useState(seed);
  const [replaceOnImport, setReplaceOnImport] = useState(true);
  const [adminKey, setAdminKey] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [now, setNow] = useState(() => new Date());
  const [pageSettings, setPageSettings] = useState(initialSettings || defaultPageSettings);

  useEffect(() => {
    let ignore = false;
    const loadSettings = async () => {
      try {
        const res = await fetch('/api/settings');
        const data = await res.json().catch(() => null);
        if (!ignore && res.ok && data) {
          setPageSettings({
            pageTitle: data.pageTitle || defaultPageSettings.pageTitle,
            description: data.description || defaultPageSettings.description,
          });
        }
      } catch (error) {
        if (process.env.NODE_ENV !== 'production') {
          console.warn('Gagal memuat pengaturan halaman', error);
        }
      }
    };
    loadSettings();
    return () => {
      ignore = true;
    };
  }, []);

  const pageTitle = pageSettings?.pageTitle || defaultPageSettings.pageTitle;
  const pageDescription = pageSettings?.description || defaultPageSettings.description;

  // THEME (light/dark)
  const [theme, setTheme] = useState('light');
  const isDark = theme === 'dark';
  useEffect(() => {
    const saved = localStorage.getItem('AKAY_THEME') || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    setTheme(saved);
    document.documentElement.classList.toggle('dark', saved === 'dark');
  }, []);
  const toggleTheme = () => {
    const next = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
    localStorage.setItem('AKAY_THEME', next);
    document.documentElement.classList.toggle('dark', next === 'dark');
  };

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  const formattedDate = useMemo(() => {
    const text = new Intl.DateTimeFormat('id-ID', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }).format(now);
    return text.charAt(0).toUpperCase() + text.slice(1);
  }, [now]);

  const formattedTime = useMemo(
    () =>
      new Intl.DateTimeFormat('id-ID', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      }).format(now),
    [now]
  );

  // Logout (hapus cookie sesi)
  const doLogout = async () => {
    try { await fetch('/api/auth/logout'); } catch {}
    window.location.href = '/login';
  };

  // Filters
  const [dateFrom, setDateFrom] = useState(() => { const d = new Date(); d.setDate(d.getDate() - 14); return d.toISOString().slice(0,10); });
  const [dateTo, setDateTo] = useState(() => new Date().toISOString().slice(0,10));
  const [marketplaces, setMarketplaces] = useState(new Set(allMarketplaces));

  useEffect(() => { const k = localStorage.getItem('AKAY_ADMIN_KEY') || ''; if (k) setAdminKey(k); }, []);

  useEffect(() => {
    const fetcher = async () => {
      try {
        const params = new URLSearchParams({ from: dateFrom, to: dateTo });
        const res = await fetch(`/api/sales?${params.toString()}`);
        const js = await res.json();
        if (js && Array.isArray(js.rows)) {
          setRows(js.rows);
          setIsAdmin(Boolean(js.isAdmin));
        }
      } catch (e) {}
    };
    fetcher();
  }, [dateFrom, dateTo]);

  const filtered = useMemo(() => rows.filter(r => {
    const t = new Date(r.date);
    const min = new Date(dateFrom); const max = new Date(dateTo); max.setHours(23,59,59,999);
    return t >= min && t <= max && marketplaces.has(r.marketplace);
  }), [rows, dateFrom, dateTo, marketplaces]);

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

  const adSpendByChannel = useMemo(() => {
    const map = new Map();
    filtered.forEach((row) => {
      const channel = row.channel || "Lainnya";
      const current = map.get(channel) || 0;
      map.set(channel, current + parseNumber(row.biayaIklan));
    });
    return Array.from(map.entries()).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);
  }, [filtered]);

  const pieColors = useMemo(
    () =>
      isDark
        ? ["#38bdf8", "#c084fc", "#f472b6", "#fb7185", "#facc15", "#34d399", "#22d3ee", "#60a5fa", "#f97316"]
        : ["#3B82F6", "#F97316", "#22C55E", "#A855F7", "#EF4444", "#14B8A6", "#EAB308", "#06B6D4", "#F472B6"],
    [isDark]
  );

  const axisTickStyle = useMemo(
    () => ({ fill: isDark ? '#a1a1aa' : '#4b5563', fontSize: 11, fontWeight: 500 }),
    [isDark]
  );

  const legendStyle = useMemo(
    () => ({ color: isDark ? '#d4d4d8' : '#4b5563', fontSize: 12 }),
    [isDark]
  );

  const tooltipStyle = useMemo(
    () => ({
      backgroundColor: isDark ? '#18181b' : '#ffffff',
      borderColor: isDark ? '#27272a' : '#e5e7eb',
      borderRadius: 12,
      color: isDark ? '#f4f4f5' : '#1f2937',
    }),
    [isDark]
  );

  const tooltipItemStyle = useMemo(
    () => ({ color: isDark ? '#f4f4f5' : '#1f2937' }),
    [isDark]
  );

  const chartColors = useMemo(
    () => ({
      revenue: isDark ? '#60a5fa' : '#3b82f6',
      cost: isDark ? '#f87171' : '#ef4444',
      marketing: isDark ? '#c084fc' : '#8b5cf6',
      bar: isDark ? '#f59e0b' : '#f97316',
      profit: isDark ? '#4ade80' : '#22c55e',
      grid: isDark ? '#27272a' : '#e5e7eb',
    }),
    [isDark]
  );

  const toggleSet = (setState, hasFn, value) => { setState((prev) => { const next = new Set(prev); if (hasFn(prev, value)) next.delete(value); else next.add(value); return next; }); };
  const inSet = (set, value) => set.has(value);

  const onImportCSV = async (file) => {
    const text = await file.text();
    const lines = text.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
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
      ["qty","penjualan","modal","biayaIklan","potonganMarketplace","biayaOperasional","gajiKaryawan","pajak","diskon","codFee","biayaPengiriman","biayaLainnya"]
        .forEach(k => row[k] = parseNumber(row[k]));
      parsed.push(row);
    }
    setRows((prev) => (replaceOnImport ? parsed : [...prev, ...parsed]));
  };

  const doExport = (fmt) => {
    const params = new URLSearchParams({ from: dateFrom, to: dateTo });
    const url = `/api/export?format=${fmt}&` + params.toString();
    const a = document.createElement("a");
    a.href = url; a.click();
  };

  const loginAdmin = async () => {
    if (!adminKey) return;
    localStorage.setItem('AKAY_ADMIN_KEY', adminKey);
    try {
      const res = await fetch('/api/sales', { headers: { 'x-api-key': adminKey }});
      const js = await res.json().catch(()=>({}));
      if (res.ok && js.isAdmin) { setIsAdmin(true); alert('Admin aktif'); }
      else { alert(js.error || 'API key salah'); }
    } catch (e) { alert('Gagal terhubung ke API: ' + e.message); }
  };

  return (
    <>
      <Head>
        <title>{pageTitle}</title>
        <meta name="description" content={pageDescription} />
      </Head>
      <div className="min-h-screen w-full bg-neutral-50 text-neutral-900 dark:bg-neutral-950 dark:text-neutral-100">
      {/* Header */}
      <div className="sticky top-0 z-30 backdrop-blur bg-white/70 border-b border-neutral-200
                      dark:bg-neutral-900/70 dark:border-neutral-800">
        <div className="max-w-7xl mx-auto px-4 py-3">
          {/* Responsive header layout */}
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            {/* Brand */}
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <img src="/akay-logo.svg" alt="AKAY" className="w-9 h-9 rounded" />
                  <div>
                    <h1 className="text-xl font-semibold leading-tight">{pageTitle}</h1>
                    <p className="text-sm text-neutral-500 dark:text-neutral-300">{pageDescription}</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setMobileMenuOpen((prev) => !prev)}
                  className="md:hidden inline-flex items-center gap-2 px-3 py-2 rounded-full border border-neutral-300 text-sm font-medium text-neutral-700 hover:bg-neutral-100 dark:border-neutral-700 dark:text-neutral-100 dark:bg-neutral-900"
                  aria-expanded={mobileMenuOpen}
                  aria-controls="dashboard-controls"
                >
                  <span className="text-lg" aria-hidden="true">☰</span>
                  Menu
                </button>
              </div>
            </div>
            {/* Control groups */}
            <div
              id="dashboard-controls"
              className={`${mobileMenuOpen ? "flex" : "hidden"} flex-col gap-3 md:flex md:flex-row md:items-center md:justify-between md:gap-4`}
            >
              {/* Date group */}
              <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                <div className="flex items-center gap-2">
                  <label className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-300">Dari</label>
                  <input type="date" value={dateFrom} onChange={(e)=>setDateFrom(e.target.value)} className="w-32 sm:w-auto px-2 py-1 rounded border border-neutral-300 text-xs sm:text-sm dark:bg-neutral-800 dark:border-neutral-700" />
                </div>
                <div className="flex items-center gap-2">
                  <label className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-300">Sampai</label>
                  <input type="date" value={dateTo} onChange={(e)=>setDateTo(e.target.value)} className="w-32 sm:w-auto px-2 py-1 rounded border border-neutral-300 text-xs sm:text-sm dark:bg-neutral-800 dark:border-neutral-700" />
                </div>
              </div>
              {/* Action group */}
              <div className="flex flex-wrap items-center gap-2">
                <Link
                  href="/warehouse"
                  className="w-full sm:w-auto rounded-full border border-neutral-300 bg-white px-3 py-1.5 text-sm font-medium text-neutral-700 hover:bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100"
                >
                  Gudang
                </Link>
                <Link
                  href="/admin"
                  className="w-full sm:w-auto rounded-full border border-neutral-300 bg-white px-3 py-1.5 text-sm font-medium text-neutral-700 hover:bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100"
                >
                  Admin
                </Link>
                <button onClick={toggleTheme} className="w-full sm:w-auto px-3 py-1.5 rounded-full border text-sm bg-white hover:bg-neutral-50 dark:bg-neutral-800 dark:text-neutral-100 dark:border-neutral-700" title="Ganti tema">
                  {theme === 'dark' ? '☀️ Terang' : '🌙 Gelap'}
                </button>
                <button onClick={async()=>{await doLogout();}} className="w-full sm:w-auto px-3 py-1.5 rounded-full border text-sm bg-white hover:bg-neutral-50 dark:bg-neutral-800 dark:text-neutral-100 dark:border-neutral-700">
                  Logout
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="max-w-7xl mx-auto px-4 py-3">
        <div className="grid md:grid-cols-2 gap-3">
          <div className="rounded-2xl border border-neutral-200 bg-white p-4 dark:bg-neutral-900 dark:border-neutral-800">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <div className="text-sm font-semibold text-neutral-800 dark:text-neutral-100">Helo Admin</div>
                <div className="mt-1 text-xs font-medium uppercase tracking-wide text-neutral-400 dark:text-neutral-500">
                  Ringkasan dashboard
                </div>
              </div>
              <div className="flex flex-col items-start gap-1 text-sm text-neutral-600 capitalize sm:items-end sm:text-right dark:text-neutral-300">
                <span>{formattedDate}</span>
                <span className="text-base font-semibold tracking-tight text-neutral-900 dark:text-neutral-100">
                  {formattedTime}
                </span>
              </div>
            </div>
          </div>
          <div className="rounded-2xl border border-neutral-200 bg-white p-3 sm:p-4 dark:bg-neutral-900 dark:border-neutral-800">
            <div className="text-xs font-semibold uppercase tracking-wide text-neutral-500 dark:text-neutral-400 mb-2">
              Marketplace
            </div>
            <div className="flex flex-wrap gap-1.5">
              {allMarketplaces.map((m) => (
                <button
                  key={m}
                  onClick={() => toggleSet(setMarketplaces, (s, v) => s.has(v), m)}
                  className={`px-2.5 py-1 rounded-full text-xs font-medium transition ${
                    inSet(marketplaces, m)
                      ? "bg-neutral-900 text-white shadow-sm dark:bg-neutral-100 dark:text-neutral-900"
                      : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200 dark:bg-neutral-800 dark:text-neutral-200 dark:hover:bg-neutral-700/70"
                  }`}
                >
                  {m}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* KPI cards */}
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <KPI title="Penjualan (Gross)" value={fmtIDR(totals.penjualan)} sub={"Diskon " + fmtIDR(totals.diskon)} />
          <KPI title="Penjualan Net" value={fmtIDR(totals.penjualanNet)} sub={"Qty " + fmtNum(totals.qty)} />
          <KPI title="Total Biaya" value={fmtIDR(totals.totalBiaya)} sub={`Modal ${fmtIDR(totals.modal)}`} />
          <KPI title="Total Biaya Iklan" value={fmtIDR(totals.biayaIklan)} sub={`ROAS ${totals.roas.toFixed(2)}x`} />
          <KPI title="Laba" value={fmtIDR(totals.laba)} sub={`Margin ${(totals.margin * 100).toFixed(1)}%`} />
        </div>
      </div>

      {/* Main Charts */}
      <div className="max-w-7xl mx-auto px-4 py-6 grid lg:grid-cols-4 gap-4">
        <div className="rounded-2xl border border-neutral-200 bg-white p-4 lg:col-span-2 dark:bg-neutral-900 dark:border-neutral-800">
          <div className="text-sm font-medium mb-3 text-neutral-700 dark:text-neutral-200">Pendapatan Net vs Total Biaya (Harian)</div>
          <div className="h-[42vh] sm:h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={daily} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="g1" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={chartColors.revenue} stopOpacity={0.35} />
                    <stop offset="95%" stopColor={chartColors.revenue} stopOpacity={0.02} />
                  </linearGradient>
                  <linearGradient id="g2" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={chartColors.cost} stopOpacity={0.35} />
                    <stop offset="95%" stopColor={chartColors.cost} stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke={chartColors.grid} />
                <XAxis dataKey="date" tick={axisTickStyle} tickLine={false} axisLine={false} />
                <YAxis
                  tickFormatter={formatAxisValue}
                  tick={axisTickStyle}
                  width={80}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip formatter={(v) => fmtIDR(v)} contentStyle={tooltipStyle} itemStyle={tooltipItemStyle} />
                <Legend wrapperStyle={legendStyle} />
                <Area type="monotone" dataKey="penjualanNet" name="Pendapatan Net" stroke={chartColors.revenue} fill="url(#g1)" strokeWidth={2} />
                <Area type="monotone" dataKey="totalBiaya" name="Total Biaya" stroke={chartColors.cost} fill="url(#g2)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="rounded-2xl border border-neutral-200 bg-white p-4 dark:bg-neutral-900 dark:border-neutral-800">
          <div className="text-sm font-medium mb-3 text-neutral-700 dark:text-neutral-200">Laba Harian</div>
          <div className="h-[42vh] sm:h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={daily}>
                <CartesianGrid strokeDasharray="3 3" stroke={chartColors.grid} />
                <XAxis dataKey="date" tick={axisTickStyle} tickLine={false} axisLine={false} />
                <YAxis
                  tickFormatter={formatAxisValue}
                  tick={axisTickStyle}
                  width={80}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip formatter={(v) => fmtIDR(v)} contentStyle={tooltipStyle} itemStyle={tooltipItemStyle} />
                <Legend wrapperStyle={legendStyle} />
                <Line type="monotone" dataKey="laba" name="Laba" stroke={chartColors.profit} strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="rounded-2xl border border-neutral-200 bg-white p-4 dark:bg-neutral-900 dark:border-neutral-800">
          <div className="text-sm font-medium mb-3 text-neutral-700 dark:text-neutral-200">Breakdown Biaya</div>
          <div className="h-[42vh] sm:h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={pieData} dataKey="value" nameKey="name" outerRadius={90}>
                  {pieData.map((entry, i) => (<Cell key={i} fill={pieColors[i % pieColors.length]} />))}
                </Pie>
                <Tooltip formatter={(v) => fmtIDR(v)} contentStyle={tooltipStyle} itemStyle={tooltipItemStyle} />
                <Legend wrapperStyle={legendStyle} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* New Charts: Ad Spend & Marketplace Deductions */}
      <div className="max-w-7xl mx-auto px-4 pb-6 grid md:grid-cols-2 xl:grid-cols-3 gap-4">
        <div className="rounded-2xl border border-neutral-200 bg-white p-4 dark:bg-neutral-900 dark:border-neutral-800">
          <div className="text-sm font-medium mb-3 text-neutral-700 dark:text-neutral-200">Pengeluaran Iklan (Harian)</div>
          <div className="h-[36vh] sm:h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={daily}>
                <CartesianGrid strokeDasharray="3 3" stroke={chartColors.grid} />
                <XAxis dataKey="date" tick={axisTickStyle} tickLine={false} axisLine={false} />
                <YAxis
                  tickFormatter={formatAxisValue}
                  tick={axisTickStyle}
                  width={80}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip formatter={(v) => fmtIDR(v)} contentStyle={tooltipStyle} itemStyle={tooltipItemStyle} />
                <Legend wrapperStyle={legendStyle} />
                <Line type="monotone" dataKey="biayaIklan" name="Biaya Iklan" stroke={chartColors.marketing} strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="rounded-2xl border border-neutral-200 bg-white p-4 dark:bg-neutral-900 dark:border-neutral-800">
          <div className="text-sm font-medium mb-3 text-neutral-700 dark:text-neutral-200">Potongan Marketplace (Harian)</div>
          <div className="h-[36vh] sm:h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={daily}>
                <CartesianGrid strokeDasharray="3 3" stroke={chartColors.grid} />
                <XAxis dataKey="date" tick={axisTickStyle} tickLine={false} axisLine={false} />
                <YAxis
                  tickFormatter={formatAxisValue}
                  tick={axisTickStyle}
                  width={80}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip formatter={(v) => fmtIDR(v)} contentStyle={tooltipStyle} itemStyle={tooltipItemStyle} />
                <Legend wrapperStyle={legendStyle} />
                <Bar dataKey="potonganMarketplace" name="Potongan MP" fill={chartColors.cost} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="rounded-2xl border border-neutral-200 bg-white p-4 dark:bg-neutral-900 dark:border-neutral-800">
          <div className="text-sm font-medium mb-3 text-neutral-700 dark:text-neutral-200">Biaya Iklan per Channel</div>
          <div className="h-[36vh] sm:h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={adSpendByChannel}>
                <CartesianGrid strokeDasharray="3 3" stroke={chartColors.grid} />
                <XAxis dataKey="name" tick={axisTickStyle} tickLine={false} axisLine={false} />
                <YAxis
                  tickFormatter={formatAxisValue}
                  tick={axisTickStyle}
                  width={80}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip formatter={(v) => fmtIDR(v)} contentStyle={tooltipStyle} itemStyle={tooltipItemStyle} />
                <Legend wrapperStyle={legendStyle} />
                <Bar dataKey="value" name="Biaya Iklan" fill={chartColors.bar} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="max-w-7xl mx-auto px-4 pb-10">
        <div className="rounded-2xl border border-neutral-200 bg-white overflow-hidden dark:bg-neutral-900 dark:border-neutral-800">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between px-4 py-3 border-b gap-2 dark:border-neutral-800">
            <div className="text-sm font-medium text-neutral-700 dark:text-neutral-200">Rangkuman Harian</div>
            <div className="flex flex-col gap-2 w-full lg:flex-row lg:items-center lg:justify-between">
              <label className="flex items-center gap-2 text-sm text-neutral-600 dark:text-neutral-300">
                <input type="checkbox" checked={replaceOnImport} onChange={(e) => setReplaceOnImport(e.target.checked)} />
                Ganti data saat import CSV
              </label>
              <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                <div className="flex flex-wrap sm:flex-nowrap gap-2">
                  <button onClick={()=>doExport('csv')} className="w-full sm:w-auto px-3 py-1.5 rounded-full border text-sm bg-white hover:bg-neutral-50 dark:bg-neutral-800 dark:text-neutral-100 dark:border-neutral-700">CSV</button>
                  <button onClick={()=>doExport('xlsx')} className="w-full sm:w-auto px-3 py-1.5 rounded-full border text-sm bg-white hover:bg-neutral-50 dark:bg-neutral-800 dark:text-neutral-100 dark:border-neutral-700">XLSX</button>
                  <button onClick={()=>doExport('pdf')} className="w-full sm:w-auto px-3 py-1.5 rounded-full border text-sm bg-white hover:bg-neutral-50 dark:bg-neutral-800 dark:text-neutral-100 dark:border-neutral-700">PDF</button>
                </div>
                <label className="inline-flex items-center justify-center text-sm px-3 py-1.5 rounded-full bg-neutral-900 text-white cursor-pointer dark:bg-neutral-200 dark:text-neutral-900 text-center">
                  Import CSV
                  <input type="file" accept=".csv" className="hidden" onChange={(e)=>{ const f = e.target.files?.[0]; if (f) onImportCSV(f); }} />
                </label>
              </div>
              <div className="flex flex-col sm:flex-row gap-2 w-full lg:w-auto">
                <input placeholder="Admin API Key" value={adminKey} onChange={(e)=>setAdminKey(e.target.value)} className="flex-1 px-2 py-1 rounded border border-neutral-300 text-sm dark:bg-neutral-800 dark:border-neutral-700" />
                <button onClick={loginAdmin} className="px-3 py-1.5 rounded-full border text-sm bg-white hover:bg-neutral-50 dark:bg-neutral-800 dark:text-neutral-100 dark:border-neutral-700">Login Admin</button>
              </div>
            </div>
          </div>
          <div className="overflow-auto">
            <table className="w-full text-xs sm:text-sm min-w-[900px]">
              <thead className="bg-neutral-50 dark:bg-neutral-900">
                <tr>
                  <Th>Tanggal</Th>
                  <Th className="hidden md:table-cell">Channel</Th>
                  <Th className="hidden md:table-cell">MP</Th>
                  <Th className="text-right">Qty</Th>
                  <Th className="text-right">Penj. Gross</Th>
                  <Th className="text-right">Diskon</Th>
                  <Th className="text-right">Penj. Net</Th>
                  <Th className="text-right hidden lg:table-cell">Modal</Th>
                  <Th className="text-right hidden lg:table-cell">Iklan</Th>
                  <Th className="text-right hidden lg:table-cell">Pot. MP</Th>
                  <Th className="text-right hidden lg:table-cell">Operasional</Th>
                  <Th className="text-right hidden lg:table-cell">Gaji</Th>
                  <Th className="text-right hidden xl:table-cell">Pajak</Th>
                  <Th className="text-right hidden xl:table-cell">COD</Th>
                  <Th className="text-right hidden xl:table-cell">Pengiriman</Th>
                  <Th className="text-right hidden xl:table-cell">Lainnya</Th>
                  <Th className="text-right">Total Biaya</Th>
                  <Th className="text-right">Laba</Th>
                  <Th className="text-right">Margin</Th>
                </tr>
              </thead>
              <tbody>
                {daily.map((r) => (
                  <tr key={r.date} className="border-t hover:bg-neutral-50/60 dark:border-neutral-800 dark:hover:bg-neutral-800/50">
                    <Td className="whitespace-nowrap">{r.date}</Td>
                    <Td className="hidden md:table-cell">—</Td>
                    <Td className="hidden md:table-cell">—</Td>
                    <Td className="text-right">{fmtNum(r.qty)}</Td>
                    <Td className="text-right">{fmtIDR(r.penjualan)}</Td>
                    <Td className="text-right">{fmtIDR(r.diskon)}</Td>
                    <Td className="text-right">{fmtIDR(r.penjualanNet)}</Td>
                    <Td className="text-right hidden lg:table-cell">{fmtIDR(r.modal)}</Td>
                    <Td className="text-right hidden lg:table-cell">{fmtIDR(r.biayaIklan)}</Td>
                    <Td className="text-right hidden lg:table-cell">{fmtIDR(r.potonganMarketplace)}</Td>
                    <Td className="text-right hidden lg:table-cell">{fmtIDR(r.biayaOperasional)}</Td>
                    <Td className="text-right hidden lg:table-cell">{fmtIDR(r.gajiKaryawan)}</Td>
                    <Td className="text-right hidden xl:table-cell">{fmtIDR(r.pajak)}</Td>
                    <Td className="text-right hidden xl:table-cell">{fmtIDR(r.codFee)}</Td>
                    <Td className="text-right hidden xl:table-cell">{fmtIDR(r.biayaPengiriman)}</Td>
                    <Td className="text-right hidden xl:table-cell">{fmtIDR(r.biayaLainnya)}</Td>
                    <Td className="text-right">{fmtIDR(r.totalBiaya)}</Td>
                    <Td className={`text-right font-medium ${r.laba < 0 ? 'text-red-600' : ''}`}>{fmtIDR(r.laba)}</Td>
                    <Td className="text-right">{(r.margin * 100).toFixed(1)}%</Td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-neutral-50 border-t dark:bg-neutral-900 dark:border-neutral-800">
                <tr>
                  <Td className="font-medium">TOTAL</Td>
                  <Td className="hidden md:table-cell"></Td>
                  <Td className="hidden md:table-cell"></Td>
                  <Td className="text-right font-medium">{fmtNum(totals.qty)}</Td>
                  <Td className="text-right font-medium">{fmtIDR(totals.penjualan)}</Td>
                  <Td className="text-right font-medium">{fmtIDR(totals.diskon)}</Td>
                  <Td className="text-right font-medium">{fmtIDR(totals.penjualanNet)}</Td>
                  <Td className="text-right font-medium hidden lg:table-cell">{fmtIDR(totals.modal)}</Td>
                  <Td className="text-right font-medium hidden lg:table-cell">{fmtIDR(totals.biayaIklan)}</Td>
                  <Td className="text-right font-medium hidden lg:table-cell">{fmtIDR(totals.potonganMarketplace)}</Td>
                  <Td className="text-right font-medium hidden lg:table-cell">{fmtIDR(totals.biayaOperasional)}</Td>
                  <Td className="text-right font-medium hidden lg:table-cell">{fmtIDR(totals.gajiKaryawan)}</Td>
                  <Td className="text-right font-medium hidden xl:table-cell">{fmtIDR(totals.pajak)}</Td>
                  <Td className="text-right font-medium hidden xl:table-cell">{fmtIDR(totals.codFee)}</Td>
                  <Td className="text-right font-medium hidden xl:table-cell">{fmtIDR(totals.biayaPengiriman)}</Td>
                  <Td className="text-right font-medium hidden xl:table-cell">{fmtIDR(totals.biayaLainnya)}</Td>
                  <Td className="text-right font-medium">{fmtIDR(totals.totalBiaya)}</Td>
                  <Td className="text-right font-medium">{fmtIDR(totals.laba)}</Td>
                  <Td className="text-right font-medium">{(totals.margin * 100).toFixed(1)}%</Td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 pb-16 text-xs text-neutral-500 dark:text-neutral-400">
        <p>
          Header Google Sheet: <b>date, channel, marketplace, qty, penjualan, modal, biayaIklan, potonganMarketplace, biayaOperasional, gajiKaryawan, pajak, diskon, codFee, biayaPengiriman, biayaLainnya</b>.
          Rumus: <b>Penjualan Net = Penjualan - Diskon</b>, <b>Total Biaya = Modal + Iklan + Pot. MP + Operasional + Gaji + Pajak + COD + Pengiriman + Lainnya</b>, <b>Laba = Penjualan Net - Total Biaya</b>.
        </p>
      </div>
    </div>
    </>
  );
}

export async function getServerSideProps() {
  try {
    const { getPublicSettings } = await import('../lib/settings');
    const settings = await getPublicSettings();
    return { props: { initialSettings: settings } };
  } catch (error) {
    console.warn('Gagal memuat pengaturan publik:', error);
    return { props: { initialSettings: defaultPageSettings } };
  }
}

function KPI({ title, value, sub }) {
  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="rounded-2xl border border-neutral-200 bg-white p-4 dark:bg-neutral-900 dark:border-neutral-800">
      <div className="text-sm text-neutral-600 dark:text-neutral-300">{title}</div>
      <div className="text-2xl font-semibold mt-1">{value}</div>
      {sub ? <div className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">{sub}</div> : null}
    </motion.div>
  );
}
function Th({ children, className = "" }) { return <th className={`text-left px-3 py-2 font-medium text-neutral-600 dark:text-neutral-300 ${className}`}>{children}</th>; }
function Td({ children, className = "" }) { return <td className={`px-3 py-2 ${className}`}>{children}</td>; }
