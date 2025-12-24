"use client";

import { useMemo } from "react";
import Xarrow, { Xwrapper } from "react-xarrows";
import { useQuestions } from "@/app/hooks/useQuestions";
import TaskViewWrapper from "./TaskViewWrapper";

type ConceptMapViewProps = {
  widgetId: number;
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

type ConceptMap = {
  tableSize: {
    width: number;
    height: number;
  };
  arrows: Arrow[];
  Cells: Cell[][];
  color: "green" | "red" | "blue";
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

function ArrowsLayerView({
  arrows,
  color,
}: {
  arrows: Arrow[];
  color: string;
}) {
  return (
    <>
      {arrows
        .filter((a) => a.from && a.to)
        .map((a) => (
          <Xarrow
            key={a.id}
            start={a.from}
            end={a.to}
            strokeWidth={2}
            headSize={6}
            path="straight"
            color={color ?? "red"}
          />
        ))}
    </>
  );
}

function TableView({ matrix }: { matrix: Cell[][] }) {
  return (
    <div className="w-full flex flex-col gap-10">
      {matrix.map((row, i) => {
        return (
          <div key={i} className="flex w-full justify-around">
            {row.map((el) => {
              const hasText = el.text.trim().length > 0;

              if (!hasText) {
                return <div key={el.id} className="min-w-10 min-h-10" />;
              }

              return (
                <div
                  key={el.id}
                  id={el.id}
                  className="relative ring-2 max-w-[20%] min-w-20 ring-slate-300 rounded-md bg-white"
                >
                  <div className="p-1 wrap-anywhere text-wrap text-sm text-gray-800">
                    {el.text}
                  </div>
                </div>
              );
            })}
          </div>
        );
      })}
    </div>
  );
}

export default function ConceptMapView({ widgetId }: ConceptMapViewProps) {
  const { questions } = useQuestions(widgetId);

  const questionsArray = questions;
  const currentQuestion = questionsArray.length > 0 ? questionsArray[0] : null;
  const data = currentQuestion?.data as ConceptMap | undefined;

  const table = useMemo<ConceptMap>(() => {
    if (!data) {
      return {
        tableSize: { width: 2, height: 2 },
        Cells: [],
        arrows: [],
        color: "red",
      };
    }

    if (
      data.tableSize &&
      typeof data.tableSize.width === "number" &&
      typeof data.tableSize.height === "number" &&
      Array.isArray(data.Cells)
    ) {
      return {
        tableSize: {
          width: data.tableSize.width,
          height: data.tableSize.height,
        },
        Cells: data.Cells,
        arrows: Array.isArray(data.arrows) ? data.arrows : [],
        color: data.color || "red",
      };
    }

    return {
      tableSize: { width: 2, height: 2 },
      Cells: [],
      arrows: [],
      color: "red",
    };
  }, [data]);

  const tableMatrix = useMemo(() => {
    return createMatrix(
      table.tableSize.width,
      table.tableSize.height,
      table.Cells
    );
  }, [table.tableSize.width, table.tableSize.height, table.Cells]);

  if (!currentQuestion) {
    return null;
  }

  return (
    <TaskViewWrapper widgetId={widgetId}>
      <div className="w-full max-w-full">
        <Xwrapper>
          <TableView matrix={tableMatrix} />
          <ArrowsLayerView arrows={table.arrows} color={table.color} />
        </Xwrapper>
      </div>
    </TaskViewWrapper>
  );
}
