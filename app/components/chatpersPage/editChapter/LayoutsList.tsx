"use client";

import { JSX } from "react/jsx-dev-runtime";
import { useTranslations } from "next-intl";
import style from "./LayoutsList.module.css";

type blockType = {
  nameKey: string;
  structure: JSX.Element;
  code: string;
};

const blocks: blockType[] = [
  // Single column
  {
    nameKey: "fullPage",
    structure: (
      <div className="w-full bg-gray-200 flex items-center justify-center h-full p-2">
        <div className="bg-yellow-300/50 w-full h-full rounded-md"></div>
      </div>
    ),
    code: "full",
  },

  // 2 columns
  {
    nameKey: "twoEqual",
    structure: (
      <div className="w-full h-full grid grid-cols-2 gap-2 p-2">
        <div className="bg-blue-200 rounded-md h-full"></div>
        <div className="bg-green-200 rounded-md h-full"></div>
      </div>
    ),
    code: "two_equal",
  },
  {
    nameKey: "leftWide",
    structure: (
      <div className="w-full h-full flex gap-2 p-2">
        <div className="bg-purple-200 rounded-md h-full flex-2"></div>
        <div className="bg-orange-200 rounded-md h-full flex-1"></div>
      </div>
    ),
    code: "left_wide",
  },
  {
    nameKey: "rightWide",
    structure: (
      <div className="w-full h-full flex gap-2 p-2">
        <div className="bg-orange-200 rounded-md h-full flex-1"></div>
        <div className="bg-purple-200 rounded-md h-full flex-2"></div>
      </div>
    ),
    code: "right_wide",
  },

  // 3 columns
  {
    nameKey: "threeCols",
    structure: (
      <div className="w-full h-full grid grid-cols-3 gap-2 p-2">
        <div className="bg-blue-200 rounded-md h-full"></div>
        <div className="bg-green-200 rounded-md h-full"></div>
        <div className="bg-yellow-200 rounded-md h-full"></div>
      </div>
    ),
    code: "three_cols",
  },
  {
    nameKey: "threeCenterWide",
    structure: (
      <div className="w-full h-full flex gap-2 p-2">
        <div className="bg-blue-200 rounded-md h-full flex-1"></div>
        <div className="bg-green-200 rounded-md h-full flex-2"></div>
        <div className="bg-yellow-200 rounded-md h-full flex-1"></div>
      </div>
    ),
    code: "three_center_wide",
  },

  // 4 columns
  // {
  //   nameKey: "fourCols",
  //   structure: (
  //     <div className="w-full h-full grid grid-cols-4 gap-2 p-2">
  //       <div className="bg-blue-200 rounded-md h-full"></div>
  //       <div className="bg-green-200 rounded-md h-full"></div>
  //       <div className="bg-yellow-200 rounded-md h-full"></div>
  //       <div className="bg-pink-200 rounded-md h-full"></div>
  //     </div>
  //   ),
  //   code: "four_cols",
  // },

  // Sidebar layouts
  {
    nameKey: "sidebarLeft",
    structure: (
      <div className="w-full h-full flex gap-2 p-2">
        <div className="bg-purple-200 rounded-md h-full w-1/4"></div>
        <div className="bg-orange-200 rounded-md h-full flex-1"></div>
      </div>
    ),
    code: "sidebar_left",
  },
  {
    nameKey: "sidebarRight",
    structure: (
      <div className="w-full h-full flex gap-2 p-2">
        <div className="bg-orange-200 rounded-md h-full flex-1"></div>
        <div className="bg-purple-200 rounded-md h-full w-1/4"></div>
      </div>
    ),
    code: "sidebar_right",
  },
];

type LayoutsListProps = {
  onSelect: (layoutCode: string) => void;
};

export default function LayoutsList({ onSelect }: LayoutsListProps) {
  const t = useTranslations("chapterEditor");
  return (
    <div className="bg-gray-100 w-sm rounded-lg p-4 sm:w-xl md:w-2xl lg:w-4xl max-h-[80vh] overflow-y-auto">
      <h1 className="lg:text-2xl md:text-xl text-lg text-gray-600 font-bold mb-4">
        {t("selectBlockType")}
      </h1>
      <div className={`gap-3 grid ${style.grid_template_columns}`}>
        {blocks.map((el) => {
          return (
            <div
              className="flex p-2 rounded-lg ring ring-gray-300 cursor-pointer hover:scale-103 hover:ring-blue-400 transition-all duration-100 flex-col items-center bg-white"
              key={el.code}
              onClick={() => onSelect(el.code)}
            >
              <div className="w-32 h-32 sm:w-36 sm:h-36">{el.structure}</div>
              <p className="font-semibold text-sm text-center mt-1">
                {t(el.nameKey)}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
