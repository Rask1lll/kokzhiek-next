"use client";

import { useTranslations } from "next-intl";
import { FiSearch } from "react-icons/fi";

type BooksSearchInputProps = {
  value: string;
  onChange: (value: string) => void;
  onSearch?: () => void;
};

export default function BooksSearchInput({
  value,
  onChange,
  onSearch,
}: BooksSearchInputProps) {
  const t = useTranslations("filters");

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && onSearch) {
      onSearch();
    }
  };

  return (
    <div className="flex items-center gap-2">
      <div className="relative flex-1">
        {/* <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" /> */}
        <input
          type="text"
          placeholder={t("searchBooks")}
          className="w-full pl-4 pr-4 py-2.5 rounded-xl border border-gray-300 bg-white text-sm md:text-base outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
        />
      </div>
      <button
        type="button"
        onClick={onSearch}
        className="px-4 py-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors flex items-center gap-2"
      >
        <FiSearch className="w-5 h-5" />
        <span className="hidden sm:inline">{t("search")}</span>
      </button>
    </div>
  );
}
