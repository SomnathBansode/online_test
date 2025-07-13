import React, { useState, useRef, useEffect } from 'react';
import axios from '../utils/axios';
import { useSelector, useDispatch } from 'react-redux';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';
import AuthWrapper from './AuthWrapper';
import { logout } from '../features/auth/authSlice';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

const UserProfile = ({ user: userProp, onUpdate }) => {
  const { t } = useTranslation();
  const token = useSelector((state) => state.auth.token);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [user, setUser] = useState(userProp || null);
  const [form, setForm] = useState({ name: '', email: '' });
  const [currentPassword, setCurrentPassword] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [passwordError, setPasswordError] = useState('');

  const timeoutRef = useRef();

  // Fetch user if not provided
  useEffect(() => {
    if (!userProp) {
      const fetchUser = async () => {
        try {
          setLoading(true);
          const res = await axios.get('/auth/me', {
            headers: { Authorization: `Bearer ${token}` },
          });
          setUser(res.data);
          setForm({ name: res.data.name, email: res.data.email });
        } catch (err) {
          setUser(null);
        } finally {
          setLoading(false);
        }
      };
      fetchUser();
    } else {
      setUser(userProp);
      setForm({ name: userProp?.name || '', email: userProp?.email || '' });
    }
  }, [userProp, token]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await axios.put('/auth/me', { name: form.name }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success(t('Profile updated successfully!'));
      if (onUpdate) onUpdate(res.data);
      setUser(res.data);
      setForm({ name: res.data.name, email: res.data.email });
    } catch (err) {
      toast.error(err?.response?.data?.message || t('Failed to update profile'));
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setPasswordError('');
    if (password.length < 6) {
      setPasswordError(t('Password must be at least 6 characters'));
      return;
    }
    setLoading(true);
    try {
      await axios.post(
        '/auth/change-password',
        { password },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success(t('Password changed successfully!'));
      setPassword('');
      setCurrentPassword('');
      // Logout and redirect to login
      dispatch(logout());
      navigate('/auth/login');
    } catch (err) {
      toast.error(err?.response?.data?.message || t('Failed to change password'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      setForm({ name: user.name || '', email: user.email || '' });
    }
  }, [user]);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 40 }}
      transition={{ duration: 0.4 }}
      className="min-h-screen flex flex-col items-center justify-center bg-[#fff9ea] dark:bg-gray-900 text-[#a1724e] dark:text-green-300 p-6"
    >
      <AuthWrapper>
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl p-8 w-full max-w-md border border-[#a1724e] dark:border-gray-700 mx-auto">
          <div className="text-center mb-6">
            <h1 className="text-3xl font-bold mt-2 bg-gradient-to-r from-[#a1724e] to-[#a1724e] bg-clip-text text-transparent dark:text-green-400">
              {t('Profile')}
            </h1>
          </div>
          <form onSubmit={handleProfileUpdate} className="space-y-4">
            <div>
              <label className="block mb-1 font-semibold">{t('Name')}</label>
              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                className="w-full py-3 px-3 rounded border border-[#a1724e] dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 text-base font-medium focus:ring-2 focus:ring-[#a1724e] dark:focus:ring-green-400"
                required
              />
            </div>
            <div>
              <label className="block mb-1 font-semibold">{t('Email')}</label>
              <input
                type="email"
                name="email"
                value={form.email}
                readOnly
                className="w-full py-3 px-3 rounded border border-[#a1724e] dark:border-gray-600 bg-gray-100 dark:bg-gray-700 dark:text-gray-100 cursor-not-allowed text-base font-medium"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded bg-[#a1724e] dark:bg-green-600 hover:bg-[#5e4029] dark:hover:bg-green-700 transition text-white font-semibold text-lg flex justify-center items-center"
            >
              {t('Update Profile')}
            </button>
          </form>
          <form onSubmit={handlePasswordChange} className="space-y-4 mt-6">
            <div>
              <label className="block mb-1 font-semibold">{t('Current Password')}</label>
              <div className="relative">
                <input
                  type={showCurrentPassword ? 'text' : 'password'}
                  name="currentPassword"
                  value={currentPassword}
                  onChange={e => setCurrentPassword(e.target.value)}
                  className="w-full py-3 px-3 rounded border border-[#a1724e] dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 pr-10 text-base font-medium focus:ring-2 focus:ring-[#a1724e] dark:focus:ring-green-400"
                  required
                />
                <span
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 cursor-pointer text-gray-500"
                  onClick={() => setShowCurrentPassword((v) => !v)}
                  tabIndex={0}
                  role="button"
                  aria-label={showCurrentPassword ? t('Hide password') : t('Show password')}
                >
                  {showCurrentPassword ? <EyeSlashIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
                </span>
              </div>
            </div>
            <div>
              <label className="block mb-1 font-semibold">{t('New Password')}</label>
              <div className="relative">
                <input
                  type={showNewPassword ? 'text' : 'password'}
                  name="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full py-3 px-3 rounded border border-[#a1724e] dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 pr-10 text-base font-medium focus:ring-2 focus:ring-[#a1724e] dark:focus:ring-green-400"
                  required
                />
                <span
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 cursor-pointer text-gray-500"
                  onClick={() => setShowNewPassword((v) => !v)}
                  tabIndex={0}
                  role="button"
                  aria-label={showNewPassword ? t('Hide password') : t('Show password')}
                >
                  {showNewPassword ? <EyeSlashIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
                </span>
              </div>
              {passwordError && <div className="text-xs text-red-500 mt-1">{passwordError}</div>}
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded bg-[#a1724e] dark:bg-green-600 hover:bg-[#5e4029] dark:hover:bg-green-700 transition text-white font-semibold text-lg flex justify-center items-center"
            >
              {t('Change Password')}
            </button>
          </form>
        </div>
      </AuthWrapper>
    </motion.div>
  );
};

export default UserProfile;
