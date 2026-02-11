"use client";

import { useState } from "react";
import { FiX, FiZoomIn } from "react-icons/fi";

type ImageViewProps = {
  value: string;
  text?: string;
};

export default function ImageView({ value, text }: ImageViewProps) {
  const [isOpen, setIsOpen] = useState(false);

  if (!value) {
    return (
      <div className="w-full h-48 bg-gray-100 rounded-lg flex items-center justify-center text-gray-400">
        Изображение не загружено
      </div>
    );
  }

  return (
    <>
      <div className="w-full p-2 space-y-2">
        {text && <p className="text-lg font-medium text-gray-800">{text}</p>}
        <img
          onClick={() => setIsOpen(true)}
          src={value}
          alt={text || "Image"}
          className="cursor-zoom-in  w-full h-auto max-h-[500px] object-contain rounded-lg"
        />
      </div>

      {isOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 cursor-zoom-out"
          onClick={() => setIsOpen(false)}
        >
          <button
            onClick={() => setIsOpen(false)}
            className="absolute top-4 right-4 p-2 text-white/70 hover:text-white rounded-full hover:bg-white/10 transition-colors z-10"
          >
            <FiX className="w-6 h-6" />
          </button>
          <img
            src={value}
            alt={text || "Image"}
            className="max-w-[90vw] max-h-[90vh] object-contain rounded-lg"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </>
  );
}
