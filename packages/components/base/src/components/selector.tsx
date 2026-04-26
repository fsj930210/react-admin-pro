import { Listbox, ListboxItem, ListboxItemIndicator } from "./listbox";
import { Checkbox } from "./checkbox";
import { Label } from "./label";
import { cn } from "@rap/utils";
import { useState, useEffect, createContext, use, useMemo, useRef, useCallback } from 'react'
import { Inbox, SearchIcon } from 'lucide-react'
import { InputGroup, InputGroupAddon, InputGroupInput } from "./input-group";
import { useVirtualizer } from "@tanstack/react-virtual";


export interface SelectorItem {
	label: string;
	value: string;
	disabled?: boolean;
}

interface SelectorContextValue {
	dataSource: SelectorItem[];
	filteredItems: SelectorItem[];
	selectedItems: SelectorItem[];
	selectedValues: string[];
	searchValue: string;
	selectItem: (value: string, selected: boolean) => void;
	selectAll: (selected: boolean) => void;
	selectItems: (values: string[], selected: boolean) => void;
	handleValueChange: (newValues: string[]) => void;
	setFilteredItems: (items: SelectorItem[]) => void;
	setSearchValue: (value: string) => void;
}

const SelectorContext = createContext<SelectorContextValue | undefined>(undefined);


export function useListSelector() {
	const context = use(SelectorContext);
	if (!context) {
		throw new Error("useListSelector must be used within a ListSelectorRoot");
	}
	return context;
}

interface SelectorProps {
	dataSource: SelectorItem[];
	children: React.ReactNode | ((props: {
		filteredItems: SelectorItem[];
		selectedValues: string[];
		selectedItems: SelectorItem[];
		searchValue: string;
		onItemSelect: (value: string, selected: boolean) => void;
		onItemsSelect: (values: string[], selected: boolean) => void;
		onItemSelectAll: (selected: boolean) => void;
	}) => React.ReactNode);
	height?: number;
	className?: string;
	defaultValue?: string[];
	value?: string[];
	onChange?: (value: string[], selectedItems: SelectorItem[]) => void;
}

export function Selector({
	dataSource,
	defaultValue,
	value,
	className,
	children,
	height = 400,
	onChange,
}: SelectorProps) {
	const [filteredItems, setFilteredItems] = useState<SelectorItem[]>([]);
	const [internalSelectedValues, setInternalSelectedValues] = useState<string[]>(defaultValue || []);
	const [searchValue, setSearchValue] = useState("");

	const isControlled = value !== undefined;
	const selectedValues = isControlled ? value : internalSelectedValues;
	console.log(value, isControlled, selectedValues, 'selectedValues');
	const selectedItems = useMemo(() => {
		return dataSource.filter(item => selectedValues.includes(item.value));
	}, [dataSource, selectedValues]);

	useEffect(() => {
		setFilteredItems(dataSource);
	}, [dataSource]);

	useEffect(() => {
		if (!isControlled) {
			setInternalSelectedValues(defaultValue || []);
		}
	}, [defaultValue, isControlled]);

	const handleValueChange = useCallback((newValues: string[]) => {
		console.log(newValues, 'handleValueChange');
		if (!isControlled) {
			setInternalSelectedValues(newValues);
		}
		onChange?.(newValues, dataSource.filter(item => newValues.includes(item.value)));
	}, []);

	const selectItem = useCallback((value: string, selected: boolean) => {
		let newValues: string[];
		if (selected) {
			newValues = selectedValues.filter(v => v !== value);
		} else {
			newValues = [...selectedValues, value];
		}
		handleValueChange(newValues);
	}, []);
	const selectItems = useCallback((values: string[], selected: boolean) => {
		let newValues: string[];
		if (selected) {
			newValues = values;
		} else {
			newValues = selectedValues.filter(v => !values.includes(v));
		}
		handleValueChange(newValues);
	}, []);
	const selectAll = useCallback((selected: boolean) => {
		let newValues: string[];
		if (selected) {
			newValues = filteredItems.map(item => item.value);
		} else {
			newValues = [];
		}
		handleValueChange(newValues);
	}, []);

	const contextValue: SelectorContextValue = useMemo(() => ({
		dataSource,
		filteredItems,
		selectedItems,
		selectedValues,
		searchValue,
		selectItems,
		selectItem,
		selectAll,
		handleValueChange,
		setFilteredItems,
		setSearchValue,
	}), [
		dataSource,
		filteredItems,
		selectedItems,
		selectedValues,
		searchValue,
		selectItems,
		selectItem,
		selectAll,
		handleValueChange,
		setFilteredItems,
		setSearchValue
	]);

	const renderChildren = () => {
		if (typeof children === 'function') {
			return children({
				filteredItems,
				selectedValues,
				selectedItems,
				searchValue,
				onItemSelect: selectItem,
				onItemsSelect: selectItems,
				onItemSelectAll: selectAll,
			});
		}
		return children;
	};

	return (
		<SelectorContext value={contextValue}>
			<div className={cn("w-full", className)} style={{ height }}>
				<div className="flex flex-col h-full">
					{renderChildren()}
				</div>
			</div>
		</SelectorContext>
	);
}

type SelectorContentProps = Omit<React.ComponentProps<'div'>, 'children'> & {
	children: ((props: {
		item: SelectorItem;
		selectedValues: string[];
		selectedItems: SelectorItem[];
		searchValue: string;
		index: number;
		selectItem: (value: string, selected: boolean) => void;
		selectAll: (selected: boolean) => void;
		selectItems: (values: string[], selected: boolean) => void;
	}) => React.ReactNode);
	className?: string;
	itemSize?: number;
	onScroll?: React.ComponentProps<'div'>['onScroll'];
}

export function SelectorContent({ children, className, itemSize = 48, onScroll }: SelectorContentProps) {
	const {
		filteredItems,
		selectedValues,
		selectedItems,
		searchValue,
		selectItem,
		selectAll,
		selectItems,
		handleValueChange,
	} = useListSelector();
	const parentRef = useRef<HTMLDivElement>(null);

	const virtualizer = useVirtualizer({
		count: filteredItems.length,
		estimateSize: () => itemSize,
		overscan: 5,
		getScrollElement: () => parentRef.current,
	});

	return (
		<div
			ref={parentRef}
			className={cn("flex-1 overflow-auto", className)}
			onScroll={onScroll}
		>
			<Listbox
				multiple
				orientation="vertical"
				value={selectedValues}
				onValueChange={(values) => {
					handleValueChange(values as string[]);
				}}
			>
				<div
					style={{
						height: `${virtualizer.getTotalSize()}px`,
						width: '100%',
						position: 'relative',
					}}
				>
					{virtualizer.getVirtualItems().map((virtualItem) => {
						const item = filteredItems[virtualItem.index];
						return (
							<div
								key={item.value}
								style={{
									position: 'absolute',
									width: '100%',
									top: 0,
									left: 0,
									transform: `translateY(${virtualItem.start}px)`,
								}}
							>
								{
									children({
										item,
										selectedValues,
										selectedItems,
										searchValue,
										index: virtualItem.index,
										selectItem,
										selectItems,
										selectAll,
									})
								}
							</div>
						);
					})}
				</div>
			</Listbox>
		</div>
	);
}

interface SelectorSearchProps {
	placeholder?: string;
	className?: string;
	onSearch?: (value: string) => void;
	asyncSearch?: boolean;
}

export function SelectorSearch({
	placeholder = "搜索...",
	className,
	onSearch,
	asyncSearch = false,
}: SelectorSearchProps) {
	const { dataSource, setFilteredItems, searchValue, setSearchValue } = useListSelector();

	function handleSearch(value: string) {
		onSearch?.(value);
		if (!asyncSearch) {
			if (value) {
				const filtered = dataSource.filter(item =>
					item.label.toString().toLowerCase().includes(value.toLowerCase()),
				);
				setFilteredItems(filtered);
			} else {
				setFilteredItems(dataSource);
			}
		}
	}

	const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const value = e.target.value;
		setSearchValue(value);
		handleSearch(value);
	};

	const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
		if (e.key === 'Enter') {
			handleSearch(searchValue);
		}
	};

	return (
		<InputGroup className={className}>
			<InputGroupInput
				placeholder={placeholder}
				value={searchValue}
				onChange={handleChange}
				onKeyDown={handleKeyDown}
			/>
			<InputGroupAddon>
				<SearchIcon className="cursor-pointer" onClick={() => handleSearch(searchValue)} />
			</InputGroupAddon>
		</InputGroup>
	);
}

interface SelectorSelectAllProps {
	className?: string;
}

export function SelectorSelectAll({ className }: SelectorSelectAllProps) {
	const { filteredItems, selectedValues, selectAll } = useListSelector();

	const isAllSelected = filteredItems.length > 0 && filteredItems.every(item => selectedValues.includes(item.value));
	const isSomeSelected = filteredItems.some(item => selectedValues.includes(item.value));

	if (filteredItems.length === 0) return null;

	return (
		<div className={cn("flex items-center mb-2 px-2", className)}>
			<Checkbox
				checked={isAllSelected ? true : isSomeSelected ? "indeterminate" : false}
				onCheckedChange={(value) => selectAll(value === true)}
				className="mr-2"
			/>
			<Label>全选 ({filteredItems.length})</Label>
		</div>
	);
}

type SelectedItems = {
	selectedItems: SelectorItem[];
	selectedValues: string[];
}
interface SelectorContentItemProps {
	item: SelectorItem;
	children?: React.ReactNode;
	className?: string;
	onSelect?: (selected: boolean, item: SelectorItem, selectedItems: SelectedItems) => void;
}
export function SelectorContentItem({
	item,
	children,
	className,
	onSelect,
}: SelectorContentItemProps) {
	const { selectedItems, selectedValues, selectItem, searchValue } = useListSelector();

	const handleSelect = (value: string) => {

		if (item.disabled) return;
		const selected = selectedValues.includes(value);
		// selectItem(value, selected);
		onSelect?.(selected, item, { selectedItems, selectedValues });
	};

	const highlightSearchKeyword = (text: string) => {
		if (!searchValue) return text;

		const parts = text.split(new RegExp(`(${searchValue})`, 'gi'));
		return (
			<span>
				{parts.map((part, index) =>
					part.toLowerCase() === searchValue.toLowerCase() ? (
						<span key={index} className="bg-yellow-200 text-black">{part}</span>
					) : (
						part
					)
				)}
			</span>
		);
	};


	if (children) {
		return (
			<ListboxItem
				asChild
				key={item.value}
				value={item.value}
				disabled={item.disabled}
				onSelect={handleSelect}
				className={cn("ring-0 p-2", className)}
			>
				{children}
			</ListboxItem>
		);
	}

	return (
		<ListboxItem
			key={item.value}
			value={item.value}
			disabled={item.disabled}
			onSelect={handleSelect}
			className={cn("ring-0 p-2", className)}
		>
			<div className="flex items-center overflow-hidden">
				<Checkbox
					checked={selectedValues.includes(item.value)}
					onCheckedChange={() => handleSelect(item.value)}
					disabled={item.disabled}
					className="mr-2"
				/>
				<span className="flex-1 truncate">{highlightSearchKeyword(item.label)}</span>
			</div>
			{selectedValues.includes(item.value) && <ListboxItemIndicator />}
		</ListboxItem>
	);
}

interface SelectorEmptyProps {
	className?: string;
	children?: React.ReactNode;
	emptyText?: string;
	emptyIcon?: React.ReactNode;
}
export function SelectorEmpty({
	className,
	children,
	emptyText = "暂无数据",
	emptyIcon,
}: SelectorEmptyProps) {
	const { filteredItems } = useListSelector();
	return filteredItems.length === 0 ? (
		<div className={cn("h-full text-muted-foreground", className)}>
			{children || (
				<div className="h-full flex-col-center">
					{emptyIcon || <Inbox />}
					<span className="space-y-2">{emptyText}</span>
				</div>
			)}
		</div>
	) : null;
}

