import { Checkbox } from "./checkbox";
import { Label } from "./label";
import { cn } from "@rap/utils";
import { useState, useEffect, createContext, use, useMemo, useRef, useCallback } from 'react'
import { Inbox, SearchIcon, Check } from 'lucide-react'
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


export function useSelector() {
	const context = use(SelectorContext);
	if (!context) {
		throw new Error("useSelector must be used within a Selector");
	}
	return context;
}

export interface SelectorProps {
	dataSource: SelectorItem[];
	children?: React.ReactNode | ((props: {
		filteredItems: SelectorItem[];
		selectedValues: string[];
		selectedItems: SelectorItem[];
		searchValue: string;
		onItemSelect: (value: string, selected: boolean) => void;
		onItemsSelect: (values: string[], selected: boolean) => void;
		onItemSelectAll: (selected: boolean) => void;
	}) => React.ReactNode);
	defaultValue?: string[];
	value?: string[];
	onChange?: (value: string[], selectedItems: SelectorItem[]) => void;
}

export function Selector({
	dataSource,
	defaultValue,
	value,
	children,
	onChange,
}: SelectorProps) {
	const [filteredItems, setFilteredItems] = useState<SelectorItem[]>([]);
	const [internalSelectedValues, setInternalSelectedValues] = useState<string[]>(defaultValue || []);
	const [searchValue, setSearchValue] = useState("");

	const isControlled = value !== undefined;
	const selectedValues = isControlled ? value : internalSelectedValues;

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
		if (!isControlled) {
			setInternalSelectedValues(newValues);
		}
		onChange?.(newValues, dataSource.filter(item => newValues.includes(item.value)));
	}, [isControlled, onChange, dataSource]);

	const selectItem = useCallback((value: string, selected: boolean) => {
		let newValues: string[];
		if (selected) {
			newValues = selectedValues.filter(v => v !== value);
		} else {
			newValues = [...selectedValues, value];
		}
		handleValueChange(newValues);
	}, [selectedValues, handleValueChange]);

	const selectItems = useCallback((values: string[], selected: boolean) => {
		let newValues: string[];
		if (selected) {
			newValues = values;
		} else {
			newValues = selectedValues.filter(v => !values.includes(v));
		}
		handleValueChange(newValues);
	}, [selectedValues, handleValueChange]);

	const selectAll = useCallback((selected: boolean) => {
		let newValues: string[];
		if (selected) {
			newValues = filteredItems.map(item => item.value);
		} else {
			newValues = [];
		}
		handleValueChange(newValues);
	}, [filteredItems, handleValueChange]);

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
		if (children) {
			return children;
		}
		return (
			<SelectorContent>
				{({ item }) => (
					<SelectorContentItem item={item} />
				)}
			</SelectorContent>
		);
	};

	return (
		<SelectorContext value={contextValue}>
			{renderChildren()}
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
	} = useSelector();
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
			className={cn("h-100 flex-1 overflow-auto", className)}
			onScroll={onScroll}
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
	const { dataSource, setFilteredItems, searchValue, setSearchValue } = useSelector();

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
	const { filteredItems, selectedValues, selectAll } = useSelector();

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
	const { selectedItems, selectedValues, selectItem, searchValue } = useSelector();

	const handleSelect = () => {
		if (item.disabled) return;
		const selected = selectedValues.includes(item.value);
		selectItem(item.value, selected);
		onSelect?.(selected, item, { selectedItems, selectedValues });
	};

	const handleCheckboxChange = () => {
		if (item.disabled) return;
		const selected = selectedValues.includes(item.value);
		selectItem(item.value, selected);
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

	const isSelected = selectedValues.includes(item.value);

	if (children) {
		return (
			<div
				className={cn(
					"flex w-full cursor-pointer select-none items-center justify-between gap-2 rounded-md p-4 outline-hidden focus-visible:ring-ring data-disabled:pointer-events-none data-disabled:opacity-50 data-highlighted:bg-accent data-highlighted:text-accent-foreground hover:bg-accent",
					item.disabled && "opacity-50 pointer-events-none cursor-not-allowed",
					className
				)}
				onClick={handleSelect}
			>
				{children}
			</div>
		);
	}

	return (
		<div
			className={cn(
				"flex w-full cursor-pointer select-none items-center justify-between gap-2 rounded-md p-2 outline-hidden focus-visible:ring-ring data-disabled:pointer-events-none data-disabled:opacity-50 hover:bg-accent",
				item.disabled && "opacity-50 pointer-events-none cursor-not-allowed",
				isSelected && "bg-accent/50",
				className
			)}
			onClick={handleSelect}
		>
			<div className="flex items-center overflow-hidden">
				<div onClick={(e) => e.stopPropagation()} className="mr-2">
					<Checkbox
						checked={isSelected}
						onCheckedChange={handleCheckboxChange}
						disabled={item.disabled}
					/>
				</div>
				<span className="flex-1 truncate">{highlightSearchKeyword(item.label)}</span>
			</div>
			{isSelected && (
				<Check className="size-4 text-green-500" />
			)}
		</div>
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
	const { filteredItems } = useSelector();
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