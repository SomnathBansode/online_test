import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

const TestRules = ({ open, onAgree, userRole }) => {
  const { t } = useTranslation();
  const [checked, setChecked] = useState(false);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg max-w-lg w-full p-6 relative">
        <h2 className="text-xl font-bold mb-4 text-[#482307] dark:text-green-400">{t('Test Rules')}</h2>
        {userRole && (
          <div className="mb-2 text-sm text-gray-600 dark:text-gray-300">
            {t('Your role')}: <span className="font-bold">{userRole}</span>
          </div>
        )}
        <ul className="list-disc pl-6 space-y-2 text-gray-700 dark:text-gray-100">
          <li>{t('Read all questions carefully before answering.')}</li>
          <li>{t('Do not refresh or close the browser during the test.')}</li>
          <li>{t('Each question is mandatory unless specified.')}</li>
          <li>{t('You cannot go back to previous questions once answered (if test is set to sequential).')}</li>
          <li>{t('Your answers will be auto-submitted when time is up.')}</li>
          <li>{t('Any attempt to cheat may result in disqualification.')}</li>
        </ul>
        <div className="mt-6 flex items-center">
          <input
            id="agree"
            type="checkbox"
            checked={checked}
            onChange={e => setChecked(e.target.checked)}
            className="mr-2"
          />
          <label htmlFor="agree" className="text-sm text-gray-700 dark:text-gray-200">
            {t('I have read and agree to the test rules.')}
          </label>
        </div>
        <button
          className="mt-4 w-full py-2 rounded bg-[#a1724e] dark:bg-green-600 text-white font-semibold disabled:opacity-60"
          disabled={!checked}
          onClick={onAgree}
        >
          {t('Start Test')}
        </button>
      </div>
    </div>
  );
};

export default TestRules;
