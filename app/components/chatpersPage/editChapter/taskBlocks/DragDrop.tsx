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

  function deleteCell(id: string) {
    const result = data.cells.filter((el) => {
      return el.id !== id && { ...el, answer: value };
    });
    setData({ ...data, cells: result });
  }

  return (
    <div className="w-full space-y-4">
      {/* Заголовок с кнопкой */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          <p className="text-gray-700 font-semibold">Текст задания</p>
          <span
            className="relative inline-flex items-center justify-center w-6 h-6 bg-gray-200 hover:bg-gray-300 text-gray-600 text-xs font-bold rounded-full cursor-help transition-colors"
            onMouseEnter={() => {
              setShowHint(true);
            }}
            onMouseLeave={() => {
              setShowHint(false);
            }}
          >
            ?
            {showHint && (
              <div className="absolute top-8 left-0 w-56 bg-white border border-gray-200 rounded-xl shadow-lg z-10 p-3 text-sm text-gray-600 font-normal">
                При создании контейнеров в тексте появятся метки{" "}
                <code className="bg-gray-100 px-1 rounded">{"{{{id}}}"}</code> —
                это позиции для ответов
              </div>
            )}
          </span>
        </div>
        <button
          onClick={addCell}
          className="flex items-center gap-2 text-sm bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg cursor-pointer font-medium transition-colors shadow-sm"
        >
          <span>+</span>
          Добавить контейнер
        </button>
      </div>

      {/* Текстовое поле */}
      <textarea
        className="w-full resize-none border-2 border-gray-200 focus:border-blue-400 min-h-24 p-3 rounded-xl outline-none bg-white text-gray-700 transition-colors"
        placeholder="Введите текст задания..."
        value={data.content}
        onChange={(e) => {
          setData((prev) => ({ ...prev, content: e.target.value }));
          e.target.style.height = `${e.target.scrollHeight}px`;
        }}
      ></textarea>

      {/* Контейнеры */}
      <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-1 h-5 bg-blue-500 rounded-full"></div>
          <h3 className="text-lg font-semibold text-gray-700">
            Контейнеры ответов
          </h3>
        </div>

        {data.cells.length === 0 ? (
          <p className="text-gray-400 text-sm italic text-center py-4">
            Нет контейнеров. Нажмите «Добавить контейнер» чтобы создать.
          </p>
        ) : (
          <div className="flex flex-col gap-3">
            {data.cells.map((el) => {
              return (
                <div
                  key={el.id}
                  className="flex items-center gap-3 bg-white p-3 rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center justify-center w-10 h-10 bg-blue-100 text-blue-600 font-bold rounded-lg text-sm">
                    {el.id}
                  </div>
                  <input
                    type="text"
                    placeholder="Введите правильный ответ..."
                    defaultValue={el.answer ?? ""}
                    className="flex-1 p-2 px-3 border border-gray-200 focus:border-blue-400 rounded-lg text-gray-700 bg-gray-50 focus:bg-white outline-none transition-colors"
                    onChange={(e) => {
                      upDateCell(el.id, e.target.value);
                    }}
                  />
                  <button
                    onClick={() => {
                      deleteCell(el.id);
                    }}
                    className="flex items-center justify-center w-10 h-10 bg-red-50 hover:bg-red-100 text-red-500 rounded-lg cursor-pointer transition-colors"
                  >
                    <BiTrash className="w-5 h-5" />
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
