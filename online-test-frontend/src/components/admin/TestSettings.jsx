import React from 'react';
import { useTranslation } from 'react-i18next';

const TestSettings = () => {
  const { t } = useTranslation();
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#fff9ea] dark:bg-gray-900 text-[#a1724e] dark:text-gray-100 p-6">
      <h1 className="text-3xl font-bold mb-4 text-[#482307] dark:text-green-400">{t('Test Settings')}</h1>
      <p className="text-lg">{t('Configure test details here. (Feature coming soon)')}</p>
    </div>
  );
};

export default TestSettings;
