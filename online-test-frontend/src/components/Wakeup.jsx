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
  const MAX_ATTEMPTS = 20; // Increased max attempts
  const TIMEOUT_DURATION = 20000; // 20 seconds timeout
  const CHECK_INTERVAL = 8000; // 8 seconds between checks

  // Get the base URL from environment or default to local
  const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5000";
  const healthEndpoint = `${apiUrl}/api/health`;

  const checkEndpoint = async (mounted) => {
    if (!mounted) return false;

    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), TIMEOUT_DURATION);

      const res = await fetch(healthEndpoint, {
        signal: controller.signal,
        method: "GET",
        mode: "cors",
        credentials: "include",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          "Cache-Control": "no-cache",
          "X-Requested-With": "XMLHttpRequest",
        },
      });
      clearTimeout(timer);

      if (!res || !res.ok) {
        throw new Error(`Server returned ${res?.status || "no response"}`);
      }

      const data = await res.json();
      return data && data.status === "OK" && data.dbStatus === "connected";
    } catch (error) {
      console.warn("Health check failed:", error.message);
      return false;
    }
  };

  const tryWake = async (mounted = true) => {
    if (!mounted) return;

    attemptsRef.current += 1;
    setAttemptsCount(attemptsRef.current);

    // Update message based on attempt count
    const attemptPhrase =
      attemptsRef.current > 1
        ? `Attempt ${attemptsRef.current}/${MAX_ATTEMPTS}...`
        : "Contacting the server...";
    setMessage(attemptPhrase);

    const isAwake = await checkEndpoint(mounted);

    if (!mounted) return;

    if (isAwake) {
      setStatus("ready");
      setMessage("Server is awake and ready!");
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    if (attemptsRef.current >= MAX_ATTEMPTS) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      setStatus("error");
      setMessage(
        "The server is not responding. Please try again or contact support if the issue persists."
      );
    } else {
      setStatus("waking");
      setMessage("Still trying to connect... please wait.");
    }
  };

  useEffect(() => {
    let mounted = true;

    // Initial check
    tryWake(mounted);

    // Set up interval for subsequent checks
    intervalRef.current = setInterval(() => {
      if (mounted && status !== "ready") {
        tryWake(mounted);
      }
    }, CHECK_INTERVAL);

    return () => {
      mounted = false;
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [status]);

  const handleRetry = () => {
    // Reset state
    setStatus("waking");
    setMessage("Retrying connection...");
    attemptsRef.current = 0;
    setAttemptsCount(0);

    // Clear existing interval
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    // Start fresh attempt
    tryWake(true);
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
