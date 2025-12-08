export default function ChapterCardSkeleton() {
  return (
    <div className="flex w-full items-center justify-between rounded-xl border border-gray-200 bg-white px-4 py-3 shadow-sm animate-pulse">
      <div className="flex items-center gap-3 flex-1">
        <div className="h-8 w-8 rounded-full bg-gray-200" />
        <div className="flex-1">
          <div className="h-4 bg-gray-200 rounded w-3/4" />
        </div>
      </div>
      <div className="h-3 w-4 rounded bg-gray-200" />
    </div>
  );
}

