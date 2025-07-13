import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import axios from '../utils/axios';
import { FilePlus, FileText, Users, BarChart2, Settings, UploadCloud, ShieldCheck, BookOpen, ListChecks } from './DashboardIcons';
import LogoutButton from './LogoutButton';
import { useTranslation } from 'react-i18next';
import TestRules from './TestRules';
import { motion, AnimatePresence } from 'framer-motion';
import Loader from './Loader';

const Dashboard = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState(null);
  const [showRules, setShowRules] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        if (!token) throw new Error('No token found');
        
        const res = await axios.get('/auth/me', {
          headers: { 
            Authorization: `Bearer ${token}`
          }
        });
        
        setUser(res.data);
      } catch (err) {
        console.error('Failed to fetch user:', err);
        setError(err.response?.data?.message || 'Failed to fetch user');
        navigate('/auth/login?session=expired');
      } finally {
        setLoading(false);
      }
    };
    
    fetchUser();
  }, [navigate]);

  useEffect(() => {
    if (user?.role === 'admin') {
      axios.get('/stats')
        .then(res => setStats(res.data))
        .catch(() => setStats(null));
    }
  }, [user]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-[#fff9ea] dark:bg-gray-900">
        <Loader size={32} color="#a1724e" darkColor="#4ade80" message={t('Loading dashboard...')} />
      </div>
    );
  }

  if (error) {
    if (error.toLowerCase().includes('token')) {
      setTimeout(() => navigate('/auth/login'), 2000);
      return (
        <AnimatePresence>
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 40 }}
            transition={{ duration: 0.4 }}
            className="flex flex-col items-center justify-center h-screen bg-[#fff9ea] dark:bg-gray-900 text-[#a1724e] dark:text-gray-100 p-6"
          >
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl p-8 w-full max-w-md border border-[#a1724e] dark:border-gray-600 flex flex-col items-center">
              <h2 className="text-3xl font-bold mb-4 text-[#482307] dark:text-gray-100">{t('Session Expired')}</h2>
              <p className="text-lg mb-4 text-center text-gray-700 dark:text-gray-300">{t('Your session has expired or is invalid. Please log in again to continue. We can\'t wait to see you back!')}</p>
            </div>
          </motion.div>
        </AnimatePresence>
      );
    }
    return (
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 40 }}
          transition={{ duration: 0.4 }}
          className="flex items-center justify-center h-screen bg-[#fff9ea] dark:bg-gray-900"
        >
          <div className="text-xl text-red-600 dark:text-red-400">{error}</div>
        </motion.div>
      </AnimatePresence>
    );
  }

  const AdminDashboard = () => (
    <div className="w-full max-w-md mx-auto">
      {stats && (
        <div className="grid grid-cols-2 gap-3 mb-6">
          {[
            { value: stats.users, label: 'Total Users', color: 'green' },
            { value: stats.tests, label: 'Total Tests', color: 'blue' },
            { value: stats.attempts, label: 'Total Attempts', color: 'yellow' },
            { value: `${stats.passRate}%`, label: 'Pass Rate', color: 'purple' }
          ].map((stat, index) => (
            <div key={index} className={`bg-white dark:bg-gray-800 rounded-lg p-3 flex flex-col items-center border border-${stat.color}-200 dark:border-${stat.color}-700`}>
              <span className={`text-xl font-bold text-${stat.color}-700 dark:text-${stat.color}-300`}>{stat.value}</span>
              <span className="text-xs text-gray-600 dark:text-gray-300">{t(stat.label)}</span>
            </div>
          ))}
        </div>
      )}
      <div className="grid gap-4 grid-cols-2">
        {[
          { icon: FilePlus, path: '/admin/manage-tests', label: 'Manage Tests', desc: 'Create, edit, delete tests' },
          { icon: UploadCloud, path: '/admin/bulk-upload', label: 'Bulk Upload', desc: 'Upload CSV, PDF' },
          { icon: Settings, path: '/admin/test-settings', label: 'Test Settings', desc: 'Configure test details' },
          { icon: BarChart2, path: '/admin/analytics', label: 'Analytics', desc: 'User & test statistics' },
          { icon: ShieldCheck, path: '/admin/security', label: 'Security', desc: 'Device restrictions' },
          { icon: Users, path: '/admin/manage-users', label: 'Manage Users', desc: 'User management' },
          { icon: Users, path: '/admin/assign-test', label: 'Assign Test', desc: 'Assign to users/groups' },
          { icon: FileText, path: '/admin/results', label: 'View Results', desc: 'See all test results' }
        ].map((item, index) => (
          <div 
            key={index}
            onClick={() => navigate(item.path)} 
            className="cursor-pointer bg-white dark:bg-gray-800 rounded-lg p-4 flex flex-col items-center border border-[#a1724e] dark:border-gray-600 active:scale-95 transition-transform"
          >
            <item.icon className="text-[#a1724e] dark:text-green-400 mb-1" size={24} />
            <span className="font-medium text-sm text-center text-gray-800 dark:text-gray-200">{t(item.label)}</span>
            <span className="text-xs text-gray-600 dark:text-gray-400 text-center">{t(item.desc)}</span>
          </div>
        ))}
      </div>
    </div>
  );

  const UserDashboard = () => {
    return (
      <div className="w-full max-w-md mx-auto grid gap-4 grid-cols-2">
        {[
          { icon: Users, path: '/profile', label: 'Profile', desc: 'View and edit profile' },
          { icon: FileText, path: '/results', label: 'Results', desc: 'View test results' },
          { icon: BookOpen, path: '/available-tests', label: 'Tests', desc: 'Available tests' },
          { icon: ListChecks, action: () => setShowRules(true), label: 'Rules', desc: 'Test guidelines' }
        ].map((item, index) => (
          <div 
            key={index}
            onClick={item.action || (() => navigate(item.path))} 
            className="cursor-pointer bg-white dark:bg-gray-800 rounded-lg p-4 flex flex-col items-center border border-[#a1724e] dark:border-gray-600 active:scale-95 transition-transform"
          >
            <item.icon className="text-[#a1724e] dark:text-green-400 mb-1" size={24} />
            <span className="font-medium text-sm text-center text-gray-800 dark:text-gray-200">{t(item.label)}</span>
            <span className="text-xs text-gray-600 dark:text-gray-400 text-center">{t(item.desc)}</span>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="flex flex-col items-center justify-start min-h-screen bg-[#fff9ea] dark:bg-gray-900 p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="w-full max-w-md"
      >
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 mb-6 border border-[#a1724e] dark:border-gray-600">
          <h1 className="text-2xl font-bold mb-1 text-[#482307] dark:text-gray-100 text-center">{t('Dashboard')}</h1>
          <h2 className="text-lg font-semibold mb-3 text-[#482307] dark:text-gray-100 text-center">
            {t('Welcome, {{name}}!', { name: user?.name || t('User') })}
          </h2>
          
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-gray-700 dark:text-gray-300">{t('Role')}:</span>
            <span className="font-medium text-gray-800 dark:text-gray-200">{user?.role}</span>
          </div>
          
          <div className="flex justify-between items-center mb-4">
            <span className="text-sm text-gray-700 dark:text-gray-300">{t('User ID')}:</span>
            <span className="font-mono text-sm text-gray-800 dark:text-gray-200">{user?.id}</span>
          </div>
          
          <div className="flex justify-center">
            <LogoutButton />
          </div>
        </div>

        {user?.role === 'admin' ? <AdminDashboard /> : <UserDashboard />}
      </motion.div>

      <TestRules open={showRules} onAgree={() => setShowRules(false)} userRole={user?.role} />
    </div>
  );
};

export default Dashboard;