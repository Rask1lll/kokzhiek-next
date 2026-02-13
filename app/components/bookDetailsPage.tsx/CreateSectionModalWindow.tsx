"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { useModalWindowStore } from "@/app/store/modalWindowStore";
import { useSections } from "@/app/hooks/useSections";

export default function CreateSectionModalWindow() {
  const t = useTranslations("chapters");
  const [title, setTitle] = useState("");
  const searchParams = useSearchParams();
  const bookId = searchParams.get("book") ?? "";
  const { createSection } = useSections(bookId);
  const { removeContent } = useModalWindowStore();

  return (
    <div className="bg-white md:w-xs lg:w-md rounded-2xl pb-4">
      <h1 className="border-b p-5 border-gray-300">{t("createSectionTitle")}</h1>
      <div className="py-4 p-2">
        <input
          spellCheck
          type="text"
          placeholder={t("sectionTitlePlaceholder")}
          className="w-full ring-1 p-2 rounded-md"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
      </div>
      <div className="w-full flex justify-end mt-3 px-4">
        <button
          type="button"
          onClick={async () => {
            const res = await createSection(title);
            if (res?.success) removeContent();
          }}
          disabled={!title.trim()}
          className="bg-sky-500/40 p-4 py-2 rounded-lg border-2 border-blue-400 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {t("create")}
        </button>
      </div>
    </div>
  );
}
