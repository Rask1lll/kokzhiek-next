"use client";

import { useCallback, useMemo } from "react";
import { Widget } from "@/app/types/widget";
import ViewPlaceholder from "../ViewPlaceholder";

type TableBorderStyle = "solid" | "dashed" | "dotted" | "none";

type TableData = {
  rows?: number;
  columns?: number;
  borderWidth?: number;
  borderColor?: string;
  borderStyle?: TableBorderStyle;
  cellPadding?: number;
  showOuterBorder?: boolean;
};

type TableViewProps = {
  widget: Widget;
};

export default function TableView({ widget }: TableViewProps) {
  const tableData = widget.data as TableData;

  const rows = tableData?.rows || 2;
  const columns = tableData?.columns || 2;
  const borderWidth = tableData?.borderWidth ?? 1;
  const borderColor = tableData?.borderColor || "#e5e7eb";
  const borderStyle = tableData?.borderStyle || "solid";
  const cellPadding = tableData?.cellPadding ?? 8;
  const showOuterBorder = tableData?.showOuterBorder ?? true;
  const children = widget.children || [];

  // Get widget at specific cell
  const getWidgetAtCell = useCallback(
    (row: number, col: number): Widget | null => {
      return children.find((w) => w.row === row && w.column === col) || null;
    },
    [children]
  );

  // Generate row and column arrays
  const rowArray = useMemo(() => Array.from({ length: rows }, (_, i) => i), [rows]);
  const colArray = useMemo(() => Array.from({ length: columns }, (_, i) => i), [columns]);

  // Compute border CSS
  const cellBorderStyle = useMemo(() => {
    if (borderStyle === "none") return "none";
    return `${borderWidth}px ${borderStyle} ${borderColor}`;
  }, [borderWidth, borderStyle, borderColor]);

  const outerBorderStyle = useMemo(() => {
    if (!showOuterBorder || borderStyle === "none") return "none";
    return `${borderWidth}px ${borderStyle} ${borderColor}`;
  }, [showOuterBorder, borderWidth, borderStyle, borderColor]);

  return (
    <div className="w-full">
      <div
        className="grid bg-white rounded-lg overflow-hidden"
        style={{
          gridTemplateColumns: `repeat(${columns}, 1fr)`,
          border: outerBorderStyle,
          gap: 0,
        }}
      >
        {rowArray.map((row) =>
          colArray.map((col) => {
            const cellWidget = getWidgetAtCell(row, col);
            const isLastRow = row === rows - 1;
            const isLastCol = col === columns - 1;

            return (
              <div
                key={`${row}-${col}`}
                className="min-h-[40px] bg-white"
                style={{
                  padding: `${cellPadding}px`,
                  borderRight: isLastCol ? "none" : cellBorderStyle,
                  borderBottom: isLastRow ? "none" : cellBorderStyle,
                }}
              >
                {cellWidget ? (
                  <ViewPlaceholder widget={cellWidget} />
                ) : (
                  <div className="w-full h-full min-h-[20px]" />
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
