import { useEffect, useMemo, useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';

const defaultGeneral = {
  pageTitle: 'AKAY Sales Dashboard',
  description: 'Pantau performa penjualan AKAY Digital Nusantara secara real-time.',
};

export default function AdminPage({ initialSettings, initialEnvUser }) {
  const [general, setGeneral] = useState({
    pageTitle: initialSettings?.pageTitle || defaultGeneral.pageTitle,
    description: initialSettings?.description || defaultGeneral.description,
  });
  const [users, setUsers] = useState(initialSettings?.users || []);
  const [envUser, setEnvUser] = useState(initialEnvUser);
  const [status, setStatus] = useState(null);
  const [savingGeneral, setSavingGeneral] = useState(false);
  const [newUser, setNewUser] = useState({ username: '', password: '' });
  const [addingUser, setAddingUser] = useState(false);

  useEffect(() => {
    let ignore = false;
    const loadSettings = async () => {
      try {
        const res = await fetch('/api/admin/settings');
        const data = await res.json().catch(() => ({}));
        if (!ignore && res.ok) {
          setGeneral({
            pageTitle: data.pageTitle || defaultGeneral.pageTitle,
            description: data.description || defaultGeneral.description,
          });
          setUsers(data.users || []);
          setEnvUser(data.envUser || initialEnvUser);
        }
      } catch (error) {
        if (process.env.NODE_ENV !== 'production') {
          console.warn('Gagal memuat pengaturan admin', error);
        }
      }
    };
    loadSettings();
    return () => {
      ignore = true;
    };
  }, [initialEnvUser]);

  useEffect(() => {
    if (!status) return undefined;
    const timer = setTimeout(() => setStatus(null), 4000);
    return () => clearTimeout(timer);
  }, [status]);

  const usersWithFormattedDate = useMemo(
    () =>
      (users || []).map((user) => {
        if (!user?.createdAt) return { ...user, createdLabel: '-' };
        try {
          const label = new Intl.DateTimeFormat('id-ID', {
            dateStyle: 'medium',
            timeStyle: 'short',
          }).format(new Date(user.createdAt));
          return { ...user, createdLabel: label };
        } catch (error) {
          return { ...user, createdLabel: user.createdAt };
        }
      }),
    [users]
  );

  const showStatus = (type, message) => {
    setStatus({ type, message });
  };

  const saveGeneral = async (event) => {
    event.preventDefault();
    setSavingGeneral(true);
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(general),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.error || 'Gagal menyimpan pengaturan');
      }
      setUsers(data.users || []);
      setEnvUser(data.envUser || initialEnvUser);
      showStatus('success', 'Pengaturan berhasil diperbarui');
    } catch (error) {
      showStatus('error', error.message);
    } finally {
      setSavingGeneral(false);
    }
  };

  const addNewUser = async (event) => {
    event.preventDefault();
    if (!newUser.username || !newUser.password) {
      showStatus('error', 'Lengkapi username dan password');
      return;
    }
    setAddingUser(true);
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newUser),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.error || 'Gagal menambahkan user');
      }
      setUsers(data.users || []);
      setEnvUser(data.envUser || initialEnvUser);
      setNewUser({ username: '', password: '' });
      showStatus('success', 'User baru berhasil ditambahkan');
    } catch (error) {
      showStatus('error', error.message);
    } finally {
      setAddingUser(false);
    }
  };

  return (
    <>
      <Head>
        <title>Pengaturan Admin • {general.pageTitle || 'Dashboard'}</title>
      </Head>
      <div className="min-h-screen bg-neutral-100 text-neutral-900 dark:bg-neutral-950 dark:text-neutral-100">
        <header className="border-b border-neutral-200 bg-white/90 backdrop-blur dark:border-neutral-800 dark:bg-neutral-900/80">
          <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4">
            <div className="flex items-center gap-3">
              <img src="/akay-logo.svg" alt="AKAY" className="h-10 w-10 rounded" />
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-neutral-500 dark:text-neutral-400">Admin</p>
                <h1 className="text-xl font-semibold">Pengaturan Website</h1>
              </div>
            </div>
            <nav className="flex items-center gap-2 text-sm">
              <Link
                href="/"
                className="rounded-full border border-neutral-300 bg-white px-3 py-1.5 font-medium text-neutral-700 hover:bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100"
              >
                Dashboard
              </Link>
              <Link
                href="/warehouse"
                className="rounded-full border border-neutral-300 bg-white px-3 py-1.5 font-medium text-neutral-700 hover:bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100"
              >
                Gudang
              </Link>
            </nav>
          </div>
        </header>

        <main className="mx-auto max-w-5xl px-4 py-10 space-y-10">
          {status ? (
            <div
              className={`rounded-xl border px-4 py-3 text-sm ${
                status.type === 'success'
                  ? 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-800/50 dark:bg-emerald-900/30 dark:text-emerald-300'
                  : 'border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-800/60 dark:bg-rose-900/30 dark:text-rose-200'
              }`}
              role="status"
            >
              {status.message}
            </div>
          ) : null}

          <section className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
            <div className="mb-6 flex items-start justify-between gap-4">
              <div>
                <h2 className="text-lg font-semibold">Informasi Website</h2>
                <p className="text-sm text-neutral-500 dark:text-neutral-400">
                  Ubah nama website (page title) dan deskripsi utama yang tampil di dashboard.
                </p>
              </div>
            </div>
            <form className="space-y-4" onSubmit={saveGeneral}>
              <div className="space-y-2">
                <label htmlFor="pageTitle" className="block text-sm font-medium text-neutral-700 dark:text-neutral-200">
                  Nama Website (Page Title)
                </label>
                <input
                  id="pageTitle"
                  name="pageTitle"
                  type="text"
                  value={general.pageTitle}
                  onChange={(event) => setGeneral((prev) => ({ ...prev, pageTitle: event.target.value }))}
                  className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-neutral-700 dark:bg-neutral-800"
                  maxLength={150}
                  required
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="description" className="block text-sm font-medium text-neutral-700 dark:text-neutral-200">
                  Deskripsi
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={general.description}
                  onChange={(event) => setGeneral((prev) => ({ ...prev, description: event.target.value }))}
                  className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-neutral-700 dark:bg-neutral-800"
                  rows={3}
                  maxLength={500}
                  required
                />
                <p className="text-xs text-neutral-500 dark:text-neutral-400">
                  Deskripsi ini ditampilkan sebagai subtitle pada dashboard utama dan meta description halaman.
                </p>
              </div>
              <div className="flex items-center justify-end gap-3">
                <button
                  type="submit"
                  className="inline-flex items-center gap-2 rounded-full bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:ring-offset-1"
                  disabled={savingGeneral}
                >
                  {savingGeneral ? 'Menyimpan…' : 'Simpan Pengaturan'}
                </button>
              </div>
            </form>
          </section>

          <section className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
            <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-lg font-semibold">Manajemen User</h2>
                <p className="text-sm text-neutral-500 dark:text-neutral-400">
                  Tambahkan user baru untuk mengakses dashboard. Password tersimpan aman menggunakan enkripsi scrypt.
                </p>
              </div>
            </div>
            <div className="overflow-hidden rounded-xl border border-neutral-200 dark:border-neutral-800">
              <table className="min-w-full divide-y divide-neutral-200 text-sm dark:divide-neutral-800">
                <thead className="bg-neutral-50 dark:bg-neutral-800/40">
                  <tr>
                    <th className="px-4 py-3 text-left font-medium text-neutral-600 dark:text-neutral-200">Username</th>
                    <th className="px-4 py-3 text-left font-medium text-neutral-600 dark:text-neutral-200">Ditambahkan</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-200 bg-white dark:divide-neutral-800 dark:bg-neutral-900/60">
                  {usersWithFormattedDate.length ? (
                    usersWithFormattedDate.map((user) => (
                      <tr key={user.username}>
                        <td className="px-4 py-3 font-medium text-neutral-800 dark:text-neutral-100">{user.username}</td>
                        <td className="px-4 py-3 text-neutral-500 dark:text-neutral-400">{user.createdLabel}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td className="px-4 py-3 text-neutral-500 dark:text-neutral-400" colSpan={2}>
                        Belum ada user tambahan.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <form className="mt-6 grid gap-4 rounded-xl border border-dashed border-neutral-300 bg-neutral-50 p-4 dark:border-neutral-700 dark:bg-neutral-900/40 sm:grid-cols-2" onSubmit={addNewUser}>
              <div className="space-y-2">
                <label htmlFor="new-username" className="block text-sm font-medium text-neutral-700 dark:text-neutral-200">
                  Username baru
                </label>
                <input
                  id="new-username"
                  name="username"
                  type="text"
                  value={newUser.username}
                  onChange={(event) => setNewUser((prev) => ({ ...prev, username: event.target.value }))}
                  className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-neutral-700 dark:bg-neutral-800"
                  placeholder="mis. finance"
                  required
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="new-password" className="block text-sm font-medium text-neutral-700 dark:text-neutral-200">
                  Password
                </label>
                <input
                  id="new-password"
                  name="password"
                  type="password"
                  value={newUser.password}
                  onChange={(event) => setNewUser((prev) => ({ ...prev, password: event.target.value }))}
                  className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-neutral-700 dark:bg-neutral-800"
                  placeholder="Minimal 6 karakter"
                  minLength={6}
                  required
                />
              </div>
              <div className="sm:col-span-2 flex items-center justify-end">
                <button
                  type="submit"
                  className="inline-flex items-center gap-2 rounded-full bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:ring-offset-1"
                  disabled={addingUser}
                >
                  {addingUser ? 'Menambahkan…' : 'Tambah User'}
                </button>
              </div>
            </form>

            <div className="mt-4 rounded-lg bg-neutral-100 px-4 py-3 text-xs text-neutral-600 dark:bg-neutral-900/60 dark:text-neutral-400">
              <p>
                User bawaan dari environment: <strong>{envUser?.username || 'admin'}</strong>
                {envUser?.hasPassword ? ' (aktif)' : ' (password belum diset)'}.
              </p>
              <p className="mt-1">
                Untuk keamanan, gunakan user tambahan dengan password kuat dan bagikan hanya kepada tim yang membutuhkan akses.
              </p>
            </div>
          </section>
        </main>
      </div>
    </>
  );
}

export async function getServerSideProps({ req }) {
  const { requireAuth } = await import('../lib/auth');
  const session = requireAuth(req);
  if (!session) {
    return {
      redirect: {
        destination: '/login?next=/admin',
        permanent: false,
      },
    };
  }

  const { getSecureSettings, getEnvUser } = await import('../lib/settings');
  const settings = await getSecureSettings();
  const envUser = getEnvUser();

  return {
    props: {
      initialSettings: settings,
      initialEnvUser: envUser,
    },
  };
}
