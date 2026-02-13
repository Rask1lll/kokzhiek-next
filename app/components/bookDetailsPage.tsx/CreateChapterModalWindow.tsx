"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { useModalWindowStore } from "@/app/store/modalWindowStore";
import { useChapters } from "@/app/hooks/useChapters";
import { useChaptersStore } from "@/app/store/chaptersStore";

type CreateChapterModalWindowProps = {
  defaultSectionId?: string;
};

export default function CreateChapterModalWindow({
  defaultSectionId,
}: CreateChapterModalWindowProps) {
  const t = useTranslations("chapters");
  const [title, setTitle] = useState("");
  const [sectionId, setSectionId] = useState(defaultSectionId ?? "");
  const searchParams = useSearchParams();
  const bookId = searchParams.get("book") ?? "";
  const { createChapter } = useChapters(bookId);
  const { removeContent } = useModalWindowStore();
  const { sections } = useChaptersStore();

  return (
    <div className="bg-white md:w-xs lg:w-md rounded-2xl pb-4">
      <h1 className="border-b p-5 border-gray-300">{t("createTitle")}</h1>
      <div className="py-4 px-4 space-y-3">
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

        {sections.length > 0 && (
          <div>
            <label className="block text-sm text-gray-600 mb-1">{t("section")}</label>
            <select
              value={sectionId}
              onChange={(e) => setSectionId(e.target.value)}
              className="w-full ring-1 ring-gray-300 p-2 rounded-md bg-white text-sm"
            >
              <option value="">— {t("section")} —</option>
              {sections.map((s) => (
                <option key={s.id} value={String(s.id)}>
                  {s.title}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>
      <div className="w-full flex justify-end mt-3 px-4">
        <button
          type="button"
          onClick={async () => {
            const parsedSectionId = sectionId ? Number(sectionId) : null;
            const res = await createChapter(title, parsedSectionId);
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
