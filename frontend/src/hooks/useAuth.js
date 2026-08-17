import { useSelector } from 'react-redux';

export default function useAuth() {
  const { user, accessToken } = useSelector((state) => state.auth);
  return { user, isAuthenticated: Boolean(accessToken), role: user?.role || null };
}
