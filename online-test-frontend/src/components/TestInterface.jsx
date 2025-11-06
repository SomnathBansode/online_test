import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "../utils/axios";
import { useTranslation } from "react-i18next";
import Loader from "./Loader";
import { XCircle } from "lucide-react";
import { useTestProgress } from "../context/TestProgressContext";

const APP_NAME = "SmartTestApp";
const USER_EMAIL = localStorage.getItem("userEmail") || "user@example.com";

const TestInterface = () => {
  const { t, i18n } = useTranslation();
  const { testId } = useParams();
  const navigate = useNavigate();
  const [test, setTest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [timer, setTimer] = useState(0);
  const [sessionId, setSessionId] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [antiCheat, setAntiCheat] = useState({ warning: false, message: "" });
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const timerRef = useRef();
  const { setTestInProgress } = useTestProgress();

  // Initialize test progress
  useEffect(() => {
    setTestInProgress(true);
    return () => setTestInProgress(false);
  }, [setTestInProgress]);

  // Anti-cheat measures
  useEffect(() => {
    const beforeUnload = (e) => {
      e.preventDefault();
      return (e.returnValue =
        "Are you sure you want to leave? Your test progress will be lost.");
    };
    window.addEventListener("beforeunload", beforeUnload);

    const contextMenu = (e) => e.preventDefault();
    window.addEventListener("contextmenu", contextMenu);

    const onVisibility = () => {
      if (document.hidden) {
        setAntiCheat({
          warning: true,
          message: t("Tab switch detected! This is a violation of test rules."),
        });
      }
    };
    document.addEventListener("visibilitychange", onVisibility);

    const onKeyUp = (e) => {
      if (e.key === "PrintScreen" || (e.ctrlKey && e.key === "p")) {
        setAntiCheat({
          warning: true,
          message: t("Screenshots/printing are not allowed during tests!"),
        });
      }
    };
    window.addEventListener("keyup", onKeyUp);

    const onKeyDown = (e) => {
      if (
        e.key === "F12" ||
        (e.ctrlKey && e.shiftKey && e.key === "I") ||
        (e.ctrlKey && e.shiftKey && e.key === "J") ||
        (e.ctrlKey && e.key === "U")
      ) {
        e.preventDefault();
        setAntiCheat({
          warning: true,
          message: t("Developer tools are disabled during tests!"),
        });
      }
    };
    window.addEventListener("keydown", onKeyDown);

    return () => {
      window.removeEventListener("beforeunload", beforeUnload);
      window.removeEventListener("contextmenu", contextMenu);
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("keyup", onKeyUp);
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [t]);

  // Load or start test session
  useEffect(() => {
    setLoading(true);
    setError(null);
    const localSession = localStorage.getItem(`test-session-${testId}`);
    const savedState = localStorage.getItem(`test-state-${testId}`);
    let retried = false;

    async function loadTestSession() {
      try {
        if (localSession && savedState) {
          const parsedState = JSON.parse(savedState);
          const response = await axios.get(`/tests/${testId}`);

          setTest(response.data);
          setSessionId(localSession);
          setAnswers(
            parsedState.answers ||
              Array(response.data.questions.length).fill({
                answer: -1,
                marked: false,
              })
          );
          setTimer(parsedState.timer || (response.data.duration || 0) * 60);
          setCurrent(parsedState.currentQuestion || 0);

          if (parsedState.language && parsedState.language !== i18n.language) {
            i18n.changeLanguage(parsedState.language);
          }
        } else {
          const response = await axios.post(`/tests/${testId}/start`);

          setTest(response.data.rules);
          setSessionId(response.data.sessionId);
          localStorage.setItem(
            `test-session-${testId}`,
            response.data.sessionId
          );
          setAnswers(
            Array((response.data.rules.questions || []).length).fill({
              answer: -1,
              marked: false,
            })
          );
          setTimer((response.data.rules.duration || 0) * 60);
        }
      } catch (err) {
        if (!retried && localSession) {
          localStorage.removeItem(`test-session-${testId}`);
          localStorage.removeItem(`test-state-${testId}`);
          retried = true;
          await loadTestSession();
        } else {
          setError(
            t("Failed to load test: ") +
              (err.response?.data?.message || err.message)
          );
        }
      } finally {
        setLoading(false);
      }
    }

    loadTestSession();
  }, [testId, t]);

  // Save test state periodically
  useEffect(() => {
    if (!test || !sessionId) return;

    const saveState = () => {
      const state = {
        answers,
        currentQuestion: current,
        timer,
        language: i18n.language,
      };
      localStorage.setItem(`test-state-${testId}`, JSON.stringify(state));
    };

    saveState();

    const interval = setInterval(saveState, 10000);
    return () => clearInterval(interval);
  }, [test, sessionId, answers, current, timer, testId, i18n.language]);

  // Timer logic
  useEffect(() => {
    if (!test || timer <= 0) return;

    timerRef.current = setInterval(() => {
      setTimer((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          setTimeout(() => handleSubmit(true), 100);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timerRef.current);
  }, [test, timer]);

  const handleLanguageChange = (newLanguage) => {
    i18n.changeLanguage(newLanguage);
    const state = {
      answers,
      currentQuestion: current,
      timer,
      language: newLanguage,
    };
    localStorage.setItem(`test-state-${testId}`, JSON.stringify(state));
  };

  const handleSelect = (idx) => {
    const newAnswers = [...answers];
    newAnswers[current] = {
      ...newAnswers[current],
      answer: idx,
      marked: false,
    };
    setAnswers(newAnswers);
  };

  const handleMark = () => {
    const newAnswers = [...answers];
    newAnswers[current] = {
      ...newAnswers[current],
      marked: !newAnswers[current].marked,
    };
    setAnswers(newAnswers);
  };

  const handleSubmit = async (auto = false) => {
    if (submitting) return;
    if (!auto) {
      setShowConfirm(true);
      return;
    }

    setSubmitting(true);
    try {
      const formatted = answers.map((a, questionIndex) => ({
        questionIndex,
        selectedOption: typeof a.answer === "number" ? a.answer : -1,
      }));

      await axios.post(`/tests/${testId}/submit`, {
        answers: formatted,
        sessionId,
      });

      localStorage.removeItem(`test-session-${testId}`);
      localStorage.removeItem(`test-state-${testId}`);
      setTestInProgress(false);
      navigate(`/test/${testId}/result`);
    } catch (err) {
      const msg = err?.response?.data?.message || t("Submission failed");

      if (
        msg.includes("session") ||
        msg.includes("expired") ||
        msg.includes("auth")
      ) {
        localStorage.removeItem(`test-session-${testId}`);
        localStorage.removeItem(`test-state-${testId}`);
        setTestInProgress(false);

        if (auto) {
          navigate(`/test/${testId}/result`);
        } else {
          setTimeout(() => window.location.reload(), 500);
          setError(t("Session expired or invalid. Please login again."));
        }
      } else {
        setError(msg);
      }
    } finally {
      setSubmitting(false);
    }
  };

  const confirmSubmit = () => {
    setShowConfirm(false);
    handleSubmit(true);
  };

  const cancelSubmit = () => setShowConfirm(false);

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#fff9ea] dark:bg-gray-900 p-6">
        <Loader size={48} color="#a1724e" darkColor="#4ade80" />
        <p className="mt-4 text-[#a1724e] dark:text-green-300">
          {t("Preparing your test environment...")}
        </p>
        <div className="w-64 h-2 bg-gray-200 dark:bg-gray-700 rounded-full mt-4 overflow-hidden">
          <div
            className="h-full bg-[#a1724e] dark:bg-green-500 transition-all duration-300"
            style={{ width: `${Math.random() * 30 + 30}%` }}
          />
        </div>
      </div>
    );
  }

  // Error state
  if (error || !test) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#fff9ea] dark:bg-gray-900 p-6 text-center">
        <XCircle className="text-red-500 dark:text-red-400 mb-4" size={48} />
        <h2 className="text-xl font-bold text-red-600 dark:text-red-400 mb-2">
          {error || t("Test not found")}
        </h2>
        <p className="text-gray-700 dark:text-gray-300 mb-6 max-w-md">
          {t(
            "We couldn't load your test. This might be due to network issues or the test may no longer be available."
          )}
        </p>
        <div className="flex gap-4">
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded transition-colors"
          >
            {t("Try Again")}
          </button>
          <button
            onClick={() => navigate("/dashboard")}
            className="px-4 py-2 bg-gray-300 dark:bg-gray-700 text-gray-800 dark:text-gray-100 rounded transition-colors"
          >
            {t("Back to Dashboard")}
          </button>
        </div>
      </div>
    );
  }

  const q = test.questions[current];
  const min = String(Math.floor(timer / 60)).padStart(2, "0");
  const sec = String(timer % 60).padStart(2, "0");
  const progress = Math.round(
    ((test.questions.length - answers.filter((a) => a.answer === -1).length) /
      test.questions.length) *
      100
  );

  const statusColor = (idx) =>
    answers[idx]?.answer !== -1
      ? "bg-green-500"
      : answers[idx]?.marked
      ? "bg-yellow-400"
      : "bg-gray-400";

  return (
    <div className="relative min-h-screen flex flex-col md:flex-row bg-[#fff9ea] dark:bg-gray-900 transition-colors duration-300">
      {/* Watermark overlay */}
      <div className="fixed inset-0 pointer-events-none opacity-10 text-4xl sm:text-6xl font-bold flex justify-center items-center text-[#a1724e] dark:text-green-400 select-none z-0 text-center break-words p-2">
        {APP_NAME} | {USER_EMAIL} | Test ID: {testId}
      </div>

      {/* Sidebar */}
      <button
        className="md:hidden fixed top-4 left-4 z-20 bg-[#a1724e] dark:bg-green-700 text-white p-2 rounded shadow-lg focus:outline-none focus:ring"
        onClick={() => setSidebarOpen((v) => !v)}
        aria-label={sidebarOpen ? t("Close navigation") : t("Open navigation")}
      >
        {sidebarOpen ? "✖" : "☰"}
      </button>

      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-40 z-10 md:hidden"
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}

      <aside
        className={`fixed md:static z-20 top-0 left-0 h-full w-4/5 max-w-xs bg-white dark:bg-gray-800 border-r border-[#a1724e] dark:border-gray-700 p-4 transition-transform duration-300 md:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } md:block overflow-y-auto`}
        aria-label="Question navigation"
      >
        <h2 className="text-lg font-semibold mb-4 text-gray-800 dark:text-gray-100">
          {t("Questions")}
        </h2>
        <div className="flex flex-wrap gap-2 overflow-x-auto p-2 max-h-[50vh] md:max-h-none">
          {test.questions.map((_, idx) => (
            <button
              key={idx}
              className={`w-8 h-8 rounded-full text-xs font-bold text-white focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all duration-200 hover:scale-110 ${statusColor(
                idx
              )} ${current === idx ? "ring-2 ring-blue-400 scale-110" : ""}`}
              onClick={() => {
                setCurrent(idx);
                setSidebarOpen(false);
              }}
              aria-label={t("Go to question {{num}}", { num: idx + 1 })}
            >
              {idx + 1}
            </button>
          ))}
        </div>
        <div className="mt-6 text-xs text-gray-700 dark:text-gray-200 space-y-2">
          <div>
            <span className="inline-block w-3 h-3 rounded-full bg-green-500 mr-2" />
            {t("Answered")}
          </div>
          <div>
            <span className="inline-block w-3 h-3 rounded-full bg-yellow-400 mr-2" />
            {t("Marked")}
          </div>
          <div>
            <span className="inline-block w-3 h-3 rounded-full bg-gray-400 mr-2" />
            {t("Unanswered")}
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 p-2 sm:p-4 md:p-6 flex flex-col items-center z-10 w-full max-w-full">
        {/* Timer and progress */}
        <div className="mb-4 w-full max-w-2xl">
          <div className="flex flex-col sm:flex-row justify-between items-center mb-2 gap-2">
            <span className="text-base sm:text-lg font-semibold text-white bg-[#232556] px-2 sm:px-4 py-1 sm:py-2 rounded transition-colors duration-300">
              {t("Time Left")}: {min}:{sec}
            </span>
            <span className="text-xs sm:text-sm text-gray-700 dark:text-gray-200">
              {t("Progress")}: {progress}%
            </span>
          </div>
          <div className="w-full h-2 sm:h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
            <div
              className="h-2 sm:h-3 bg-green-500 transition-all duration-500"
              style={{ width: `${progress}%` }}
              aria-valuenow={progress}
              aria-valuemin={0}
              aria-valuemax={100}
              role="progressbar"
            />
          </div>
        </div>

        {/* Question card */}
        <section
          className="bg-white dark:bg-gray-800 shadow-xl rounded-2xl p-2 sm:p-4 md:p-8 w-full max-w-2xl mb-8 transition-all duration-300"
          aria-labelledby="question-label"
        >
          <div className="flex flex-col sm:flex-row justify-between mb-2 gap-2">
            <span
              className="text-xs sm:text-sm text-gray-600 dark:text-gray-300"
              id="question-label"
            >
              {t("Question")} {current + 1} / {test.questions.length}
            </span>
            <button
              onClick={handleMark}
              className={`text-xs px-2 sm:px-3 py-1 rounded transition-colors duration-200 font-semibold ${
                answers[current]?.marked
                  ? "bg-yellow-400 text-yellow-900"
                  : "bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-100"
              }`}
              aria-pressed={answers[current]?.marked}
            >
              {answers[current]?.marked ? t("Unmark") : t("Mark for Review")}
            </button>
          </div>

          <h3 className="font-bold text-lg sm:text-2xl md:text-3xl text-[#482307] dark:text-green-200 mb-4 sm:mb-6 leading-snug transition-colors duration-300">
            {q.questionText[i18n.language] || q.questionText.en}
          </h3>

          {/* Language toggle - Centered between question and options */}
          <div className="flex justify-center mb-4">
            <div className="inline-flex items-center bg-[#4f46e5] rounded-full p-1">
              <button
                onClick={() => handleLanguageChange("en")}
                className={`px-3 py-1 text-sm rounded-full transition-colors ${
                  i18n.language === "en"
                    ? "bg-white text-[#4f46e5]"
                    : "text-white hover:bg-white/10"
                }`}
              >
                English
              </button>
              <button
                onClick={() => handleLanguageChange("mr")}
                className={`px-3 py-1 text-sm rounded-full transition-colors ${
                  i18n.language === "mr"
                    ? "bg-white text-[#4f46e5]"
                    : "text-white hover:bg-white/10"
                }`}
              >
                मराठी
              </button>
            </div>
          </div>

          <div className="space-y-2 sm:space-y-3 mb-4">
            {q.options.map((opt, idx) => (
              <label
                key={idx}
                className={`block p-2 sm:p-4 rounded-xl border cursor-pointer transition-all duration-200 text-base sm:text-lg font-medium shadow-sm focus-within:ring-2 focus-within:ring-green-400 ${
                  answers[current]?.answer === idx
                    ? "bg-green-100 border-green-400 dark:bg-green-900"
                    : "border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700"
                } text-gray-800 dark:text-gray-100`}
                tabIndex={0}
                aria-checked={answers[current]?.answer === idx}
                role="radio"
              >
                <input
                  type="radio"
                  name="option"
                  checked={answers[current]?.answer === idx}
                  onChange={() => handleSelect(idx)}
                  className="mr-3 sr-only"
                  tabIndex={-1}
                />
                <span>{opt[i18n.language] || opt.en}</span>
              </label>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 mt-6 sm:mt-8 w-full">
            <button
              onClick={() => setCurrent((c) => Math.max(0, c - 1))}
              disabled={current === 0}
              className="flex-1 px-2 sm:px-4 py-2 bg-gray-300 dark:bg-gray-700 text-gray-800 dark:text-gray-100 rounded disabled:opacity-50 focus:outline-none focus:ring transition-all duration-200"
            >
              {t("Previous")}
            </button>
            <button
              onClick={() =>
                setCurrent((c) => Math.min(test.questions.length - 1, c + 1))
              }
              disabled={current === test.questions.length - 1}
              className="flex-1 px-2 sm:px-4 py-2 bg-gray-300 dark:bg-gray-700 text-gray-800 dark:text-gray-100 rounded disabled:opacity-50 focus:outline-none focus:ring transition-all duration-200"
            >
              {t("Next")}
            </button>
            <button
              onClick={() => handleSubmit(false)}
              disabled={submitting}
              className="flex-1 px-2 sm:px-4 py-2 bg-[#4338ca] hover:bg-[#3730a3] text-white rounded focus:outline-none focus:ring font-bold shadow transition-all duration-200 flex items-center justify-center gap-2"
            >
              {submitting ? (
                <>
                  <Loader size={20} color="#fff" inline />
                  {t("Submitting...")}
                </>
              ) : (
                t("Submit Test")
              )}
            </button>
          </div>
        </section>
      </main>

      {/* Anti-cheat warning */}
      {antiCheat.warning && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-80 text-white text-2xl font-bold transition-all duration-300"
          role="alertdialog"
          aria-modal="true"
        >
          {antiCheat.message}
        </div>
      )}

      {/* Confirmation modal */}
      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 max-w-sm w-full text-center">
            <h2 className="text-lg font-bold mb-4 text-gray-800 dark:text-gray-100">
              {t("Submit Test?")}
            </h2>
            <p className="mb-6 text-gray-700 dark:text-gray-200">
              {t(
                "Are you sure you want to submit your test? You will not be able to change your answers after submission."
              )}
            </p>
            <div className="flex gap-4 justify-center">
              <button
                onClick={confirmSubmit}
                className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded font-bold focus:outline-none focus:ring"
                disabled={submitting}
              >
                {submitting ? (
                  <Loader
                    size={16}
                    color="#fff"
                    inline
                    message={t("Submitting...")}
                  />
                ) : (
                  t("Yes, Submit")
                )}
              </button>
              <button
                onClick={cancelSubmit}
                className="px-4 py-2 bg-gray-300 dark:bg-gray-700 text-gray-800 dark:text-gray-100 rounded font-bold focus:outline-none focus:ring"
              >
                {t("Cancel")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TestInterface;
