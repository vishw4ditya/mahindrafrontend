import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export const useAuth = () => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const userData = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    if (userData && token) {
      setUser(JSON.parse(userData));
    }
    setLoading(false);
  }, []);

  const login = (userData: any, token: string) => {
    localStorage.setItem('user', JSON.stringify(userData));
    localStorage.setItem('token', token);
    setUser(userData);
    router.push('/dashboard');
  };

  const logout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    setUser(null);
    router.push('/login');
  };

  return { user, loading, login, logout };
};
