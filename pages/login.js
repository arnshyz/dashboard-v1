
import Head from "next/head";
import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";

export default function Login() {
  const TYPEWRITER_TEXT = "AKAY DIGITAL NUSANTARA";
  const [username, setUsername] = useState("admin");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const vantaRef = useRef(null);
  const [typedText, setTypedText] = useState("");

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

  useEffect(() => {
    if (typeof window === "undefined") return undefined;

    let effect = null;
    let isCancelled = false;

    const ensureScript = (src, check) => {
      if (check()) return Promise.resolve();

      return new Promise((resolve, reject) => {
        const existing = document.querySelector(`script[src="${src}"]`);
        if (existing) {
          if (existing.dataset.loaded === "true" || check()) {
            resolve();
            return;
          }
          existing.addEventListener("load", resolve, { once: true });
          existing.addEventListener("error", reject, { once: true });
          return;
        }

        const script = document.createElement("script");
        script.src = src;
        script.async = true;
        script.onload = () => {
          script.dataset.loaded = "true";
          resolve();
        };
        script.onerror = reject;
        document.body.appendChild(script);
      });
    };

    async function initVanta() {
      if (!vantaRef.current || isCancelled) return;

      try {
        await ensureScript("https://cdn.jsdelivr.net/npm/three@0.157.0/build/three.min.js", () => !!window.THREE);
        await ensureScript("https://cdn.jsdelivr.net/npm/vanta@0.5.24/dist/vanta.halo.min.js", () => !!window.VANTA?.HALO);
      } catch (err) {
        console.error("Failed to load Vanta scripts", err);
        return;
      }

      if (isCancelled || effect || !window.VANTA?.HALO) return;

      effect = window.VANTA.HALO({
        el: vantaRef.current,
        mouseControls: true,
        touchControls: true,
        gyroControls: false,
        baseColor: 0x4338ca,
        backgroundColor: 0x050315,
        amplitudeFactor: 1.2,
        size: 1.1,
        shininess: 80,
      });
    }

    initVanta();

    return () => {
      isCancelled = true;
      if (effect) {
        effect.destroy();
        effect = null;
      }
    };
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") {
      return undefined;
    }

    const fullText = TYPEWRITER_TEXT;
    let currentLength = 0;
    let isDeleting = false;
    let timeoutId = null;

    const tick = () => {
      if (!isDeleting) {
        currentLength += 1;
        setTypedText(fullText.slice(0, currentLength));

        if (currentLength === fullText.length) {
          isDeleting = true;
          timeoutId = window.setTimeout(tick, 1400);
          return;
        }
      } else {
        currentLength = Math.max(0, currentLength - 1);
        setTypedText(fullText.slice(0, currentLength));

        if (currentLength === 0) {
          isDeleting = false;
          timeoutId = window.setTimeout(tick, 500);
          return;
        }
      }

      const delay = isDeleting ? 60 : 120;
      timeoutId = window.setTimeout(tick, delay);
    };

    timeoutId = window.setTimeout(tick, 400);

    return () => {
      if (timeoutId) {
        window.clearTimeout(timeoutId);
      }
    };
  }, [TYPEWRITER_TEXT]);

  return (
    <>
      <Head>
        <title>Login | AKAY Sales Dashboard</title>
        <meta
          name="description"
          content="Masuk ke AKAY Sales Dashboard untuk mengelola dan memantau kinerja penjualan Anda."
        />
      </Head>
      <div className="relative min-h-screen overflow-hidden bg-[#050315] text-white">
      <div ref={vantaRef} className="pointer-events-none absolute inset-0" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(244,114,182,0.25),transparent_55%),radial-gradient(circle_at_80%_30%,rgba(59,130,246,0.18),transparent_45%),radial-gradient(circle_at_50%_80%,rgba(129,140,248,0.2),transparent_50%)] mix-blend-screen" />
      <div className="pointer-events-none absolute inset-0 bg-noise opacity-20" />

      {/* Login layout */}
      <div className="relative z-10 flex min-h-screen flex-col items-center justify-center gap-16 px-4 py-16 text-center md:flex-row md:items-center md:justify-between md:px-12 md:text-left">
        <div className="max-w-xl space-y-4">
          <p className="text-sm uppercase tracking-[0.4em] text-white/60">Welcome</p>
          <div className="flex items-center justify-center gap-2 md:justify-start">
            <h2 className="text-4xl font-semibold leading-tight text-white sm:text-5xl lg:text-6xl">
              {typedText}
            </h2>
            <span className="mt-2 h-7 w-[3px] animate-pulse rounded-full bg-white/80 sm:h-9" aria-hidden />
          </div>
          <p className="text-base text-white/70 sm:text-lg">
            Transforming data into decisive actions for your business growth.
          </p>
        </div>
        <motion.form
          onSubmit={submit}
          initial={{ y: 12, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-sm rounded-2xl border border-white/10 bg-white/5 p-6 shadow-2xl backdrop-blur-xl"
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
            placeholder="username"
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
            Develop by <span className="font-medium text-neutral-200">@mungwongsepele</span> @2025
          </div>
        </motion.form>
      </div>
    </>
  );
}
