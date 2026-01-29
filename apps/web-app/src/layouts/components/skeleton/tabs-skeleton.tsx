import { Skeleton } from "@rap/components-base/skeleton";

export function TabsSkeleton() {
  return (
    <div className="flex items-center space-x-4">
      <Skeleton className="h-8 w-30 rounded-md" />
      <Skeleton className="h-8 w-30 rounded-md" />
      <Skeleton className="h-8 w-30 rounded-md" />
      <Skeleton className="h-8 w-30 rounded-md" />
      <Skeleton className="h-8 w-30 rounded-md" />
      <Skeleton className="h-8 w-30 rounded-md" />
    </div>
  );
}
