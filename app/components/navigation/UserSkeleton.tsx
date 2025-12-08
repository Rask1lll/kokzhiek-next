export default function UserSkeleton() {
  return (
    <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 rounded-lg animate-pulse">
      <div className="w-8 h-8 bg-gray-300 rounded-full" />
      <div className="hidden sm:block">
        <div className="h-4 bg-gray-300 rounded w-24 mb-1" />
        <div className="h-3 bg-gray-300 rounded w-16" />
      </div>
    </div>
  );
}

