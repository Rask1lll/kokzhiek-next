"use client";

import { useMemo } from "react";
import { parseData } from "@/app/libs/parseData";
import Xarrow, { Xwrapper } from "react-xarrows";

type ConceptMapViewProps = {
  value: string;
};

type ConceptMap = {
  tableSize: {
    width: number;
    height: number;
  };
  arrows: Arrow[];
  Cells: Cell[][];
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

function ArrowsLayerView({ arrows }: { arrows: Arrow[] }) {
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
                  className=" relative ring-2 max-w-[20%] min-w-20 ring-slate-300 rounded-md bg-white"
                >
                  <div className="p-1 text-sm text-gray-800 ">{el.text}</div>
                </div>
              );
            })}
          </div>
        );
      })}
    </div>
  );
}

export default function ConceptMapView({ value }: ConceptMapViewProps) {
  const table = useMemo<ConceptMap>(() => {
    const parsed = parseData(value) as Partial<ConceptMap> | undefined;

    if (
      parsed &&
      parsed.tableSize &&
      typeof parsed.tableSize.width === "number" &&
      typeof parsed.tableSize.height === "number" &&
      Array.isArray(parsed.Cells)
    ) {
      return {
        tableSize: {
          width: parsed.tableSize.width,
          height: parsed.tableSize.height,
        },
        Cells: parsed.Cells,
        arrows: Array.isArray(parsed.arrows) ? parsed.arrows : [],
      };
    }

    return {
      tableSize: { width: 2, height: 2 },
      Cells: [],
      arrows: [],
    };
  }, [value]);

  const tableMatrix = useMemo(() => {
    return createMatrix(
      table.tableSize.width,
      table.tableSize.height,
      table.Cells
    );
  }, [table.tableSize.width, table.tableSize.height, table.Cells]);

  return (
    <div className="w-full max-w-full">
      <Xwrapper>
        <TableView matrix={tableMatrix} />
        <ArrowsLayerView arrows={table.arrows} />
      </Xwrapper>
    </div>
  );
}
