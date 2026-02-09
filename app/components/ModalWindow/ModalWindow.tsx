"use client";

import { useModalWindowStore } from "@/app/store/modalWindowStore";
import { CgClose } from "react-icons/cg";

export default function ModalWindow() {
  const { content, removeContent } = useModalWindowStore();
  if (!content) {
    return <></>;
  }
  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center bg-gray-600/60"
      onClick={(e) => {
        if (e.target === e.currentTarget) removeContent();
      }}
    >
      <div className="relative">
        {content}
        <button
          onClick={() => {
            removeContent();
          }}
          type="button"
          className="rounded-full w-7 h-7 flex items-center justify-center hover:bg-gray-200 text-gray-500 absolute top-0 right-0"
        >
          <span className="text-2xl">×</span>
        </button>
      </div>
    </div>
  );
}
