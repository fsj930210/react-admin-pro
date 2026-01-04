import { useQuery } from '@tanstack/react-query';
import { httpClient } from '@rap/utils/fetch';
import type { MenuItem } from '../hooks/useMenuService';

export const getMenus = () => {
	return httpClient.get< MenuItem[]>('/api/rap/user/menus');
};


export const useFetchMenus = (callback?: (menus: MenuItem[]) => void) => {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['menus'],
    queryFn: async () => {
      const result =  getMenus();
      const data = await result.promise;
			callback?.(data?.data ?? []);
      return data || [];
    },
  });

  return {
    menus: data?.data ?? [],
    isLoading,
    error,
    refetch,
  };
};
