import { useState, useEffect } from 'react';
import { User } from '@shared/schema';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';

interface UseAuthReturn {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<User | null>;
  register: (userData: any) => Promise<User | null>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<User | null>;
}

export const useAuth = (): UseAuthReturn => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const { toast } = useToast();

  const checkAuth = async (): Promise<User | null> => {
    try {
      const response = await apiRequest('GET', '/api/auth/me');
      const userData = await response.json();
      setUser(userData);
      return userData;
    } catch (error) {
      setUser(null);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string): Promise<User | null> => {
    try {
      const response = await apiRequest('POST', '/api/auth/login', { email, password });
      const userData = await response.json();
      setUser(userData);
      toast({
        title: 'Login Successful',
        description: 'Welcome back!',
        variant: 'default'
      });
      return userData;
    } catch (error) {
      toast({
        title: 'Login Failed',
        description: error instanceof Error ? error.message : 'Invalid email or password',
        variant: 'destructive'
      });
      return null;
    }
  };

  const register = async (userData: any): Promise<User | null> => {
    try {
      const response = await apiRequest('POST', '/api/auth/register', userData);
      const user = await response.json();
      setUser(user);
      toast({
        title: 'Registration Successful',
        description: 'Your account has been created!',
        variant: 'default'
      });
      return user;
    } catch (error) {
      toast({
        title: 'Registration Failed',
        description: error instanceof Error ? error.message : 'Failed to create account',
        variant: 'destructive'
      });
      return null;
    }
  };

  const logout = async (): Promise<void> => {
    try {
      await apiRequest('POST', '/api/auth/logout');
      setUser(null);
      toast({
        title: 'Logged Out',
        description: 'You have been successfully logged out',
        variant: 'default'
      });
    } catch (error) {
      toast({
        title: 'Logout Failed',
        description: 'An error occurred while logging out',
        variant: 'destructive'
      });
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  return { user, loading, login, register, logout, checkAuth };
};
