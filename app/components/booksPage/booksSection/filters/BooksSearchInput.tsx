"use client";

import { useTranslations } from "next-intl";

type BooksSearchInputProps = {
  value: string;
  onChange: (value: string) => void;
};

export default function BooksSearchInput({
  value,
  onChange,
}: BooksSearchInputProps) {
  const t = useTranslations("filters");

  return (
    <div className="flex items-center gap-3">
      <input
        type="text"
        placeholder={t("searchBooks")}
        className="w-full px-4 py-2.5 rounded-xl border border-gray-300 bg-white text-sm md:text-base outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}
