import { Skeleton } from '@/components/ui/skeleton';

/** Stream catalogs immediately without splitting the home hero's hydration. */
export default function Loading() {
  return <div className="container py-10 md:py-16" role="status" aria-label="Loading page">
    <span className="sr-only">Opening your next page…</span>
    <Skeleton className="mb-4 h-4 w-36" />
    <Skeleton className="mb-8 h-12 w-3/4 max-w-xl" />
    <Skeleton className="mb-8 h-20 w-full rounded-2xl" />
    <div className="grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-3 xl:grid-cols-4">
      {Array.from({ length: 8 }, (_, index) => <Skeleton key={index} className="h-80 rounded-2xl" />)}
    </div>
  </div>;
}
