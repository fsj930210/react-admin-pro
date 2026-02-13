import { Skeleton } from "@rap/components-base/skeleton";
import { BreadcrumbSkeleton } from "./breadcrumb-skeleton";
import type { ReactNode } from "react";


interface HeaderSkeletonProps {
	className?: string;
	children?: ReactNode;
}
export function HeaderSkeleton({ className, children }: HeaderSkeletonProps) {
	return (
		<div className={`flex items-center justify-between h-11 p-2 bg-background border-b border-b-border ${className}`}>
			{children ?? <BreadcrumbSkeleton />}
			<div className="flex items-center space-x-4">
				<Skeleton className="h-6 w-6 rounded-full" />
				<Skeleton className="h-6 w-6 rounded-full" />
				<Skeleton className="h-6 w-6 rounded-full" />
				<Skeleton className="h-6 w-6 rounded-full" />
				<Skeleton className="h-6 w-6 rounded-full" />
				<Skeleton className="h-6 w-6 rounded-full" />
				<Skeleton className="h-6 w-6 rounded-full" />
			</div>
		</div>
	);
}
