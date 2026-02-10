import { Skeleton } from "@rap/components-base/skeleton";

export function HeaderSkeleton() {
	return (
		<div className="flex items-center justify-between p-4">
			<Skeleton className="h-10 w-40 rounded-md" />
			<div className="flex items-center space-x-4">
				<Skeleton className="h-8 w-24 rounded-md" />
				<Skeleton className="h-8 w-24 rounded-md" />
				<Skeleton className="h-8 w-24 rounded-md" />
				<Skeleton className="h-8 w-24 rounded-md" />
				<Skeleton className="h-8 w-24 rounded-md" />
				<Skeleton className="h-8 w-24 rounded-md" />
			</div>
			<Skeleton className="h-10 w-10 rounded-full" />
		</div>
	);
}
