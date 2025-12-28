"use client";
import { useTranslations } from "next-intl";
import { useModalWindowStore } from "@/app/store/modalWindowStore";
import { PiPlus } from "react-icons/pi";
import CreateChapterModalWindow from "./CreateChapterModalWindow";
import { useAuth } from "@/app/hooks/useAuth";
import { isAuthor } from "@/app/libs/roles";

export default function CreateChapterButton() {
  const t = useTranslations("chapters");
  const { addContent } = useModalWindowStore();
  const { user } = useAuth();

  if (!user || !isAuthor(user)) {
    return null;
  }

  return (
    <button
      onClick={() => {
        addContent(<CreateChapterModalWindow />);
      }}
      className="w-full bg-blue-300/30 cursor-pointer items-center border-blue-400 hover:bg-blue-300/50 rounded-xl p-3 px-5 border-4 border-dashed flex transition-all duration-150 hover:border-blue-500 gap-5"
    >
      <PiPlus className="w-7 h-7 text-3xl" /> <p>{t("add")}</p>
    </button>
  );
}
