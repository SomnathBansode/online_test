import React, { useEffect, useState } from 'react';
import axios from '../../utils/axios';
import { useTranslation } from 'react-i18next';

const Analytics = () => {
  const { t } = useTranslation();
  const [tests, setTests] = useState([]);
  const [selectedTest, setSelectedTest] = useState('');
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTests = async () => {
      try {
        const res = await axios.get('/tests');
        setTests(res.data);
      } catch (err) {
        setError('Failed to load tests');
      }
    };
    fetchTests();
  }, []);

  const fetchAnalytics = async (testId) => {
    setLoading(true);
    setError(null);
    setAnalytics(null);
    try {
      const res = await axios.get(`/analytics/tests/${testId}`);
      setAnalytics(res.data);
    } catch (err) {
      setError('Failed to load analytics');
    } finally {
      setLoading(false);
    }
  };

  const handleTestChange = (e) => {
    setSelectedTest(e.target.value);
    if (e.target.value) fetchAnalytics(e.target.value);
    else setAnalytics(null);
  };

  // ✅ CSV Export (fixed)
  const exportCSV = () => {
    if (!analytics || !Array.isArray(analytics)) return;

    const flattenObject = (obj, prefix = '') => {
      let result = {};
      for (const key in obj) {
        if (Object.hasOwn(obj, key)) {
          const value = obj[key];
          const newKey = prefix ? `${prefix}.${key}` : key;

          if (value && typeof value === 'object' && !Array.isArray(value)) {
            // Recursively flatten nested objects
            Object.assign(result, flattenObject(value, newKey));
          } else if (Array.isArray(value)) {
            // Serialize arrays as JSON string
            result[newKey] = JSON.stringify(value);
          } else {
            result[newKey] = value;
          }
        }
      }
      return result;
    };

    const flattenedData = analytics.map(item => flattenObject(item));
    const header = Object.keys(flattenedData[0] || {});
    const rows = flattenedData.map(row =>
      header.map(field => {
        let cell = row[field] ?? '';
        if (typeof cell === 'string') {
          // Escape quotes in CSV
          cell = cell.replace(/"/g, '""');
          return `"${cell}"`;
        }
        return cell;
      }).join(',')
    );

    const csv = [header.join(','), ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'test-analytics.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  // DETAILED CSV Export: Each answer as a row with all context
  const exportDetailedCSV = () => {
    if (!analytics || !Array.isArray(analytics)) return;
    const rows = [];
    analytics.forEach(result => {
      const base = {
        id: result._id,
        user: result.userId?.name || result.userId?.email || result.userId?._id || result.userId,
        test: result.testId?.title?.en || result.testId?.title || result.testId?._id || result.testId,
        score: result.score,
        correctAnswers: result.correctAnswers,
        incorrectAnswers: result.incorrectAnswers,
        unanswered: result.unanswered,
        attemptNumber: result.attemptNumber,
        submittedAt: result.submittedAt,
        createdAt: result.createdAt,
        updatedAt: result.updatedAt,
      };
      if (Array.isArray(result.answers) && result.answers.length > 0) {
        result.answers.forEach(ans => {
          rows.push({
            ...base,
            questionIndex: ans.questionIndex,
            selectedOption: ans.selectedOption,
            correctAnswer: ans.correctAnswer,
            isCorrect: ans.isCorrect,
          });
        });
      } else {
        rows.push(base);
      }
    });
    const header = Object.keys(rows[0] || {});
    const csvRows = rows.map(row =>
      header.map(field => {
        let cell = row[field] ?? '';
        if (typeof cell === 'string') {
          cell = cell.replace(/"/g, '""');
          return `"${cell}"`;
        }
        return cell;
      }).join(',')
    );
    const csv = [header.join(','), ...csvRows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'test-analytics-detailed.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-[#fff9ea] dark:bg-gray-900 p-6 text-[#a1724e] dark:text-green-300">
      <h1 className="text-3xl font-bold mb-6 text-[#482307] dark:text-green-400 text-center">
        {t('Analytics')}
      </h1>
      <div className="max-w-xl mx-auto mb-6">
        <label className="block mb-2 font-semibold">{t('Select a Test')}:</label>
        <select
          className="w-full p-2 rounded border border-[#a1724e] dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
          value={selectedTest}
          onChange={handleTestChange}
        >
          <option value="">{t('-- Select Test --')}</option>
          {tests.map(test => (
            <option key={test._id} value={test._id}>
              {test.title?.en || test.title}
            </option>
          ))}
        </select>
      </div>
      {loading && (
        <div className="text-center text-lg text-[#a1724e] dark:text-green-400">
          {t('Loading analytics...')}
        </div>
      )}
      {error && (
        <div className="text-center text-red-600 dark:text-red-400">
          {error}
        </div>
      )}
      {analytics && Array.isArray(analytics) && analytics.length > 0 && (
        <div className="bg-white dark:bg-[#232e41] rounded-xl shadow-xl p-6 max-w-4xl mx-auto text-[#a1724e] dark:text-green-300">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-[#482307] dark:text-green-400">
              {t('Attempts')}
            </h2>
            <button
              onClick={exportDetailedCSV}
              className="px-4 py-2 rounded bg-gradient-to-r from-green-400 to-green-600 text-white font-semibold"
            >
              {t('Export Detailed CSV')}
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border border-[#a1724e] dark:border-[#263040]">
              <thead>
                <tr>
                  {Object.keys(analytics[0] || {}).map(key => (
                    <th
                      key={key}
                      className="py-2 px-4 border-b border-[#a1724e] dark:border-[#263040]"
                    >
                      {key}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {analytics.map((row, i) => (
                  <tr key={i} className="border-b border-[#a1724e] dark:border-[#263040]">
                    {Object.entries(row || {}).map(([key, val], j) => (
                      <td key={j} className="py-2 px-4 align-top">
                        {Array.isArray(val) ? (
                          <details>
                            <summary className="cursor-pointer text-blue-600 dark:text-blue-300">
                              {t('Show Details')}
                            </summary>
                            <div className="mt-2 text-xs whitespace-pre-wrap bg-gray-50 dark:bg-gray-900 p-2 rounded text-[#a1724e] dark:text-green-300">
                              {val.map((item, idx) => (
                                <div
                                  key={idx}
                                  className="mb-2 border-b border-dashed border-gray-300 pb-1"
                                >
                                  {Object.entries(item).map(([k, v]) => (
                                    <div key={k}>
                                      <span className="font-semibold">{k}:</span>{' '}
                                      {typeof v === 'object' && v !== null
                                        ? JSON.stringify(v)
                                        : String(v)}
                                    </div>
                                  ))}
                                </div>
                              ))}
                            </div>
                          </details>
                        ) : typeof val === 'object' && val !== null ? (
                          <span>
                            {val.name ||
                              val.email ||
                              val._id ||
                              JSON.stringify(val)}
                          </span>
                        ) : (
                          String(val)
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
      {analytics && Array.isArray(analytics) && analytics.length === 0 && (
        <div className="text-center text-lg text-[#a1724e] dark:text-green-400">
          {t('No attempts found for this test.')}
        </div>
      )}
      {analytics && !Array.isArray(analytics) && (
        <div className="bg-white dark:bg-[#232e41] rounded-xl shadow-xl p-6 max-w-2xl mx-auto mt-6 text-[#a1724e] dark:text-green-300">
          <h2 className="text-xl font-bold mb-4 text-[#482307] dark:text-green-400">
            {t('Summary')}
          </h2>
          <ul className="space-y-2">
            {Object.entries(analytics).map(([key, value]) => (
              <li
                key={key}
                className="flex justify-between border-b border-dashed border-[#a1724e] py-1"
              >
                <span className="font-semibold capitalize">
                  {key.replace(/([A-Z])/g, ' $1')}
                </span>
                <span>
                  {typeof value === 'number'
                    ? value.toFixed(2)
                    : value}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default Analytics;
