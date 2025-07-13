import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { BookOpen } from 'lucide-react';
import axios from '../utils/axios';
import { motion, AnimatePresence } from 'framer-motion';

const PAGE_SIZE = 6;

const AvailableTests = () => {
  const { t, i18n } = useTranslation();
  const [tests, setTests] = useState([]);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    axios.get('/tests')
      .then(res => setTests(res.data))
      .catch(() => setError(t('Failed to load tests')))
      .finally(() => setLoading(false));
  }, [t]);

  const lang = i18n.language || 'en';
  const filtered = tests.filter(test =>
    (test.title?.[lang] || '').toLowerCase().includes(search.toLowerCase())
  );
  const paginated = filtered.slice((page-1)*PAGE_SIZE, page*PAGE_SIZE);
  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);

  return (
    <div className="min-h-screen bg-[#fff9ea] dark:bg-gray-900 p-4 flex flex-col items-center">
      <h1 className="text-3xl font-bold mb-6 text-[#482307] dark:text-green-400">{t('Available Tests')}</h1>
      <input
        type="text"
        placeholder={t('Search tests...')}
        value={search}
        onChange={e => { setSearch(e.target.value); setPage(1); }}
        className="mb-6 w-full max-w-md px-4 py-2 rounded border border-[#a1724e] dark:border-green-500 dark:bg-gray-800 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-400"
      />
      {loading ? (
        <div className="text-lg text-[#a1724e] dark:text-green-400">{t('Loading...')}</div>
      ) : error ? (
        <div className="text-red-600 dark:text-red-400">{error}</div>
      ) : filtered.length === 0 ? (
        <div className="text-gray-700 dark:text-gray-300 text-center mt-10">{t('No tests found')}</div>
      ) : (
        <>
          <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 w-full max-w-5xl">
            <AnimatePresence>
              {paginated.map(test => (
                <motion.div
                  key={test._id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 30 }}
                  transition={{ duration: 0.3 }}
                  className="bg-white dark:bg-gray-800 rounded-xl shadow p-6 flex flex-col border border-[#a1724e] dark:border-green-500 hover:shadow-lg transition relative"
                >
                  <div className="flex items-center mb-2">
                    <BookOpen className="text-[#a1724e] dark:text-green-400 mr-2" size={28} />
                    <h2 className="font-bold text-lg flex-1 text-[#482307] dark:text-gray-100">
                      {test.title?.[lang]}
                    </h2>
                  </div>
                  <p className="text-sm text-gray-700 dark:text-gray-300 mb-2 line-clamp-2">
                    {test.description?.[lang]}
                  </p>
                  <div className="flex flex-wrap gap-2 text-xs mb-4">
                    <span className="px-2 py-1 rounded bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200">
                      {t(test.language)}
                    </span>
                    <span className="px-2 py-1 rounded bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200">
                      {t('Duration')}: {test.duration} {t('minutes')}
                    </span>
                  </div>
                  <button
                    className="mt-auto w-full py-2 rounded bg-[#a1724e] dark:bg-green-600 text-white font-semibold shadow hover:bg-[#7a5436] dark:hover:bg-green-700 transition"
                    onClick={() => window.location.href = `/test-rules/${test._id}`}
                  >
                    {t('Start Test')}
                  </button>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
          <div className="flex justify-center items-center gap-2 mt-8">
            <button
              className="px-3 py-1 rounded bg-gray-300 dark:bg-gray-700 text-gray-800 dark:text-gray-100 disabled:opacity-50"
              onClick={() => setPage(page - 1)}
              disabled={page === 1}
            >
              {t('Prev')}
            </button>
            <span className="mx-2 text-sm text-gray-700 dark:text-gray-300">
              {t('Page')} {page} / {totalPages}
            </span>
            <button
              className="px-3 py-1 rounded bg-gray-300 dark:bg-gray-700 text-gray-800 dark:text-gray-100 disabled:opacity-50"
              onClick={() => setPage(page + 1)}
              disabled={page === totalPages}
            >
              {t('Next')}
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default AvailableTests;
