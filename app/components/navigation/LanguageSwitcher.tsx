"use client";

import { useRef } from "react";

export default function LanguageSwitcher() {
  const divRef = useRef<HTMLDivElement | null>(null);
  return (
    <div className=" z-50 flex gap-1 bg-white rounded-lg shadow-md p-1">
      <div className="relative">
        <div
          ref={divRef}
          className="w-1/2 h-full bg-sky-200 rounded-lg left-0 absolute transition-all duration-300"
        ></div>
        <button
          className="px-3 py-1.5 text-sm font-medium rounded text-gray-600 transition-all"
          onClick={() => {
            divRef.current?.classList.remove("left-[50%]");
            divRef.current?.classList.add("left-[0%]");
          }}
        >
          <span className="relative z-50">ҚАЗ</span>
        </button>
        <button
          onClick={() => {
            divRef.current?.classList.remove("left-[0%]");
            divRef.current?.classList.add("left-[50%]");
          }}
          className="px-3 py-1.5 text-sm font-medium rounded bg-transparent text-gray-600 hover:bg-gray-100 transition-all"
        >
          <span className="relative z-50">РУС</span>
        </button>
      </div>
    </div>
  );
}
