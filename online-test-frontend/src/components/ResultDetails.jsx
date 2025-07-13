import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "../utils/axios";
import { useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { Pie } from "react-chartjs-2";
import { Chart, ArcElement, Tooltip, Legend } from "chart.js";
Chart.register(ArcElement, Tooltip, Legend);
import Loader from "../components/Loader";

const ResultDetails = () => {
  const { t, i18n } = useTranslation();
  const { resultId } = useParams();
  const token = useSelector((state) => state.auth.token);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const isDarkMode = document.documentElement.classList.contains("dark");

    setChartOptions((prev) => ({
      ...prev,
      plugins: {
        ...prev.plugins,
        legend: {
          ...prev.plugins.legend,
          labels: {
            ...prev.plugins.legend.labels,
            color: isDarkMode ? "#fff" : "#222",
          },
        },
        tooltip: {
          ...prev.plugins.tooltip,
          backgroundColor: isDarkMode
            ? "rgba(255,255,255,0.9)"
            : "rgba(0,0,0,0.8)",
          titleColor: isDarkMode ? "#000" : "#fff",
          bodyColor: isDarkMode ? "#000" : "#fff",
          borderColor: isDarkMode ? "#000" : "#fff",
        },
      },
    }));
  }, [result]);

  const legendSpacingPlugin = {
    id: "increase-legend-spacing",
    beforeInit(chart) {
      const originalFit = chart.legend.fit;
      chart.legend.fit = function () {
        originalFit.bind(chart.legend)();
        this.height += 20;
      };
    },
  };

  useEffect(() => {
    const fetchResult = async () => {
      setLoading(true);
      setError("");
      try {
        const res = await axios.get(`/results/${resultId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setResult(res.data?.result || res.data);
      } catch (err) {
        setError(t("Failed to load result"));
      } finally {
        setLoading(false);
      }
    };
    fetchResult();
  }, [resultId, token, t]);

  const getTestTitle = () => {
    if (!result?.testId) return "-";
    const { testId } = result;

    if (typeof testId === "object" && !Array.isArray(testId)) {
      if (typeof testId.title === "object") {
        return (
          testId.title?.[i18n.language] ||
          testId.title?.en ||
          testId.title?.mr ||
          "-"
        );
      } else if (typeof testId.title === "string") {
        return testId.title;
      } else {
        return testId?.[i18n.language] || testId?.en || testId?.mr || "-";
      }
    } else if (typeof testId === "string") {
      return testId;
    }
    return "-";
  };

  // Pie chart logic
  let correct = 0,
    incorrect = 0,
    unanswered = 0;
  if (result && result.questions && result.answers) {
    result.questions.forEach((q, idx) => {
      const ans = result.answers.find((a) => a.questionIndex === idx);
      if (!ans || ans.selectedOption === -1 || ans.selectedOption === undefined)
        unanswered++;
      else if (ans.isCorrect) correct++;
      else incorrect++;
    });
  } else if (result) {
    correct = result.correctAnswers || 0;
    incorrect = result.incorrectAnswers || 0;
    unanswered = result.unanswered || 0;
  }

  const chartData = {
    labels: [t("Correct"), t("Incorrect"), t("Unanswered")],
    datasets: [
      {
        data: [correct, incorrect, unanswered],
        backgroundColor: ["#22c55e", "#ef4444", "#fbbf24"],
        borderColor: ["#1e7e34", "#b91c1c", "#d97706"],
        borderWidth: 2,
      },
    ],
  };

  const [chartOptions, setChartOptions] = useState({
    plugins: {
      legend: {
        position: "right",
        labels: {
          color: "#222", // Default light mode color
          font: {
            size: 14,
            family: "'Inter', sans-serif",
          },
          padding: 20,
          usePointStyle: true,
          pointStyle: "circle",
        },
      },
      tooltip: {
        enabled: true,
        position: "nearest",
        backgroundColor: "rgba(0,0,0,0.8)",
        titleColor: "#fff",
        bodyColor: "#fff",
        borderColor: "#fff",
        borderWidth: 1,
        padding: 12,
        displayColors: true,
        usePointStyle: true,
        callbacks: {
          label: function (context) {
            const label = context.label || "";
            const value = context.raw || 0;
            const total = context.dataset.data.reduce((a, b) => a + b, 0);
            const percentage = Math.round((value / total) * 100);
            return `${label}: ${value} (${percentage}%)`;
          },
        },
      },
    },
    maintainAspectRatio: false,
    responsive: true,
  });

  // 12-hour time format helper
  const formatDateTime = (dateStr) => {
    if (!dateStr) return "-";
    const date = new Date(dateStr);
    return date.toLocaleString("en-IN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader size={32} color="#22c55e" message={t("Loading results...")} />
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 40 }}
      transition={{ duration: 0.4 }}
      className="min-h-screen flex items-center justify-center bg-gradient-to-br from-yellow-50 to-yellow-100 dark:from-gray-800 dark:to-gray-900 p-6"
    >
      <div className="relative w-full max-w-xl bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8">
        <button
          onClick={() => navigate(-1)}
          className="absolute -top-5 left-4 flex items-center gap-2 bg-blue-600 dark:bg-purple-600 text-white px-4 py-2 rounded-full shadow hover:bg-blue-700 dark:hover:bg-purple-700 transition-colors text-sm font-medium z-10"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
          {t("Back")}
        </button>
        <h2 className="text-3xl font-bold text-center text-gray-800 dark:text-purple-300 mb-8">
          {t("Test Result")}
        </h2>

        {error ? (
          <div className="text-center text-red-600 dark:text-red-400 text-lg py-8">
            {error}
          </div>
        ) : (
          result && (
            <div className="space-y-6">
              <DetailRow
                label={t("Test")}
                value={getTestTitle()}
                color="text-blue-700 dark:text-blue-300"
              />
              <DetailRow
                label={t("Score")}
                value={
                  result.score !== undefined && result.score !== null
                    ? result.score
                    : "-"
                }
                color="text-green-700 dark:text-green-300"
              />
              <DetailRow
                label={t("Status")}
                value={result.status ? t(result.status) : "-"}
                color="text-yellow-700 dark:text-yellow-300"
              />
              <DetailRow
                label={t("Date")}
                value={formatDateTime(result.createdAt)}
                color="text-gray-700 dark:text-gray-300"
              />

              <div className="flex flex-col items-center mt-8">
                {correct + incorrect + unanswered > 0 &&
                  correct >= 0 &&
                  incorrect >= 0 &&
                  unanswered >= 0 && (
                    <div className="w-48 h-48 mx-auto mb-4">
                      <Pie
                        data={chartData}
                        options={chartOptions}
                        plugins={[legendSpacingPlugin]}
                      />
                    </div>
                  )}
                <div className="flex gap-4 justify-center mt-2">
                  <div className="flex items-center gap-1">
                    <span className="inline-block w-3 h-3 rounded-full bg-green-500" />{" "}
                    <span className="text-green-700 dark:text-green-300 text-xs">
                      {t("Correct")}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="inline-block w-3 h-3 rounded-full bg-red-500" />{" "}
                    <span className="text-red-500 text-xs">{t("Incorrect")}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="inline-block w-3 h-3 rounded-full bg-yellow-400" />{" "}
                    <span className="text-yellow-600 text-xs">
                      {t("Unanswered")}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )
        )}
      </div>
    </motion.div>
  );
};

const DetailRow = ({ label, value, color }) => (
  <div className="flex justify-between items-center border-b border-gray-200 dark:border-gray-700 pb-2">
    <span className={`font-semibold ${color}`}>{label}:</span>
    <span className="text-gray-800 dark:text-gray-100">
      {value && value !== "undefined" ? value : "-"}
    </span>
  </div>
);

export default ResultDetails;