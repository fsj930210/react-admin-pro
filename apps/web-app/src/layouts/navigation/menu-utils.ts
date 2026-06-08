import type { MenuItem } from "@/layouts/types";

export function isVisibleMenu(item: MenuItem) {
  return !item.hidden && item.status === "enabled" && item.type !== "button";
}

export function getVisibleMenus(menus: MenuItem[] = []) {
  return menus.filter(isVisibleMenu);
}
