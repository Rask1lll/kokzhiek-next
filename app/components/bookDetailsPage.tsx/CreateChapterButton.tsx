"use client";
import { useModalWindowStore } from "@/app/store/modalWindowStore";
import { PiPlus } from "react-icons/pi";
import CreateChapterModalWindow from "./CreateChapterModalWindow";

export default function CreateChapterButton() {
  const { addContent } = useModalWindowStore();
  return (
    <button
      onClick={() => {
        addContent(<CreateChapterModalWindow />);
      }}
      className="w-full bg-blue-300/50 cursor-pointer items-center border-blue-400 hover:bg-blue-300 rounded-xl p-3 px-5 border-4 border-dashed flex transition-all duration-150 hover:border-blue-500 gap-5"
    >
      <PiPlus className="w-7 h-7 text-3xl" /> <p>Добавить Главу</p>
    </button>
  );
}
