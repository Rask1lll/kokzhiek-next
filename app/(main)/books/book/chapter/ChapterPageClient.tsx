"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragStartEvent,
  DragOverlay,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

import CreateBlock from "@/app/components/chatpersPage/CreateBlock";
import LayoutsList from "@/app/components/chatpersPage/editChapter/LayoutsList";
import Layout from "@/app/components/chatpersPage/editChapter/Layout";
import BookTocSidebar from "@/app/components/bookDetailsPage.tsx/BookTocSidebar";
import { useModalWindowStore } from "@/app/store/modalWindowStore";
import { useConstructor } from "@/app/hooks/useConstructor";
import { useBlocks } from "@/app/hooks/useBlocks";
import { useChapterPresence } from "@/app/hooks/useChapterPresence";
import { useAuth } from "@/app/hooks/useAuth";
import { isAuthor } from "@/app/libs/roles";
import { useChaptersStore } from "@/app/store/chaptersStore";
import { handleGetBook } from "@/app/services/book/booksApi";
import { Block } from "@/app/types/block";
import ChapterContentSkeleton from "./ChapterContentSkeleton";

export function ChapterPageSkeleton() {
  return (
    <div className="min-h-screen w-screen mt-20 flex flex-col items-center py-10">
      <ChapterContentSkeleton />
    </div>
  );
}

// Sortable block wrapper component
function SortableBlock({
  block,
  isEditMode,
}: {
  block: Block;
  isEditMode: boolean;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: block.id, disabled: !isEditMode });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.3 : 1,
    zIndex: isDragging ? 1000 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`
        bg-white flex w-full gap-2 cursor-default group
        ${block.widgets?.some((w) => w.type === "banner") ? "p-0 overflow-hidden" : "p-1 rounded-lg"}
        ${isDragging ? "shadow-2xl ring-2 ring-blue-400" : ""}
      `}
    >
      <Layout
        block={block}
        dragHandleProps={
          isEditMode ? { ...attributes, ...listeners } : undefined
        }
      />
    </div>
  );
}

// Drag overlay component - follows cursor during drag
function DragOverlayContent({ block }: { block: Block }) {
  return (
    <div
      className={`bg-white flex w-full gap-2 shadow-2xl ring-2 ring-blue-400 opacity-90 scale-[0.93] transition-transform ${block.widgets?.some((w) => w.type === "banner") ? "p-0 overflow-hidden" : "p-1 rounded-lg"}`}
    >
      <Layout block={block} />
    </div>
  );
}

export default function ChapterPageClient() {
  const searchParams = useSearchParams();
  const bookId = searchParams.get("book");
  const chapterId = searchParams.get("chapter");
  const isEditMode = searchParams.get("edit") === "1";

  const { addContent, removeContent } = useModalWindowStore();
  const { blocks, isLoading } = useConstructor({ bookId, chapterId });
  const { create: createBlock, swap: swapBlocks } = useBlocks();
  const { user } = useAuth();
  const { joinChapter, leaveChapter } = useChapterPresence(user);
  const { sections, chapters, setSections, setChapters } = useChaptersStore();

  const [activeId, setActiveId] = useState<number | null>(null);

  // Загружаем оглавление книги для сайдбара (разделы и главы)
  useEffect(() => {
    if (!bookId) return;
    let cancelled = false;
    handleGetBook(Number(bookId))
      .then((res) => {
        if (!cancelled && res?.data) {
          setSections(res.data.sections ?? []);
          setChapters(res.data.chapters ?? []);
        }
      })
      .catch((err) => console.error("Error fetching book toc:", err));
    return () => {
      cancelled = true;
    };
  }, [bookId, setSections, setChapters]);

  // Configure sensors for drag detection
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // 8px movement before drag starts
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  // Отправляем join при входе в главу, leave при выходе (только для авторов)
  useEffect(() => {
    if (bookId && chapterId && user && isAuthor(user)) {
      joinChapter(bookId, chapterId);
    }

    return () => {
      if (bookId && chapterId && user && isAuthor(user)) {
        leaveChapter(bookId, chapterId);
      }
    };
  }, [bookId, chapterId, user, joinChapter, leaveChapter]);

  const handleCreate = () => {
    addContent(
      <LayoutsList
        onSelect={(layoutCode) => {
          createBlock(layoutCode);
          removeContent();
        }}
      />,
    );
  };

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as number);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);

    if (over && active.id !== over.id) {
      swapBlocks(active.id as number, over.id as number);
    }
  };

  const handleDragCancel = () => {
    setActiveId(null);
  };

  if (!bookId || !chapterId) {
    return (
      <div className="min-h-screen w-screen mt-20 flex items-center justify-center">
        <p className="text-gray-500 text-lg">
          Не указан идентификатор книги или главы
        </p>
      </div>
    );
  }

  const activeBlock = activeId ? blocks.find((b) => b.id === activeId) : null;

  return (
    <div className="min-h-screen w-screen mt-14 flex">
      {/* Сайдбар с деревом — всегда виден, не перерисовывается при смене главы */}
      {bookId && (
        <BookTocSidebar
          bookId={bookId}
          sections={sections}
          standaloneChapters={chapters}
          currentChapterId={chapterId}
          canEdit={isEditMode}
        />
      )}

      <div className="flex-1 min-w-0 flex flex-col items-center py-10 overflow-y-auto  chapter-scrollbar">
        {isLoading ? (
          <ChapterContentSkeleton />
        ) : (
          <div className="2xl:w-5/6 w-full space-y-1">
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragStart={handleDragStart}
              onDragEnd={handleDragEnd}
              onDragCancel={handleDragCancel}
            >
              <SortableContext
                items={blocks.map((b) => b.id)}
                strategy={verticalListSortingStrategy}
              >
                {blocks.map((block) => (
                  <SortableBlock
                    key={block.id}
                    block={block}
                    isEditMode={isEditMode}
                  />
                ))}
              </SortableContext>

              {/* Drag overlay - the element that follows cursor */}
              <DragOverlay
                adjustScale={false}
                dropAnimation={{
                  duration: 300,
                  easing: "cubic-bezier(0.18, 0.67, 0.6, 1.22)",
                }}
              >
                {activeBlock ? (
                  <DragOverlayContent block={activeBlock} />
                ) : null}
              </DragOverlay>
            </DndContext>

            {isEditMode && <CreateBlock onClick={handleCreate} />}
          </div>
        )}
      </div>
    </div>
  );
}
