import type { IconifyJSON } from '@iconify/react';

export function getIconNames(icons: IconifyJSON) {
  const prefix = icons.prefix;
  const iconNames = Object.keys(icons.icons);
  return {
    prefix,
    iconNames: iconNames.map((name) => ({ name, active: false })),
  };
}
