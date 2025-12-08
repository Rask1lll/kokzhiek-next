"use client";

import CreateBlock from "@/app/components/chatpersPage/CreateBlock";
import LayoutsList from "@/app/components/chatpersPage/editChapter/LayoutsList";
import Layout from "@/app/components/chatpersPage/editChapter/Layout";
import { useBlocksStore } from "@/app/store/blocksStore";
import { useModalWindowStore } from "@/app/store/modalWindowStore";

export default function ChapterPage() {
  const { addContent } = useModalWindowStore();
  const blocks = useBlocksStore((state) => state.blocks);

  const handleCreate = () => {
    addContent(<LayoutsList />);
  };

  return (
    <div className="min-h-screen w-screen flex flex-col items-center py-10">
      <div className="w-4/5 space-y-6">
        <CreateBlock onClick={handleCreate} />

        {blocks.map((block) => (
          <div
            key={block.id}
            className="bg-white rounded-lg shadow-sm border border-gray-200 p-4"
          >
            {Layout(block.layoutCode)}
          </div>
        ))}
      </div>
    </div>
  );
}
