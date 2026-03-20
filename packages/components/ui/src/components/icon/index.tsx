import React from 'react';
import { Icon as IconifyIcon } from '@iconify/react';

import type { IconProps as IconifyIconProps } from '@iconify/react';

type IconProps = {

	title?: string;
	children?: React.ReactNode;
	icon?: string | IconifyIconProps['icon'];
	type?: 'image' | 'iconify';
	size?: number;
	imageProps?: Omit<React.HTMLAttributes<HTMLImageElement>, 'src'>;
	iconifyProps?: Omit<IconifyIconProps, 'icon'>;
	width?: number;
	height?: number;
} & React.ComponentProps<'span'>

export function Icon({
	className,
	title = '',
	children,
	icon,
	type = 'iconify',
	width = 16,
	height = 16,
	size = 16,
	imageProps,
	iconifyProps,
	...rest
}: IconProps) {
	if (children) {
		return (
			<span
				{...rest}
				className={`text-[0px] leading-none align-top ${className || ''}`}
				title={title}
				aria-label={title}
			>
				{children}
			</span>
		);
	}

	if (type === 'image' && icon) {
		return (
			<span
				{...rest}
				className={`text-[0px] leading-none align-top ${className || ''}`}
				title={title}
				aria-label={title}
			>
				<img src={icon as string} {...imageProps} width={width} height={height} />
			</span>
		);
	}

	if (type === 'iconify' && icon) {
		return (
			<span
				{...rest}
				className={`text-[0px] leading-none align-top ${className || ''}`}
				title={title}
				aria-label={title}
			>
				<IconifyIcon inline fontSize={size} icon={icon} {...iconifyProps} />
			</span>
		);
	}

	if (typeof icon === 'string') {
		if (/\.(png|jpg|jpeg|gif|webp|bmp|ico|svg)$/i.test(icon)) {
			return (
				<span
					{...rest}
					className={`text-[0px] leading-none align-top ${className || ''}`}
					title={title}
					aria-label={title}
				>
					<img src={icon} {...imageProps} width={width} height={height} />
				</span>
			);
		}
		else {
			return (
				<span
					{...rest}
					className={`text-[0px] leading-none align-top ${className || ''}`}
					title={title}
					aria-label={title}
				>
					<IconifyIcon inline fontSize={size} icon={icon} {...iconifyProps} />
				</span>
			);
		}
	}

	// 否则使用iconify icon
	return icon && (
		<span
			{...rest}
			className={`text-[0px] leading-none align-top ${className || ''}`}
			title={title}
			aria-label={title}
		>
			<IconifyIcon inline fontSize={size} icon={icon} {...iconifyProps} />
		</span>
	);
};

export { IconView } from './icon-view';
