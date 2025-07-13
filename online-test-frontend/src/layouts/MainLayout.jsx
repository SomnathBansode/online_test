import React, { useState } from 'react';
import { Outlet, Link, useNavigate } from 'react-router-dom';
import ThemeToggle from '../components/ThemeToggle';
import { Grid, User, LogOut } from 'lucide-react';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../features/auth/authSlice';
import { useTranslation } from 'react-i18next';
import { useTestProgress } from '../context/TestProgressContext';

const MainLayout = () => {
  const { t, i18n } = useTranslation();
  const [language, setLanguage] = useState(i18n.language || 'en');
  const user = useSelector((state) => state.auth.user);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { testInProgress } = useTestProgress();

  const handleLogout = () => {
    if (testInProgress) {
      alert(t('You cannot logout during a test. Please submit your test first.'));
      return;
    }
    dispatch(logout());
    navigate('/auth/login');
  };

  const handleLanguageChange = (e) => {
    if (testInProgress) {
      alert(t('Language cannot be changed during a test.'));
      return;
    }
    const newLanguage = e.target.value;
    setLanguage(newLanguage);
    i18n.changeLanguage(newLanguage);
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Navbar */}
      <header
        className="
          bg-[#fff9ea] dark:bg-gray-900
          border-b border-[#a1724e] dark:border-gray-700
          shadow px-2 sm:px-4 py-2 flex flex-wrap sm:flex-nowrap justify-between items-center
          sticky top-0 z-30
        "
      >
        <Link
          to="/"
          className="
            text-xl sm:text-2xl font-bold
            bg-gradient-to-r from-[#a1724e] to-[#a1724e]
            bg-clip-text text-transparent
            dark:text-green-400
            whitespace-nowrap
          "
        >
          {t('Online Test')}
        </Link>
        <div className="flex flex-1 flex-wrap sm:flex-nowrap items-center gap-2 sm:gap-6 justify-end min-w-0">
          {/* Language Dropdown */}
          <select
            value={language}
            onChange={handleLanguageChange}
            disabled={testInProgress}
            className={`border rounded px-2 py-1 text-[#a1724e] dark:text-gray-900 bg-white dark:bg-gray-200 text-sm ${
              testInProgress ? "opacity-50 cursor-not-allowed" : ""
            }`}
            title={testInProgress ? t("Cannot change language during test") : ""}
          >
            <option value="en">{t('English')}</option>
            <option value="mr">{t('Marathi')}</option>
          </select>

          <Link
            to={testInProgress ? '#' : '/dashboard'}
            onClick={e => { 
              if (testInProgress) { 
                e.preventDefault(); 
                alert(t('You cannot leave the test until you submit!')); 
              } 
            }}
            className={`flex items-center gap-2 text-[#a1724e] dark:text-gray-300 hover:text-[#5e4029] dark:hover:text-green-400 transition-colors text-sm sm:text-base whitespace-nowrap ${
              testInProgress ? "opacity-50 cursor-not-allowed" : ""
            }`}
          >
            <Grid className="w-5 h-5" />
            <span>{t('Dashboard')}</span>
          </Link>

          {/* Login/Logout logic */}
          {user ? (
            <button
              onClick={handleLogout}
              className={`flex items-center gap-2 text-[#a1724e] dark:text-gray-300 hover:text-[#5e4029] dark:hover:text-green-400 transition-colors text-sm sm:text-base whitespace-nowrap ${
                testInProgress ? "opacity-50 cursor-not-allowed" : ""
              }`}
              disabled={testInProgress}
              title={testInProgress ? t("Cannot logout during test") : ""}
            >
              <LogOut className="w-5 h-5" />
              <span>{t('Logout')}</span>
            </button>
          ) : (
            <Link
              to="/auth/login"
              className="flex items-center gap-2 text-[#a1724e] dark:text-gray-300 hover:text-[#5e4029] dark:hover:text-green-400 transition-colors text-sm sm:text-base whitespace-nowrap"
            >
              <User className="w-5 h-5" />
              <span>{t('Login')}</span>
            </Link>
          )}

          <ThemeToggle />
        </div>
      </header>

      {/* Main content */}
      <main className="flex-grow">
        <Outlet />
      </main>

      {/* Footer */}
      <footer
        className="
          bg-[#fff9ea] dark:bg-gray-900
          border-t border-[#a1724e] dark:border-gray-700
          text-[#a1724e] dark:text-gray-300
          text-center p-4
        "
      >
        © {new Date().getFullYear()} Online Test Platform
      </footer>
    </div>
  );
};

export default MainLayout;