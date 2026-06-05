import type { TFunction } from "@rap/i18n";
import type { MenuItem } from "../types";

function localizeBadge(item: MenuItem, t: TFunction<"webApp">) {
  if (!item.badge?.text) return item.badge;

  return {
    ...item.badge,
    text: t(`menuBadges.${item.code}`, { defaultValue: item.badge.text }),
  };
}

export function localizeMenuTree(menus: MenuItem[], t: TFunction<"webApp">): MenuItem[] {
  return menus.map((item) => ({
    ...item,
    title: t(`menu.${item.code}`, { defaultValue: item.title }),
    badge: localizeBadge(item, t),
    children: item.children ? localizeMenuTree(item.children, t) : undefined,
  }));
}
