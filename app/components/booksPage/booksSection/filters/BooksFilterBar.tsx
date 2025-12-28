"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import BooksSearchInput from "./BooksSearchInput";
import BooksStatusFilter from "./BooksStatusFilter";
import BooksSortSelect from "./BooksSortSelect";
import BooksViewModeToggle, { ViewMode } from "./BooksViewModeToggle";
import { BookStatus } from "@/app/types/book";
import { Subject } from "@/app/types/subject";
import { fetchSubjects } from "@/app/services/subjectsApi";

type StatusFilterId = "all" | BookStatus;
type SortId = "recent-desc" | "recent-asc" | "title-asc" | "title-desc";

export type SortBy = "recent" | "title";
export type SortOrder = "asc" | "desc";

export type BooksFilterState = {
  search: string;
  status: StatusFilterId;
  gradeId: number | null;
  subjectId: number | null;
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

const GRADES = [
  { id: 1, label: "1 класс" },
  { id: 2, label: "2 класс" },
  { id: 3, label: "3 класс" },
  { id: 4, label: "4 класс" },
  { id: 5, label: "5 класс" },
  { id: 6, label: "6 класс" },
  { id: 7, label: "7 класс" },
  { id: 8, label: "8 класс" },
  { id: 9, label: "9 класс" },
  { id: 10, label: "10 класс" },
  { id: 11, label: "11 класс" },
  { id: 12, label: "12 класс" },
];

type BooksFilterBarProps = {
  onChange?: (state: BooksFilterState) => void;
};

export default function BooksFilterBar({ onChange }: BooksFilterBarProps) {
  const t = useTranslations("filters");
  const tStatus = useTranslations("status");
  const [search, setSearch] = useState("");
  const [activeStatus, setActiveStatus] = useState<StatusFilterId>("all");
  const [gradeId, setGradeId] = useState<number | null>(null);
  const [subjectId, setSubjectId] = useState<number | null>(null);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [sortOption, setSortOption] = useState<SortId>("recent-desc");
  const [viewMode, setViewMode] = useState<ViewMode>("grid");

  useEffect(() => {
    fetchSubjects().then((res) => {
      if (res?.data) {
        setSubjects(res.data);
      }
    });
  }, []);

  const STATUS_FILTERS = [
    { id: "all", label: t("allBooks") },
    { id: "draft", label: tStatus("draft") },
    { id: "pending", label: tStatus("pending") },
    { id: "published", label: tStatus("published") },
    { id: "archived", label: tStatus("archived") },
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
    const currentStatus = next.status ?? activeStatus;
    const currentGradeId = next.gradeId !== undefined ? next.gradeId : gradeId;
    const currentSubjectId = next.subjectId !== undefined ? next.subjectId : subjectId;

    const fullState: BooksFilterState = {
      search: currentSearch,
      status: currentStatus,
      gradeId: currentGradeId,
      subjectId: currentSubjectId,
      sort: currentSort,
      sortBy,
      sortOrder,
      viewMode: currentViewMode,
    };

    onChange(fullState);
  };

  const handleSearchChange = (value: string) => {
    setSearch(value);
  };

  const handleSearch = () => {
    emitChange({ search });
  };

  const handleStatusChange = (id: string) => {
    const typedId = id as StatusFilterId;
    setActiveStatus(typedId);
    emitChange({ status: typedId });
  };

  const handleGradeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value ? Number(e.target.value) : null;
    setGradeId(value);
    emitChange({ gradeId: value });
  };

  const handleSubjectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value ? Number(e.target.value) : null;
    setSubjectId(value);
    emitChange({ subjectId: value });
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
        <BooksSearchInput value={search} onChange={handleSearchChange} onSearch={handleSearch} />

        <div className="flex flex-col gap-3 md:flex-row md:justify-between">
          <BooksStatusFilter
            filters={STATUS_FILTERS}
            activeFilter={activeStatus}
            onChange={handleStatusChange}
          />

          <div className="max-w-xl flex flex-wrap items-center gap-3 md:justify-end">
            <select
              value={gradeId ?? ""}
              onChange={handleGradeChange}
              className="px-2 py-1.5 rounded-lg border border-gray-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">{t("allGrades")}</option>
              {GRADES.map((grade) => (
                <option key={grade.id} value={grade.id}>
                  {grade.label}
                </option>
              ))}
            </select>
            <select
              value={subjectId ?? ""}
              onChange={handleSubjectChange}
              className="px-2 py-1.5 rounded-lg border border-gray-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">{t("allSubjects")}</option>
              {subjects.map((subject) => (
                <option key={subject.id} value={subject.id}>
                  {subject.name_ru}
                </option>
              ))}
            </select>

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
