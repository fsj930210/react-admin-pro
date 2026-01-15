import { useMutation } from '@tanstack/react-query';
import { login, logout as logoutApi, fetchUserInfo } from '@/service/auth';
import { useRouter } from '@tanstack/react-router';
import { toast } from 'sonner';
import { useUserSelector } from '@/store/user';
import type { ILoginRequestData} from '@/service/auth';

export function useAuth() {
  const router = useRouter();
  // const queryClient = useQueryClient();
  const { setUserInfo } = useUserSelector(['setUserInfo']);

  const loginMutation = useMutation({
    mutationFn: async (credentials: ILoginRequestData) => {
      const { data } = await login(credentials);
      return data;
    },
    onSuccess: (data) => {
      if (data?.token) {
        localStorage.setItem('token', data.token);
        toast.success('Login success');
        // 获取用户信息
        getUserInfoMutation.mutate();
        // 导航到仪表盘
        router.navigate({ to: '/dashboard', replace: true });
        // // 使相关查询失效，触发重新获取
        // queryClient.invalidateQueries({ queryKey: ['user'] });
        // queryClient.invalidateQueries({ queryKey: ['menus'] });
      }
    },
    onError: (error: Error) => {
      console.error('Login error:', error);
      toast.error('Login failed');
    },
  });

  // 获取用户信息 mutation (用于页面刷新时调用)
  const getUserInfoMutation = useMutation({
    mutationKey: ['getUserInfo'],
    mutationFn: async () => {
      try {
        const res = await fetchUserInfo();
        // 获取成功后直接更新store
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
        throw error; // 继续抛出错误，让React Query处理
      }
    },
  });

  // 登出 mutation
  const logoutMutation = useMutation({
    mutationFn: async () => {
      const res = await logoutApi();
      return res;
    },
    onSuccess: () => {
      // 清除 localStorage 中的 token
      localStorage.removeItem('token');
      // 清空用户信息 store
      setUserInfo({
        id: '',
        username: '',
        gender: 0,
        avatar: '',
        phone: '',
        email: '',
      });
      toast.success('Logout success');
      // 导航到登录页
			localStorage.removeItem('token');
      router.navigate({ to: '/login', replace: true });
    },
    onError: (error: Error) => {
      console.error('Logout error:', error);
      toast.error('Logout failed');
    },
  });

  // 登出功能
  const logout = () => {
    logoutMutation.mutate();
  };


  // 检查是否已登录
  const isAuthenticated = () => {
    return localStorage.getItem('token') !== null;
  };

  // 获取当前 token
  const getToken = () => {
    return localStorage.getItem('token');
  };

	const getUserInfo = () => {
    return getUserInfoMutation.mutate();
  };

  return {
    login: loginMutation.mutate,
    loginAsync: loginMutation.mutateAsync,
    isLoginLoading: loginMutation.isPending,
    loginError: loginMutation.error,
    logout,
    isLogoutLoading: logoutMutation.isPending,
    logoutError: logoutMutation.error,
    isAuthenticated,
    getToken,
		getUserInfo,
  };
}
