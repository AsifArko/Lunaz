export function HomeProductCardSkeleton() {
  return (
    <div className="bg-white rounded-2xl overflow-hidden border border-stone-200/80 shadow-sm animate-pulse">
      <div className="aspect-[4/3] bg-stone-200" />
      <div className="p-4 sm:p-5 space-y-3">
        <div className="h-5 bg-stone-200 rounded w-3/4" />
        <div className="h-4 bg-stone-100 rounded w-full" />
        <div className="h-4 bg-stone-100 rounded w-1/2" />
        <div className="flex items-center justify-between pt-3 border-t border-stone-100">
          <div className="h-5 bg-stone-200 rounded w-20" />
          <div className="flex gap-2">
            <div className="h-9 w-14 bg-stone-100 rounded-full" />
            <div className="h-9 w-9 bg-stone-100 rounded-full" />
          </div>
        </div>
      </div>
    </div>
  );
}
