"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { FiChevronDown, FiChevronRight } from "react-icons/fi";
import { useTranslations } from "next-intl";
import { Section, Chapter } from "@/app/types/chapter";

const STORAGE_KEY_OPEN = "kokzhiek-book-toc-sidebar-open";
const STORAGE_KEY_CLOSED_SECTIONS = "kokzhiek-book-toc-closed-sections";

// То же правило, что на странице книги (ChaptersContainer): разделы и главы без раздела в одном списке по order
type TocItem =
  | { type: "section"; order: number; section: Section }
  | { type: "chapter"; order: number; chapter: Chapter };

type BookTocSidebarProps = {
  bookId: string;
  sections: Section[];
  standaloneChapters: Chapter[];
  currentChapterId?: string | null;
  canEdit?: boolean;
};

export default function BookTocSidebar({
  bookId,
  sections,
  standaloneChapters,
  currentChapterId = null,
  canEdit = false,
}: BookTocSidebarProps) {
  const t = useTranslations("chapters");
  const [isOpen, setIsOpen] = useState(false);
  const [allowTransition, setAllowTransition] = useState(false);

  // Восстанавливаем открыт/закрыт сайдбар из localStorage; анимацию не показываем при восстановлении
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_OPEN);
      if (stored !== null) {
        setIsOpen(JSON.parse(stored));
      }
    } catch {
      // ignore
    }
    const t = setTimeout(() => setAllowTransition(true), 0);
    return () => clearTimeout(t);
  }, []);

  const setOpen = (open: boolean) => {
    setIsOpen(open);
    try {
      localStorage.setItem(STORAGE_KEY_OPEN, JSON.stringify(open));
    } catch {
      // ignore
    }
  };

  const sortedContentItems = useMemo<TocItem[]>(
    () =>
      [
        ...sections.map((s) => ({
          type: "section" as const,
          order: s.order ?? 0,
          section: s,
        })),
        ...standaloneChapters.map((c) => ({
          type: "chapter" as const,
          order: c.order ?? 0,
          chapter: c,
        })),
      ].sort((a, b) => a.order - b.order),
    [sections, standaloneChapters]
  );

  const [closedSectionIds, setClosedSectionIds] = useState<Set<number>>(() => new Set());

  // По умолчанию все разделы развёрнуты; восстанавливаем из localStorage только список свёрнутых
  useEffect(() => {
    if (sections.length === 0) return;
    try {
      const stored = localStorage.getItem(STORAGE_KEY_CLOSED_SECTIONS);
      if (stored !== null) {
        const ids = JSON.parse(stored) as number[];
        const valid = new Set(ids.filter((id) => sections.some((s) => s.id === id)));
        setClosedSectionIds(valid);
        return;
      }
    } catch {
      // ignore
    }
    setClosedSectionIds(new Set());
  }, [sections]);

  const toggleSection = (sectionId: number) => {
    setClosedSectionIds((prev) => {
      const next = new Set(prev);
      if (next.has(sectionId)) {
        next.delete(sectionId);
      } else {
        next.add(sectionId);
      }
      try {
        localStorage.setItem(STORAGE_KEY_CLOSED_SECTIONS, JSON.stringify([...next]));
      } catch {
        // ignore
      }
      return next;
    });
  };

  const isSectionExpanded = (sectionId: number) => !closedSectionIds.has(sectionId);

  const chapterHref = (chapterId: number) =>
    canEdit
      ? `/books/book/chapter?chapter=${chapterId}&book=${bookId}&edit=1`
      : `/books/book/chapter?chapter=${chapterId}&book=${bookId}`;

  const isCurrentChapter = (chapterId: number) =>
    currentChapterId !== null && currentChapterId !== undefined && String(chapterId) === currentChapterId;

  const hasContent = sortedContentItems.length > 0;

  return (
    <aside
      className={`hidden lg:flex lg:flex-col lg:shrink-0 lg:border-r lg:border-gray-200 lg:bg-[#F5F6F8] ${
        allowTransition ? "transition-[width] duration-200 ease-out" : ""
      } ${isOpen ? "lg:w-64" : "lg:w-12"}`}
      aria-label={t("title")}
    >
      {isOpen ? (
        <>
          {/* Заголовок + кнопка закрыть — встроены в сайдбар */}
          <div className="sticky top-16 flex items-center justify-between gap-2 py-3 px-2 border-b border-gray-200 shrink-0 bg-[#F5F6F8]">
            <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider truncate">
              {t("title")}
            </h2>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition-colors cursor-w-resize"
              title={t("sidebarClose")}
              aria-expanded={true}
              aria-label={t("sidebarClose")}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                <path d="M15 18l-6-6 6-6" />
              </svg>
            </button>
          </div>
          <div className="sticky top-[calc(5rem+3rem)] py-2 pl-2 pr-2 overflow-y-auto max-h-[calc(100vh-8rem)]">
          {!hasContent ? (
            <p className="text-sm text-gray-400 px-2">{t("empty")}</p>
          ) : (
            <nav className="space-y-0.5">
              {sortedContentItems.map((item) => {
                if (item.type === "section") {
                  const section = item.section;
                  const sectionChapters = [...section.chapters].sort(
                    (a, b) => (a.order ?? 0) - (b.order ?? 0)
                  );
                  const isExpanded = isSectionExpanded(section.id);
                  return (
                    <div key={`section-${section.id}`} className="mb-2">
                      <button
                        type="button"
                        onClick={() => toggleSection(section.id)}
                        className="flex items-center gap-1.5 w-full text-left py-1.5 px-2 rounded-md hover:bg-gray-100 text-gray-900 font-medium text-sm"
                      >
                        {isExpanded ? (
                          <FiChevronDown className="w-4 h-4 shrink-0 text-gray-400" />
                        ) : (
                          <FiChevronRight className="w-4 h-4 shrink-0 text-gray-400" />
                        )}
                        <span className="truncate">{section.title}</span>
                      </button>
                      {isExpanded && (
                        <ul className="ml-5 mt-0.5 space-y-0.5 border-l border-gray-200 pl-2">
                          {sectionChapters.map((chapter) => (
                            <li key={chapter.id}>
                              <Link
                                href={chapterHref(chapter.id)}
                                className={`block py-1.5 px-2 -ml-px text-sm rounded-md truncate ${
                                  isCurrentChapter(chapter.id)
                                    ? "bg-white text-gray-900 font-medium shadow-sm ring-1 ring-gray-200/80"
                                    : "text-gray-600 hover:bg-white/60 hover:text-gray-900"
                                }`}
                              >
                                {chapter.title}
                              </Link>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  );
                }
                const chapter = item.chapter;
                return (
                  <div key={`ch-${chapter.id}`} className="mb-0.5">
                    <Link
                      href={chapterHref(chapter.id)}
                      className={`block py-1.5 px-2 text-sm rounded-md ml-5 pl-2 truncate ${
                        isCurrentChapter(chapter.id)
                          ? "bg-white text-gray-900 font-medium shadow-sm ring-1 ring-gray-200/80"
                          : "text-gray-600 hover:bg-white/60 hover:text-gray-900"
                      }`}
                    >
                      {chapter.title}
                    </Link>
                  </div>
                );
              })}
            </nav>
          )}
          </div>
        </>
      ) : (
        <div className="sticky top-16 flex items-center justify-center py-4 shrink-0">
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="flex h-9 w-9 items-center justify-center rounded-lg p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition-colors"
            title={t("sidebarOpen")}
            aria-expanded={false}
            aria-label={t("sidebarOpen")}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <path d="M9 18l6-6-6-6" />
            </svg>
          </button>
        </div>
      )}
    </aside>
  );
}
