"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { useModalWindowStore } from "@/app/store/modalWindowStore";
import { useSections } from "@/app/hooks/useSections";

type EditSectionModalProps = {
  sectionId: string;
  currentTitle: string;
};

export default function EditSectionModal({
  sectionId,
  currentTitle,
}: EditSectionModalProps) {
  const t = useTranslations("chapters");
  const [title, setTitle] = useState(currentTitle);
  const [isSaving, setIsSaving] = useState(false);
  const searchParams = useSearchParams();
  const bookId = searchParams.get("book") ?? "";
  const { updateSection } = useSections(bookId);
  const { removeContent } = useModalWindowStore();

  const handleSave = async () => {
    if (!title.trim() || title === currentTitle) {
      removeContent();
      return;
    }

    setIsSaving(true);
    const success = await updateSection(sectionId, title);
    setIsSaving(false);

    if (success) {
      removeContent();
    }
  };

  return (
    <div className="bg-white md:w-xs lg:w-md rounded-2xl pb-4">
      <h1 className="border-b p-5 border-gray-300">{t("edit")}</h1>
      <div className="py-4 p-2">
        <input
          spellCheck
          type="text"
          placeholder={t("sectionTitlePlaceholder")}
          className="w-full ring-1 p-2 rounded-md"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleSave();
          }}
          autoFocus
        />
      </div>
      <div className="w-full flex justify-end gap-2 mt-3 px-4">
        <button
          type="button"
          onClick={() => removeContent()}
          className="p-4 py-2 rounded-lg border border-gray-300 cursor-pointer hover:bg-gray-50"
        >
          {t("cancel")}
        </button>
        <button
          type="button"
          onClick={handleSave}
          disabled={isSaving || !title.trim()}
          className="bg-sky-500/40 p-4 py-2 rounded-lg border-2 border-blue-400 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSaving ? "..." : t("save")}
        </button>
      </div>
    </div>
  );
}
