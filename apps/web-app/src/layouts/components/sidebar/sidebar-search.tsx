import { useSidebar } from "@rap/components-base/sidebar";
import { InputWithClear } from "@rap/components-ui/input-with-clear";
import { cn } from "@rap/utils";
import { Search } from "lucide-react";
import { useState, useRef } from "react";


interface sidebarSearchProps {
	onChange?: (value: string) => void;
}
export function SidebarSearch({ onChange }: sidebarSearchProps) {
	const { state, toggleSidebar } = useSidebar();
	const searchRef = useRef<HTMLInputElement>(null);
	const [searchKeyword, setSearchKeyword] = useState('');


	const handleInputChange = (value: string) => {
		setSearchKeyword(value);
		onChange?.(value);
	};

	const handleClearSearch = () => {
		setSearchKeyword('');
		onChange?.('');
	};
  return (
		<div className="flex-center px-2 py-1">
			<InputWithClear 
				placeholder="搜索菜单" 
				ref={searchRef as React.RefObject<HTMLInputElement>}
				className={cn("w-full", state === 'collapsed' ? 'hidden' : '')}
				onChange={handleInputChange}
				value={searchKeyword}
				onClear={handleClearSearch}
			/>
			<Search 
				className={cn("size-5 cursor-pointer", state === 'expanded' ? 'hidden' : '')} 
				onClick={() => {
					toggleSidebar();
					requestAnimationFrame(() => {
						searchRef.current?.focus?.();
					});
				}} 
			/>
		</div>
	)
}
