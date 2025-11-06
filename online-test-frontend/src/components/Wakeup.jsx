import React, { useEffect, useState, useRef } from "react";
// visual animation removed from framer-motion to avoid unused import in some setups

// Wakeup acts as a gate: while backend is sleeping show UI, when ready render children

const Wakeup = ({ children }) => {
  const [status, setStatus] = useState("waking"); // 'waking' | 'ready' | 'error'
  const [message, setMessage] = useState(
    "Waking server, this may take a few seconds..."
  );
  const attemptsRef = useRef(0);
  const intervalRef = useRef(null);
  const MAX_ATTEMPTS = 8;

  const base = import.meta.env.VITE_API_URL || "";
  // Only check the canonical /api/health endpoint. Try absolute host (VITE_API_URL) first if provided,
  // then the relative `/api/health` path. Avoid fallback `/health` which doesn't exist on the server.
  const baseNoSlash = base.replace(/\/$/, "");
  const endpoints = baseNoSlash
    ? [`${baseNoSlash}/api/health`, "/api/health"]
    : ["/api/health"];

  useEffect(() => {
    let mounted = true;

    // helper to check endpoint and validate JSON response so dev server HTML doesn't count as success
    const checkEndpoint = async (endpoint) => {
      try {
        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), 15000);
        const res = await fetch(endpoint, { signal: controller.signal });
        clearTimeout(timer);

        if (!res || !res.ok) return false;

        const ct = res.headers.get("content-type") || "";
        // require JSON response from health check to consider it valid (prevents Vite index.html 200)
        if (!ct.includes("application/json")) return false;

        const data = await res.json();
        // server.js returns { status: 'OK', ... }
        return (
          data &&
          (data.status === "OK" || data.status === "ok" || data.status === true)
        );
      } catch {
        return false;
      }
    };

    const tryWake = async () => {
      // increment attempts ref so interval closure can read latest
      attemptsRef.current += 1;
      setMessage("Contacting server...");

      for (const endpoint of endpoints) {
        const ok = await checkEndpoint(endpoint);
        if (!mounted) return;
        if (ok) {
          setStatus("ready");
          setMessage("Server is awake — redirecting...");
          // stop retry loop
          if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
          }
          return;
        }
      }

      if (!mounted) return;
      setStatus("waking");
      setMessage("Server is sleeping or not reachable yet. Retrying...");
    };

    // first try immediately
    tryWake();

    // then try every 6 seconds up to MAX_ATTEMPTS
    intervalRef.current = setInterval(() => {
      if (attemptsRef.current >= MAX_ATTEMPTS) {
        if (intervalRef.current) clearInterval(intervalRef.current);
        intervalRef.current = null;
        setStatus("error");
        setMessage("Still sleeping — please click Retry or try again later.");
        return;
      }
      tryWake();
    }, 6000);

    return () => {
      mounted = false;
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleRetry = () => {
    setStatus("waking");
    setMessage("Retrying...");
    attemptsRef.current = 0;
    // use same sequential attempts logic for manual retry
    (async () => {
      for (const endpoint of endpoints) {
        try {
          const controller = new AbortController();
          const timer = setTimeout(() => controller.abort(), 15000);
          const res = await fetch(endpoint, { signal: controller.signal });
          clearTimeout(timer);

          if (!res || !res.ok) continue;
          const ct = res.headers.get("content-type") || "";
          if (!ct.includes("application/json")) continue;
          const data = await res.json();
          if (
            data &&
            (data.status === "OK" ||
              data.status === "ok" ||
              data.status === true)
          ) {
            setStatus("ready");
            setMessage("Server is awake — redirecting...");
            return;
          }
        } catch {
          // try next
        }
      }
      setStatus("error");
      setMessage("Retry failed — still not reachable.");
    })();
  };

  if (status === "ready") {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 to-white dark:from-gray-900 dark:to-gray-800 p-6">
      <div className="max-w-2xl w-full bg-white dark:bg-gray-900/60 border border-indigo-100 dark:border-gray-700 rounded-2xl shadow-xl p-8 text-center">
        <div className="flex items-center justify-center mb-4">
          <svg
            className="w-14 h-14 text-indigo-600"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <defs></defs>
            <path
              d="M12 2v6"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M20 12a8 8 0 1 1-16 0 8 8 0 0 1 16 0z"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>

        <h2 className="text-2xl font-extrabold text-indigo-700 dark:text-indigo-300 mb-2">
          Bringing the server online
        </h2>
        <p className="text-sm text-gray-600 dark:text-gray-300 mb-6">
          We run on a free tier and sometimes our backend sleeps. We're waking
          it up now — this may take up to 30 seconds.
        </p>

        <div className="mb-6">
          <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-indigo-50 dark:bg-gray-800/60">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-indigo-500 animate-bounce delay-75" />
              <div className="w-3 h-3 rounded-full bg-indigo-400 animate-bounce delay-150" />
              <div className="w-3 h-3 rounded-full bg-indigo-300 animate-bounce delay-200" />
            </div>
            <div className="text-sm text-indigo-700 dark:text-indigo-200">
              {message}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-center gap-3">
          <button
            onClick={handleRetry}
            className="py-2 px-4 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 font-medium shadow"
          >
            Retry
          </button>

          <a
            href="/auth/login"
            className="py-2 px-4 rounded-lg border border-indigo-200 dark:border-gray-700 text-indigo-600 dark:text-indigo-300"
          >
            Go to Login
          </a>
        </div>

        <div className="mt-6 text-xs text-gray-400">
          If the wake-up doesn't work, the backend base URL may be missing or
          incorrect. Set <code>VITE_API_URL</code> in your `.env` to your
          backend host (example: <em>https://your-backend.onrender.com</em>).
        </div>
      </div>
    </div>
  );
};

export default Wakeup;
