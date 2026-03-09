import { Navbar } from "@/components/layout/navbar";
import { Skeleton, DriverCardSkeleton } from "@/components/ui/skeleton";

export default function DriversLoading() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-gray-50">
        <section className="bg-white border-b">
          <div className="container-app py-8">
            <Skeleton className="h-4 w-48" />
            <Skeleton className="mt-4 h-8 w-72" />
            <Skeleton className="mt-2 h-5 w-56" />
            <div className="mt-6 flex gap-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-9 w-24 rounded-md" />
              ))}
            </div>
          </div>
        </section>
        <section className="container-app py-8">
          <div className="flex flex-col gap-6 lg:flex-row">
            <aside className="w-full lg:w-64 shrink-0">
              <div className="rounded-xl bg-white p-6 shadow-sm">
                <Skeleton className="h-6 w-20" />
                <div className="mt-6 space-y-6">
                  <Skeleton className="h-10 w-full rounded-md" />
                  <div className="grid grid-cols-2 gap-2">
                    <Skeleton className="h-10 rounded-md" />
                    <Skeleton className="h-10 rounded-md" />
                  </div>
                  <div className="space-y-2">
                    <Skeleton className="h-5 w-16" />
                    <Skeleton className="h-5 w-24" />
                    <Skeleton className="h-5 w-20" />
                  </div>
                </div>
              </div>
            </aside>
            <div className="flex-1 space-y-6">
              {Array.from({ length: 3 }).map((_, i) => (
                <DriverCardSkeleton key={i} />
              ))}
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
