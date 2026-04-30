import React from 'react';
import { Icon as IconifyIconComponent } from '@iconify/react';
import type { IconProps as IconifyIconComponentProps } from '@iconify/react';

export type IconWrapperProps = {
	title?: string;
	wrapperClassName?: string;
	wrapperStyle?: React.CSSProperties;
}
export type IconifyIconProps = IconifyIconComponentProps & IconWrapperProps;


export function IconifyIcon({
	wrapperClassName,
	wrapperStyle,
	title = '',
	fontSize = 16,
	...rest
}: IconifyIconProps) {
	return (
		<span
			style={wrapperStyle}
			className={`text-[0px] leading-none align-top ${wrapperClassName || ''}`}
			title={title}
			aria-label={title}
			data-slot="icon"
		>
			<IconifyIconComponent inline fontSize={fontSize} {...rest} />
		</span>
	);
}

export type ImageIconProps = React.ImgHTMLAttributes<HTMLImageElement> & IconWrapperProps;

export function ImageIcon({
	title = '',
	wrapperClassName,
	wrapperStyle,
	...rest
}: ImageIconProps) {
	return (
		<span
			style={wrapperStyle}
			className={`text-[0px] leading-none align-top ${wrapperClassName || ''}`}
			title={title}
			aria-label={title}
			data-slot="icon"
		>
			<img {...rest} />
		</span>
	);
}
