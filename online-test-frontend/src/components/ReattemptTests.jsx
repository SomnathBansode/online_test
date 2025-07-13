import React, { useEffect, useState } from 'react';
import axios from '../utils/axios';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { BookOpen, RotateCw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Loader from './Loader';

function ReattemptTests() {
  const { t, i18n } = useTranslation();
  const { token, user } = useSelector((state) => state.auth);
  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [reattempting, setReattempting] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAvailableTests = async () => {
      try {
        setLoading(true);
        setError('');
        const response = await axios.get('/api/tests/reattempt/available', {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        if (response.data && Array.isArray(response.data)) {
          setTests(response.data);
        } else {
          setError(t('Invalid response format'));
        }
      } catch (err) {
        console.error('Fetch error:', err);
        setError(err.response?.data?.message || t('Failed to load tests'));
        if (err.response?.status === 401) {
          navigate('/auth/login');
        }
      } finally {
        setLoading(false);
      }
    };

    if (user?.id && token) {
      fetchAvailableTests();
    }
  }, [token, user, t, navigate]);

  const handleReattempt = async (testId) => {
    if (!testId) return;
    
    setReattempting(testId);
    try {
      const response = await axios.post(
        `/api/tests/${testId}/reattempt`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.data?.success) {
        navigate(`/test-rules/${testId}`, {
          state: {
            isReattempt: true,
            sessionId: response.data.sessionId,
            attemptNumber: response.data.attemptNumber
          }
        });
      } else {
        throw new Error('Invalid server response');
      }
    } catch (err) {
      console.error('Reattempt error:', err);
      let errorMsg = t('Failed to start re-attempt');
      
      if (err.response?.status === 403) {
        errorMsg = t('Maximum attempts reached');
      } else if (err.response?.status === 404) {
        errorMsg = t('Test not found');
      } else if (err.response?.data?.message) {
        errorMsg = err.response.data.message;
      }
      
      setError(errorMsg);
    } finally {
      setReattempting(null);
    }
  };

  const getTestTitle = (test) => {
    if (!test?.title) return t('Untitled Test');
    if (typeof test.title === 'object') {
      return test.title[i18n.language] || test.title.en || t('Untitled Test');
    }
    return test.title;
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#fff9ea] dark:bg-gray-900 p-6">
      <div className="bg-white dark:bg-[#181b20] rounded-xl shadow-xl p-8 w-full max-w-6xl">
        <div className="text-center mb-8">
          <RotateCw className="mx-auto text-[#a1724e] dark:text-green-400" size={48} />
          <h1 className="text-3xl font-bold mt-4 text-[#482307] dark:text-green-300">
            {t('Re-attempt Eligible Tests')}
          </h1>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <Loader size={32} color="#a1724e" darkColor="#4ade80" />
          </div>
        ) : error ? (
          <div className="text-center text-red-600 dark:text-red-400 py-8">
            <p className="text-lg mb-4">{error}</p>
            <button 
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-[#a1724e] dark:bg-green-600 text-white rounded hover:opacity-90"
            >
              {t('Try Again')}
            </button>
          </div>
        ) : tests.length === 0 ? (
          <div className="text-center text-gray-500 dark:text-gray-400 py-8">
            <p className="text-lg mb-4">{t('No tests available for re-attempt.')}</p>
            <button
              onClick={() => navigate('/dashboard')}
              className="px-4 py-2 bg-[#a1724e] dark:bg-green-600 text-white rounded hover:opacity-90"
            >
              {t('Back to Dashboard')}
            </button>
          </div>
        ) : (
          <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            <AnimatePresence>
              {tests.map(test => (
                <motion.div
                  key={test._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="h-full flex flex-col bg-[#fff9ea] dark:bg-[#23272e] rounded-lg shadow p-6 border-l-4 border-blue-500 hover:shadow-lg transition-all duration-300"
                >
                  <div className="flex items-center mb-3">
                    <BookOpen className="text-[#a1724e] dark:text-green-400 mr-2" size={20} />
                    <h3 className="font-semibold text-lg text-[#482307] dark:text-green-200 line-clamp-2">
                      {getTestTitle(test)}
                    </h3>
                  </div>
                  
                  <div className="flex flex-wrap gap-2 mb-4">
                    <span className="px-2 py-1 text-xs rounded bg-blue-100 dark:bg-blue-900">
                      {t('Attempts')}: {test.attemptCount || 0}
                    </span>
                    {test.lastScore !== undefined && (
                      <span className="px-2 py-1 text-xs rounded bg-green-100 dark:bg-green-900">
                        {t('Last Score')}: {test.lastScore}%
                      </span>
                    )}
                  </div>

                  <button
                    onClick={() => handleReattempt(test._id)}
                    disabled={reattempting === test._id}
                    className={`w-full py-2 rounded flex items-center justify-center gap-2 ${
                      reattempting === test._id 
                        ? 'bg-gray-400 dark:bg-gray-600' 
                        : 'bg-[#a1724e] hover:bg-[#7a5436] dark:bg-green-600 dark:hover:bg-green-700'
                    } text-white font-semibold mt-auto`}
                  >
                    {reattempting === test._id ? (
                      <>
                        <RotateCw className="animate-spin" size={18} />
                        {t('Starting...')}
                      </>
                    ) : (
                      <>
                        <RotateCw size={18} />
                        {t('Re-attempt')}
                      </>
                    )}
                  </button>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}

export default ReattemptTests;