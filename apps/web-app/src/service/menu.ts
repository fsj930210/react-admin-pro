import { httpClient } from '@rap/utils/fetch';
import type { MenuItem } from '@rap/components-ui/layouts'


export interface MenuResponseData {
  menus: MenuItem[];
}

export const getMenus = () => {
  return httpClient.get<MenuResponseData>('/api/rap/user/menus');
};
