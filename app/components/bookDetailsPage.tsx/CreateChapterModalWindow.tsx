"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { useModalWindowStore } from "@/app/store/modalWindowStore";
import { useChapters } from "@/app/hooks/useChapters";

export default function CreateChapterModalWindow() {
  const t = useTranslations("chapters");
  const [title, setTitle] = useState("");
  const searchParams = useSearchParams();
  const bookId = searchParams.get("book") ?? "";
  const { createChapter } = useChapters(bookId);
  const { removeContent } = useModalWindowStore();

  return (
    <div className=" bg-white md:w-xs lg:w-md rounded-2xl pb-4">
      <h1 className="border-b p-5 border-gray-300 ">{t("createTitle")}</h1>
      <div className="py-4 p-2">
        <input
          spellCheck
          type="text"
          placeholder={t("titlePlaceholder")}
          id="Chapter title"
          name="Chapter title"
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
          {t("create")}
        </button>
      </div>
    </div>
  );
}
