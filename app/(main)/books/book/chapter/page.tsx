"use client";

import { useState } from "react";

import CreateBlock from "@/app/components/chatpersPage/CreateBlock";
import LayoutsList from "@/app/components/chatpersPage/editChapter/LayoutsList";
import Layout from "@/app/components/chatpersPage/editChapter/Layout";
import { useBlocksStore } from "@/app/store/blocksStore";
import { useModalWindowStore } from "@/app/store/modalWindowStore";

export default function ChapterPage() {
  const { addContent } = useModalWindowStore();
  const blocks = useBlocksStore((state) => state.blocks);
  const swapBlocks = useBlocksStore((state) => state.swapBlocks);
  const [draggedId, setDraggedId] = useState<string | null>(null);

  const handleCreate = () => {
    addContent(<LayoutsList />);
  };

  const handleDragStart = (id: string, e: React.DragEvent<HTMLDivElement>) => {
    setDraggedId(id);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const handleDrop = (targetId: string) => {
    if (!draggedId || draggedId === targetId) return;

    swapBlocks(draggedId, targetId);

    const newOrder = useBlocksStore
      .getState()
      .blocks.map((b) => ({ id: b.id, order: b.order }));

    console.log("Blocks swapped", {
      fromId: draggedId,
      toId: targetId,
      newOrder,
    });

    setDraggedId(null);
  };

  return (
    <div className="min-h-screen w-screen mt-20 flex flex-col items-center py-10">
      <div className="w-5/6 space-y-6">
        {blocks.map((block) => (
          <div
            key={block.id}
            draggable
            onDragStart={(e) => handleDragStart(block.id, e)}
            onDragOver={handleDragOver}
            onDrop={() => handleDrop(block.id)}
            className="bg-white flex gap-2 rounded-lg shadow-sm border border-gray-200 p-4 cursor-move"
          >
            <Layout block={block} />
            <div className="flex flex-col justify-center gap-0">
              <p className="h-3">::</p>
              <p>::</p>
            </div>
          </div>
        ))}
        <CreateBlock onClick={handleCreate} />
      </div>
    </div>
  );
}
