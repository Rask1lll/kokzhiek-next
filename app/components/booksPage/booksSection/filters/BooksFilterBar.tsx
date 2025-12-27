"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import BooksSearchInput from "./BooksSearchInput";
import BooksStatusFilter from "./BooksStatusFilter";
import BooksSortSelect from "./BooksSortSelect";
import BooksViewModeToggle, { ViewMode } from "./BooksViewModeToggle";

type FilterId = "all" | "drafts" | "inProgress" | "completed";
type SortId = "recent-desc" | "recent-asc" | "title-asc" | "title-desc";

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
  const t = useTranslations("filters");
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState<FilterId>("all");
  const [sortOption, setSortOption] = useState<SortId>("recent-desc");
  const [viewMode, setViewMode] = useState<ViewMode>("grid");

  const FILTERS = [
    { id: "all", label: t("allBooks") },
    { id: "drafts", label: t("drafts") },
    { id: "inProgress", label: t("inProgress") },
    { id: "completed", label: t("completed") },
  ] as const;

  const SORT_OPTIONS = [
    { id: "recent-desc", label: t("newestFirst") },
    { id: "recent-asc", label: t("oldestFirst") },
    { id: "title-asc", label: t("titleAZ") },
    { id: "title-desc", label: t("titleZA") },
  ] as const;

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
