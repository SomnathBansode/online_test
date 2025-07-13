import React from 'react';
import { useTranslation } from 'react-i18next';
import SecurityForm from './SecurityForm';

const Security = () => {
  const { t } = useTranslation();
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#fff9ea] dark:bg-gray-900 text-[#a1724e] dark:text-green-300 p-6">
      <h1 className="text-3xl font-bold mb-4 text-[#482307] dark:text-green-400">{t('Security')}</h1>
      <SecurityForm />
    </div>
  );
};

export default Security;
