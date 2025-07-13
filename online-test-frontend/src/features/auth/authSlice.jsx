import { createSlice } from '@reduxjs/toolkit';
import { jwtDecode } from 'jwt-decode';
import axios from '../../utils/axios';

const isTokenValid = (token) => {
  if (!token) return false;
  try {
    const decoded = jwtDecode(token);
    return decoded.exp * 1000 > Date.now();
  } catch {
    return false;
  }
};

const initialState = {
  user: JSON.parse(localStorage.getItem('user')) || null,
  token: localStorage.getItem('token') || null,
  refreshToken: localStorage.getItem('refreshToken') || null,
  isLoading: false,
  error: null,
  lastActivity: localStorage.getItem('lastActivity') || null
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    loginStart(state) {
      state.isLoading = true;
      state.error = null;
    },
    loginSuccess(state, action) {
      state.user = action.payload.user;
      state.token = action.payload.accessToken;
      state.refreshToken = action.payload.refreshToken;
      state.isLoading = false;
      state.error = null;
      state.lastActivity = new Date().toISOString();
      
      localStorage.setItem('user', JSON.stringify(action.payload.user));
      localStorage.setItem('token', action.payload.accessToken);
      localStorage.setItem('refreshToken', action.payload.refreshToken);
      localStorage.setItem('lastActivity', new Date().toISOString());
    },
    loginFailure(state, action) {
      state.isLoading = false;
      state.error = action.payload;
    },
    logout(state) {
      state.user = null;
      state.token = null;
      state.refreshToken = null;
      state.isLoading = false;
      state.error = null;
      state.lastActivity = null;
      
      localStorage.removeItem('user');
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('lastActivity');
    },
    refreshTokenSuccess(state, action) {
      state.token = action.payload.accessToken;
      state.refreshToken = action.payload.refreshToken;
      state.isLoading = false;
      state.error = null;
      state.lastActivity = new Date().toISOString();
      
      localStorage.setItem('token', action.payload.accessToken);
      localStorage.setItem('refreshToken', action.payload.refreshToken);
      localStorage.setItem('lastActivity', new Date().toISOString());
    },
    setError(state, action) {
      state.error = action.payload;
    },
    clearError(state) {
      state.error = null;
    }
  }
});

export const attemptRefreshToken = () => async (dispatch, getState) => {
  const { refreshToken } = getState().auth;
  
  if (!refreshToken || !isTokenValid(refreshToken)) {
    dispatch(logout());
    return null;
  }

  try {
    const response = await axios.post('/auth/refresh', { refreshToken });
    dispatch(refreshTokenSuccess({
      accessToken: response.data.accessToken,
      refreshToken: response.data.refreshToken
    }));
    return response.data.accessToken;
  } catch (error) {
    console.error('Refresh token failed:', error);
    dispatch(logout());
    return null;
  }
};

export const { 
  loginStart,
  loginSuccess,
  loginFailure,
  logout,
  refreshTokenSuccess,
  setError,
  clearError
} = authSlice.actions;

export default authSlice.reducer;