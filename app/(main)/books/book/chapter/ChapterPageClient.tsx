"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";

import CreateBlock from "@/app/components/chatpersPage/CreateBlock";
import LayoutsList from "@/app/components/chatpersPage/editChapter/LayoutsList";
import Layout from "@/app/components/chatpersPage/editChapter/Layout";
import { useModalWindowStore } from "@/app/store/modalWindowStore";
import { useConstructor } from "@/app/hooks/useConstructor";
import { useBlocks } from "@/app/hooks/useBlocks";
import { useChapterPresence } from "@/app/hooks/useChapterPresence";
import { useAuth } from "@/app/hooks/useAuth";
import { isAuthor } from "@/app/libs/roles";

export function ChapterPageSkeleton() {
  return (
    <div className="min-h-screen w-screen mt-20 flex flex-col items-center py-10">
      <div className="w-5/6 space-y-6">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 h-32 animate-pulse"
          >
            <div className="bg-gray-200 rounded w-full h-full" />
          </div>
        ))}
      </div>
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

  const [draggedId, setDraggedId] = useState<number | null>(null);
  const [isDragging, setIsDragging] = useState(false);

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
      />
    );
  };

  const handleDragStart = (id: number, e: React.DragEvent<HTMLDivElement>) => {
    if (!isEditMode) {
      console.log("eeee");
      e.preventDefault();
      return;
    }
    setIsDragging(true);
    setDraggedId(id);
    console.log(id);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    if (!isEditMode) {
      e.preventDefault();
      return;
    }
    e.preventDefault();
  };

  const handleDrop = (targetId: number) => {
    if (!isEditMode) return;
    if (!draggedId || draggedId === targetId) return;

    swapBlocks(draggedId, targetId);
    setDraggedId(null);
    setIsDragging(false);
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

  if (isLoading) {
    return <ChapterPageSkeleton />;
  }

  return (
    <div className="min-h-screen w-screen mt-20 flex flex-col items-center py-10">
      {/* <div className="w-5/6 space-y-6"> */}
      <div className="2xl:w-5/6 w-[100%] space-y-1">
        {blocks.map((block) => (
          <div
            key={block.id}
            draggable={isDragging}
            onDragOver={handleDragOver}
            onDrop={() => {
              console.log(!!draggedId);
              console.log("droped");
              handleDrop(block.id);
            }}
            className={`bg-white flex w-full gap-2 rounded-lg p-1 cursor-default group`}
          >
            <Layout
              block={block}
              handleDrop={handleDrop}
              handleDragStart={handleDragStart}
              handleDragOver={handleDragOver}
            />
          </div>
        ))}
        {isEditMode && <CreateBlock onClick={handleCreate} />}
      </div>
    </div>
  );
}
