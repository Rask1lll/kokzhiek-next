import { parseData } from "@/app/libs/parseData";
import { JSX, useEffect, useMemo, useRef, useState } from "react";
import { BiSolidRightArrow, BiTrash } from "react-icons/bi";
import { BsArrowBarRight } from "react-icons/bs";
import { TbArrowBarToRight } from "react-icons/tb";
import Xarrow, { Xwrapper } from "react-xarrows";
import { arrayBuffer } from "stream/consumers";
type Props = {
  value: string;
  onChange: (s: string) => void;
};

type ConceptMap = {
  tableSize: {
    width: number;
    height: number;
  };
  arrows: Arrow[];
  Cells: Cell[][];
  color: string;
};
type Arrow = {
  id: string;
  from: string;
  to: string;
};
type Cell = {
  id: string;
  text: string;
};

function createMatrix(
  width: number,
  height: number,
  prevTable: Cell[][]
): Cell[][] {
  const result: Cell[][] = [];

  for (let i = 0; i < height; i++) {
    const row: Cell[] = [];

    for (let j = 0; j < width; j++) {
      const prevCell = prevTable?.[i]?.[j];

      row.push({
        id: `${i}${j}`,
        text: prevCell?.text ?? "",
      });
    }

    result.push(row);
  }

  return result;
}

function ArrowsLayer({ arrows, color }: { arrows: Arrow[]; color: string }) {
  return (
    <>
      {arrows
        .filter((a) => a.from && a.to)
        .map((a) => (
          <Xarrow
            key={a.id}
            start={a.from}
            end={a.to}
            path="straight"
            strokeWidth={2}
            headSize={6}
            color={color ?? "red"}
          />
        ))}
    </>
  );
}

function Table({
  matrix,
  onCellChange,
}: {
  matrix: Cell[][];
  onCellChange?: (id: string, text: string) => void;
}) {
  return (
    <div className="w-full flex flex-col gap-10">
      {matrix.map((row, i) => {
        return (
          <div key={i} className="flex w-full justify-around">
            {row.map((el) => {
              return (
                <div
                  key={el.id}
                  id={el.id}
                  className="min-w-10 relative ring-2 ring-slate-300 rounded-md"
                >
                  <span className="absolute -top-5 left-0 opacity-50 text-sm">
                    {el.id}
                  </span>
                  <textarea
                    defaultValue={el.text}
                    className="p-0.5 resize-none outline-0"
                    onChange={(e) => onCellChange?.(el.id, e.target.value)}
                  />
                </div>
              );
            })}
          </div>
        );
      })}
    </div>
  );
}

function doesCellExist(id: string, cells: Cell[][]): boolean {
  return cells.some((row) => row.some((cell) => cell.id === id));
}

function Arrows({
  arrows,
  addArrow,
  editArrow,
  removeArrow,
  cells,
}: {
  arrows: Arrow[];
  addArrow: () => void;
  editArrow: (a: Arrow) => void;
  removeArrow: (id: string) => void;
  cells: Cell[][];
}) {
  const [drafts, setDrafts] = useState<
    Record<string, { from: string; to: string }>
  >({});
  const [errors, setErrors] = useState<string[]>();
  return (
    <div>
      <h3 className="font-medium text-xl mb-2">Стрелки сежду ячейками</h3>
      <button
        color="green"
        className="bg-green-300 opacity-80 cursor-pointer rounded-lg p-2 py-1"
        onClick={addArrow}
      >
        Добавить стрелку +
      </button>
      <div className="flex flex-col gap-2 mt-4 justify-center">
        {arrows.map((el) => {
          return (
            <div key={el.id}>
              <div className="flex items-center gap-1">
                <input
                  type="text"
                  value={drafts[el.id]?.from ?? el.from}
                  className="w-20 ring rounded ring-slate-400"
                  maxLength={2}
                  onChange={(e) => {
                    const value = e.target.value;

                    setDrafts((prev) => ({
                      ...prev,
                      [el.id]: {
                        from: value,
                        to: prev[el.id]?.to ?? el.to,
                      },
                    }));

                    if (doesCellExist(value, cells)) {
                      editArrow({ id: el.id, from: value, to: el.to });
                    }
                  }}
                />
                <BsArrowBarRight />
                <input
                  type="text"
                  value={drafts[el.id]?.to ?? el.to}
                  className="w-20 ring rounded ring-slate-400"
                  maxLength={2}
                  onChange={(e) => {
                    const value = e.target.value;

                    setDrafts((prev) => ({
                      ...prev,
                      [el.id]: {
                        from: prev[el.id]?.from ?? el.from,
                        to: value,
                      },
                    }));

                    if (doesCellExist(value, cells)) {
                      setTimeout(() => {
                        setErrors((prev) => {
                          const res = prev?.slice(
                            prev.indexOf(el.id),
                            prev.indexOf(el.id)
                          );
                          return res;
                        });
                      }, 1000);
                      editArrow({ id: el.id, from: el.from, to: value });
                    } else {
                      console.log("huuuuu");
                      setTimeout(() => {
                        setErrors((prev) => {
                          return prev ? [...prev, el.id] : [el.id];
                        });
                      }, 1000);
                    }
                  }}
                />
                <button
                  className="ml-2 text-red-500 hover:text-red-700 font-bold"
                  onClick={() => removeArrow(el.id)}
                  title="Удалить стрелку"
                >
                  <BiTrash className="text-red-500" />
                </button>
              </div>

              {errors?.includes(el.id) && (
                <div className="text-red-400 text-sm mt-1">
                  Неприменимый id элемента
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function ConceptMap({ value, onChange }: Props) {
  const [table, setTable] = useState<ConceptMap>(() => {
    return (
      parseData(value) ?? {
        tableSize: { width: 2, height: 2 },
        Cells: [],
        arrows: [],
      }
    );
  });

  const [colorChoose, setColorChoose] = useState<boolean>(false);
  const [colorDiv, setColorDiv] = useState<JSX.Element>(
    <div className=" bg-red-500 w-5 h-5"></div>
  );

  function handleCellChange(id: string, text: string) {
    setTable((prev) => {
      const cells = prev.Cells.map((row) =>
        row.map((cell) => (cell.id === id ? { ...cell, text } : cell))
      );

      return { ...prev, Cells: cells };
    });
  }

  useEffect(() => {
    onChange(JSON.stringify(table));
  }, [table]);

  function addArrow() {
    setTable((prev) => ({
      ...prev,
      arrows: [
        ...prev.arrows,
        { id: String(table.arrows.length), to: "", from: "" },
      ],
    }));

    onChange(
      JSON.stringify({
        ...table,
        arrows: [
          ...table.arrows,
          { id: String(table.arrows.length), to: "", from: "" },
        ],
      })
    );
  }

  function removeArrow(id: string) {
    setTable((prev) => {
      const filtered = prev.arrows.filter((a) => a.id !== id);

      const next = {
        ...prev,
        arrows: filtered,
      };

      onChange(JSON.stringify(next));
      return next;
    });
  }

  function editArrow(arrow: Arrow) {
    console.log(arrow);
    const edited = table.arrows.map((el) => {
      return el.id === arrow.id
        ? { id: String(arrow.id), to: arrow.to, from: arrow.from }
        : el;
    });
    setTable((prev) => ({
      ...prev,
      arrows: edited,
    }));
    console.log(table);
    onChange(
      JSON.stringify({
        ...table,
        arrows: edited,
      })
    );
  }

  // const tableMatrix = useMemo(() => {
  //   return createMatrix(
  //     table.tableSize.width,
  //     table.tableSize.height,
  //     table.Cells
  //   );
  // }, [table.tableSize.width, table.tableSize.height, table.Cells]);

  return (
    <div className="w-full max-w-full">
      <div className="flex items-center justify-between">
        <span className="text-lg text-stone-700 font-semibold">
          Размеры таблицы
        </span>
        <div className="flex gap-12 mr-20">
          <div className="flex gap-2 items-center">
            <label htmlFor="tableWidth">Ширина:</label>
            <input
              id="tableWidth"
              name="tableWidth"
              type="number"
              className="w-10 text-center border rounded-lg border-gray-500"
              value={table.tableSize.width}
              onChange={(e) => {
                let value = Number(e.target.value);
                if (value > 9 || value < 2) value = value > 9 ? 9 : 2;

                setTable((prev) => {
                  const nextCells = createMatrix(
                    value,
                    prev.tableSize.height,
                    prev.Cells
                  );

                  const next = {
                    ...prev,
                    tableSize: { width: value, height: prev.tableSize.height },
                    Cells: nextCells,
                  };

                  onChange(JSON.stringify(next));
                  return next;
                });
              }}
            />
          </div>
          <div className="flex gap-2 items-center">
            <label htmlFor="tableWidth">Ширина:</label>
            <input
              id="tableWidth"
              name="tableWidth"
              type="number"
              className="w-10 text-center border rounded-lg border-gray-500"
              value={table.tableSize.height}
              onChange={(e) => {
                let value = Number(e.target.value);
                if (value > 9 || value < 2) value = value > 9 ? 9 : 2;

                setTable((prev) => {
                  const nextCells = createMatrix(
                    prev.tableSize.width,
                    value,
                    prev.Cells
                  );

                  const next = {
                    ...prev,
                    tableSize: { width: prev.tableSize.width, height: value },
                    Cells: nextCells,
                  };

                  onChange(JSON.stringify(next));
                  return next;
                });
              }}
            />
          </div>
          <div className="px-2 flex gap-2 items-center">
            {!colorChoose ? (
              <p
                className={`bg-${table.color} bg-green-300 font-bold cursor-pointer p-1.5 rounded-lg text-gray-500 hover:text-white transition-colors duration-300`}
                onClick={() => {
                  setColorChoose(!colorChoose);
                }}
              >
                Выбрать цвет
              </p>
            ) : (
              <>
                <div
                  className="bg-red-500  w-7 h-7 cursor-pointer rounded-full"
                  onClick={() => {
                    setTable((prev) => ({ ...prev, color: "red" }));
                    setColorChoose(!colorChoose);
                  }}
                ></div>
                <div
                  className="bg-green-500 w-7 h-7 cursor-pointer rounded-full"
                  onClick={() => {
                    setTable((prev) => ({ ...prev, color: "green" }));
                    setColorChoose(!colorChoose);
                  }}
                ></div>
                <div
                  className="bg-blue-500 w-7 h-7 cursor-pointer rounded-full"
                  onClick={() => {
                    setTable((prev) => ({ ...prev, color: "blue" }));
                    setColorChoose(!colorChoose);
                  }}
                ></div>
              </>
            )}
          </div>
        </div>
      </div>
      <div className="mt-10">
        <Xwrapper>
          <Table matrix={table.Cells} onCellChange={handleCellChange} />
          <ArrowsLayer arrows={table.arrows} color={table.color} />
        </Xwrapper>
      </div>
      <div className="mt-10">
        <Arrows
          arrows={table.arrows}
          addArrow={addArrow}
          editArrow={editArrow}
          removeArrow={removeArrow}
          cells={table.Cells}
        />
      </div>
    </div>
  );
}
