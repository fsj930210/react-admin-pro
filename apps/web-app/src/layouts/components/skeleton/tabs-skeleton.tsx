import { Skeleton } from "@rap/components-base/skeleton";

export function TabsSkeleton() {
	return (
		<div className="flex items-center h-9 p-1.5 border-b border-b-border space-x-4">
			<Skeleton className="h-6 w-30 rounded-md" />
			<Skeleton className="h-6 w-30 rounded-md" />
			<Skeleton className="h-6 w-30 rounded-md" />
			<Skeleton className="h-6 w-30 rounded-md" />
			<Skeleton className="h-6 w-30 rounded-md" />
			<Skeleton className="h-6 w-30 rounded-md" />
		</div>
	);
}
