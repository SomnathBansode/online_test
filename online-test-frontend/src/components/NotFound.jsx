import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';

const NotFound = () => {
  const { t } = useTranslation();
  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 40 }}
      transition={{ duration: 0.4 }}
      className="min-h-screen flex flex-col items-center justify-center text-center p-8 bg-[#fff9ea] dark:bg-gray-900"
    >
      <h1 className="text-6xl font-bold text-red-500 mb-4">404</h1>
      <p className="text-xl mb-4 text-[#a1724e] dark:text-green-300">{t('Oops! Page not found.')}</p>
      <Link to="/" className="text-blue-600 dark:text-blue-400 hover:underline">{t('Go Home')}</Link>
    </motion.div>
  );
};

export default NotFound;
