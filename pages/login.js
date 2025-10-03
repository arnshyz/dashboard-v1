
import { useState } from "react";
import { motion } from "framer-motion";

export default function Login() {
  const [username, setUsername] = useState("admin");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true); setError("");
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      const js = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(js.error || "Login gagal");
      const nextParam = new URLSearchParams(window.location.search).get("next") || "/";
      const SAFE_NEXT = /^\/(?!.*\.[a-zA-Z0-9]{1,8}$).*/.test(nextParam) ? nextParam : "/";
      window.location.href = SAFE_NEXT;
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-neutral-950 text-white">
      {/* Animated gradient blobs */}
      <motion.div
        aria-hidden
        className="pointer-events-none absolute -top-32 -left-32 h-[36rem] w-[36rem] rounded-full blur-3xl"
        initial={{ opacity: 0.4, scale: 0.9 }}
        animate={{ opacity: 0.7, scale: 1.05, x: [0, 30, -20, 0], y: [0, -10, 20, 0] }}
        transition={{ duration: 16, repeat: Infinity, ease: "easeInOut" }}
        style={{ background: "radial-gradient(closest-side, rgba(120,119,198,0.6), rgba(120,119,198,0) 70%)" }}
      />
      <motion.div
        aria-hidden
        className="pointer-events-none absolute -bottom-40 -right-40 h-[40rem] w-[40rem] rounded-full blur-3xl"
        initial={{ opacity: 0.35, scale: 0.9 }}
        animate={{ opacity: 0.6, scale: 1.08, x: [0, -20, 35, 0], y: [0, 25, -15, 0] }}
        transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
        style={{ background: "radial-gradient(closest-side, rgba(34,197,94,0.5), rgba(34,197,94,0) 70%)" }}
      />

      {/* Subtle animated grid overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.06)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.06)_1px,transparent_1px)] bg-[size:24px_24px] opacity-30" />
      <motion.div
        aria-hidden
        className="absolute inset-0"
        initial={{ backgroundPositionX: 0 }}
        animate={{ backgroundPositionX: ["0px", "48px", "0px"] }}
        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        style={{ backgroundImage: "linear-gradient(to right, rgba(255,255,255,0.05) 1px, transparent 1px)", backgroundSize: "48px 100%", mixBlendMode: "overlay" }}
      />

      {/* Noise layer */}
      <div className="absolute inset-0 bg-noise opacity-20 pointer-events-none" />

      {/* Centered card */}
      <div className="relative z-10 grid min-h-screen place-items-center px-4">
        <motion.form
          onSubmit={submit}
          initial={{ y: 12, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-sm rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-6 shadow-2xl"
        >
          {/* Brand */}
          <div className="mb-4 flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-lg bg-white/10">
              <img src="/akay-logo.svg" alt="AKAY" className="h-6 w-6 object-contain" />
            </div>
            <div>
              <h1 className="text-lg font-semibold tracking-tight">AKAY Sales Dashboard</h1>
              <p className="text-xs text-neutral-300">Masuk untuk melanjutkan</p>
            </div>
          </div>

          <label className="mb-1 block text-sm text-neutral-200">Username</label>
          <input
            className="mb-3 w-full rounded-lg border border-white/10 bg-white/10 px-3 py-2 text-white placeholder:text-neutral-400 outline-none focus:ring-2 focus:ring-white/20"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="admin"
          />

          <label className="mb-1 block text-sm text-neutral-200">Password</label>
          <input
            type="password"
            className="mb-4 w-full rounded-lg border border-white/10 bg-white/10 px-3 py-2 text-white placeholder:text-neutral-400 outline-none focus:ring-2 focus:ring-white/20"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
          />

          {error ? (
            <div className="mb-3 rounded-md bg-red-500/10 px-3 py-2 text-sm text-red-300">
              {error}
            </div>
          ) : null}

          <button
            disabled={loading}
            className="group relative w-full overflow-hidden rounded-lg bg-white px-3 py-2 font-medium text-neutral-900 outline-none transition hover:brightness-95 disabled:opacity-60"
          >
            <span className="relative z-10">
              {loading ? "Memproses..." : "Login"}
            </span>
            {/* animated hover sheen */}
            <span className="pointer-events-none absolute inset-y-0 left-[-200%] w-[200%] bg-gradient-to-r from-transparent via-white/40 to-transparent transition-all duration-700 group-hover:left-[200%]" />
          </button>

          <div className="mt-3 text-center text-xs text-neutral-400">
            Set ENV <code>ADMIN_UI_USER</code>, <code>ADMIN_UI_PASSWORD</code>, <code>SESSION_SECRET</code>
          </div>
        </motion.form>
      </div>
    </div>
  );
}
