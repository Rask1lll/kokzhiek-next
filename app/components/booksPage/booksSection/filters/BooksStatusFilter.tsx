type BooksStatusFilterProps = {
  filters: ReadonlyArray<{
    id: string;
    label: string;
  }>;
  activeFilter: string;
  onChange: (id: string) => void;
};

export default function BooksStatusFilter({
  filters,
  activeFilter,
  onChange,
}: BooksStatusFilterProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {filters.map((filter) => {
        const isActive = activeFilter === filter.id;

        return (
          <button
            key={filter.id}
            type="button"
            className={`px-3 py-1.5 max-h-9 rounded-full text-xs md:text-sm border transition-all ${
              isActive
                ? "bg-indigo-600 text-white border-indigo-600 shadow-sm"
                : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
            }`}
            onClick={() => onChange(filter.id)}
          >
            {filter.label}
          </button>
        );
      })}
    </div>
  );
}
