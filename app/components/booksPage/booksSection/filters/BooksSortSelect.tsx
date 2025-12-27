"use client";

import { useTranslations } from "next-intl";

type BooksSortSelectProps = {
  options: ReadonlyArray<{
    id: string;
    label: string;
  }>;
  value: string;
  onChange: (id: string) => void;
};

export default function BooksSortSelect({
  options,
  value,
  onChange,
}: BooksSortSelectProps) {
  const t = useTranslations("filters");

  return (
    <div className="flex items-center gap-2">
      <span className="hidden text-xs text-gray-500 md:inline">
        {t("sort")}:
      </span>
      <select
        className="px-3 py-1.5 rounded-xl border border-gray-300 bg-white text-xs md:text-sm outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      >
        {options.map((option) => (
          <option key={option.id} value={option.id}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}
