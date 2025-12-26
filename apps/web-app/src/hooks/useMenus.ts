import { useQuery } from '@tanstack/react-query';
import { getMenus } from '../service/menu';

export const useMenus = () => {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['menus'],
    queryFn: async () => {
      const result =  getMenus();
      const menus = await result.promise;
      return menus || [];
    },
  });

  return {
    menus: data ?? [],
    isLoading,
    error,
    refetch,
  };
};
