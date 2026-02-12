import React from 'react';
import { Icon as IconifyIcon } from '@iconify/react';

import type { IconProps as IconifyIconProps } from '@iconify/react';

interface IconProps {
  wrapClassName?: string;
  title?: string;
  children?: React.ReactNode;
  icon?: string | IconifyIconProps['icon'];
  type?: 'img' | 'iconify';
  alt?: string;
  width?: string | number;
  height?: string | number;
	size?: number;
  loading?: 'eager' | 'lazy';
  className?: string;
  style?: React.CSSProperties;
}

const Icon = ({
  wrapClassName,
  title = '',
  children,
  icon,
  type,
	size = 16,
  ...rest
}: IconProps) => {
  if (children) {
    return (
      <span
        className={`text-[0px] leading-none align-top ${wrapClassName || ''}`}
        title={title}
        aria-label={title}
      >
        {children}
      </span>
    );
  }

  if (type === 'img' && icon) {
    return (
      <span
        className={`text-[0px] leading-none align-top ${wrapClassName || ''}`}
        title={title}
        aria-label={title}
      >
        <img src={icon as string} {...rest} />
      </span>
    );
  }

  if (type === 'iconify' && icon) {
    return (
      <span
        className={`text-[0px] leading-none align-top ${wrapClassName || ''}`}
        title={title}
        aria-label={title}
      >
        <IconifyIcon inline fontSize={size} icon={icon}  />
      </span>
    );
  }

  if (typeof icon === 'string') {
    if (/\.(png|jpg|jpeg|gif|webp|bmp|ico|svg)$/i.test(icon)) {
      return (
        <span
          className={`text-[0px] leading-none align-top ${wrapClassName || ''}`}
          title={title}
          aria-label={title}
        >
          <img src={icon} {...rest} />
        </span>
      );
    }
    else {
      return (
        <span
          className={`text-[0px] leading-none align-top ${wrapClassName || ''}`}
          title={title}
          aria-label={title}
        >
          <IconifyIcon inline fontSize={size} icon={icon} />
        </span>
      );
    }
  }

  // 否则使用iconify icon
  return icon && (
    <span
      className={`text-[0px] leading-none align-top ${wrapClassName || ''}`}
      title={title}
      aria-label={title}
    >
      <IconifyIcon inline fontSize={size} icon={icon} />
    </span>
  );
};

export default Icon;
