export default function UserSkeletonMobile() {
  return (
    <div className="border-t pt-4">
      <div className="flex items-center gap-2 px-3 mb-3 animate-pulse">
        <div className="w-10 h-10 bg-gray-300 rounded-full" />
        <div className="flex-1">
          <div className="h-4 bg-gray-300 rounded w-32 mb-2" />
          <div className="h-3 bg-gray-300 rounded w-20" />
        </div>
      </div>
    </div>
  );
}

