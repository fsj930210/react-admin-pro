import { useQuery } from '@tanstack/react-query';
import { type ApiResponse } from '@rap/utils/fetch';
import type { MenuItem } from '../hooks/useMenuService';
import baseFetch from '@/service/fetch';
export const getMenus = () => {
	return baseFetch.get<MenuItem[]>('/api/rap/user/menus') as Promise<ApiResponse<MenuItem[]>>;
};


export const useFetchMenus = () => {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['menus'],
    queryFn: getMenus,
  });

  return {
    menus: data?.data ?? [],
    isLoading,
    error,
    refetch,
  };
};
