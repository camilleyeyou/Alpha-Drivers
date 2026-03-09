import { cn } from "@/lib/utils";

function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("animate-pulse rounded-md bg-gray-200", className)}
      {...props}
    />
  );
}

function DriverCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-lg border bg-white">
      <div className="flex flex-col sm:flex-row">
        {/* Avatar Section */}
        <div className="flex items-center justify-center bg-gray-100 p-6 sm:w-48">
          <Skeleton className="h-24 w-24 rounded-full" />
        </div>

        {/* Info Section */}
        <div className="flex flex-1 flex-col p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <Skeleton className="h-5 w-32" />
              <Skeleton className="mt-2 h-4 w-24" />
            </div>
            <div className="text-right">
              <Skeleton className="h-7 w-28" />
              <Skeleton className="mt-1 h-4 w-16 ml-auto" />
            </div>
          </div>

          <Skeleton className="mt-3 h-4 w-full" />
          <Skeleton className="mt-1 h-4 w-3/4" />

          <div className="mt-4 flex gap-4">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-4 w-24" />
          </div>

          <div className="mt-3 flex gap-2">
            <Skeleton className="h-6 w-20 rounded-full" />
            <Skeleton className="h-6 w-20 rounded-full" />
          </div>

          <div className="mt-6 flex gap-3">
            <Skeleton className="h-10 flex-1 rounded-md" />
            <Skeleton className="h-10 flex-1 rounded-md" />
          </div>
        </div>
      </div>
    </div>
  );
}

export { Skeleton, DriverCardSkeleton };
