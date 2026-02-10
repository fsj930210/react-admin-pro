import { Icon as IconifyIcon } from '@iconify/react';

import type { IconProps } from '@iconify/react';

const Icon = ({
  wrapClassName,
	title = '',
  ...rest
}: IconProps & { wrapClassName?: string, title?: string }) => {
  return (
    <span
      className={`text-[0px] leading-none align-top ${wrapClassName ? wrapClassName : ''}`}
			title={title}
			aria-label={title}
    >
      <IconifyIcon inline fontSize={14} {...rest} />
    </span>
  );
};

export default Icon;
