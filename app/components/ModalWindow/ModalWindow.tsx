"use client";

import { useModalWindowStore } from "@/app/store/modalWindowStore";
import { CgClose } from "react-icons/cg";

export default function ModalWindow() {
  const { content, removeContent } = useModalWindowStore();
  if (!content) {
    return <></>;
  }
  return (
    <div className="w-full h-full flex items-center justify-center fixed top-0 z-50 bg-gray-600/60">
      <div className="relative w-fit">
        {content}{" "}
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
