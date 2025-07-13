import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Navigate, useLocation } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import { logout, attemptRefreshToken } from '../features/auth/authSlice';
import Loader from './Loader';

const ProtectedRoute = ({ children, requireAdmin = false }) => {
  const { token, user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const location = useLocation();
  const [authChecked, setAuthChecked] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const verifyAuth = async () => {
      try {
        if (!token) {
          throw new Error('No token found');
        }

        const decoded = jwtDecode(token);
        const isExpired = decoded.exp * 1000 < Date.now();

        if (isExpired) {
          const newToken = await dispatch(attemptRefreshToken()).unwrap();
          if (!newToken) {
            throw new Error('Session expired');
          }
        }

        if (requireAdmin && user?.role !== 'admin') {
          throw new Error('Admin access required');
        }

        setAuthChecked(true);
      } catch (error) {
        console.error('Authentication check failed:', error);
        dispatch(logout());
      } finally {
        setLoading(false);
      }
    };

    verifyAuth();
  }, [token, user, dispatch, requireAdmin]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader size="lg" />
      </div>
    );
  }

  if (!authChecked || !token) {
    return (
      <Navigate
        to="/auth/login"
        state={{ from: location }}
        replace
      />
    );
  }

  if (requireAdmin && user?.role !== 'admin') {
    return (
      <Navigate
        to="/"
        state={{ from: location }}
        replace
      />
    );
  }

  return children;
};

export default ProtectedRoute;