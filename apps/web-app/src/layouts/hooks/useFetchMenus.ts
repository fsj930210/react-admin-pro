import { useQuery } from '@tanstack/react-query';

import type { MenuItem } from '../hooks/useMenuService';
import request from '@/service/fetch';
export const getMenus = () => {
	return request.get<MenuItem[]>('/api/rap/user/menus') ;
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
