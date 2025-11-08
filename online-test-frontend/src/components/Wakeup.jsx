import React, { useEffect, useState, useRef } from "react";
import { motion } from "framer-motion";
import { FaCloudSun, FaRedoAlt } from "react-icons/fa";

const Wakeup = ({ children }) => {
  const [status, setStatus] = useState("waking");
  const [message, setMessage] = useState(
    "Waking up the backend — please hang tight!"
  );
  const attemptsRef = useRef(0);
  const [attemptsCount, setAttemptsCount] = useState(0);
  const intervalRef = useRef(null);
  const MAX_ATTEMPTS = 12;

  const base = import.meta.env.VITE_API_URL || "";
  const baseNoSlash = base.replace(/\/$/, "");
  const endpoints = baseNoSlash
    ? [`${baseNoSlash}/api/health`, "/api/health"]
    : ["/api/health"];

  const checkEndpoint = async (endpoint) => {
    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 15000);
      const res = await fetch(endpoint, { signal: controller.signal });
      clearTimeout(timer);

      if (!res || !res.ok) return false;

      const ct = res.headers.get("content-type") || "";
      if (!ct.includes("application/json")) return false;

      const data = await res.json();
      return (
        data &&
        (data.status === "OK" || data.status === "ok" || data.status === true)
      );
    } catch {
      return false;
    }
  };

  const tryWake = async (mounted = true) => {
    attemptsRef.current += 1;
    setAttemptsCount(attemptsRef.current);
    setMessage("Contacting the server...");

    for (const endpoint of endpoints) {
      const ok = await checkEndpoint(endpoint);
      if (!mounted) return;
      if (ok) {
        setStatus("ready");
        setMessage("Server is awake and ready!");
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
        return;
      }
    }

    if (!mounted) return;
    if (attemptsRef.current >= MAX_ATTEMPTS) {
      if (intervalRef.current) clearInterval(intervalRef.current);
      intervalRef.current = null;
      setStatus("error");
      setMessage(
        "Hmm... the server seems to be in a deep sleep. Try again in a bit!"
      );
    } else {
      setStatus("waking");
      setMessage("Still waking up... trying again soon.");
    }
  };

  useEffect(() => {
    let mounted = true;
    tryWake(mounted);

    intervalRef.current = setInterval(() => {
      tryWake(mounted);
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
    setAttemptsCount(0);

    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = null;

    tryWake(true);
    intervalRef.current = setInterval(() => {
      tryWake(true);
    }, 6000);
  };

  if (status === "ready") {
    return <>{children}</>;
  }

  const percent = Math.min(
    100,
    Math.round((attemptsCount / MAX_ATTEMPTS) * 100)
  );

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-purple-50 to-blue-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="max-w-md w-full bg-white/80 dark:bg-gray-900/60 backdrop-blur-sm border border-purple-100 dark:border-gray-700 rounded-3xl shadow-xl p-8 text-center"
      >
        <div className="flex justify-center mb-4">
          <motion.div
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ repeat: Infinity, duration: 3 }}
          >
            <FaCloudSun className="text-5xl text-purple-600 dark:text-purple-400" />
          </motion.div>
        </div>

        <h2 className="text-2xl font-bold text-purple-700 dark:text-purple-300 mb-2">
          Just a moment ☕
        </h2>
        <p className="text-gray-600 dark:text-gray-300 mb-6 text-sm">
          Our backend is hosted on free servers that take a quick nap when idle.
          We’re waking it up for you — thanks for your patience!
        </p>

        <div className="mb-6">
          <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-white dark:bg-gray-800/60 shadow-sm">
            <div className="w-3 h-3 rounded-full bg-purple-500 animate-pulse" />
            <div className="text-sm text-gray-900 dark:text-white font-semibold">
              {message}
            </div>
          </div>
        </div>

        <div className="mb-6 px-4">
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 overflow-hidden">
            <motion.div
              className="h-3 bg-gradient-to-r from-purple-600 to-indigo-600 dark:from-purple-500 dark:to-indigo-500"
              style={{ width: `${percent}%` }}
              initial={{ width: 0 }}
              animate={{ width: `${percent}%` }}
              transition={{ duration: 0.6 }}
            />
          </div>
          <div className="mt-2 text-xs text-gray-500 dark:text-gray-400 flex items-center justify-between">
            <div>
              Requests sent:{" "}
              <span className="font-semibold text-gray-700 dark:text-gray-200">
                {attemptsCount}
              </span>
            </div>
            <div>{percent}% awake</div>
          </div>
        </div>

        <div className="flex items-center justify-center gap-3">
          <button
            onClick={handleRetry}
            className="py-2 px-5 rounded-lg bg-purple-600 text-white hover:bg-purple-700 active:scale-95 transition-transform font-medium shadow"
          >
            <FaRedoAlt className="inline-block mr-2" />
            Retry
          </button>

          <a
            href="/auth/login"
            className="py-2 px-5 rounded-lg border border-purple-200 dark:border-gray-700 text-purple-700 dark:text-purple-300 hover:bg-purple-50 dark:hover:bg-gray-800 transition font-medium flex items-center gap-2"
          >
            Go to Login
          </a>
        </div>
      </motion.div>
    </div>
  );
};

export default Wakeup;
