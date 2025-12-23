"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";

import CreateBlock from "@/app/components/chatpersPage/CreateBlock";
import LayoutsList from "@/app/components/chatpersPage/editChapter/LayoutsList";
import Layout from "@/app/components/chatpersPage/editChapter/Layout";
import { useModalWindowStore } from "@/app/store/modalWindowStore";
import { useConstructor } from "@/app/hooks/useConstructor";
import { useBlocks } from "@/app/hooks/useBlocks";

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
  const {
    create: createBlock,
    remove: deleteBlock,
    swap: swapBlocks,
  } = useBlocks();

  const [draggedId, setDraggedId] = useState<number | null>(null);

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
      e.preventDefault();
      return;
    }
    setDraggedId(id);
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
  };

  const handleDeleteBlock = (blockId: number) => {
    if (confirm("Вы уверены, что хотите удалить этот блок?")) {
      deleteBlock(blockId);
    }
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
      <div className="lg:w-5/6 w-[95%] space-y-1">
        {blocks.map((block) => (
          <div
            key={block.id}
            draggable={isEditMode}
            onDragStart={
              isEditMode ? (e) => handleDragStart(block.id, e) : undefined
            }
            onDragOver={isEditMode ? handleDragOver : undefined}
            onDrop={isEditMode ? () => handleDrop(block.id) : undefined}
            className={`bg-white flex gap-2 rounded-lg p-1 ${
              isEditMode ? "cursor-move" : "cursor-default"
            } group`}
          >
            <Layout block={block} />
          </div>
        ))}
        {isEditMode && <CreateBlock onClick={handleCreate} />}
      </div>
    </div>
  );
}
