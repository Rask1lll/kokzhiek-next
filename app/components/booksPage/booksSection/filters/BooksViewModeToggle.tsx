import { BiGridAlt, BiListUl } from "react-icons/bi";

export type ViewMode = "list" | "grid";

type BooksViewModeToggleProps = {
  mode: ViewMode;
  onChange: (mode: ViewMode) => void;
};

export default function BooksViewModeToggle({
  mode,
  onChange,
}: BooksViewModeToggleProps) {
  return (
    <div className="flex items-center gap-1 rounded-xl border border-gray-300 bg-white p-1">
      <button
        type="button"
        className={`flex h-8 w-8 items-center justify-center rounded-lg text-gray-500 transition-all ${
          mode === "list" ? "bg-indigo-50 text-indigo-600" : "hover:bg-gray-100"
        }`}
        onClick={() => onChange("list")}
        title="Показать списком"
      >
        <BiListUl className="h-4 w-4" />
      </button>
      <button
        type="button"
        className={`flex h-8 w-8 items-center justify-center rounded-lg text-gray-500 transition-all ${
          mode === "grid" ? "bg-indigo-50 text-indigo-600" : "hover:bg-gray-100"
        }`}
        onClick={() => onChange("grid")}
        title="Показать как файлы"
      >
        <BiGridAlt className="h-4 w-4" />
      </button>
    </div>
  );
}
