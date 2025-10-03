import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";

const now = () => new Date();

const quickStats = [
  { title: "Total SKU Aktif", value: 124, trend: "+8 SKU", tone: "positive" },
  { title: "Stok Minimum", value: "37 SKU", trend: "Perlu restock", tone: "warning" },
  { title: "Barang Masuk Hari Ini", value: "1.240 unit", trend: "+12% vs kemarin", tone: "positive" },
  { title: "Barang Keluar Hari Ini", value: "980 unit", trend: "-5% vs kemarin", tone: "neutral" },
  { title: "Stock Opname Terakhir", value: "12 Feb 2025", trend: "Gudang Utama", tone: "neutral" },
];

const stockAlerts = [
  { sku: "AK-0912", name: "Serum Bright 30ml", status: "Stok menipis", location: "Rak A3", priority: "high" },
  { sku: "AK-4551", name: "Masker Charcoal", status: "Overstock", location: "Rak B1", priority: "medium" },
  { sku: "AK-7710", name: "Toner Herbal", status: "Menunggu QC", location: "Area Karantina", priority: "low" },
];

const inboundOutbound = [
  { type: "Inbound", reference: "PO-2025-091", time: "08:15", by: "Maya", notes: "Supplier Herbal Co", qty: "+320" },
  { type: "Outbound", reference: "SO-2025-233", time: "10:22", by: "Rangga", notes: "Marketplace Tokopedia", qty: "-180" },
  { type: "Inbound", reference: "PO-2025-094", time: "13:05", by: "Yuda", notes: "Supplier GlowUp", qty: "+420" },
  { type: "Outbound", reference: "SO-2025-240", time: "15:40", by: "Laras", notes: "Website", qty: "-260" },
];

const locationMap = [
  { zone: "Gudang Utama", racks: "Rak A1-A8", filled: 82, capacity: 96 },
  { zone: "Gudang Pending", racks: "Rak B1-B6", filled: 45, capacity: 60 },
  { zone: "Area QC", racks: "C1-C3", filled: 12, capacity: 24 },
  { zone: "Area Ekspedisi", racks: "D1-D2", filled: 9, capacity: 12 },
];

const users = [
  { name: "Hadi", role: "Kepala Gudang", status: "Aktif", shift: "Pagi" },
  { name: "Maya", role: "Admin Stok", status: "Aktif", shift: "Pagi" },
  { name: "Rangga", role: "Picker", status: "Aktif", shift: "Siang" },
  { name: "Dina", role: "Checker", status: "Cuti", shift: "Malam" },
];

const reports = [
  { title: "Ringkasan Stok Mingguan", period: "5-11 Feb 2025", status: "Siap unduh" },
  { title: "Laporan Barang Masuk", period: "Februari 2025", status: "Dijadwalkan" },
  { title: "Laporan Barang Keluar", period: "Februari 2025", status: "Diproses" },
];

const opnamePlans = [
  { area: "Rak A1-A4", schedule: "15 Feb 2025", supervisor: "Hadi", status: "Terjadwal" },
  { area: "Rak B1-B6", schedule: "16 Feb 2025", supervisor: "Maya", status: "Terjadwal" },
  { area: "Area Pending", schedule: "17 Feb 2025", supervisor: "Dina", status: "Menunggu" },
];

const notifications = [
  { time: "Baru saja", message: "Stok Serum Bright tinggal 24 unit.", tone: "critical" },
  { time: "10 menit lalu", message: "Inbound PO-2025-094 selesai diproses.", tone: "success" },
  { time: "30 menit lalu", message: "Pengingat opname Rak A1-A4 besok pukul 09.00.", tone: "info" },
];

const classNames = (...args) => args.filter(Boolean).join(" ");

const toneStyles = {
  positive: "text-emerald-600 dark:text-emerald-400",
  warning: "text-amber-600 dark:text-amber-400",
  neutral: "text-neutral-500 dark:text-neutral-400",
  success: "text-emerald-600 dark:text-emerald-400",
  info: "text-sky-600 dark:text-sky-400",
  critical: "text-rose-600 dark:text-rose-400",
};

export default function WarehousePage() {
  const [theme, setTheme] = useState("light");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [clock, setClock] = useState(() => now());

  useEffect(() => {
    const saved =
      typeof window !== "undefined"
        ? localStorage.getItem("AKAY_THEME") ||
          (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light")
        : "light";
    setTheme(saved);
    document.documentElement.classList.toggle("dark", saved === "dark");
  }, []);

  const toggleTheme = () => {
    setTheme((prev) => {
      const next = prev === "dark" ? "light" : "dark";
      if (typeof window !== "undefined") {
        localStorage.setItem("AKAY_THEME", next);
        document.documentElement.classList.toggle("dark", next === "dark");
      }
      return next;
    });
  };

  useEffect(() => {
    const timer = setInterval(() => setClock(now()), 1000);
    return () => clearInterval(timer);
  }, []);

  const currentTime = useMemo(
    () =>
      new Intl.DateTimeFormat("id-ID", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      }).format(clock),
    [clock]
  );

  const currentDate = useMemo(() => {
    const formatted = new Intl.DateTimeFormat("id-ID", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    }).format(clock);
    return formatted.charAt(0).toUpperCase() + formatted.slice(1);
  }, [clock]);

  return (
    <div className="min-h-screen bg-neutral-50 text-neutral-900 dark:bg-neutral-950 dark:text-neutral-100">
      <header className="sticky top-0 z-30 border-b border-neutral-200 bg-white/80 backdrop-blur dark:border-neutral-800 dark:bg-neutral-900/80">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <img src="/akay-logo.svg" alt="AKAY" className="h-9 w-9 rounded" />
              <div>
                <h1 className="text-xl font-semibold leading-tight">AKAY Warehouse Hub</h1>
                <p className="text-sm text-neutral-500 dark:text-neutral-400">Integrasi stok & fulfillment</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setMobileMenuOpen((prev) => !prev)}
              className="inline-flex items-center gap-2 rounded-full border border-neutral-300 px-3 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-100 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100 md:hidden"
              aria-expanded={mobileMenuOpen}
              aria-controls="warehouse-controls"
            >
              <span aria-hidden="true" className="text-lg">
                ☰
              </span>
              Menu
            </button>
          </div>
          <nav
            id="warehouse-controls"
            className={classNames(
              "flex flex-col gap-3 md:flex md:flex-row md:items-center md:gap-4",
              mobileMenuOpen ? "flex" : "hidden"
            )}
          >
            <div className="flex flex-wrap items-center gap-2">
              <Link
                href="/"
                className="rounded-full border border-neutral-200 px-3 py-1.5 text-sm font-medium text-neutral-600 hover:bg-neutral-100 dark:border-neutral-700 dark:text-neutral-200 dark:hover:bg-neutral-800"
              >
                ← Kembali ke Sales
              </Link>
              <button
                type="button"
                onClick={toggleTheme}
                className="rounded-full border border-neutral-200 px-3 py-1.5 text-sm font-medium text-neutral-600 hover:bg-neutral-100 dark:border-neutral-700 dark:text-neutral-200 dark:hover:bg-neutral-800"
              >
                {theme === "dark" ? "☀️ Terang" : "🌙 Gelap"}
              </button>
            </div>
            <div className="flex flex-col gap-1 text-sm text-neutral-500 dark:text-neutral-400 md:items-end">
              <span>{currentDate}</span>
              <span className="text-base font-semibold text-neutral-900 dark:text-neutral-100">{currentTime}</span>
            </div>
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-7xl space-y-6 px-4 py-6">
        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
          {quickStats.map((item) => (
            <article
              key={item.title}
              className="rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm dark:border-neutral-800 dark:bg-neutral-900"
            >
              <h2 className="text-sm font-semibold text-neutral-500 dark:text-neutral-400">{item.title}</h2>
              <p className="mt-3 text-2xl font-semibold text-neutral-900 dark:text-neutral-50">{item.value}</p>
              <span className={classNames("mt-2 block text-xs font-medium", toneStyles[item.tone])}>{item.trend}</span>
            </article>
          ))}
        </section>

        <section className="grid gap-4 lg:grid-cols-5">
          <article className="rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm dark:border-neutral-800 dark:bg-neutral-900 lg:col-span-3">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-lg font-semibold">Data Barang</h2>
                <p className="text-sm text-neutral-500 dark:text-neutral-400">Ringkasan SKU aktif & status stok realtime</p>
              </div>
              <button className="rounded-full border border-neutral-200 px-3 py-1 text-xs font-medium text-neutral-600 hover:bg-neutral-100 dark:border-neutral-700 dark:text-neutral-200 dark:hover:bg-neutral-800">
                Unduh CSV
              </button>
            </div>
            <div className="mt-4 overflow-hidden rounded-xl border border-neutral-200 dark:border-neutral-800">
              <table className="min-w-full divide-y divide-neutral-200 text-sm dark:divide-neutral-800">
                <thead className="bg-neutral-100 text-left uppercase tracking-wide text-xs font-semibold text-neutral-500 dark:bg-neutral-800/60 dark:text-neutral-300">
                  <tr>
                    <th className="px-4 py-3">SKU</th>
                    <th className="px-4 py-3">Nama</th>
                    <th className="px-4 py-3">Stok</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Lokasi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-200 dark:divide-neutral-800">
                  {stockAlerts.map((item) => (
                    <tr key={item.sku} className="bg-white dark:bg-neutral-900">
                      <td className="px-4 py-3 font-mono text-xs text-neutral-500 dark:text-neutral-400">{item.sku}</td>
                      <td className="px-4 py-3 font-medium">{item.name}</td>
                      <td className="px-4 py-3">{item.status === "Overstock" ? "> 500" : item.status === "Stok menipis" ? "< 50" : "120"}</td>
                      <td className="px-4 py-3">
                        <span
                          className={classNames(
                            "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium",
                            item.priority === "high" && "bg-rose-50 text-rose-600 dark:bg-rose-500/10 dark:text-rose-300",
                            item.priority === "medium" && "bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-300",
                            item.priority === "low" && "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-300"
                          )}
                        >
                          {item.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-neutral-500 dark:text-neutral-400">{item.location}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </article>

          <article className="rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm dark:border-neutral-800 dark:bg-neutral-900 lg:col-span-2">
            <h2 className="text-lg font-semibold">Manajemen Stok</h2>
            <p className="text-sm text-neutral-500 dark:text-neutral-400">Prioritas otomatis berdasarkan level stok & pergerakan</p>
            <ul className="mt-4 space-y-3 text-sm">
              {stockAlerts.map((item) => (
                <li key={item.sku} className="rounded-xl border border-neutral-200 p-3 dark:border-neutral-800">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-neutral-800 dark:text-neutral-100">{item.name}</span>
                    <span className="text-xs font-medium text-neutral-500 dark:text-neutral-400">{item.location}</span>
                  </div>
                  <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">{item.status}</p>
                  <span className={classNames("mt-2 inline-block text-xs font-semibold", toneStyles[item.priority === "high" ? "critical" : item.priority === "medium" ? "warning" : "positive"]) }>
                    {item.priority === "high" ? "Butuh restock segera" : item.priority === "medium" ? "Periksa rotasi" : "Aman"}
                  </span>
                </li>
              ))}
            </ul>
          </article>
        </section>

        <section className="grid gap-4 lg:grid-cols-5">
          <article className="rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm dark:border-neutral-800 dark:bg-neutral-900 lg:col-span-3">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-lg font-semibold">Pencatatan Barang Masuk & Keluar</h2>
                <p className="text-sm text-neutral-500 dark:text-neutral-400">Aktivitas terbaru terhubung ke dashboard utama</p>
              </div>
              <button className="rounded-full border border-neutral-200 px-3 py-1 text-xs font-medium text-neutral-600 hover:bg-neutral-100 dark:border-neutral-700 dark:text-neutral-200 dark:hover:bg-neutral-800">
                Lihat semua
              </button>
            </div>
            <ul className="mt-4 space-y-3">
              {inboundOutbound.map((item) => (
                <li key={item.reference} className="flex items-start gap-3 rounded-xl border border-neutral-200 p-3 dark:border-neutral-800">
                  <span
                    className={classNames(
                      "mt-0.5 inline-flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold",
                      item.type === "Inbound"
                        ? "bg-emerald-500/10 text-emerald-500"
                        : "bg-sky-500/10 text-sky-500"
                    )}
                  >
                    {item.type === "Inbound" ? "+" : "−"}
                  </span>
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm font-medium text-neutral-800 dark:text-neutral-100">
                      <span>{item.reference}</span>
                      <span className="text-xs text-neutral-400 dark:text-neutral-500">{item.time}</span>
                      <span className="text-xs text-neutral-400 dark:text-neutral-500">oleh {item.by}</span>
                    </div>
                    <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">{item.notes}</p>
                  </div>
                  <span className="text-sm font-semibold text-neutral-700 dark:text-neutral-200">{item.qty}</span>
                </li>
              ))}
            </ul>
          </article>

          <article className="rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm dark:border-neutral-800 dark:bg-neutral-900 lg:col-span-2">
            <h2 className="text-lg font-semibold">Laporan</h2>
            <p className="text-sm text-neutral-500 dark:text-neutral-400">Jadwalkan otomatis & sinkron ke ekosistem AKAY</p>
            <ul className="mt-4 space-y-3 text-sm">
              {reports.map((report) => (
                <li key={report.title} className="rounded-xl border border-neutral-200 p-3 dark:border-neutral-800">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-neutral-800 dark:text-neutral-100">{report.title}</span>
                    <span className="text-xs text-neutral-400 dark:text-neutral-500">{report.period}</span>
                  </div>
                  <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">Status: {report.status}</p>
                </li>
              ))}
            </ul>
          </article>
        </section>

        <section className="grid gap-4 lg:grid-cols-5">
          <article className="rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm dark:border-neutral-800 dark:bg-neutral-900 lg:col-span-3">
            <h2 className="text-lg font-semibold">Pelacakan Lokasi Persediaan</h2>
            <p className="text-sm text-neutral-500 dark:text-neutral-400">Status kapasitas setiap area gudang</p>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {locationMap.map((location) => {
                const percent = Math.round((location.filled / location.capacity) * 100);
                return (
                  <div key={location.zone} className="rounded-xl border border-neutral-200 p-4 dark:border-neutral-800">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-sm font-semibold text-neutral-800 dark:text-neutral-100">{location.zone}</h3>
                        <p className="text-xs text-neutral-500 dark:text-neutral-400">{location.racks}</p>
                      </div>
                      <span className="text-sm font-semibold text-neutral-700 dark:text-neutral-200">{percent}%</span>
                    </div>
                    <div className="mt-3 h-2 rounded-full bg-neutral-200 dark:bg-neutral-800">
                      <div
                        className="h-full rounded-full bg-emerald-500 dark:bg-emerald-400"
                        style={{ width: `${Math.min(percent, 100)}%` }}
                      />
                    </div>
                    <p className="mt-2 text-xs text-neutral-500 dark:text-neutral-400">
                      {location.filled} dari {location.capacity} rak terisi
                    </p>
                  </div>
                );
              })}
            </div>
          </article>

          <article className="rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm dark:border-neutral-800 dark:bg-neutral-900 lg:col-span-2">
            <h2 className="text-lg font-semibold">Fitur Notifikasi</h2>
            <p className="text-sm text-neutral-500 dark:text-neutral-400">Sinkron dengan alert dashboard penjualan</p>
            <ul className="mt-4 space-y-3 text-sm">
              {notifications.map((notif) => (
                <li key={notif.message} className="rounded-xl border border-neutral-200 p-3 dark:border-neutral-800">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-neutral-800 dark:text-neutral-100">{notif.message}</span>
                    <span className="text-xs text-neutral-400 dark:text-neutral-500">{notif.time}</span>
                  </div>
                  <span className={classNames("mt-2 inline-block text-xs font-semibold", toneStyles[notif.tone])}>
                    {notif.tone === "critical"
                      ? "Tindakan segera"
                      : notif.tone === "success"
                      ? "Selesai"
                      : "Pengingat"}
                  </span>
                </li>
              ))}
            </ul>
          </article>
        </section>

        <section className="grid gap-4 lg:grid-cols-5">
          <article className="rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm dark:border-neutral-800 dark:bg-neutral-900 lg:col-span-3">
            <h2 className="text-lg font-semibold">Manajemen Pengguna</h2>
            <p className="text-sm text-neutral-500 dark:text-neutral-400">Hak akses terintegrasi dengan login utama</p>
            <div className="mt-4 overflow-hidden rounded-xl border border-neutral-200 dark:border-neutral-800">
              <table className="min-w-full divide-y divide-neutral-200 text-sm dark:divide-neutral-800">
                <thead className="bg-neutral-100 text-left text-xs font-semibold uppercase tracking-wide text-neutral-500 dark:bg-neutral-800/60 dark:text-neutral-300">
                  <tr>
                    <th className="px-4 py-3">Nama</th>
                    <th className="px-4 py-3">Peran</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Shift</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-200 dark:divide-neutral-800">
                  {users.map((user) => (
                    <tr key={user.name} className="bg-white dark:bg-neutral-900">
                      <td className="px-4 py-3 font-medium">{user.name}</td>
                      <td className="px-4 py-3 text-neutral-500 dark:text-neutral-400">{user.role}</td>
                      <td className="px-4 py-3">
                        <span
                          className={classNames(
                            "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold",
                            user.status === "Aktif"
                              ? "bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-300"
                              : "bg-neutral-200 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400"
                          )}
                        >
                          {user.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-neutral-500 dark:text-neutral-400">{user.shift}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </article>

          <article className="rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm dark:border-neutral-800 dark:bg-neutral-900 lg:col-span-2">
            <h2 className="text-lg font-semibold">Stock Opname</h2>
            <p className="text-sm text-neutral-500 dark:text-neutral-400">Rencana opname lintas area gudang</p>
            <ul className="mt-4 space-y-3 text-sm">
              {opnamePlans.map((plan) => (
                <li key={plan.area} className="rounded-xl border border-neutral-200 p-3 dark:border-neutral-800">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-neutral-800 dark:text-neutral-100">{plan.area}</span>
                    <span className="text-xs text-neutral-400 dark:text-neutral-500">{plan.schedule}</span>
                  </div>
                  <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">PJ: {plan.supervisor}</p>
                  <span className="mt-2 inline-block text-xs font-semibold text-neutral-500 dark:text-neutral-400">{plan.status}</span>
                </li>
              ))}
            </ul>
          </article>
        </section>
      </main>
    </div>
  );
}
