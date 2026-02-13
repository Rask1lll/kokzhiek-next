"use client";

import { useState, useCallback, useRef } from "react";
import { useTranslations } from "next-intl";
import {
  DndContext,
  closestCenter,
  pointerWithin,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragStartEvent,
  DragOverEvent,
  DragOverlay,
  CollisionDetection,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
  arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import CreateChapterButton from "./CreateChapterButton";
import ChapterCard from "./ChapterCard";
import ChapterCardSkeleton from "./ChapterCardSkeleton";
import SectionCard from "./SectionCard";
import { useChaptersStore } from "@/app/store/chaptersStore";
import { useChapters } from "@/app/hooks/useChapters";
import { useSections } from "@/app/hooks/useSections";
import { PresenceUser } from "@/app/hooks/useChapterPresence";
import { useModalWindowStore } from "@/app/store/modalWindowStore";
import CreateSectionModalWindow from "./CreateSectionModalWindow";
import CreateChapterModalWindow from "./CreateChapterModalWindow";
import EditSectionModal from "./EditSectionModal";
import { Section, Chapter } from "@/app/types/chapter";
import {
  handleReorderContent,
  handleReorderSectionChapters,
  handleUpdateChapter,
} from "@/app/services/book/chaptersApi";

type ChaptersContainerProps = {
  isLoading: boolean;
  bookId: string;
  isBookOwner?: boolean;
  isChapterOccupied?: (chapterId: string) => boolean;
  getChapterUsers?: (chapterId: string) => PresenceUser[];
};

// A unified content item: either a section or a standalone chapter
type ContentItem =
  | { type: "section"; id: string; data: Section; order: number }
  | { type: "chapter"; id: string; data: Chapter; order: number };

// Sortable wrapper for SectionCard
function SortableSection({
  section,
  bookId,
  isBookOwner,
  onDeleteChapter,
  onAddChapter,
  onEditSection,
  onDeleteSection,
  isChapterOccupied,
  getChapterUsers,
}: {
  section: Section;
  bookId: string;
  isBookOwner: boolean;
  onDeleteChapter?: (chapterId: string) => Promise<void>;
  onAddChapter: (sectionId: string) => void;
  onEditSection: (sectionId: string) => void;
  onDeleteSection: (sectionId: string) => void;
  isChapterOccupied?: (chapterId: string) => boolean;
  getChapterUsers?: (chapterId: string) => PresenceUser[];
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: `section-${section.id}`, disabled: !isBookOwner });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.3 : 1,
  };

  return (
    <div ref={setNodeRef} style={style}>
      <SectionCard
        section={section}
        bookId={bookId}
        isBookOwner={isBookOwner}
        onDeleteChapter={onDeleteChapter}
        onAddChapter={onAddChapter}
        onEditSection={onEditSection}
        onDeleteSection={onDeleteSection}
        isChapterOccupied={isChapterOccupied}
        getChapterUsers={getChapterUsers}
        dragHandleProps={isBookOwner ? { ...attributes, ...listeners } : undefined}
      />
    </div>
  );
}

// Sortable wrapper for standalone ChapterCard
function SortableChapter({
  chapter,
  bookId,
  isBookOwner,
  onDelete,
  isOccupied,
  occupiedBy,
}: {
  chapter: Chapter;
  bookId: string;
  isBookOwner: boolean;
  onDelete?: (chapterId: string) => Promise<void>;
  isOccupied: boolean;
  occupiedBy: PresenceUser[];
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

  return (
    <div ref={setNodeRef} style={style}>
      <ChapterCard
        chapterId={chapterId}
        title={chapter.title}
        bookid={bookId}
        onDelete={isBookOwner ? onDelete : undefined}
        isOccupied={isOccupied}
        occupiedBy={occupiedBy}
        canEdit={isBookOwner}
        dragHandleProps={isBookOwner ? { ...attributes, ...listeners } : undefined}
      />
    </div>
  );
}

// Helper: find which container a chapter belongs to
function findContainer(
  chapterId: string,
  sections: Section[],
  standaloneChapters: Chapter[]
): { type: "section"; sectionId: number } | { type: "standalone" } | null {
  const numId = Number(chapterId.replace("ch-", ""));
  for (const s of sections) {
    if (s.chapters.some((c) => c.id === numId)) {
      return { type: "section", sectionId: s.id };
    }
  }
  if (standaloneChapters.some((c) => c.id === numId)) {
    return { type: "standalone" };
  }
  return null;
}

export default function ChaptersContainer({
  isLoading: externalLoading,
  bookId,
  isBookOwner = false,
  isChapterOccupied,
  getChapterUsers,
}: ChaptersContainerProps) {
  const { chapters, sections, setSections, setChapters } = useChaptersStore();
  const { deleteChapter } = useChapters(bookId);
  const { deleteSection } = useSections(bookId);
  const { addContent } = useModalWindowStore();
  const t = useTranslations("chapters");

  const [activeId, setActiveId] = useState<string | null>(null);
  const movedChapterRef = useRef<{
    chapterId: number;
    fromSectionId: number | null;
    toSectionId: number | null;
  } | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  // Build unified content list sorted by order
  const contentItems: ContentItem[] = [
    ...sections.map((s) => ({
      type: "section" as const,
      id: `section-${s.id}`,
      data: s,
      order: s.order ?? 0,
    })),
    ...chapters.map((c) => ({
      type: "chapter" as const,
      id: `ch-${c.id}`,
      data: c,
      order: c.order ?? 0,
    })),
  ].sort((a, b) => a.order - b.order);

  const contentIds = contentItems.map((item) => item.id);

  const handleDeleteChapter = async (chapterId: string) => {
    try {
      await deleteChapter(chapterId);
    } catch (err) {
      console.error("Failed to delete chapter:", err);
      throw err;
    }
  };

  const handleAddSection = () => {
    addContent(<CreateSectionModalWindow />);
  };

  const handleAddChapterToSection = (sectionId: string) => {
    addContent(<CreateChapterModalWindow defaultSectionId={sectionId} />);
  };

  const handleEditSection = (sectionId: string) => {
    const section = sections.find((s) => String(s.id) === sectionId);
    if (!section) return;
    addContent(
      <EditSectionModal sectionId={sectionId} currentTitle={section.title} />
    );
  };

  const handleDeleteSectionAction = async (sectionId: string) => {
    const section = sections.find((s) => String(s.id) === sectionId);
    if (!section) return;
    if (!confirm(t("deleteSectionConfirm", { title: section.title }))) return;
    await deleteSection(sectionId);
  };

  // Collision: closestCenter for sortable items, fallback to pointerWithin for droppable zones
  const collisionDetection: CollisionDetection = useCallback(
    (args) => {
      const centerCollisions = closestCenter(args);
      const itemCollisions = centerCollisions.filter(
        (c) =>
          !String(c.id).startsWith("section-drop-") &&
          String(c.id) !== "standalone-drop"
      );
      if (itemCollisions.length > 0) return itemCollisions;
      return pointerWithin(args);
    },
    []
  );

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(String(event.active.id));
    movedChapterRef.current = null;
  };

  // Cross-container chapter moves (into/out of sections)
  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    if (!over) return;

    const activeStr = String(active.id);
    const overStr = String(over.id);

    // Only handle chapter cross-container moves (ch- items moving into/out of sections)
    if (!activeStr.startsWith("ch-")) return;

    const { sections: curSections, chapters: curChapters } =
      useChaptersStore.getState();

    const activeChapterId = Number(activeStr.replace("ch-", ""));
    const activeContainer = findContainer(activeStr, curSections, curChapters);
    if (!activeContainer) return;

    // Determine target container
    let targetSectionId: number | null = null;

    if (overStr.startsWith("section-drop-")) {
      targetSectionId = Number(overStr.replace("section-drop-", ""));
    } else if (overStr.startsWith("ch-")) {
      const overContainer = findContainer(overStr, curSections, curChapters);
      if (!overContainer) return;
      targetSectionId =
        overContainer.type === "section" ? overContainer.sectionId : null;
    } else if (overStr.startsWith("section-")) {
      targetSectionId = Number(overStr.replace("section-", ""));
    } else {
      // Hovering over a standalone chapter or top-level area — target is standalone
      targetSectionId = null;
    }

    const fromSectionId =
      activeContainer.type === "section" ? activeContainer.sectionId : null;

    // Same container — skip
    if (fromSectionId === targetSectionId) return;

    const chapter =
      fromSectionId !== null
        ? curSections
            .find((s) => s.id === fromSectionId)
            ?.chapters.find((c) => c.id === activeChapterId)
        : curChapters.find((c) => c.id === activeChapterId);

    if (!chapter) return;

    // Build new state atomically
    let newSections = curSections;
    let newChapters = curChapters;

    // Remove from source
    if (fromSectionId !== null) {
      newSections = newSections.map((s) =>
        s.id === fromSectionId
          ? { ...s, chapters: s.chapters.filter((c) => c.id !== activeChapterId) }
          : s
      );
    } else {
      newChapters = newChapters.filter((c) => c.id !== activeChapterId);
    }

    // Add to target
    if (targetSectionId !== null) {
      const targetSection = newSections.find((s) => s.id === targetSectionId);
      if (!targetSection) return;

      let insertIndex = targetSection.chapters.length;
      if (overStr.startsWith("ch-")) {
        const overChapterId = Number(overStr.replace("ch-", ""));
        const idx = targetSection.chapters.findIndex((c) => c.id === overChapterId);
        if (idx !== -1) insertIndex = idx;
      }

      const updatedChapters = [...targetSection.chapters];
      updatedChapters.splice(insertIndex, 0, {
        ...chapter,
        section_id: targetSectionId,
      });

      newSections = newSections.map((s) =>
        s.id === targetSectionId ? { ...s, chapters: updatedChapters } : s
      );
    } else {
      // Moving to standalone — give it a high order so it appears at end
      const maxOrder = Math.max(
        ...newChapters.map((c) => c.order ?? 0),
        ...newSections.map((s) => s.order ?? 0),
        0
      );
      newChapters = [
        ...newChapters,
        { ...chapter, section_id: null, order: maxOrder + 1 },
      ];
    }

    useChaptersStore.setState({
      sections: newSections,
      chapters: newChapters,
    });

    movedChapterRef.current = {
      chapterId: activeChapterId,
      fromSectionId,
      toSectionId: targetSectionId,
    };
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);

    if (!over || active.id === over.id) {
      if (movedChapterRef.current) {
        persistChapterMove(movedChapterRef.current);
        movedChapterRef.current = null;
      }
      return;
    }

    const activeStr = String(active.id);
    const overStr = String(over.id);

    const { sections: curSections, chapters: curChapters } =
      useChaptersStore.getState();

    // Top-level content reorder (sections & standalone chapters mixed)
    const isTopLevelActive =
      activeStr.startsWith("section-") ||
      (activeStr.startsWith("ch-") &&
        findContainer(activeStr, curSections, curChapters)?.type === "standalone");
    const isTopLevelOver =
      overStr.startsWith("section-") ||
      (overStr.startsWith("ch-") &&
        findContainer(overStr, curSections, curChapters)?.type === "standalone");

    if (isTopLevelActive && isTopLevelOver) {
      // Build current content list
      const curItems: ContentItem[] = [
        ...curSections.map((s) => ({
          type: "section" as const,
          id: `section-${s.id}`,
          data: s,
          order: s.order ?? 0,
        })),
        ...curChapters.map((c) => ({
          type: "chapter" as const,
          id: `ch-${c.id}`,
          data: c,
          order: c.order ?? 0,
        })),
      ].sort((a, b) => a.order - b.order);

      const curIds = curItems.map((item) => item.id);
      const oldIndex = curIds.indexOf(activeStr);
      const newIndex = curIds.indexOf(overStr);

      if (oldIndex !== -1 && newIndex !== -1 && oldIndex !== newIndex) {
        const reordered = arrayMove(curItems, oldIndex, newIndex);

        // Update orders
        const newSections = curSections.map((s) => {
          const idx = reordered.findIndex((item) => item.id === `section-${s.id}`);
          return idx !== -1 ? { ...s, order: idx } : s;
        });
        const newChapters = curChapters.map((c) => {
          const idx = reordered.findIndex((item) => item.id === `ch-${c.id}`);
          return idx !== -1 ? { ...c, order: idx } : c;
        });

        setSections(newSections);
        setChapters(newChapters);

        // Call new unified reorder endpoint
        handleReorderContent(
          bookId,
          reordered.map((item, i) => ({
            type: item.type,
            id: item.type === "section"
              ? (item.data as Section).id
              : (item.data as Chapter).id,
            order: i,
          }))
        );
      }

      movedChapterRef.current = null;
      return;
    }

    // Chapter reorder within same section
    if (activeStr.startsWith("ch-") && overStr.startsWith("ch-")) {
      const activeContainer = findContainer(activeStr, curSections, curChapters);
      const overContainer = findContainer(overStr, curSections, curChapters);

      if (
        activeContainer?.type === "section" &&
        overContainer?.type === "section" &&
        activeContainer.sectionId === overContainer.sectionId
      ) {
        const sec = curSections.find((s) => s.id === activeContainer.sectionId);
        if (sec) {
          const oldIdx = sec.chapters.findIndex(
            (c) => c.id === Number(activeStr.replace("ch-", ""))
          );
          const newIdx = sec.chapters.findIndex(
            (c) => c.id === Number(overStr.replace("ch-", ""))
          );
          if (oldIdx !== -1 && newIdx !== -1) {
            const reordered = arrayMove(sec.chapters, oldIdx, newIdx).map(
              (c, i) => ({ ...c, order: i })
            );
            setSections(
              curSections.map((s) =>
                s.id === sec.id ? { ...s, chapters: reordered } : s
              )
            );
            handleReorderSectionChapters(
              sec.id,
              reordered.map((c, i) => ({ id: c.id, order: i }))
            );
          }
        }
      }
    }

    // Persist cross-container move
    if (movedChapterRef.current) {
      persistChapterMove(movedChapterRef.current);
      movedChapterRef.current = null;
    }
  };

  const persistChapterMove = (move: {
    chapterId: number;
    fromSectionId: number | null;
    toSectionId: number | null;
  }) => {
    const { chapterId, toSectionId } = move;
    const { sections: curSections, chapters: curChapters } =
      useChaptersStore.getState();

    handleUpdateChapter(chapterId, "", toSectionId).catch((err) =>
      console.error("Failed to move chapter:", err)
    );

    if (toSectionId !== null) {
      const sec = curSections.find((s) => s.id === toSectionId);
      if (sec) {
        handleReorderSectionChapters(
          sec.id,
          sec.chapters.map((c, i) => ({ id: c.id, order: i }))
        );
      }
    } else {
      // Also update top-level content order
      const items: ContentItem[] = [
        ...curSections.map((s) => ({
          type: "section" as const,
          id: `section-${s.id}`,
          data: s,
          order: s.order ?? 0,
        })),
        ...curChapters.map((c) => ({
          type: "chapter" as const,
          id: `ch-${c.id}`,
          data: c,
          order: c.order ?? 0,
        })),
      ].sort((a, b) => a.order - b.order);

      handleReorderContent(
        bookId,
        items.map((item, i) => ({
          type: item.type,
          id: item.type === "section"
            ? (item.data as Section).id
            : (item.data as Chapter).id,
          order: i,
        }))
      );
    }
  };

  const handleDragCancel = () => {
    setActiveId(null);
    movedChapterRef.current = null;
  };

  // Find the active item for overlay
  const activeChapter = activeId?.startsWith("ch-")
    ? (() => {
        const numId = Number(activeId.replace("ch-", ""));
        return (
          chapters.find((c) => c.id === numId) ||
          sections.flatMap((s) => s.chapters).find((c) => c.id === numId)
        );
      })()
    : null;

  const activeSection = activeId?.startsWith("section-")
    ? sections.find((s) => s.id === Number(activeId.replace("section-", "")))
    : null;

  return (
    <section className="space-y-4 mx-10">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900">{t("title")}</h2>
        {isBookOwner && (
          <button
            onClick={handleAddSection}
            className="text-sm text-blue-600 hover:text-blue-700 font-medium transition-colors"
          >
            + {t("addSection")}
          </button>
        )}
      </div>

      {externalLoading ? (
        <div className="grid grid-cols-1 gap-4">
          <ChapterCardSkeleton />
          <ChapterCardSkeleton />
          <ChapterCardSkeleton />
          <ChapterCardSkeleton />
        </div>
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={collisionDetection}
          onDragStart={handleDragStart}
          onDragOver={handleDragOver}
          onDragEnd={handleDragEnd}
          onDragCancel={handleDragCancel}
        >
          <SortableContext items={contentIds} strategy={verticalListSortingStrategy}>
            <div className="space-y-4">
              {contentItems.map((item) => {
                if (item.type === "section") {
                  const section = item.data as Section;
                  return (
                    <SortableSection
                      key={item.id}
                      section={section}
                      bookId={bookId}
                      isBookOwner={isBookOwner}
                      onDeleteChapter={isBookOwner ? handleDeleteChapter : undefined}
                      onAddChapter={handleAddChapterToSection}
                      onEditSection={handleEditSection}
                      onDeleteSection={handleDeleteSectionAction}
                      isChapterOccupied={isChapterOccupied}
                      getChapterUsers={getChapterUsers}
                    />
                  );
                } else {
                  const chapter = item.data as Chapter;
                  const chId = String(chapter.id);
                  const occupied = isChapterOccupied?.(chId) ?? false;
                  const users = getChapterUsers?.(chId) ?? [];
                  return (
                    <SortableChapter
                      key={item.id}
                      chapter={chapter}
                      bookId={bookId}
                      isBookOwner={isBookOwner}
                      onDelete={handleDeleteChapter}
                      isOccupied={occupied}
                      occupiedBy={users}
                    />
                  );
                }
              })}

              {isBookOwner && <CreateChapterButton />}
            </div>
          </SortableContext>

          <DragOverlay
            adjustScale={false}
            dropAnimation={{ duration: 300, easing: "cubic-bezier(0.18, 0.67, 0.6, 1.22)" }}
          >
            {activeSection && (
              <div className="opacity-90 shadow-2xl ring-2 ring-blue-400 rounded-xl">
                <SectionCard
                  section={activeSection}
                  bookId={bookId}
                  isBookOwner={false}
                />
              </div>
            )}
            {activeChapter && (
              <div className="opacity-90 shadow-2xl ring-2 ring-blue-400 rounded-xl">
                <ChapterCard
                  chapterId={String(activeChapter.id)}
                  title={activeChapter.title}
                  bookid={bookId}
                  canEdit={false}
                />
              </div>
            )}
          </DragOverlay>
        </DndContext>
      )}
    </section>
  );
}
