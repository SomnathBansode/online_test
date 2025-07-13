import React, { useEffect, useState } from "react";
import axios from "../utils/axios";
import { useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom"; // Add this import
const PAGE_SIZE = 5;
const ACCENT_COLORS = [
  "border-l-4 border-green-500 dark:border-green-400",
  "border-l-4 border-blue-500 dark:border-blue-400",
  "border-l-4 border-yellow-500 dark:border-yellow-400",
  "border-l-4 border-purple-500 dark:border-purple-400",
  "border-l-4 border-pink-500 dark:border-pink-400",
  "border-l-4 border-orange-500 dark:border-orange-400",
];

const formatDateTime = (dateString) => {
  if (!dateString) return "-";
  const date = new Date(dateString);
  return date.toLocaleString("en-IN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
};

const ResultModal = ({ open, onClose, result, t, i18n }) => {
  if (!open || !result) return null;
  let testTitle = "-";
  if (result.testId && typeof result.testId === "object") {
    if (result.testId.title && typeof result.testId.title === "object") {
      testTitle =
        result.testId.title[i18n.language] ||
        result.testId.title.en ||
        result.testId.title.mr ||
        "-";
    } else if (typeof result.testId.title === "string") {
      testTitle = result.testId.title;
    }
  }
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-xl p-8 w-full max-w-md border border-[#a1724e] dark:border-green-900 relative">
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-2xl text-[#a1724e] dark:text-green-200"
        >
          &times;
        </button>
        <h3 className="text-xl font-bold mb-4 text-[#482307] dark:text-green-300 text-center">
          {t("Result Details")}
        </h3>
        <div className="mb-2">
          <span className="font-semibold">{t("Test")}:</span>{" "}
          <span>{testTitle}</span>
        </div>
        <div className="mb-2">
          <span className="font-semibold">{t("Score")}:</span>{" "}
          <span>{result.score}</span>
        </div>
        <div className="mb-2">
          <span className="font-semibold">{t("Status")}:</span>{" "}
          <span>{t(result.status) || "-"}</span>
        </div>
        <div className="mb-2">
          <span className="font-semibold">{t("Date")}:</span>{" "}
          <span>{formatDateTime(result.createdAt)}</span>
        </div>
      </div>
    </div>
  );
};

const UserResults = () => {
    const navigate = useNavigate(); 
  const { t, i18n } = useTranslation();
  const token = useSelector((state) => state.auth.token);
  const user = useSelector((state) => state.auth.user);
  const [data, setData] = useState({
    results: [],
    total: 0,
    totalPages: 1,
    currentPage: 1,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [modalResult, setModalResult] = useState(null);

  useEffect(() => {
    const fetchResults = async () => {
      setLoading(true);
      setError("");
      try {
        const res = await axios.get("/results", {
          headers: { Authorization: `Bearer ${token}` },
          params: {
            userId: user?.id,
            page,
            limit: PAGE_SIZE,
          },
        });
        setData(res.data);
      } catch (err) {
        console.error("Error fetching results:", err);
        setError(t("Failed to load results. Please try again."));
      } finally {
        setLoading(false);
      }
    };
    fetchResults();
  }, [token, user, page, t]);

  const filteredResults = data.results.filter((r) => {
    let testTitle = "-";
    if (r.testId && typeof r.testId === "object") {
      if (r.testId.title && typeof r.testId.title === "object") {
        testTitle = r.testId.title[i18n.language] || r.testId.title.en || "-";
      } else if (typeof r.testId.title === "string") {
        testTitle = r.testId.title;
      }
    }
    return testTitle.toLowerCase().includes(search.toLowerCase());
  });

  return (
    <div className="min-h-screen w-full bg-[#fff9ea] dark:bg-gray-900 flex flex-col items-center justify-start py-10 px-2">
      <div className="bg-white dark:bg-[#181b20] rounded-xl shadow-lg dark:shadow-green-950/30 p-6 mb-6 w-full max-w-3xl mx-auto border border-[#e2c9a0] dark:border-[#23272e] transition-colors">
        <ResultModal
          open={!!modalResult}
          onClose={() => setModalResult(null)}
          result={modalResult}
          t={t}
          i18n={i18n}
        />
        <h2 className="text-2xl font-bold mb-6 text-[#482307] dark:text-green-300 text-center tracking-tight">
          {t("Your Results")}
        </h2>

        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4 gap-2">
          <input
            type="text"
            className="w-full md:w-1/3 px-3 py-2 rounded border border-[#a1724e] dark:border-green-800 bg-[#fff9ea] dark:bg-[#23272e] text-[#482307] dark:text-green-200 focus:outline-none focus:ring-2 focus:ring-green-400 dark:focus:ring-green-700 placeholder:text-[#a1724e] dark:placeholder:text-green-700"
            placeholder={t("Search by test name...")}
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
          />
        </div>

        {loading ? (
          <div className="text-center text-[#a1724e] dark:text-green-200 text-lg py-8">
            {t("Loading...")}
          </div>
        ) : error ? (
          <div className="text-center text-red-600 dark:text-red-400 text-lg py-8">
            {error}
          </div>
        ) : filteredResults.length === 0 ? (
          <div className="text-center text-gray-500 dark:text-gray-400 text-lg py-8">
            {t("No results found.")}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm md:text-base border-collapse">
              <thead>
                <tr className="bg-[#fff9ea] dark:bg-[#23272e] dark:border-b dark:border-[#23272e]">
                  <th className="py-3 px-4 text-left font-semibold text-[#a1724e] dark:text-green-200">
                    {t("Test")}
                  </th>
                  <th className="py-3 px-4 text-left font-semibold text-[#a1724e] dark:text-green-200">
                    {t("Score")}
                  </th>
                  <th className="py-3 px-4 text-left font-semibold text-[#a1724e] dark:text-green-200">
                    {t("Status")}
                  </th>
                  <th className="py-3 px-4 text-left font-semibold text-[#a1724e] dark:text-green-200">
                    {t("Date & Time")}
                  </th>
                  <th className="py-3 px-4 text-left font-semibold text-[#a1724e] dark:text-green-200">
                    {t("Action")}
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredResults.map((r, idx) => {
                  let testTitle = "-";
                  if (r.testId && typeof r.testId === "object") {
                    if (r.testId.title && typeof r.testId.title === "object") {
                      testTitle =
                        r.testId.title[i18n.language] ||
                        r.testId.title.en ||
                        r.testId.title.mr ||
                        "-";
                    } else if (typeof r.testId.title === "string") {
                      testTitle = r.testId.title;
                    }
                  }
                  return (
                    <tr
                      key={r._id || idx}
                      className={[
                        idx % 2 === 0
                          ? "bg-[#fff9ea] dark:bg-[#23272e]"
                          : "bg-white dark:bg-[#23272e]/60",
                        "transition-colors hover:bg-[#f5e6c8] dark:hover:bg-green-950/40",
                        ACCENT_COLORS[idx % ACCENT_COLORS.length],
                      ].join(" ")}
                    >
                      <td
                        className="py-2 px-4 text-[#482307] dark:text-green-100 max-w-xs truncate"
                        title={testTitle}
                      >
                        {testTitle}
                      </td>
                      <td className="py-2 px-4 text-[#a1724e] dark:text-green-200">
                        {r.score}
                      </td>
                      <td className="py-2 px-4 text-[#a1724e] dark:text-green-200">
                        {t(r.status) || "-"}
                      </td>
                      <td className="py-2 px-4 text-[#a1724e] dark:text-green-200">
                        {formatDateTime(r.createdAt)}
                      </td>
                      <td className="py-2 px-4">
                      <button
  className="bg-green-600 hover:bg-green-700 dark:bg-green-800 dark:hover:bg-green-700 text-white font-semibold py-1 px-4 rounded shadow transition-colors text-xs md:text-sm"
  onClick={() => navigate(`/results/${r._id}`)}
>
  {t("View")}
</button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {data.total > PAGE_SIZE && (
          <div className="flex justify-center items-center gap-2 mt-6">
            <button
              className="px-3 py-1 rounded bg-[#a1724e] dark:bg-green-900 text-white font-bold disabled:opacity-50 hover:bg-[#482307] dark:hover:bg-green-700 transition-colors"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
            >
              {t("Prev")}
            </button>
            <span className="text-[#482307] dark:text-green-200 font-semibold">
              {t("Page")} {page} {t("of")} {data.totalPages}
            </span>
            <button
              className="px-3 py-1 rounded bg-[#a1724e] dark:bg-green-900 text-white font-bold disabled:opacity-50 hover:bg-[#482307] dark:hover:bg-green-700 transition-colors"
              onClick={() => setPage((p) => Math.min(data.totalPages, p + 1))}
              disabled={page === data.totalPages}
            >
              {t("Next")}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserResults;
