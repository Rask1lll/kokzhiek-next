export default function BookInfoCardSkeleton() {
  return (
    <section className="rounded-2xl bg-white shadow-md border border-gray-200 p-5 md:p-6 flex gap-5 mx-10 animate-pulse">
      {/* Обложка скелетон */}
      <div className="relative flex-shrink-0">
        <div className="rounded-xl bg-gray-200 w-[150px] h-[200px] md:w-[180px] md:h-[240px]" />
      </div>

      {/* Основная информация скелетон */}
      <div className="flex flex-1 flex-col gap-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1">
            <div className="h-7 md:h-8 bg-gray-200 rounded w-3/4 mb-2" />
            <div className="h-4 bg-gray-200 rounded w-1/3" />
          </div>

          <div className="h-9 bg-gray-200 rounded-lg w-32" />
        </div>

        {/* Метаданные скелетон */}
        <div className="flex flex-wrap gap-2">
          <div className="h-6 bg-gray-200 rounded-full w-24" />
          <div className="h-6 bg-gray-200 rounded-full w-28" />
          <div className="h-6 bg-gray-200 rounded-full w-32" />
          <div className="h-6 bg-gray-200 rounded-full w-20" />
        </div>

        {/* Описание скелетон */}
        <div className="mt-1 space-y-2">
          <div className="h-4 bg-gray-200 rounded w-full" />
          <div className="h-4 bg-gray-200 rounded w-5/6" />
          <div className="h-4 bg-gray-200 rounded w-4/6" />
        </div>
      </div>
    </section>
  );
}

