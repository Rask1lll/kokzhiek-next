"use client";

import { useState } from "react";
import { FiChevronDown, FiChevronRight, FiEdit2, FiTrash2, FiPlus } from "react-icons/fi";
import { PiDotsNine } from "react-icons/pi";
import { useTranslations } from "next-intl";
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { useDroppable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { Section, Chapter } from "@/app/types/chapter";
import ChapterCard from "./ChapterCard";
import { PresenceUser } from "@/app/hooks/useChapterPresence";

type SectionCardProps = {
  section: Section;
  bookId: string;
  isBookOwner?: boolean;
  onDeleteChapter?: (chapterId: string) => Promise<void>;
  onEditSection?: (sectionId: string) => void;
  onDeleteSection?: (sectionId: string) => void;
  onAddChapter?: (sectionId: string) => void;
  isChapterOccupied?: (chapterId: string) => boolean;
  getChapterUsers?: (chapterId: string) => PresenceUser[];
  dragHandleProps?: Record<string, unknown>;
};

// Sortable chapter inside section
export function SortableChapterInSection({
  chapter,
  bookId,
  isBookOwner,
  onDeleteChapter,
  isChapterOccupied,
  getChapterUsers,
}: {
  chapter: Chapter;
  bookId: string;
  isBookOwner: boolean;
  onDeleteChapter?: (chapterId: string) => Promise<void>;
  isChapterOccupied?: (chapterId: string) => boolean;
  getChapterUsers?: (chapterId: string) => PresenceUser[];
}) {
  const chapterId = String(chapter.id);
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: `ch-${chapter.id}`, disabled: !isBookOwner });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.3 : 1,
  };

  const occupied = isChapterOccupied?.(chapterId) ?? false;
  const users = getChapterUsers?.(chapterId) ?? [];

  return (
    <div ref={setNodeRef} style={style}>
      <ChapterCard
        chapterId={chapterId}
        title={chapter.title}
        bookid={bookId}
        onDelete={isBookOwner ? onDeleteChapter : undefined}
        isOccupied={occupied}
        occupiedBy={users}
        canEdit={isBookOwner}
        dragHandleProps={isBookOwner ? { ...attributes, ...listeners } : undefined}
      />
    </div>
  );
}

export default function SectionCard({
  section,
  bookId,
  isBookOwner = false,
  onDeleteChapter,
  onEditSection,
  onDeleteSection,
  onAddChapter,
  isChapterOccupied,
  getChapterUsers,
  dragHandleProps,
}: SectionCardProps) {
  const t = useTranslations("chapters");
  const [isExpanded, setIsExpanded] = useState(true);

  const chapterIds = section.chapters.map((c) => `ch-${c.id}`);

  // Droppable zone so empty sections can accept chapters
  const { setNodeRef: setDroppableRef } = useDroppable({
    id: `section-drop-${section.id}`,
    data: { type: "section", sectionId: section.id },
  });

  return (
    <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
      {/* Section header */}
      <div
        className="flex items-center justify-between px-5 py-3.5 bg-gradient-to-r from-blue-50 to-indigo-50 cursor-pointer select-none group"
        onClick={() => setIsExpanded((v) => !v)}
      >
        <div className="flex items-center gap-3 min-w-0">
          {dragHandleProps && (
            <div
              {...dragHandleProps}
              onClick={(e: React.MouseEvent) => e.stopPropagation()}
              className="cursor-grab active:cursor-grabbing text-gray-300 hover:text-gray-500 transition-colors"
            >
              <PiDotsNine className="w-5 h-5" />
            </div>
          )}
          {isExpanded ? (
            <FiChevronDown className="w-5 h-5 text-blue-500 shrink-0" />
          ) : (
            <FiChevronRight className="w-5 h-5 text-blue-500 shrink-0" />
          )}
          <h3 className="text-sm font-semibold text-gray-900 truncate">
            {section.title}
          </h3>
          <span className="text-xs text-gray-400 shrink-0">
            {section.chapters.length} {section.chapters.length === 1 ? t("lessonCount_one") : t("lessonCount_other")}
          </span>
        </div>

        {isBookOwner && (
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onEditSection?.(String(section.id));
              }}
              className="p-1.5 rounded-lg hover:bg-blue-100 text-gray-400 hover:text-blue-500 transition-colors"
              title={t("edit")}
            >
              <FiEdit2 className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDeleteSection?.(String(section.id));
              }}
              className="p-1.5 rounded-lg hover:bg-red-100 text-gray-400 hover:text-red-500 transition-colors"
              title={t("delete")}
            >
              <FiTrash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>

      {/* Chapters inside section */}
      {isExpanded && (
        <div ref={setDroppableRef} className="px-4 py-3 space-y-2 bg-gray-50/50 min-h-[40px]">
          <SortableContext items={chapterIds} strategy={verticalListSortingStrategy}>
            {section.chapters.map((chapter) => (
              <SortableChapterInSection
                key={chapter.id}
                chapter={chapter}
                bookId={bookId}
                isBookOwner={isBookOwner}
                onDeleteChapter={onDeleteChapter}
                isChapterOccupied={isChapterOccupied}
                getChapterUsers={getChapterUsers}
              />
            ))}
          </SortableContext>

          {section.chapters.length === 0 && (
            <div className="text-center text-xs text-gray-400 py-2">
              {t("add")}
            </div>
          )}

          {isBookOwner && (
            <button
              onClick={() => onAddChapter?.(String(section.id))}
              className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-gray-500 hover:text-blue-600 border-2 border-dashed border-gray-200 hover:border-blue-300 rounded-xl transition-colors hover:bg-blue-50/50"
            >
              <FiPlus className="w-4 h-4" />
              {t("add")}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
