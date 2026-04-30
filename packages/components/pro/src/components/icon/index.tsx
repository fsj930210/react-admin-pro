import React, { useMemo, useRef, useState } from 'react';
import type { IconifyJSON } from '@iconify/react';
import { useVirtualizer } from '@tanstack/react-virtual';
import { useControllableValue } from 'ahooks';
import { Input } from '@rap/components-ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@rap/components-ui/tabs';
import { IconifyIcon, ImageIcon, type IconWrapperProps } from '@rap/components-ui/icon';

// 默认图标集（静态 import）
import { icons as carbonIcons } from '@iconify-json/carbon';
import { icons as lucideIcons } from '@iconify-json/lucide';
import { icons as riIcons } from '@iconify-json/ri';

export type IconProps = {
	children?: React.ReactNode;
	icon: string;
	type?: 'image' | 'iconify';
	imageProps?: Omit<React.HTMLAttributes<HTMLImageElement>, 'src'>;
	iconifyProps?: Omit<React.ComponentProps<typeof IconifyIcon>, 'icon'>;
} & IconWrapperProps;

export function Icon({
	title = '',
	children,
	icon,
	type = 'iconify',
	imageProps,
	iconifyProps,
	wrapperClassName,
	wrapperStyle,
}: IconProps) {
	if (children) {
		return children;
	}
	if (/\.(png|jpg|jpeg|gif|webp|bmp|ico|svg)$/i.test(icon)) {
		return (
			<ImageIcon
				wrapperClassName={wrapperClassName}
				wrapperStyle={wrapperStyle}
				title={title}
				src={icon}
				{...imageProps}
			/>
		);
	}
	if (type === 'image' && icon) {
		return (
			<ImageIcon
				wrapperClassName={wrapperClassName}
				wrapperStyle={wrapperStyle}
				title={title}
				{...imageProps}
				src={icon}
			/>
		);
	}

	if (type === 'iconify' && icon) {
		return (
			<IconifyIcon
				wrapperClassName={wrapperClassName}
				wrapperStyle={wrapperStyle}
				title={title}
				icon={icon}
				{...iconifyProps}
			/>
		);
	}

	return icon && (
		<IconifyIcon
			wrapperClassName={wrapperClassName}
			wrapperStyle={wrapperStyle}
			title={title}
			icon={icon}
			{...iconifyProps}
		/>
	);
}

function getIconNames(icons: IconifyJSON) {
	const prefix = icons.prefix;
	const iconNames = Object.keys(icons.icons);
	return {
		prefix,
		iconNames: iconNames.map((name) => ({ name, active: false })),
	};
}

export interface IconSelectProps {
	iconSet: {
		prefix: string;
		icons: IconifyJSON;
	};
	value?: string;
	onChange?: (value: string) => void;
}

export function IconSelect(props: IconSelectProps) {
	const { iconSet, value, onChange } = props;
	const listRef = useRef<HTMLDivElement>(null);
	const [searchKeyword, setSearchKeyword] = useState('');

	const iconNames = useMemo(() => {
		return getIconNames(iconSet.icons).iconNames.map((nameItem) => ({
			...nameItem,
			active: `${iconSet.prefix}:${nameItem.name}` === value,
		}));
	}, [iconSet, value]);

	const filteredIcons = useMemo(() => {
		if (!searchKeyword) return iconNames;
		const keyword = searchKeyword.toLowerCase();
		return iconNames.filter((item) => item.name.toLowerCase().includes(keyword));
	}, [iconNames, searchKeyword]);

	const rowVirtualizer = useVirtualizer({
		count: filteredIcons.length,
		getScrollElement: () => listRef.current,
		estimateSize: () => 32,
		overscan: 5,
	});

	const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
		setSearchKeyword(e.target.value);
	};

	const handleIconClick = (iconName: string) => {
		onChange?.(`${iconSet.prefix}:${iconName}`);
	};

	return (
		<div className="flex h-full flex-col">
			<div className="mb-2">
				<Input
					type="text"
					placeholder="搜索图标"
					value={searchKeyword}
					onChange={handleSearch}
					className="w-full"
				/>
			</div>
			<div
				ref={listRef}
				className="flex-1 overflow-auto h-full relative"
			>
				{filteredIcons.length === 0 ? (
					<div className="p-4 text-center text-muted-foreground">
						未找到图标
					</div>
				) : (
					<div
						style={{
							height: `${rowVirtualizer.getTotalSize()}px`,
							width: '100%',
							position: 'relative',
						}}
					>
						<div className="grid grid-cols-6 gap-2 p-2">
							{rowVirtualizer.getVirtualItems().map((virtualItem) => (
								<div
									key={filteredIcons[virtualItem.index].name}
									style={{
										position: 'absolute',
										top: 0,
										left: 0,
										width: 'calc(100% - 16px)',
										transform: `translateY(${virtualItem.start}px)`,
									}}
									className="grid grid-cols-6 gap-2"
								>
									{filteredIcons.slice(virtualItem.index, virtualItem.index + 6).map((item) => (
										<div
											key={item.name}
											onClick={() => handleIconClick(item.name)}
											title={`${iconSet.prefix}:${item.name}`}
											className={`flex items-center justify-center aspect-square p-1 rounded-md transition-colors ${item.active ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'}`}
										>
											<Icon icon={`${iconSet.prefix}:${item.name}`} />
										</div>
									))}
								</div>
							))}
						</div>
					</div>
				)}
			</div>
		</div>
	);
}

export interface IconSet {
	prefix: string;
	icons: IconifyJSON;
}

const defaultIconSets: IconSet[] = [
	{
		prefix: 'carbon',
		icons: carbonIcons
	},
	{
		prefix: 'lucide',
		icons: lucideIcons
	},
	{
		prefix: 'ri',
		icons: riIcons
	},
];

export interface IconViewProps {
	value?: string;
	defaultValue?: string;
	iconSets?: IconSet[];
	disableDefaultIconSets?: boolean;
	defaultIconSet?: string;
	onChange?: (value: string) => void;
	onIconSetChange?: (key: string) => void;
}

export function IconView(props: IconViewProps) {
	const [value, setValue] = useControllableValue(props);
	const allIconSets = useMemo(() => {
		const sets = props.disableDefaultIconSets ? [] : [...defaultIconSets];
		if (props.iconSets?.length) {
			sets.push(...props.iconSets);
		}
		return sets;
	}, [props.iconSets, props.disableDefaultIconSets]);

	const [activeKey, setActiveKey] = useState(props.defaultIconSet || allIconSets[0]?.prefix || '');
	const handleTabChange = (key: string) => {
		setActiveKey(key);
		props.onIconSetChange?.(key);
	};

	return (
		<div className="size-full overflow-hidden">
			<Tabs
				value={activeKey}
				onValueChange={handleTabChange}
				className="h-full flex flex-col"
			>
				<TabsList className="mb-2" variant="line">
					{allIconSets.map((set) => (
						<TabsTrigger key={set.prefix} value={set.prefix}>
							{set.prefix}
						</TabsTrigger>
					))}
				</TabsList>

				<div className="flex-1 overflow-hidden">
					{allIconSets.map((set) => (
						<TabsContent key={set.prefix} value={set.prefix} className="h-full">
							<IconSelect
								iconSet={set}
								value={value}
								onChange={setValue}
							/>
						</TabsContent>
					))}
				</div>
			</Tabs>
		</div>
	);
}