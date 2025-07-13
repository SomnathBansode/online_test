import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from '../utils/axios';
import { useTranslation } from 'react-i18next';

const TestRulesPage = () => {
  const { t, i18n } = useTranslation();
  const { testId } = useParams();
  const navigate = useNavigate();
  const [test, setTest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    axios.get(`/tests/${testId}`)
      .then(res => setTest(res.data))
      .catch(() => setError(t('Failed to load test info')))
      .finally(() => setLoading(false));
  }, [testId, t]);

  const lang = i18n.language || 'en';

  if (loading) return <div className="min-h-screen flex items-center justify-center text-gray-700 dark:text-gray-200">{t('Loading...')}</div>;
  if (error || !test) return <div className="min-h-screen flex items-center justify-center text-red-600 dark:text-red-300">{error || t('Test not found')}</div>;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#fff9ea] dark:bg-gray-900 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl p-8 w-full max-w-xl border border-[#a1724e] dark:border-gray-600">
        <h1 className="text-2xl font-bold mb-2 text-[#482307] dark:text-gray-100">{test.title?.[lang]}</h1>
        <p className="mb-4 text-gray-700 dark:text-gray-200">{test.description?.[lang]}</p>
        <ul className="mb-6 space-y-2 text-gray-700 dark:text-gray-200 list-disc pl-5">
          <li><b>{t('Total Questions')}:</b> {test.questions?.length}</li>
          <li><b>{t('Duration')}:</b> {test.duration} {t('minutes')}</li>
          <li><b>{t('Language')}:</b> {t(lang === 'mr' ? 'Marathi' : 'English')}</li>
          <li>{t('Read all questions carefully before answering.')}</li>
          <li>{t('Each question is mandatory unless specified.')}</li>
          <li>{t('You cannot go back to previous questions once answered (if test is set to sequential).')}</li>
          <li>{t('Your answers will be auto-submitted when time is up.')}</li>
          <li>{t('Do not refresh or close the browser during the test.')}</li>
          <li>{t('No page refresh, copy-paste, or screenshots allowed during the test.')}</li>
          <li>{t('Copying, pasting, or switching tabs may result in disqualification.')}</li>
          <li>{t('Right-click and text selection are disabled for security.')}</li>
          <li>{t('A watermark with your email and time will be visible during the test.')}</li>
          <li>{t('If you leave the test page, you may be warned or auto-submitted.')}</li>
          <li>{t('Any attempt to cheat may result in disqualification.')}</li>
        </ul>
        <button
          className="w-full py-2 rounded bg-[#a1724e] dark:bg-green-600 text-white font-semibold text-lg shadow hover:bg-[#7a5436] dark:hover:bg-green-500 transition"
          onClick={() => navigate(`/test/${testId}`)}
        >
          {t('Start Test')}
        </button>
      </div>
    </div>
  );
};

export default TestRulesPage;
