import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { motion } from 'framer-motion';

const Home = () => {
  const { t } = useTranslation();
  const { token } = useSelector((state) => state.auth);

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 40 }}
      transition={{ duration: 0.4 }}
      className="
        min-h-screen flex flex-col justify-center items-center
        bg-gray-50 dark:bg-gray-900
        text-gray-800 dark:text-gray-100
        p-6
      "
    >
      <div className="max-w-md w-full text-center">
        <motion.h1
          initial={{ scale: 0.9 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.3 }}
          className="
            text-4xl font-bold mb-6
            text-indigo-600 dark:text-indigo-400
            tracking-tight
          "
        >
          {t('Online Test Platform')}
        </motion.h1>

        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="
            mb-8 text-lg
            text-gray-600 dark:text-gray-300
            px-4
          "
        >
          {t('Take tests, view results, and improve your skills with confidence.')}
        </motion.p>

        <motion.div 
          className="flex flex-col gap-4 px-4"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.5 }}
        >
          {token ? (
            <Link
              to="/dashboard"
              className="
                w-full py-3 px-6
                rounded-xl
                bg-indigo-600 text-white
                hover:bg-indigo-700
                active:bg-indigo-800
                transition-colors
                font-medium
                shadow-md
                dark:shadow-indigo-900/50
              "
            >
              {t('Go to Dashboard')}
            </Link>
          ) : (
            <>
              <Link
                to="/auth/login"
                className="
                  w-full py-3 px-6
                  rounded-xl
                  bg-indigo-600 text-white
                  hover:bg-indigo-700
                  active:bg-indigo-800
                  transition-colors
                  font-medium
                  shadow-md
                  dark:shadow-indigo-900/50
                "
              >
                {t('Login')}
              </Link>

              <Link
                to="/auth/register"
                className="
                  w-full py-3 px-6
                  rounded-xl
                  bg-white text-indigo-600
                  hover:bg-gray-100
                  active:bg-gray-200
                  border border-indigo-600
                  transition-colors
                  font-medium
                  shadow-md
                  dark:bg-gray-800 dark:text-indigo-400
                  dark:border-indigo-400 dark:hover:bg-gray-700
                "
              >
                {t('Register')}
              </Link>
            </>
          )}
        </motion.div>

        <motion.div 
          className="mt-8 text-sm text-gray-500 dark:text-gray-400"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.5 }}
        >
          {t('Start your learning journey today')}
        </motion.div>
      </div>
    </motion.div>
  );
};

export default Home;