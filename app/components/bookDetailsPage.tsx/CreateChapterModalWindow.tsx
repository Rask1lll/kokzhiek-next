"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { useModalWindowStore } from "@/app/store/modalWindowStore";
import { useChapters } from "@/app/hooks/useChapters";

export default function CreateChapterModalWindow() {
  const [title, setTitle] = useState("");
  const searchParams = useSearchParams();
  const bookId = searchParams.get("book") ?? "";
  const { createChapter } = useChapters(bookId);
  const { removeContent } = useModalWindowStore();

  return (
    <div className=" bg-white md:w-xs lg:w-md rounded-2xl pb-4">
      <h1 className="border-b p-5 border-gray-300 ">Создание новой главы</h1>
      <div className="py-4 p-2">
        <input
          type="text"
          placeholder="Название главы"
          className="w-full ring-1 p-2 rounded-md"
          value={title}
          onChange={(event) => {
            setTitle(event.target.value);
          }}
        />
      </div>
      <div className="w-full flex justify-end mt-3 px-4">
        <button
          type="button"
          onClick={async () => {
            const res = await createChapter(title);
            if (res?.success) removeContent();
          }}
          className="bg-sky-500/40 p-4 py-2 rounded-lg border-2 border-blue-400 cursor-pointer"
        >
          Создать
        </button>
      </div>
    </div>
  );
}
