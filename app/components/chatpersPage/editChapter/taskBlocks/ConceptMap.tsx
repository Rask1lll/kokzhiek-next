"use client";

import { useEffect, useState, useCallback, useRef, useMemo } from "react";
import { BiTrash } from "react-icons/bi";
import { BsArrowBarRight } from "react-icons/bs";
import Xarrow, { Xwrapper } from "react-xarrows";
import { useQuestions } from "@/app/hooks/useQuestions";
import { Question } from "@/app/types/question";
import { useTranslations } from "next-intl";

type ConceptMapProps = {
  widgetId: number;
};

const Colors = {
  red: "bg-red-500",
  blue: "bg-blue-500",
  green: "bg-green-500",
};

type ConceptMap = {
  tableSize: {
    width: number;
    height: number;
  };
  arrows: Arrow[];
  Cells: Cell[][];
  color: "green" | "red" | "blue";
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
                    value={el.text}
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
  t,
}: {
  arrows: Arrow[];
  addArrow: () => void;
  editArrow: (a: Arrow) => void;
  removeArrow: (id: string) => void;
  cells: Cell[][];
  t: (key: string) => string;
}) {
  const [drafts, setDrafts] = useState<
    Record<string, { from: string; to: string }>
  >({});
  const [errors, setErrors] = useState<string[]>();
  return (
    <div>
      <h3 className="font-medium text-xl mb-2">{t("arrowsBetweenCells")}</h3>
      <button
        color="green"
        className="bg-green-200/90 font-semibold text-green-900 opacity-80 cursor-pointer rounded-lg p-2 py-1"
        onClick={addArrow}
      >
        {t("addArrow")}
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
                  title={t("deleteArrow")}
                >
                  <BiTrash className="text-red-500" />
                </button>
              </div>

              {errors?.includes(el.id) && (
                <div className="text-red-400 text-sm mt-1">
                  {t("invalidCellId")}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function ConceptMap({ widgetId }: ConceptMapProps) {
  const t = useTranslations("taskEditor");
  const { questions, loading, update } = useQuestions(widgetId);

  // Get first question from array
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(
    Array.isArray(questions) && questions.length > 0 ? questions[0] : null
  );

  useEffect(() => {
    if (Array.isArray(questions) && questions.length > 0) {
      const firstQuestion = questions[0];
      // Only update if question ID changed
      if (!currentQuestion || currentQuestion.id !== firstQuestion.id) {
        // Clear initialization ref when question changes
        if (currentQuestion?.id && currentQuestion.id !== firstQuestion.id) {
          initializationRef.current.delete(currentQuestion.id);
        }
        setTimeout(() => {
          setCurrentQuestion(firstQuestion);
        }, 0);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [questions]);

  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const cellDebounceTimersRef = useRef<Map<string, NodeJS.Timeout>>(new Map());
  const initializationRef = useRef<Set<number>>(new Set());

  // Cleanup timers on unmount
  useEffect(() => {
    const debounceTimer = debounceTimerRef.current;
    const cellTimers = cellDebounceTimersRef.current;

    return () => {
      if (debounceTimer) {
        clearTimeout(debounceTimer);
      }
      cellTimers.forEach((timer) => {
        clearTimeout(timer);
      });
      cellTimers.clear();
    };
  }, []);

  // Convert question data to ConceptMap structure
  const table = useMemo((): ConceptMap => {
    if (!currentQuestion?.data) {
      return {
        tableSize: { width: 2, height: 2 },
        Cells: [],
        arrows: [],
        color: "red",
      };
    }

    const data = currentQuestion.data as {
      tableSize?: { width: number; height: number };
      arrows?: Arrow[];
      Cells?: Cell[][];
      color?: "green" | "red" | "blue";
    };

    return {
      tableSize: data.tableSize || { width: 2, height: 2 },
      arrows: data.arrows || [],
      Cells: data.Cells || [],
      color: data.color || "red",
    };
  }, [currentQuestion]);

  const [colorChoose, setColorChoose] = useState<boolean>(false);

  const syncToServer = useCallback(
    (newData: Partial<ConceptMap>) => {
      if (!currentQuestion?.id) return;

      const updatedData = {
        ...table,
        ...newData,
      };

      // Update UI immediately
      setCurrentQuestion((prev) =>
        prev
          ? {
              ...prev,
              data: {
                tableSize: updatedData.tableSize,
                arrows: updatedData.arrows,
                Cells: updatedData.Cells,
                color: updatedData.color,
              },
            }
          : null
      );

      // Send to server
      update(currentQuestion.id, {
        data: {
          tableSize: updatedData.tableSize,
          arrows: updatedData.arrows,
          Cells: updatedData.Cells,
          color: updatedData.color,
        },
      });
    },
    [currentQuestion, table, update]
  );

  const handleCellChange = useCallback(
    (id: string, text: string) => {
      if (!currentQuestion?.id) return;

      const cells = table.Cells.map((row) =>
        row.map((cell) => (cell.id === id ? { ...cell, text } : cell))
      );

      // Update UI immediately
      setCurrentQuestion((prev) =>
        prev
          ? {
              ...prev,
              data: {
                ...prev.data,
                Cells: cells,
              },
            }
          : null
      );

      // Debounce server update
      const timerKey = `cell-${id}`;
      const existingTimer = cellDebounceTimersRef.current.get(timerKey);
      if (existingTimer) {
        clearTimeout(existingTimer);
      }

      const questionId = currentQuestion.id;
      const timer = setTimeout(() => {
        if (!questionId) {
          cellDebounceTimersRef.current.delete(timerKey);
          return;
        }

        update(questionId, {
          data: {
            ...currentQuestion.data,
            Cells: cells,
          },
        });
        cellDebounceTimersRef.current.delete(timerKey);
      }, 500);

      cellDebounceTimersRef.current.set(timerKey, timer);
    },
    [currentQuestion, table.Cells, update]
  );

  const addArrow = useCallback(() => {
    const newArrow: Arrow = {
      id: String(table.arrows.length),
      to: "",
      from: "",
    };
    syncToServer({ arrows: [...table.arrows, newArrow] });
  }, [table.arrows, syncToServer]);

  const removeArrow = useCallback(
    (id: string) => {
      const filtered = table.arrows.filter((a) => a.id !== id);
      syncToServer({ arrows: filtered });
    },
    [table.arrows, syncToServer]
  );

  const editArrow = useCallback(
    (arrow: Arrow) => {
      const edited = table.arrows.map((el) =>
        el.id === arrow.id
          ? { id: String(arrow.id), to: arrow.to, from: arrow.from }
          : el
      );
      syncToServer({ arrows: edited });
    },
    [table.arrows, syncToServer]
  );

  const tableMatrix = useMemo(() => {
    return createMatrix(
      table.tableSize.width,
      table.tableSize.height,
      table.Cells
    );
  }, [table.tableSize.width, table.tableSize.height, table.Cells]);

  // Initialize cells if they don't exist
  useEffect(() => {
    if (!currentQuestion?.id) return;

    const questionId = currentQuestion.id;
    // Skip if already initialized for this question
    if (initializationRef.current.has(questionId)) return;

    // Check if Cells array is empty or doesn't match the table size
    const expectedCellCount = table.tableSize.width * table.tableSize.height;
    const actualCellCount = table.Cells.flat().length;

    // If cells don't exist or don't match size, create and save them
    if (actualCellCount === 0 || actualCellCount !== expectedCellCount) {
      const newCells = createMatrix(
        table.tableSize.width,
        table.tableSize.height,
        table.Cells
      );

      // Mark as initialized before updating
      initializationRef.current.add(questionId);

      // Update UI immediately
      setCurrentQuestion((prev) =>
        prev
          ? {
              ...prev,
              data: {
                ...prev.data,
                Cells: newCells,
              },
            }
          : null
      );

      // Send to server directly (don't use syncToServer to avoid circular updates)
      update(questionId, {
        data: {
          ...currentQuestion.data,
          tableSize: table.tableSize,
          arrows: table.arrows,
          Cells: newCells,
          color: table.color,
        },
      });
    } else {
      // Mark as initialized even if cells already exist
      initializationRef.current.add(questionId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentQuestion?.id, table.tableSize.width, table.tableSize.height]);

  const handleTableSizeChange = useCallback(
    (field: "width" | "height", value: number) => {
      if (value > 9 || value < 2) value = value > 9 ? 9 : 2;

      const newSize = {
        ...table.tableSize,
        [field]: value,
      };

      const nextCells = createMatrix(
        newSize.width,
        newSize.height,
        table.Cells
      );

      syncToServer({
        tableSize: newSize,
        Cells: nextCells,
      });
    },
    [table.tableSize, table.Cells, syncToServer]
  );

  const handleColorChange = useCallback(
    (color: "green" | "red" | "blue") => {
      syncToServer({ color });
      setColorChoose(false);
    },
    [syncToServer]
  );

  // Show loading state while loading
  if (loading) {
    return (
      <div className="w-full space-y-4 p-4">
        <div className="animate-pulse">{t("loading")}</div>
      </div>
    );
  }

  if (!currentQuestion) {
    return (
      <div className="w-full space-y-4 p-4 text-gray-500">
        {t("loadError")}
      </div>
    );
  }

  return (
    <div className="w-full max-w-full">
      <div className="flex items-center justify-between">
        <span className="text-lg text-stone-700 font-semibold">
          {t("tableSize")}
        </span>
        <div className="flex gap-12 mr-20">
          <div className="flex gap-2 items-center">
            <label htmlFor="tableWidth">{t("width")}</label>
            <input
              id="tableWidth"
              name="tableWidth"
              type="number"
              className="w-10 text-center border rounded-lg border-gray-500"
              value={table.tableSize.width}
              onChange={(e) =>
                handleTableSizeChange("width", Number(e.target.value))
              }
            />
          </div>
          <div className="flex gap-2 items-center">
            <label htmlFor="tableHeight">{t("height")}</label>
            <input
              id="tableHeight"
              name="tableHeight"
              type="number"
              className="w-10 text-center border rounded-lg border-gray-500"
              value={table.tableSize.height}
              onChange={(e) =>
                handleTableSizeChange("height", Number(e.target.value))
              }
            />
          </div>
          <div className="px-2 flex gap-2 items-center">
            {!colorChoose ? (
              <div
                className={`${
                  Colors[table.color]
                }  font-bold cursor-pointer w-5 h-5 rounded-full text-gray-500 hover:text-white transition-colors duration-300`}
                onClick={() => {
                  setColorChoose(!colorChoose);
                }}
              ></div>
            ) : (
              <>
                <div
                  className="bg-red-500  w-7 h-7 cursor-pointer rounded-full"
                  onClick={() => handleColorChange("red")}
                ></div>
                <div
                  className="bg-green-500 w-7 h-7 cursor-pointer rounded-full"
                  onClick={() => handleColorChange("green")}
                ></div>
                <div
                  className="bg-blue-500 w-7 h-7 cursor-pointer rounded-full"
                  onClick={() => handleColorChange("blue")}
                ></div>
              </>
            )}
          </div>
        </div>
      </div>
      <div className="mt-10">
        <Xwrapper>
          <Table matrix={tableMatrix} onCellChange={handleCellChange} />
          <ArrowsLayer arrows={table.arrows} color={table.color} />
        </Xwrapper>
      </div>
      <div className="mt-10">
        <Arrows
          arrows={table.arrows}
          addArrow={addArrow}
          editArrow={editArrow}
          removeArrow={removeArrow}
          cells={tableMatrix}
          t={t}
        />
      </div>
    </div>
  );
}
