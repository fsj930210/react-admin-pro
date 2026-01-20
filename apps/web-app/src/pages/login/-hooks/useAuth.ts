import { useMutation } from '@tanstack/react-query';
import { login, logout, fetchUserInfo } from '@/service/auth';
import { useRouter } from '@tanstack/react-router';
import { toast } from 'sonner';
import { useUserSelector } from '@/store/user';
import type { ILoginRequestData} from '@/service/auth';

export function useAuth() {
  const router = useRouter();
  const { setUserInfo } = useUserSelector(['setUserInfo']);

  const loginMutation = useMutation({
    mutationFn: async (credentials: ILoginRequestData) => {
      const { data } = await login(credentials);
      return data;
    },
    onSuccess: (data) => {
      if (data.token) {
        localStorage.setItem('token', data.token);
        toast.success('Login success');
        getUserInfoMutation.mutate();
        router.navigate({ to: '/dashboard', replace: true });
      }
    },
    onError: (error: Error) => {
      console.error('Login error:', error);
      toast.error('Login failed');
    },
  });

  const getUserInfoMutation = useMutation({
    mutationKey: ['getUserInfo'],
    mutationFn: async () => {
      try {
        const res = await fetchUserInfo();
        setUserInfo(res?.data ?? {
          id: '',
          username: '',
          gender: 0,
          avatar: '',
          phone: '',
          email: '',
        });
        return res;
      } catch (error) {
        console.error('Failed to fetch user info:', error);
        // 如果获取用户信息失败且是401错误，自动登出
        // if (error instanceof Error && error.message.includes('401')) {
        //   logout();
        // }
        throw error;
      }
    },
  });

  const logoutMutation = useMutation({
    mutationFn: async () => {
      const res = await logout();
      return res;
    },
    onSuccess: () => {
      localStorage.removeItem('token');
      setUserInfo({
        id: '',
        username: '',
        gender: 0,
        avatar: '',
        phone: '',
        email: '',
      });
      toast.success('Logout success');
			localStorage.removeItem('token');
      router.navigate({ to: '/login', replace: true });
    },
    onError: (error: Error) => {
      console.error('Logout error:', error);
      toast.error('Logout failed');
    },
  });



  return {
    loginMutation,
		logoutMutation,
		getUserInfoMutation,
  };
}
