"use client";

import { useModalWindowStore } from "@/app/store/modalWindowStore";
import WidgetListModal from "./WidgetListModal";

const LayoutPlaceholder = () => {
  const { addContent } = useModalWindowStore();
  return (
    <div
      onClick={() => {
        addContent(<WidgetListModal />);
      }}
      className="w-full h-full flex hover:bg-blue-50 cursor-pointer transition-colors duration-100 items-center justify-center border-2 border-dashed border-gray-300 rounded-md bg-gray-50"
    >
      <span className="text-3xl text-gray-400 font-bold">+</span>
    </div>
  );
};

export default LayoutPlaceholder;
