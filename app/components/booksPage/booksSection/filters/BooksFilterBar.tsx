"use client";

import { useState } from "react";
import BooksSearchInput from "./BooksSearchInput";
import BooksStatusFilter from "./BooksStatusFilter";
import BooksSortSelect from "./BooksSortSelect";
import BooksViewModeToggle, { ViewMode } from "./BooksViewModeToggle";

const FILTERS = [
  { id: "all", label: "Все книги" },
  { id: "drafts", label: "Черновики" },
  { id: "inProgress", label: "В процессе" },
  { id: "completed", label: "Завершено" },
] as const;

const SORT_OPTIONS = [
  { id: "recent", label: "Недавние" },
  { id: "title", label: "По названию" },
  { id: "progress", label: "По прогрессу" },
] as const;

type FilterId = (typeof FILTERS)[number]["id"];
type SortId = (typeof SORT_OPTIONS)[number]["id"];

export type BooksFilterState = {
  search: string;
  filter: FilterId;
  sort: SortId;
  viewMode: ViewMode;
};

type BooksFilterBarProps = {
  onChange?: (state: BooksFilterState) => void;
};

export default function BooksFilterBar({ onChange }: BooksFilterBarProps) {
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState<FilterId>("all");
  const [sortBy, setSortBy] = useState<SortId>("recent");
  const [viewMode, setViewMode] = useState<ViewMode>("grid");

  const emitChange = (next: Partial<BooksFilterState>) => {
    if (!onChange) return;

    const fullState: BooksFilterState = {
      search,
      filter: activeFilter,
      sort: sortBy,
      viewMode,
      ...next,
    };

    onChange(fullState);
  };

  const handleSearchChange = (value: string) => {
    setSearch(value);
    emitChange({ search: value });
  };

  const handleFilterChange = (id: string) => {
    const typedId = id as FilterId;
    setActiveFilter(typedId);
    emitChange({ filter: typedId });
  };

  const handleSortChange = (id: string) => {
    const typedId = id as SortId;
    setSortBy(typedId);
    emitChange({ sort: typedId });
  };

  const handleViewModeChange = (mode: ViewMode) => {
    setViewMode(mode);
    emitChange({ viewMode: mode });
  };

  return (
    <div className="w-full px-12 py-6">
      <div className="flex flex-col gap-4">
        <BooksSearchInput value={search} onChange={handleSearchChange} />

        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <BooksStatusFilter
            filters={FILTERS}
            activeFilter={activeFilter}
            onChange={handleFilterChange}
          />

          <div className="flex items-center justify-between gap-3 md:justify-end">
            <BooksSortSelect
              options={SORT_OPTIONS}
                value={sortBy}
              onChange={handleSortChange}
            />

            <BooksViewModeToggle
              mode={viewMode}
              onChange={handleViewModeChange}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
