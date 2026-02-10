import { Skeleton } from "@rap/components-base/skeleton";

export function ContentSkeleton() {
	return (
		<div className="space-y-6">
			<Skeleton className="h-12 w-full rounded-md" />
			<div className="grid grid-cols-3 gap-4">
				<Skeleton className="h-32 w-full rounded-md" />
				<Skeleton className="h-32 w-full rounded-md" />
				<Skeleton className="h-32 w-full rounded-md" />
			</div>
			<div className="grid grid-cols-2 gap-4">
				<Skeleton className="h-40 w-full rounded-md" />
				<Skeleton className="h-40 w-full rounded-md" />
			</div>
			<Skeleton className="h-64 w-full rounded-md" />
			<div className="grid grid-cols-4 gap-4">
				<Skeleton className="h-24 w-full rounded-md" />
				<Skeleton className="h-24 w-full rounded-md" />
				<Skeleton className="h-24 w-full rounded-md" />
				<Skeleton className="h-24 w-full rounded-md" />
			</div>
			{/* <Skeleton className="h-48 w-full rounded-md" /> */}
		</div>
	);
}
