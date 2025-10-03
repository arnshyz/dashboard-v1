
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
      {/* Animated line accents */}
      <motion.div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage:
            "repeating-linear-gradient(110deg, rgba(56,189,248,0.22) 0px, rgba(56,189,248,0.22) 2px, transparent 2px, transparent 140px)",
          maskImage: "linear-gradient(to bottom, transparent 5%, black 20%, black 80%, transparent 95%)",
          WebkitMaskImage: "linear-gradient(to bottom, transparent 5%, black 20%, black 80%, transparent 95%)",
        }}
        initial={{ opacity: 0.15, backgroundPosition: "0% 0%" }}
        animate={{ opacity: 0.3, backgroundPosition: ["0% 0%", "200% 100%"] }}
        transition={{ duration: 24, repeat: Infinity, ease: "linear" }}
      />
      <motion.div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage:
            "repeating-linear-gradient(250deg, rgba(167,139,250,0.18) 0px, rgba(167,139,250,0.18) 2px, transparent 2px, transparent 120px)",
          maskImage: "linear-gradient(to right, transparent 10%, black 30%, black 70%, transparent 90%)",
          WebkitMaskImage: "linear-gradient(to right, transparent 10%, black 30%, black 70%, transparent 90%)",
        }}
        initial={{ opacity: 0.1, backgroundPosition: "0% 100%" }}
        animate={{ opacity: 0.22, backgroundPosition: ["0% 100%", "-180% -40%"] }}
        transition={{ duration: 28, repeat: Infinity, ease: "linear" }}
      />

      {/* Pulsing partial horizontal lines */}
      <motion.div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage:
            "linear-gradient(to bottom, transparent 0%, transparent 40%, rgba(255,255,255,0.12) 45%, transparent 50%, transparent 100%)",
          backgroundSize: "100% 120px",
        }}
        initial={{ opacity: 0.05, backgroundPositionY: 0 }}
        animate={{ opacity: [0.05, 0.18, 0.05], backgroundPositionY: [0, 60, 120, 0] }}
        transition={{ duration: 16, repeat: Infinity, ease: "easeInOut" }}
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
