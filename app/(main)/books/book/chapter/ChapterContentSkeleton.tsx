export default function ChapterContentSkeleton() {
  return (
    <div className="w-5/6 space-y-6">
      {[1, 2, 3].map((i) => (
        <div
          key={i}
          className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 h-32 animate-pulse"
        >
          <div className="bg-gray-200 rounded w-full h-full" />
        </div>
      ))}
    </div>
  );
}
