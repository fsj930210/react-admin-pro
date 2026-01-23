import { Skeleton } from "@rap/components-base/skeleton";

export function BreadcrumbSkeleton() {
  return (
    <div className="flex items-center space-x-2">
      <Skeleton className="h-6 w-24 rounded-md" />
      <div className="h-4 w-4 flex items-center justify-center">
        <Skeleton className="h-2 w-2 rounded-full" />
      </div>
      <Skeleton className="h-6 w-32 rounded-md" />
      <div className="h-4 w-4 flex items-center justify-center">
        <Skeleton className="h-2 w-2 rounded-full" />
      </div>
      <Skeleton className="h-6 w-28 rounded-md" />
      <div className="h-4 w-4 flex items-center justify-center">
        <Skeleton className="h-2 w-2 rounded-full" />
      </div>
      <Skeleton className="h-6 w-36 rounded-md" />
    </div>
  );
}
