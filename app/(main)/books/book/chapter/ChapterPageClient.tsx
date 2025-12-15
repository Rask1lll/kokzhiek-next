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
    setDraggedId(id);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const handleDrop = (targetId: number) => {
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
      <div className="w-5/6 md:w-[95%] space-y-1">
        {blocks.map((block) => (
          <div
            key={block.id}
            draggable
            onDragStart={(e) => handleDragStart(block.id, e)}
            onDragOver={handleDragOver}
            onDrop={() => handleDrop(block.id)}
            // className="bg-white flex gap-2 rounded-lg border border-gray-200 p-4 cursor-move group"
            className="bg-white flex gap-2 rounded-lg p-1 cursor-move group"
          >
            <Layout block={block} />
            <div className="flex flex-col justify-between items-center gap-1">
              <div className="flex flex-col justify-center gap-0 text-gray-400 hover:text-gray-600">
                <p className="h-3 leading-none">::</p>
                <p className="leading-none">::</p>
              </div>
              <button
                onClick={() => handleDeleteBlock(block.id)}
                className="opacity-0 group-hover:opacity-100 transition-opacity text-red-400 hover:text-red-600 text-sm"
                title="Удалить блок"
              >
                ✕
              </button>
            </div>
          </div>
        ))}
        <CreateBlock onClick={handleCreate} />
      </div>
    </div>
  );
}
