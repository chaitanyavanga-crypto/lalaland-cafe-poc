import axiosClient from '../api/axiosClient';

// Thin wrapper around the auth endpoints — keeps raw axios calls out of Redux slices
// and gives components/tests a single place to mock.
export const authService = {
  login: (credentials) => axiosClient.post('/auth/login', credentials).then((res) => res.data.data),
  register: (payload) => axiosClient.post('/auth/register', payload).then((res) => res.data.data),
  forgotPassword: (email) => axiosClient.post('/auth/forgot-password', { email }).then((res) => res.data),
  resetPassword: (token, password) =>
    axiosClient.post('/auth/reset-password', { token, password }).then((res) => res.data),
  refresh: (userId, refreshToken) =>
    axiosClient.post('/auth/refresh', { userId, refreshToken }).then((res) => res.data.data),
  logout: (userId, refreshToken) => axiosClient.post('/auth/logout', { userId, refreshToken }),
};
