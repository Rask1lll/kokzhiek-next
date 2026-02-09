"use client";

import { FiImage, FiHelpCircle, FiType, FiStar } from "react-icons/fi";
import { useModalWindowStore } from "@/app/store/modalWindowStore";
import {
  BgSettingsModal,
  SignSettingsModal,
  HintSettingsModal,
  PointsSettingsModal,
} from "./TaskSettingModals";

type TaskSettingsMenuProps = {
  widgetId: number;
};

export default function TaskSettingsMenu({ widgetId }: TaskSettingsMenuProps) {
  const { addContent } = useModalWindowStore();

  return (
    <>
      <div className="border-t border-gray-100 my-1" />

      <button
        onClick={() => addContent(<BgSettingsModal widgetId={widgetId} />)}
        className="w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
      >
        <FiImage className="w-4 h-4" />
        <span>Фон</span>
      </button>

      <button
        onClick={() => addContent(<SignSettingsModal widgetId={widgetId} />)}
        className="w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
      >
        <FiType className="w-4 h-4" />
        <span>Условный знак</span>
      </button>

      <button
        onClick={() => addContent(<HintSettingsModal widgetId={widgetId} />)}
        className="w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
      >
        <FiHelpCircle className="w-4 h-4" />
        <span>Подсказка</span>
      </button>

      <button
        onClick={() => addContent(<PointsSettingsModal widgetId={widgetId} />)}
        className="w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
      >
        <FiStar className="w-4 h-4" />
        <span>Очки</span>
      </button>
    </>
  );
}
