import { useState, useEffect, useRef, type HTMLAttributes } from "react";
import { Button } from "@rap/components-ui/button";

interface AnchorItem {
	id: string;
	label: string;
}

interface AnchorProps extends HTMLAttributes<HTMLDivElement> {
	items: AnchorItem[];
	direction?: "vertical" | "horizontal";
}

export function Anchor({ items, className = "", direction = "vertical", ...props }: AnchorProps) {
	const [activeId, setActiveId] = useState<string>(items[0]?.id || "");
	const [activeIndex, setActiveIndex] = useState<number>(0);
	const navRef = useRef<HTMLDivElement>(null);

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

		items.forEach((item) => {
			const element = document.getElementById(item.id);
			if (element) {
				observer.observe(element);
			}
		});

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
		<div className={`relative ${className}`} {...props}>
			{direction === "vertical" ? (
				<div className="absolute left-0 top-0 bottom-0 w-px bg-anchor-border rounded-full">
					<div
						className="absolute left-1/2 transform -translate-x-1/2 w-1 bg-primary rounded-full transition-all duration-300 ease-in-out"
						style={{
							top: `${(activeIndex / items.length) * 100}%`,
							height: `${100 / items.length}%`,
						}}
					/>
				</div>
			) : (
				<div className="absolute left-0 right-0 bottom-0 h-px bg-anchor-border rounded-full">
					<div
						className="absolute top-1/2 transform -translate-y-1/2 h-1 bg-primary rounded-full transition-all duration-300 ease-in-out"
						style={{
							left: `${(activeIndex / items.length) * 100}%`,
							width: `${100 / items.length}%`,
						}}
					/>
				</div>
			)}

			<div ref={navRef} className={`${direction === "vertical" ? "ml-4 space-y-4" : "mb-4 flex space-x-4"}`}>
				{items.map((item, index) => (
					<Button
						variant="link"
						key={item.id}
						className={`block py-1 px-2 rounded text-sm whitespace-nowrap transition-all ${activeId === item.id
							? "text-primary font-medium"
							: "text-anchor-foreground hover:text-anchor-foreground-hover"
							}`}
						aria-label={item.label}
						onClick={() => handleClick(item, index)}
					>
						{item.label}
					</Button>
				))}
			</div>
		</div>
	);
}
