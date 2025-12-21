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
  { id: "recent-desc", label: "Сначала новые" },
  { id: "recent-asc", label: "Сначала старые" },
  { id: "title-asc", label: "По названию (А-Я)" },
  { id: "title-desc", label: "По названию (Я-А)" },
] as const;

type FilterId = (typeof FILTERS)[number]["id"];
type SortId = (typeof SORT_OPTIONS)[number]["id"];

export type SortBy = "recent" | "title";
export type SortOrder = "asc" | "desc";

export type BooksFilterState = {
  search: string;
  filter: FilterId;
  sort: SortId;
  sortBy: SortBy;
  sortOrder: SortOrder;
  viewMode: ViewMode;
};

function parseSortOption(sortId: SortId): {
  sortBy: SortBy;
  sortOrder: SortOrder;
} {
  const [sortBy, sortOrder] = sortId.split("-") as [SortBy, SortOrder];
  return { sortBy, sortOrder };
}

type BooksFilterBarProps = {
  onChange?: (state: BooksFilterState) => void;
};

export default function BooksFilterBar({ onChange }: BooksFilterBarProps) {
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState<FilterId>("all");
  const [sortOption, setSortOption] = useState<SortId>("recent-desc");
  const [viewMode, setViewMode] = useState<ViewMode>("grid");

  const emitChange = (next: Partial<BooksFilterState>) => {
    if (!onChange) return;

    const currentSort = next.sort ?? sortOption;
    const { sortBy, sortOrder } = parseSortOption(currentSort);
    const currentViewMode = next.viewMode ?? viewMode;
    const currentSearch = next.search ?? search;
    const currentFilter = next.filter ?? activeFilter;

    const fullState: BooksFilterState = {
      search: currentSearch,
      filter: currentFilter,
      sort: currentSort,
      sortBy,
      sortOrder,
      viewMode: currentViewMode,
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
    setSortOption(typedId);
    emitChange({ sort: typedId });
  };

  const handleViewModeChange = (mode: ViewMode) => {
    setViewMode(mode);
    // Explicitly pass the new mode to ensure it's used
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
              value={sortOption}
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
