import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";

const now = () => new Date();

const initialWarehouseData = {
  quickStats: [],
  stockAlerts: [],
  inboundOutbound: [],
  locationMap: [],
  notifications: [],
  users: [],
  reports: [],
  opnamePlans: [],
};

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
  const [warehouseData, setWarehouseData] = useState(initialWarehouseData);
  const [loadingData, setLoadingData] = useState(true);
  const [fetchError, setFetchError] = useState("");
  const [theme, setTheme] = useState("light");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [clock, setClock] = useState(() => now());

  useEffect(() => {
    let active = true;

    async function loadWarehouse() {
      try {
        setLoadingData(true);
        const response = await fetch("/api/warehouse");
        if (!response.ok) {
          throw new Error(`Gagal memuat data gudang (status ${response.status})`);
        }
        const payload = await response.json();
        if (!active) return;
        setWarehouseData({
          quickStats: payload.quickStats || [],
          stockAlerts: payload.stockAlerts || [],
          inboundOutbound: payload.inboundOutbound || [],
          locationMap: payload.locationMap || [],
          notifications: payload.notifications || [],
          users: payload.users || [],
          reports: payload.reports || [],
          opnamePlans: payload.opnamePlans || [],
        });
        setFetchError("");
      } catch (error) {
        if (!active) return;
        console.error(error);
        setFetchError(error.message || "Gagal memuat data gudang");
        setWarehouseData({ ...initialWarehouseData });
      } finally {
        if (active) {
          setLoadingData(false);
        }
      }
    }

    loadWarehouse();

    return () => {
      active = false;
    };
  }, []);

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

  const { quickStats, stockAlerts, inboundOutbound, locationMap, notifications, users, reports, opnamePlans } =
    warehouseData;

  const numberFormatter = useMemo(() => new Intl.NumberFormat("id-ID"), []);

  const formatMovementQty = (movement) => {
    if (!movement) return "—";
    const qty = movement.qty;
    if (qty === null || qty === undefined || Number.isNaN(qty)) {
      return "—";
    }
    const absolute = Math.abs(qty);
    const formatted = numberFormatter.format(absolute);
    if (absolute === 0) return "0";
    const preferredSign = movement.type?.toLowerCase() === "outbound" ? "−" : "+";
    const sign = qty < 0 ? "−" : qty > 0 ? "+" : preferredSign;
    return `${sign}${formatted}`;
  };

  const quickStatsSkeleton = useMemo(
    () => Array.from({ length: Math.max(quickStats.length || 0, 4) }),
    [quickStats.length]
  );

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
        {fetchError && (
          <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-600 dark:border-rose-500/40 dark:bg-rose-500/10 dark:text-rose-300">
            Terjadi kesalahan saat memuat data gudang: {fetchError}
          </div>
        )}

        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
          {(quickStats.length ? quickStats : loadingData ? quickStatsSkeleton.map(() => null) : []).map(
            (item, index) => (
              <article
                key={item ? item.title || index : index}
                className="rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm dark:border-neutral-800 dark:bg-neutral-900"
              >
                <h2 className="text-sm font-semibold text-neutral-500 dark:text-neutral-400">
                  {item ? (
                    item.title
                  ) : (
                    <span className="inline-flex h-3 w-28 animate-pulse rounded bg-neutral-200 dark:bg-neutral-800" />
                  )}
                </h2>
                <p className="mt-3 text-2xl font-semibold text-neutral-900 dark:text-neutral-50">
                  {item ? (
                    item.value
                  ) : (
                    <span className="inline-flex h-6 w-24 animate-pulse rounded bg-neutral-200 dark:bg-neutral-800" />
                  )}
                </p>
                {item ? (
                  <span className={classNames("mt-2 block text-xs font-medium", toneStyles[item.tone] || toneStyles.neutral)}>
                    {item.trend}
                  </span>
                ) : (
                  <span className="mt-2 inline-flex h-3 w-24 animate-pulse rounded bg-neutral-200 dark:bg-neutral-800" />
                )}
              </article>
            )
          )}
          {!loadingData && quickStats.length === 0 && (
            <div className="col-span-full rounded-2xl border border-dashed border-neutral-200 bg-white p-4 text-sm text-neutral-500 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-400">
              Data ringkasan gudang belum tersedia di Google Sheet.
            </div>
          )}
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
              {stockAlerts.length || loadingData ? (
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
                    {(stockAlerts.length ? stockAlerts : Array.from({ length: loadingData ? 4 : 0 })).map((item, index) => (
                      <tr key={item ? item.sku || item.name || index : index} className="bg-white dark:bg-neutral-900">
                        <td className="px-4 py-3 font-mono text-xs text-neutral-500 dark:text-neutral-400">
                          {item ? item.sku || "—" : <span className="inline-flex h-3 w-16 animate-pulse rounded bg-neutral-200 dark:bg-neutral-800" />}
                        </td>
                        <td className="px-4 py-3 font-medium">
                          {item ? item.name || "—" : <span className="inline-flex h-4 w-28 animate-pulse rounded bg-neutral-200 dark:bg-neutral-800" />}
                        </td>
                        <td className="px-4 py-3">
                          {item ? (
                            item.stock === null || item.stock === undefined
                              ? "—"
                              : numberFormatter.format(item.stock)
                          ) : (
                            <span className="inline-flex h-4 w-16 animate-pulse rounded bg-neutral-200 dark:bg-neutral-800" />
                          )}
                        </td>
                        <td className="px-4 py-3">
                          {item ? (
                            <span
                              className={classNames(
                                "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium",
                                item.priority === "high" && "bg-rose-50 text-rose-600 dark:bg-rose-500/10 dark:text-rose-300",
                                item.priority === "medium" && "bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-300",
                                item.priority === "low" && "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-300",
                                !["high", "medium", "low"].includes(item.priority) && "bg-neutral-200 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-300"
                              )}
                            >
                              {item.status || "—"}
                            </span>
                          ) : (
                            <span className="inline-flex h-5 w-24 animate-pulse rounded-full bg-neutral-200 dark:bg-neutral-800" />
                          )}
                        </td>
                        <td className="px-4 py-3 text-neutral-500 dark:text-neutral-400">
                          {item ? item.location || "—" : <span className="inline-flex h-3 w-24 animate-pulse rounded bg-neutral-200 dark:bg-neutral-800" />}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className="p-4 text-sm text-neutral-500 dark:text-neutral-400">Tidak ada data barang yang dapat ditampilkan.</div>
              )}
            </div>
          </article>

          <article className="rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm dark:border-neutral-800 dark:bg-neutral-900 lg:col-span-2">
            <h2 className="text-lg font-semibold">Manajemen Stok</h2>
            <p className="text-sm text-neutral-500 dark:text-neutral-400">Prioritas otomatis berdasarkan level stok & pergerakan</p>
            {stockAlerts.length ? (
              <ul className="mt-4 space-y-3 text-sm">
                {stockAlerts.map((item) => (
                  <li key={item.sku || item.name} className="rounded-xl border border-neutral-200 p-3 dark:border-neutral-800">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-neutral-800 dark:text-neutral-100">{item.name || "—"}</span>
                      <span className="text-xs font-medium text-neutral-500 dark:text-neutral-400">{item.location || "—"}</span>
                    </div>
                    <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">{item.status || "Tidak ada status"}</p>
                    <span
                      className={classNames(
                        "mt-2 inline-block text-xs font-semibold",
                        toneStyles[
                          item.priority === "high"
                            ? "critical"
                            : item.priority === "medium"
                            ? "warning"
                            : item.priority === "low"
                            ? "positive"
                            : "neutral"
                        ]
                      )}
                    >
                      {item.priority === "high"
                        ? "Butuh restock segera"
                        : item.priority === "medium"
                        ? "Periksa rotasi"
                        : item.priority === "low"
                        ? "Aman"
                        : "Perlu verifikasi"}
                    </span>
                  </li>
                ))}
              </ul>
            ) : loadingData ? (
              <ul className="mt-4 space-y-3 text-sm">
                {Array.from({ length: 3 }).map((_, idx) => (
                  <li key={idx} className="rounded-xl border border-neutral-200 p-3 dark:border-neutral-800">
                    <div className="flex items-center justify-between">
                      <span className="inline-flex h-4 w-28 animate-pulse rounded bg-neutral-200 dark:bg-neutral-800" />
                      <span className="inline-flex h-3 w-16 animate-pulse rounded bg-neutral-200 dark:bg-neutral-800" />
                    </div>
                    <span className="mt-3 inline-flex h-3 w-40 animate-pulse rounded bg-neutral-200 dark:bg-neutral-800" />
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-4 text-sm text-neutral-500 dark:text-neutral-400">Tidak ada alert stok aktif.</p>
            )}
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
            {inboundOutbound.length ? (
              <ul className="mt-4 space-y-3">
                {inboundOutbound.map((item) => {
                  const normalizedType = (item.type || (item.qty < 0 ? "Outbound" : "Inbound")).trim();
                  const typeKey = normalizedType.toLowerCase();
                  const isOutbound = typeKey === "outbound" || (item.qty ?? 0) < 0;
                  return (
                    <li
                      key={item.reference || `${normalizedType}-${item.time}`}
                      className="flex items-start gap-3 rounded-xl border border-neutral-200 p-3 dark:border-neutral-800"
                    >
                      <span
                        className={classNames(
                          "mt-0.5 inline-flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold",
                          isOutbound ? "bg-sky-500/10 text-sky-500" : "bg-emerald-500/10 text-emerald-500"
                        )}
                      >
                        {isOutbound ? "−" : "+"}
                      </span>
                      <div className="flex-1">
                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm font-medium text-neutral-800 dark:text-neutral-100">
                          <span>{item.reference || "Tanpa referensi"}</span>
                          {item.time && (
                            <span className="text-xs text-neutral-400 dark:text-neutral-500">{item.time}</span>
                          )}
                          {item.by && (
                            <span className="text-xs text-neutral-400 dark:text-neutral-500">oleh {item.by}</span>
                          )}
                        </div>
                        {item.notes && (
                          <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">{item.notes}</p>
                        )}
                      </div>
                      <span className="text-sm font-semibold text-neutral-700 dark:text-neutral-200">{formatMovementQty({ ...item, type: normalizedType })}</span>
                    </li>
                  );
                })}
              </ul>
            ) : loadingData ? (
              <ul className="mt-4 space-y-3">
                {Array.from({ length: 4 }).map((_, idx) => (
                  <li key={idx} className="flex items-start gap-3 rounded-xl border border-neutral-200 p-3 dark:border-neutral-800">
                    <span className="mt-0.5 inline-flex h-8 w-8 items-center justify-center rounded-full bg-neutral-200 text-neutral-500 dark:bg-neutral-800 dark:text-neutral-400">
                      <span className="sr-only">Loading</span>
                    </span>
                    <div className="flex-1 space-y-2">
                      <span className="inline-flex h-4 w-32 animate-pulse rounded bg-neutral-200 dark:bg-neutral-800" />
                      <span className="block h-3 w-40 animate-pulse rounded bg-neutral-200 dark:bg-neutral-800" />
                    </div>
                    <span className="inline-flex h-4 w-12 animate-pulse rounded bg-neutral-200 dark:bg-neutral-800" />
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-4 text-sm text-neutral-500 dark:text-neutral-400">Belum ada aktivitas barang masuk/keluar.</p>
            )}
          </article>

          <article className="rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm dark:border-neutral-800 dark:bg-neutral-900 lg:col-span-2">
            <h2 className="text-lg font-semibold">Laporan</h2>
            <p className="text-sm text-neutral-500 dark:text-neutral-400">Jadwalkan otomatis & sinkron ke ekosistem AKAY</p>
            {reports.length ? (
              <ul className="mt-4 space-y-3 text-sm">
                {reports.map((report) => (
                  <li key={report.title || report.period} className="rounded-xl border border-neutral-200 p-3 dark:border-neutral-800">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-neutral-800 dark:text-neutral-100">{report.title || "Tanpa judul"}</span>
                      <span className="text-xs text-neutral-400 dark:text-neutral-500">{report.period || "Periode tidak tersedia"}</span>
                    </div>
                    <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">Status: {report.status || "-"}</p>
                  </li>
                ))}
              </ul>
            ) : loadingData ? (
              <ul className="mt-4 space-y-3 text-sm">
                {Array.from({ length: 3 }).map((_, idx) => (
                  <li key={idx} className="rounded-xl border border-neutral-200 p-3 dark:border-neutral-800">
                    <span className="inline-flex h-4 w-32 animate-pulse rounded bg-neutral-200 dark:bg-neutral-800" />
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-4 text-sm text-neutral-500 dark:text-neutral-400">Belum ada jadwal laporan.</p>
            )}
          </article>
        </section>

        <section className="grid gap-4 lg:grid-cols-5">
          <article className="rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm dark:border-neutral-800 dark:bg-neutral-900 lg:col-span-3">
            <h2 className="text-lg font-semibold">Pelacakan Lokasi Persediaan</h2>
            <p className="text-sm text-neutral-500 dark:text-neutral-400">Status kapasitas setiap area gudang</p>
            {locationMap.length ? (
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                {locationMap.map((location) => {
                  const filled =
                    location.filled === null || location.filled === undefined
                      ? null
                      : Number.isNaN(location.filled)
                      ? null
                      : location.filled;
                  const capacity =
                    location.capacity === null || location.capacity === undefined
                      ? null
                      : Number.isNaN(location.capacity)
                      ? null
                      : location.capacity;
                  const percent =
                    filled !== null && capacity && capacity > 0
                      ? Math.min(Math.round((filled / capacity) * 100), 100)
                      : 0;
                  const percentLabel = filled !== null && capacity ? `${percent}%` : "—";
                  return (
                    <div key={location.zone || location.racks} className="rounded-xl border border-neutral-200 p-4 dark:border-neutral-800">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-sm font-semibold text-neutral-800 dark:text-neutral-100">{location.zone || "Area"}</h3>
                          <p className="text-xs text-neutral-500 dark:text-neutral-400">{location.racks || "Lokasi tidak tersedia"}</p>
                        </div>
                        <span className="text-sm font-semibold text-neutral-700 dark:text-neutral-200">{percentLabel}</span>
                      </div>
                      <div className="mt-3 h-2 rounded-full bg-neutral-200 dark:bg-neutral-800">
                        <div
                          className="h-full rounded-full bg-emerald-500 dark:bg-emerald-400"
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                      <p className="mt-2 text-xs text-neutral-500 dark:text-neutral-400">
                        {filled !== null ? numberFormatter.format(filled) : "?"} dari {capacity !== null ? numberFormatter.format(capacity) : "?"} rak terisi
                      </p>
                    </div>
                  );
                })}
              </div>
            ) : loadingData ? (
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                {Array.from({ length: 4 }).map((_, idx) => (
                  <div key={idx} className="rounded-xl border border-neutral-200 p-4 dark:border-neutral-800">
                    <span className="inline-flex h-4 w-32 animate-pulse rounded bg-neutral-200 dark:bg-neutral-800" />
                  </div>
                ))}
              </div>
            ) : (
              <p className="mt-4 text-sm text-neutral-500 dark:text-neutral-400">Belum ada data lokasi persediaan.</p>
            )}
          </article>

          <article className="rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm dark:border-neutral-800 dark:bg-neutral-900 lg:col-span-2">
            <h2 className="text-lg font-semibold">Fitur Notifikasi</h2>
            <p className="text-sm text-neutral-500 dark:text-neutral-400">Sinkron dengan alert dashboard penjualan</p>
            {notifications.length ? (
              <ul className="mt-4 space-y-3 text-sm">
                {notifications.map((notif) => (
                  <li key={notif.message || notif.time} className="rounded-xl border border-neutral-200 p-3 dark:border-neutral-800">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-neutral-800 dark:text-neutral-100">{notif.message || "Notifikasi"}</span>
                      <span className="text-xs text-neutral-400 dark:text-neutral-500">{notif.time || "Baru"}</span>
                    </div>
                    <span className={classNames("mt-2 inline-block text-xs font-semibold", toneStyles[notif.tone] || toneStyles.info)}>
                      {notif.tone === "critical"
                        ? "Tindakan segera"
                        : notif.tone === "success"
                        ? "Selesai"
                        : notif.tone === "info"
                        ? "Pengingat"
                        : "Perlu perhatian"}
                    </span>
                  </li>
                ))}
              </ul>
            ) : loadingData ? (
              <ul className="mt-4 space-y-3 text-sm">
                {Array.from({ length: 3 }).map((_, idx) => (
                  <li key={idx} className="rounded-xl border border-neutral-200 p-3 dark:border-neutral-800">
                    <span className="inline-flex h-4 w-40 animate-pulse rounded bg-neutral-200 dark:bg-neutral-800" />
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-4 text-sm text-neutral-500 dark:text-neutral-400">Belum ada notifikasi gudang.</p>
            )}
          </article>
        </section>

        <section className="grid gap-4 lg:grid-cols-5">
          <article className="rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm dark:border-neutral-800 dark:bg-neutral-900 lg:col-span-3">
            <h2 className="text-lg font-semibold">Manajemen Pengguna</h2>
            <p className="text-sm text-neutral-500 dark:text-neutral-400">Hak akses terintegrasi dengan login utama</p>
            <div className="mt-4 overflow-hidden rounded-xl border border-neutral-200 dark:border-neutral-800">
              {users.length || loadingData ? (
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
                    {(users.length ? users : Array.from({ length: loadingData ? 4 : 0 })).map((user, index) => (
                      <tr key={user ? user.name || index : index} className="bg-white dark:bg-neutral-900">
                        <td className="px-4 py-3 font-medium">
                          {user ? user.name || "—" : <span className="inline-flex h-4 w-32 animate-pulse rounded bg-neutral-200 dark:bg-neutral-800" />}
                        </td>
                        <td className="px-4 py-3 text-neutral-500 dark:text-neutral-400">
                          {user ? user.role || "—" : <span className="inline-flex h-4 w-28 animate-pulse rounded bg-neutral-200 dark:bg-neutral-800" />}
                        </td>
                        <td className="px-4 py-3">
                          {user ? (
                            <span
                              className={classNames(
                                "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold",
                                user.status && user.status.toLowerCase() === "aktif"
                                  ? "bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-300"
                                  : "bg-neutral-200 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400"
                              )}
                            >
                              {user.status || "-"}
                            </span>
                          ) : (
                            <span className="inline-flex h-5 w-20 animate-pulse rounded-full bg-neutral-200 dark:bg-neutral-800" />
                          )}
                        </td>
                        <td className="px-4 py-3 text-neutral-500 dark:text-neutral-400">
                          {user ? user.shift || "—" : <span className="inline-flex h-4 w-20 animate-pulse rounded bg-neutral-200 dark:bg-neutral-800" />}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className="p-4 text-sm text-neutral-500 dark:text-neutral-400">Belum ada data pengguna gudang.</div>
              )}
            </div>
          </article>

          <article className="rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm dark:border-neutral-800 dark:bg-neutral-900 lg:col-span-2">
            <h2 className="text-lg font-semibold">Stock Opname</h2>
            <p className="text-sm text-neutral-500 dark:text-neutral-400">Rencana opname lintas area gudang</p>
            {opnamePlans.length ? (
              <ul className="mt-4 space-y-3 text-sm">
                {opnamePlans.map((plan) => (
                  <li key={plan.area || plan.schedule} className="rounded-xl border border-neutral-200 p-3 dark:border-neutral-800">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-neutral-800 dark:text-neutral-100">{plan.area || "Area"}</span>
                      <span className="text-xs text-neutral-400 dark:text-neutral-500">{plan.schedule || "Jadwal TBD"}</span>
                    </div>
                    <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">PJ: {plan.supervisor || "-"}</p>
                    <span className="mt-2 inline-block text-xs font-semibold text-neutral-500 dark:text-neutral-400">{plan.status || "-"}</span>
                  </li>
                ))}
              </ul>
            ) : loadingData ? (
              <ul className="mt-4 space-y-3 text-sm">
                {Array.from({ length: 3 }).map((_, idx) => (
                  <li key={idx} className="rounded-xl border border-neutral-200 p-3 dark:border-neutral-800">
                    <span className="inline-flex h-4 w-32 animate-pulse rounded bg-neutral-200 dark:bg-neutral-800" />
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-4 text-sm text-neutral-500 dark:text-neutral-400">Belum ada jadwal stock opname.</p>
            )}
          </article>
        </section>
      </main>
    </div>
  );
}
