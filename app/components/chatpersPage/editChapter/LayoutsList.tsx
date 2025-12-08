import { JSX } from "react/jsx-dev-runtime";
import { useBlocksStore } from "@/app/store/blocksStore";
import style from "./LayoutsList.module.css";

type blockType = {
  name: string;
  structure: JSX.Element;
  code: string;
};

const blocks: blockType[] = [
  {
    name: "Полная страница",
    structure: (
      <div className="w-full bg-gray-200 flex items-center justify-center h-full p-2">
        <div className="bg-yellow-300/50 w-full h-full rounded-md"></div>
      </div>
    ),
    code: "full",
  },
  {
    name: "2 колонки 50 / 50",
    structure: (
      <div className="w-full h-full grid grid-cols-2 gap-2">
        <div className="bg-blue-200 rounded-md h-full"></div>
        <div className="bg-green-200 rounded-md h-full"></div>
      </div>
    ),
    code: "two_equal",
  },
  {
    name: "2 колонки (левая шире)",
    structure: (
      <div className="w-full h-full flex gap-2 ">
        <div className="bg-purple-200 rounded-md h-full w-[130%]"></div>
        <div className="bg-orange-200 rounded-md h-full w-[70%]"></div>
      </div>
    ),
    code: "left_wide",
  },
  {
    name: "2 колонки (правая шире)",
    structure: (
      <div className="w-full h-full flex gap-2 ">
        <div className="bg-orange-200 rounded-md h-full w-[70%]"></div>
        <div className="bg-purple-200 rounded-md h-full w-[130%]"></div>
      </div>
    ),
    code: "right_wide",
  },
  {
    name: "3 колонки",
    structure: (
      <div className="w-full h-full grid grid-cols-3 gap-2">
        <div className="bg-blue-200 rounded-md h-full"></div>
        <div className="bg-green-200 rounded-md h-full"></div>
        <div className="bg-yellow-200 rounded-md h-full"></div>
      </div>
    ),
    code: "three_cols",
  },
];

export default function LayoutsList() {
  const addBlock = useBlocksStore((state) => state.addBlock);

  const handleSelectLayout = (code: string) => {
    addBlock(code);
  };

  return (
    <div className=" bg-gray-100 w-sm rounded-lg p-2 sm:w-xl md:w-2xl lg:w-3xl ">
      <h1 className="lg:text-2xl md:text-xl text-lg text-gray-600 font-bold">
        Выберите тип блока
      </h1>
      <div className={`p-5 gap-3 grid ${style.grid_template_columns}`}>
        {blocks.map((el) => {
          return (
            <div
              className="flex p-2 rounded-lg ring ring-gray-300 cursor-pointer hover:scale-103 transition-transform duration-100 flex-col items-center"
              key={el.code}
              onClick={() => handleSelectLayout(el.code)}
            >
              <div className="w-40 h-40">{el.structure}</div>
              <p className="font-semibold">{el.name}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
