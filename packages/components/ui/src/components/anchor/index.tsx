import { useState, useEffect, useRef } from "react";
import { Button } from "@rap/components-base/button";

interface AnchorItem {
	id: string;
	label: string;
}

interface AnchorProps {
	items: AnchorItem[];
	className?: string;
}

export function Anchor({ items, className = "" }: AnchorProps) {
	const [activeId, setActiveId] = useState<string>(items[0]?.id || "");
	const [activeIndex, setActiveIndex] = useState<number>(0);
	const navRef = useRef<HTMLDivElement>(null);

	// Use IntersectionObserver to track active section
	useEffect(() => {
		if (items.length === 0) return;

		const observerOptions = {
			root: null,
			rootMargin: "-20% 0px -80% 0px",
			threshold: 0,
		};

		const observerCallback: IntersectionObserverCallback = (entries) => {
			entries.forEach((entry) => {
				if (entry.isIntersecting) {
					setActiveId(entry.target.id);
					const index = items.findIndex((item) => item.id === entry.target.id);
					if (index !== -1) {
						setActiveIndex(index);
					}
				}
			});
		};

		const observer = new IntersectionObserver(observerCallback, observerOptions);

		// Observe all sections
		items.forEach((item) => {
			const element = document.getElementById(item.id);
			if (element) {
				observer.observe(element);
			}
		});

		// Clean up observer
		return () => {
			observer.disconnect();
		};
	}, [items]);

	const handleClick = (item: AnchorItem, index: number) => {
		const element = document.getElementById(item.id);
		if (element) {
			element.scrollIntoView({ behavior: "smooth" });
			setActiveId(item.id);
			setActiveIndex(index);
		}
	};

	return (
		<div className={`fixed right-4 top-1/4 p-1 ${className}`}>
			<div className="relative">
				{/* Left slide track */}
				<div className="absolute left-0 top-0 bottom-0 w-px bg-gray-300 dark:bg-gray-600 rounded-full">
					{/* Sliding highlight block */}
					<div
						className="absolute left-1/2 transform -translate-x-1/2 w-1 bg-primary rounded-full transition-all duration-300 ease-in-out"
						style={{
							top: `${(activeIndex / items.length) * 100}%`,
							height: `${100 / items.length}%`,
						}}
					/>
				</div>

				{/* Category buttons */}
				<div ref={navRef} className="ml-4 space-y-4">
					{items.map((item, index) => (
						<Button
							variant="link"
							key={item.id}
							className={`block py-1 px-2 rounded text-sm whitespace-nowrap transition-all ${
								activeId === item.id
									? "text-primary font-medium"
									: "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
							}`}
							aria-label={item.label}
							onClick={() => handleClick(item, index)}
						>
							{item.label}
						</Button>
					))}
				</div>
			</div>
		</div>
	);
}
