import React from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import axios from '../utils/axios';
import { logout } from '../features/auth/authSlice';
import { useTestProgress } from '../context/TestProgressContext';

const LogoutButton = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { testInProgress } = useTestProgress();

  const handleLogout = async () => {
    if (testInProgress) {
      alert('You cannot logout during a test. Please submit your test first.');
      return;
    }
    try {
      await axios.post('/auth/logout');
    } catch (err) {
      // Ignore errors
    }
    dispatch(logout());
    navigate('/auth/login');
  };

  return (
    <button
      onClick={handleLogout}
      className="mt-4 px-4 py-2 rounded bg-red-600 text-white hover:bg-red-700 transition font-semibold"
    >
      Logout
    </button>
  );
};

export default LogoutButton;
