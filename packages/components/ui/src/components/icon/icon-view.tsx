import { useMemo, useState } from 'react';
import type { IconifyJSON } from '@iconify/react';
import { useControllableValue } from 'ahooks';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@rap/components-base/tabs';
import { IconSelect } from './icon-select';
// 默认图标集（静态 import）
import { icons as carbonIcons } from '@iconify-json/carbon';
import { icons as lucideIcons } from '@iconify-json/lucide';
import { icons as riIcons } from '@iconify-json/ri';

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
	iconSize?: number;
	gap?: number;
	rowGap?: number;
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
	console.log(activeKey, '111111')
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
								iconSize={props.iconSize}
								gap={props.gap}
								rowGap={props.rowGap}
							/>
						</TabsContent>
					))}
				</div>
			</Tabs>
		</div>
	);
};
