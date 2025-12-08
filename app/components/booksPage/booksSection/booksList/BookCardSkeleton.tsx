export default function BookCardSkeleton() {
  return (
    <div className="relative group">
      <div className="block bg-white rounded-xl shadow-lg overflow-hidden animate-pulse">
        {/* Изображение скелетон */}
        <div className="h-80 relative overflow-hidden bg-gradient-to-br from-gray-200 to-gray-300" />

        {/* Контент скелетон */}
        <div className="p-4 h-24 relative">
          <div className="h-5 bg-gray-200 rounded w-3/4 mb-2" />
          <div className="h-4 bg-gray-200 rounded w-1/2 mb-2" />
          <div className="absolute bottom-2 right-4 h-3 bg-gray-200 rounded w-16" />
        </div>
      </div>
    </div>
  );
}
