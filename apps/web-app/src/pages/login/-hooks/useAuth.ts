import { useMutation } from '@tanstack/react-query';
import { login, logout } from '@/service/auth';
import { useNavigate } from '@tanstack/react-router';
import { toast } from 'sonner';
import type { ILoginRequestData} from '@/service/auth';

export function useAuth() {
  const navigate = useNavigate();

  const loginMutation = useMutation({
    mutationFn: async (credentials: ILoginRequestData) => {
      const { data } = await login(credentials);
      return data;
    },
    onSuccess: (data) => {
      if (data.token) {
        localStorage.setItem('token', data.token);
        toast.success('Login success');
        navigate({ to: '/dashboard', replace: true });
      }
    },
    onError: (error: Error) => {
      console.error('Login error:', error);
      toast.error('Login failed');
    },
  });

  const logoutMutation = useMutation({
    mutationFn: async () => {
      const res = await logout();
      return res;
    },
    onSuccess: () => {
      localStorage.removeItem('token');
      toast.success('Logout success');
      navigate({ to: '/login', replace: true });
    },
    onError: (error: Error) => {
      console.error('Logout error:', error);
      toast.error('Logout failed');
    },
  });

  return {
    loginMutation,
		logoutMutation,
  };
}
