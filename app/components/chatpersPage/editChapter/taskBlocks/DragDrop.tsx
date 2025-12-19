import { parseData } from "@/app/libs/parseData";
import { useEffect, useState } from "react";
import { BiTrash } from "react-icons/bi";

type Props = {
  value: string;
  onChange: (value: string) => void;
};

type Cell = {
  id: string;
  answer: string | null;
};

type DragDrop = {
  content: string;
  cells: Cell[];
};

export default function DragDrop({ value, onChange }: Props) {
  const [data, setData] = useState<DragDrop>(
    parseData(value) ?? { content: "", cells: [] }
  );

  const [showHint, setShowHint] = useState(false);

  console.log(data);

  useEffect(() => {
    onChange(JSON.stringify(data));
  }, [data]);

  function addCell() {
    setData((prev) => {
      const res = data.cells
        ? {
            ...prev,
            content: `${prev.content} {{{${prev.cells.length}}}}`,
            cells: [
              ...prev.cells,
              { id: `${prev.cells.length}`, answer: null } as Cell,
            ],
          }
        : {
            ...prev,
            content: `${prev.content}{{{${0}}}}`,
            cells: [{ id: "0", answer: null } as Cell],
          };
      return res;
    });
  }

  function upDateCell(id: string, value: string) {
    const result = data.cells.map((el) => {
      return el.id === id ? { ...el, answer: value } : el;
    });
    setData({ ...data, cells: result });
  }
  return (
    <div className="w-full">
      <div className="flex justify-between my-2 pr-3">
        <p className="text-slate-600 text-sm font-medium">
          Текст задания
          <span
            className="ml-5 relative bg-gray-300 p-2 py-1 rounded-full"
            onMouseEnter={() => {
              setShowHint(true);
            }}
            onMouseLeave={() => {
              setShowHint(false);
            }}
          >
            ?{" "}
            {showHint && (
              <div className="absolute top-0 left-5 w-40 bg-gray-50 border-2 rounded-2xl z-10 p-2">
                при созданий новых контейнеров будут появляться ячейки{" "}
                {"{{{id}}}"} это позиция ячеек
              </div>
            )}
          </span>
        </p>
        <button
          onClick={addCell}
          className="text-sm bg-green-100 text-green-700 p-2 rounded-lg cursor-pointer font-semibold"
        >
          Добавить контейнер
        </button>
      </div>
      <textarea
        contentEditable
        className="w-full resize-none border min-h-16 border-gray-300 p-1 rounded-md outline-0 bg-white"
        defaultValue={data.content}
        value={data.content}
        onChange={(e) => {
          setData((prev) => ({ ...prev, content: e.target.value }));
          e.target.style.height = `${e.target.scrollHeight}px`;
        }}
      ></textarea>
      <div className="bg-gray-500/5 p-2 rounded-md">
        <div className="text-xl my-2">Контейнеры</div>
        <div className="flex flex-col max-w-300 gap-2">
          {data.cells.map((el) => {
            return (
              <div
                key={el.id}
                className=" flex gap-2 text-gray-500 text-xl rounded-md ring-gray-400/60 "
              >
                <p className="p-1 w-10">
                  <span className="text-[18px]">№</span>
                  {el.id}
                </p>
                <div className="flex gap-2 full w-full">
                  <input
                    type="text"
                    placeholder="ответ к контейнеру"
                    defaultValue={el.answer ?? ""}
                    className="h-full p-1 ring-1 rounded-lg text-gray-800 bg-gray-200 ring-gray-300 w-full"
                    onChange={(e) => {
                      upDateCell(el.id, e.target.value);
                    }}
                  />
                  <div className=" flex items-center justify-center cursor-pointer">
                    <BiTrash className="w-6 h-6 text-red-400" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
