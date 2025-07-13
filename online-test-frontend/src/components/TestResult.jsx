import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import axios from '../utils/axios';
import { Pie } from 'react-chartjs-2';
import { Chart, ArcElement, Tooltip, Legend } from 'chart.js';
import { useTranslation } from 'react-i18next';
import Loader from "./Loader";
Chart.register(ArcElement, Tooltip, Legend);

const TestResult = () => {
  const { t, i18n } = useTranslation();
  const { testId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const perPage = 10; // Set to 10 as per previous request
  const lang = i18n.language || 'en';

  useEffect(() => {
    setLoading(true);
    setError(null);
    // Add cache-busting param to always get fresh data
    const cacheBuster = Date.now();
    axios.get(`/tests/${testId}/result?cb=${cacheBuster}`)
      .then(res => {
        const data = res.data;
        if (data.questions && data.answers) {
          data.questions = data.questions.map((q, idx) => {
            const answerObj = data.answers.find(a => a.questionIndex === idx);
            return {
              ...q,
              userAnswer: answerObj ? answerObj.selectedOption : null,
              isCorrect: answerObj ? answerObj.isCorrect : null,
            };
          });
        }
        setResult(data);
      })
      .catch(err => setError(err?.response?.data?.message || t('Failed to load result')))
      .finally(() => setLoading(false));
  }, [testId, t, location.key]);

if (loading) return (
  <div className="min-h-screen flex items-center justify-center">
    <Loader size={32} color="#22c55e" message={t('Loading...')} />
  </div>
);
  if (error || !result) return <div className="min-h-screen flex items-center justify-center text-xl text-red-400">{error || t('Result not found')}</div>;

  const score = result.score;
  const total = result.totalMarks;
  const timeTaken = result.submittedAt ? new Date(result.submittedAt).toLocaleString() : '-';
  const questions = result.questions || [];

  // 12-hour time format helper
  const to12Hour = (dateStr) => {
    if (!dateStr) return '-';
    const d = new Date(dateStr);
    let h = d.getHours();
    const m = d.getMinutes();
    const ampm = h >= 12 ? 'PM' : 'AM';
    h = h % 12;
    h = h ? h : 12;
    return `${h}:${String(m).padStart(2, '0')} ${ampm} ${d.toLocaleDateString()}`;
  };

  // Pie chart logic (robust)
  let correct = 0, incorrect = 0, unanswered = 0;
  if (result && result.questions) {
    result.questions.forEach(q => {
      if (q.userAnswer === null || q.userAnswer === undefined || q.userAnswer === -1) unanswered++;
      else if (q.isCorrect) correct++;
      else incorrect++;
    });
  } else {
    correct = result?.correctAnswers || 0;
    incorrect = result?.incorrectAnswers || 0;
    unanswered = result?.unanswered || 0;
  }
  const chartData = {
    labels: [t('Correct'), t('Incorrect'), t('Unanswered')],
    datasets: [
      {
        data: [correct, incorrect, unanswered],
        backgroundColor: ['#22c55e', '#ef4444', '#fbbf24'],
        borderColor: ['#1e7e34', '#b91c1c', '#d97706'],
        borderWidth: 2,
      },
    ],
  };
  const chartOptions = {
    plugins: {
      legend: {
        labels: {
          color: '#fff',
        },
      },
      tooltip: {
        titleColor: '#fff',
        bodyColor: '#fff',
      },
    },
    maintainAspectRatio: false,
  };

  const filteredQuestions = questions.filter(q =>
    q.questionText[lang].toLowerCase().includes(search.toLowerCase())
  );
  const totalPages = Math.ceil(filteredQuestions.length / perPage);
  const pagedQuestions = filteredQuestions.slice((page - 1) * perPage, page * perPage);

  return (
    <div className="min-h-screen bg-gray-900 p-4 flex flex-col items-center">
      <h1 className="text-3xl font-bold mb-4 text-green-400">{t('Test Result')}</h1>
      <div className="bg-gray-800 rounded-xl shadow p-6 w-full max-w-2xl mb-8 flex flex-col items-center">
        <div className="flex flex-wrap gap-6 w-full justify-center mb-6">
          <div className="flex flex-col items-center">
            <span className="text-4xl font-bold text-green-400">{score} / {total}</span>
            <span className="text-sm text-gray-200">{t('Score')}</span>
          </div>
          <div className="flex flex-col items-center">
            <span className={`text-2xl font-bold ${score >= (total * 0.4) ? 'text-green-400' : 'text-red-400'}`}>
              {score >= (total * 0.4) ? t('Pass') : t('Fail')}
            </span>
            <span className="text-sm text-gray-200">{t('Status')}</span>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-lg font-bold text-yellow-300">{to12Hour(result.submittedAt)}</span>
            <span className="text-sm text-gray-200">{t('Time Taken')}</span>
          </div>
        </div>
        {(correct + incorrect + unanswered > 0) && (correct >= 0 && incorrect >= 0 && unanswered >= 0) && (
          <div className="w-48 h-48 mx-auto mb-4">
            <Pie data={chartData} options={chartOptions} />
          </div>
        )}
        <div className="flex gap-4 justify-center mt-2">
          <div className="flex items-center gap-1"><span className="inline-block w-3 h-3 rounded-full bg-green-500" /> <span className="text-green-400 text-xs">{t('Correct')}</span></div>
          <div className="flex items-center gap-1"><span className="inline-block w-3 h-3 rounded-full bg-red-500" /> <span className="text-red-400 text-xs">{t('Incorrect')}</span></div>
          <div className="flex items-center gap-1"><span className="inline-block w-3 h-3 rounded-full bg-yellow-400" /> <span className="text-yellow-300 text-xs">{t('Unanswered')}</span></div>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 w-full justify-center">
          <button
            onClick={() => navigate('/dashboard')}
            className="mt-4 px-6 py-2 rounded bg-green-600 text-white font-semibold shadow hover:bg-green-700 transition"
          >
            {t('Back to Dashboard')}
          </button>
          <button
            onClick={() => navigate(`/test/${testId}`)}
            className="mt-4 px-6 py-2 rounded bg-blue-500 text-white font-semibold shadow hover:bg-blue-600 transition"
          >
            {t('Re-attempt Test')}
          </button>
        </div>
      </div>
      <div className="w-full max-w-3xl">
        <h2 className="text-2xl font-bold mb-4 text-green-400">{t('Review Answers')}</h2>
        <div className="mb-4 flex flex-col sm:flex-row gap-2 items-center">
          <input
            type="text"
            className="w-full sm:w-64 px-3 py-2 rounded border border-gray-600 bg-gray-800 text-gray-100 focus:outline-none focus:ring focus:ring-green-500"
            placeholder={t('Search questions...')}
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
          />
        </div>
        <div className="space-y-4">
          {pagedQuestions.map((q, idx) => (
            <div key={idx} className="bg-gray-800 rounded-lg shadow p-4">
              <div className="mb-2 flex items-center gap-2">
                <span className="font-bold text-green-400">{t('Q')} {(page - 1) * perPage + idx + 1}:</span>
                <span className="text-base text-gray-100">{(q.questionText && (q.questionText[lang] || q.questionText.en || q.questionText.mr || Object.values(q.questionText)[0])) || '-'}</span>
              </div>
              <div className="flex flex-wrap gap-2 mb-2">
                {Array.isArray(q.options) && q.options.map((opt, oidx) => {
                  let optClass = 'px-3 py-1 rounded border';
                  if (oidx === q.correctAnswer) optClass += ' border-green-500 bg-green-900';
                  else if (oidx === q.userAnswer) optClass += ' border-red-500 bg-red-900';
                  else optClass += ' border-gray-600';
                  const optText = opt && (opt[lang] || opt.en || opt.mr || Object.values(opt)[0] || '-');
                  return (
                    <span key={oidx} className={optClass + ' text-gray-100'}>{optText}</span>
                  );
                })}
              </div>
              <div className="text-sm">
                <span className="font-semibold text-green-400">{t('Correct Answer')}: </span>
                <span className="text-gray-100">{q.options && q.options[q.correctAnswer] && (q.options[q.correctAnswer][lang] || q.options[q.correctAnswer].en || q.options[q.correctAnswer].mr || Object.values(q.options[q.correctAnswer])[0] || '-')}</span>
                {q.userAnswer !== null && q.userAnswer !== q.correctAnswer && q.userAnswer !== undefined && q.options && q.options[q.userAnswer] && (
                  <span className="ml-4 font-semibold text-red-400">{t('Your Answer')}: {(q.options[q.userAnswer][lang] || q.options[q.userAnswer].en || q.options[q.userAnswer].mr || Object.values(q.options[q.userAnswer])[0] || '-')}</span>
                )}
              </div>
              {q.explanation && (
                <div className="mt-2 text-xs text-gray-300">
                  <span className="font-semibold">{t('Explanation')}: </span>
                  {(q.explanation[lang] || q.explanation.en || q.explanation.mr || Object.values(q.explanation)[0] || '-')}
                </div>
              )}
            </div>
          ))}
        </div>
        <div className="mt-4 flex gap-2 items-center justify-center">
          <button
            className="px-3 py-1 rounded bg-gray-700 text-gray-100 font-semibold disabled:opacity-50 hover:bg-gray-600 transition"
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
          >
            {t('Prev')}
          </button>
          <span className="text-sm text-gray-100">{t('Page')} {page} / {totalPages}</span>
          <button
            className="px-3 py-1 rounded bg-gray-700 text-gray-100 font-semibold disabled:opacity-50 hover:bg-gray-600 transition"
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
          >
            {t('Next')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default TestResult;