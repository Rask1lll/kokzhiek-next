"use client";

import { useState, useCallback, useMemo, useEffect, useRef } from "react";
import { Widget, WidgetData } from "@/app/types/widget";
import { FiPlus, FiTrash2, FiSettings, FiMaximize2, FiMinimize2 } from "react-icons/fi";
import { useTranslations } from "next-intl";
import { createChildWidget, deleteWidget } from "@/app/services/constructor/widgetApi";
import { useBlocksStore } from "@/app/store/blocksStore";
import WidgetListModal from "../WidgetListModal";
import { useModalWindowStore } from "@/app/store/modalWindowStore";
import LayoutPlaceholder from "../LayoutPlaceholder";

type TableBorderStyle = "solid" | "dashed" | "dotted" | "none";

type CellMerge = {
  row: number;
  col: number;
  rowSpan: number;
  colSpan: number;
};

type TableData = {
  rows?: number;
  columns?: number;
  borderWidth?: number;
  borderColor?: string;
  borderStyle?: TableBorderStyle;
  cellPadding?: number;
  showOuterBorder?: boolean;
  merges?: CellMerge[];
};

type TableWidgetProps = {
  widget: Widget;
  blockId: number;
  onUpdate: (data: WidgetData) => void;
};

const BORDER_COLORS = [
  { value: "#e5e7eb", label: "Серый" },
  { value: "#3b82f6", label: "Синий" },
  { value: "#10b981", label: "Зелёный" },
  { value: "#f59e0b", label: "Оранжевый" },
  { value: "#ef4444", label: "Красный" },
  { value: "#8b5cf6", label: "Фиолетовый" },
  { value: "#000000", label: "Чёрный" },
];

// --- Merge helpers ---

function getMergeAt(row: number, col: number, merges: CellMerge[]): CellMerge | null {
  return merges.find((m) => m.row === row && m.col === col) || null;
}

function isCoveredByMerge(row: number, col: number, merges: CellMerge[]): boolean {
  return merges.some(
    (m) =>
      row >= m.row &&
      row < m.row + m.rowSpan &&
      col >= m.col &&
      col < m.col + m.colSpan &&
      !(row === m.row && col === m.col)
  );
}

function getSelectedRect(cells: Set<string>): { minRow: number; maxRow: number; minCol: number; maxCol: number } | null {
  if (cells.size === 0) return null;
  let minRow = Infinity, maxRow = -1, minCol = Infinity, maxCol = -1;
  for (const key of cells) {
    const [r, c] = key.split("-").map(Number);
    if (r < minRow) minRow = r;
    if (r > maxRow) maxRow = r;
    if (c < minCol) minCol = c;
    if (c > maxCol) maxCol = c;
  }
  return { minRow, maxRow, minCol, maxCol };
}

function cleanMergesForResize(merges: CellMerge[], newRows: number, newCols: number): CellMerge[] {
  return merges.filter(
    (m) => m.row + m.rowSpan <= newRows && m.col + m.colSpan <= newCols
  );
}

export default function TableWidget({
  widget,
  blockId,
  onUpdate,
}: TableWidgetProps) {
  const t = useTranslations("blockEditor");
  const { addChildWidgetLocal, removeChildWidgetLocal } = useBlocksStore();
  const { addContent, removeContent } = useModalWindowStore();
  const [showSettings, setShowSettings] = useState(false);
  const [mergeMode, setMergeMode] = useState(false);
  const [selectedCells, setSelectedCells] = useState<Set<string>>(new Set());
  const [anchorCell, setAnchorCell] = useState<string | null>(null);
  const tableRef = useRef<HTMLDivElement>(null);

  const tableData = widget.data as TableData;

  const rows = tableData?.rows || 2;
  const columns = tableData?.columns || 2;
  const borderWidth = tableData?.borderWidth ?? 1;
  const borderColor = tableData?.borderColor || "#e5e7eb";
  const borderStyle = tableData?.borderStyle || "solid";
  const cellPadding = tableData?.cellPadding ?? 8;
  const showOuterBorder = tableData?.showOuterBorder ?? true;
  const merges: CellMerge[] = tableData?.merges || [];
  const children = widget.children || [];

  // Clear selection on Escape
  useEffect(() => {
    if (!mergeMode) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setMergeMode(false);
        setSelectedCells(new Set());
        setAnchorCell(null);
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [mergeMode]);

  // Get widget at specific cell
  const getWidgetAtCell = useCallback(
    (row: number, col: number): Widget | null => {
      return children.find((w) => w.row === row && w.column === col) || null;
    },
    [children]
  );

  // Get all cell keys covered by a cell (accounting for merges)
  const getCellKeys = useCallback(
    (row: number, col: number): string[] => {
      const merge = getMergeAt(row, col, merges);
      if (merge) {
        const keys: string[] = [];
        for (let r = merge.row; r < merge.row + merge.rowSpan; r++) {
          for (let c = merge.col; c < merge.col + merge.colSpan; c++) {
            keys.push(`${r}-${c}`);
          }
        }
        return keys;
      }
      return [`${row}-${col}`];
    },
    [merges]
  );

  // Cell selection (only in merge mode): toggle individual cells, shift for range
  const handleCellSelect = useCallback(
    (row: number, col: number, shiftKey: boolean) => {
      if (!mergeMode) return;
      const cellKeys = getCellKeys(row, col);
      if (shiftKey && anchorCell) {
        // Range select: fill rectangle from anchor to current
        const [ar, ac] = anchorCell.split("-").map(Number);
        const minR = Math.min(ar, row);
        const maxR = Math.max(ar, row);
        const minC = Math.min(ac, col);
        const maxC = Math.max(ac, col);
        const newSet = new Set(selectedCells);
        for (let r = minR; r <= maxR; r++) {
          for (let c = minC; c <= maxC; c++) {
            newSet.add(`${r}-${c}`);
          }
        }
        setSelectedCells(newSet);
      } else {
        // Toggle: add or remove all cells of this merge group
        const newSet = new Set(selectedCells);
        const isCurrentlySelected = newSet.has(cellKeys[0]);
        if (isCurrentlySelected) {
          for (const k of cellKeys) newSet.delete(k);
        } else {
          for (const k of cellKeys) newSet.add(k);
        }
        setSelectedCells(newSet);
        setAnchorCell(`${row}-${col}`);
      }
    },
    [mergeMode, anchorCell, selectedCells, getCellKeys]
  );

  // Merge selected cells
  const handleMerge = useCallback(async () => {
    const rect = getSelectedRect(selectedCells);
    if (!rect) return;
    const { minRow, maxRow, minCol, maxCol } = rect;
    const rowSpan = maxRow - minRow + 1;
    const colSpan = maxCol - minCol + 1;
    if (rowSpan === 1 && colSpan === 1) return;

    // Delete widgets in covered cells (keep top-left)
    for (let r = minRow; r <= maxRow; r++) {
      for (let c = minCol; c <= maxCol; c++) {
        if (r === minRow && c === minCol) continue;
        const w = getWidgetAtCell(r, c);
        if (w) {
          await deleteWidget(w.id);
          removeChildWidgetLocal(widget.id, w.id);
        }
      }
    }

    // Remove any existing merges that overlap with the new one
    const newMerges = merges.filter(
      (m) =>
        !(
          m.row + m.rowSpan > minRow &&
          m.row <= maxRow &&
          m.col + m.colSpan > minCol &&
          m.col <= maxCol
        )
    );
    newMerges.push({ row: minRow, col: minCol, rowSpan, colSpan });

    onUpdate({ ...widget.data, merges: newMerges });
    setMergeMode(false);
    setSelectedCells(new Set());
    setAnchorCell(null);
  }, [selectedCells, merges, widget.data, widget.id, onUpdate, getWidgetAtCell, removeChildWidgetLocal]);

  // Split merged cell
  const handleSplit = useCallback(() => {
    const rect = getSelectedRect(selectedCells);
    if (!rect) return;
    const { minRow, minCol } = rect;

    const newMerges = merges.filter(
      (m) => !(m.row === minRow && m.col === minCol)
    );
    onUpdate({ ...widget.data, merges: newMerges });
    setMergeMode(false);
    setSelectedCells(new Set());
    setAnchorCell(null);
  }, [selectedCells, merges, widget.data, onUpdate]);

  // Check if current selection can be merged
  const canMerge = useMemo(() => {
    if (selectedCells.size < 2) return false;
    const rect = getSelectedRect(selectedCells);
    if (!rect) return false;
    const expectedSize = (rect.maxRow - rect.minRow + 1) * (rect.maxCol - rect.minCol + 1);
    return selectedCells.size === expectedSize;
  }, [selectedCells]);

  // Check if current selection is exactly one merged cell
  const canSplit = useMemo(() => {
    if (selectedCells.size === 0) return false;
    const rect = getSelectedRect(selectedCells);
    if (!rect) return false;
    const { minRow, minCol } = rect;
    const merge = getMergeAt(minRow, minCol, merges);
    if (!merge) return false;
    // Check that selection matches exactly this merge's cells
    const expectedSize = merge.rowSpan * merge.colSpan;
    return selectedCells.size === expectedSize;
  }, [selectedCells, merges]);

  // Add new row
  const handleAddRow = useCallback(() => {
    onUpdate({
      ...widget.data,
      rows: rows + 1,
    });
  }, [widget.data, rows, onUpdate]);

  // Add new column
  const handleAddColumn = useCallback(() => {
    onUpdate({
      ...widget.data,
      columns: columns + 1,
    });
  }, [widget.data, columns, onUpdate]);

  // Remove row
  const handleRemoveRow = useCallback(async () => {
    if (rows <= 1) return;

    const widgetsInLastRow = children.filter((w) => w.row === rows - 1);
    for (const w of widgetsInLastRow) {
      await deleteWidget(w.id);
      removeChildWidgetLocal(widget.id, w.id);
    }

    const newMerges = cleanMergesForResize(merges, rows - 1, columns);
    onUpdate({
      ...widget.data,
      rows: rows - 1,
      merges: newMerges,
    });
  }, [rows, columns, children, merges, widget.id, widget.data, onUpdate, removeChildWidgetLocal]);

  // Remove column
  const handleRemoveColumn = useCallback(async () => {
    if (columns <= 1) return;

    const widgetsInLastColumn = children.filter((w) => w.column === columns - 1);
    for (const w of widgetsInLastColumn) {
      await deleteWidget(w.id);
      removeChildWidgetLocal(widget.id, w.id);
    }

    const newMerges = cleanMergesForResize(merges, rows, columns - 1);
    onUpdate({
      ...widget.data,
      columns: columns - 1,
      merges: newMerges,
    });
  }, [columns, rows, children, merges, widget.id, widget.data, onUpdate, removeChildWidgetLocal]);

  // Handle adding widget to cell
  const handleAddWidgetToCell = useCallback(
    (row: number, col: number) => {
      addContent(
        <WidgetListModal
          onSelect={async (widgetType) => {
            removeContent();
            const response = await createChildWidget(
              blockId,
              widget.id,
              widgetType,
              {},
              row,
              col
            );
            if (response.success && response.data) {
              addChildWidgetLocal(widget.id, response.data);
            }
          }}
        />
      );
    },
    [blockId, widget.id, addContent, removeContent, addChildWidgetLocal]
  );

  // Handle removing widget from cell
  const handleRemoveWidgetFromCell = useCallback(
    async (childWidget: Widget) => {
      if (!confirm(t("confirmDeleteWidget"))) return;

      await deleteWidget(childWidget.id);
      removeChildWidgetLocal(widget.id, childWidget.id);
    },
    [widget.id, removeChildWidgetLocal, t]
  );

  // Generate row and column arrays
  const rowArray = useMemo(() => Array.from({ length: rows }, (_, i) => i), [rows]);
  const colArray = useMemo(() => Array.from({ length: columns }, (_, i) => i), [columns]);

  // Border style handlers
  const handleBorderWidthChange = useCallback(
    (value: number) => {
      onUpdate({ ...widget.data, borderWidth: value });
    },
    [widget.data, onUpdate]
  );

  const handleBorderColorChange = useCallback(
    (value: string) => {
      onUpdate({ ...widget.data, borderColor: value });
    },
    [widget.data, onUpdate]
  );

  const handleBorderStyleChange = useCallback(
    (value: TableBorderStyle) => {
      onUpdate({ ...widget.data, borderStyle: value });
    },
    [widget.data, onUpdate]
  );

  const handleCellPaddingChange = useCallback(
    (value: number) => {
      onUpdate({ ...widget.data, cellPadding: value });
    },
    [widget.data, onUpdate]
  );

  const handleOuterBorderChange = useCallback(
    (value: boolean) => {
      onUpdate({ ...widget.data, showOuterBorder: value });
    },
    [widget.data, onUpdate]
  );

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
    <div className="w-full p-2">
      {/* Controls */}
      <div className="flex flex-wrap gap-2 mb-3">
        <button
          onClick={handleAddRow}
          className="flex items-center gap-1 px-3 py-1.5 text-sm bg-blue-50 text-blue-600 rounded-md hover:bg-blue-100 transition-colors"
        >
          <FiPlus className="w-4 h-4" />
          {t("addRow")}
        </button>
        <button
          onClick={handleAddColumn}
          className="flex items-center gap-1 px-3 py-1.5 text-sm bg-blue-50 text-blue-600 rounded-md hover:bg-blue-100 transition-colors"
        >
          <FiPlus className="w-4 h-4" />
          {t("addColumn")}
        </button>
        {rows > 1 && (
          <button
            onClick={handleRemoveRow}
            className="flex items-center gap-1 px-3 py-1.5 text-sm bg-red-50 text-red-600 rounded-md hover:bg-red-100 transition-colors"
          >
            <FiTrash2 className="w-4 h-4" />
            {t("removeRow")}
          </button>
        )}
        {columns > 1 && (
          <button
            onClick={handleRemoveColumn}
            className="flex items-center gap-1 px-3 py-1.5 text-sm bg-red-50 text-red-600 rounded-md hover:bg-red-100 transition-colors"
          >
            <FiTrash2 className="w-4 h-4" />
            {t("removeColumn")}
          </button>
        )}
        <button
          onClick={() => setShowSettings(!showSettings)}
          className={`flex items-center gap-1 px-3 py-1.5 text-sm rounded-md transition-colors ${
            showSettings
              ? "bg-gray-200 text-gray-700"
              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
          }`}
        >
          <FiSettings className="w-4 h-4" />
          {t("tableBorderSettings")}
        </button>

      </div>

      {/* Border Settings Panel */}
      {showSettings && (
        <div className="mb-3 p-3 bg-gray-50 rounded-lg border border-gray-200 space-y-3">
          {/* Border Width */}
          <div className="flex items-center gap-3">
            <label className="text-sm text-gray-600 w-28">{t("tableBorderWidth")}</label>
            <input
              type="range"
              min="0"
              max="5"
              value={borderWidth}
              onChange={(e) => handleBorderWidthChange(Number(e.target.value))}
              className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
            />
            <span className="text-sm text-gray-500 w-8">{borderWidth}px</span>
          </div>

          {/* Border Style */}
          <div className="flex items-center gap-3">
            <label className="text-sm text-gray-600 w-28">{t("tableBorderStyle")}</label>
            <div className="flex gap-2">
              {(["solid", "dashed", "dotted", "none"] as TableBorderStyle[]).map((style) => (
                <button
                  key={style}
                  onClick={() => handleBorderStyleChange(style)}
                  className={`px-3 py-1 text-xs rounded-md transition-colors ${
                    borderStyle === style
                      ? "bg-blue-500 text-white"
                      : "bg-white border border-gray-300 text-gray-600 hover:border-blue-400"
                  }`}
                >
                  {t(`tableBorderStyle_${style}`)}
                </button>
              ))}
            </div>
          </div>

          {/* Border Color */}
          <div className="flex items-center gap-3">
            <label className="text-sm text-gray-600 w-28">{t("tableBorderColor")}</label>
            <div className="flex gap-2 flex-wrap">
              {BORDER_COLORS.map((color) => (
                <button
                  key={color.value}
                  onClick={() => handleBorderColorChange(color.value)}
                  className={`w-6 h-6 rounded-md border-2 transition-all ${
                    borderColor === color.value
                      ? "border-blue-500 scale-110"
                      : "border-gray-300 hover:scale-105"
                  }`}
                  style={{ backgroundColor: color.value }}
                  title={color.label}
                />
              ))}
              <input
                type="color"
                value={borderColor}
                onChange={(e) => handleBorderColorChange(e.target.value)}
                className="w-6 h-6 rounded-md cursor-pointer border border-gray-300"
                title={t("customColor")}
              />
            </div>
          </div>

          {/* Cell Padding */}
          <div className="flex items-center gap-3">
            <label className="text-sm text-gray-600 w-28">{t("tableCellPadding")}</label>
            <input
              type="range"
              min="0"
              max="24"
              value={cellPadding}
              onChange={(e) => handleCellPaddingChange(Number(e.target.value))}
              className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
            />
            <span className="text-sm text-gray-500 w-8">{cellPadding}px</span>
          </div>

          {/* Outer Border Toggle */}
          <div className="flex items-center gap-3">
            <label className="text-sm text-gray-600 w-28">{t("tableOuterBorder")}</label>
            <button
              onClick={() => handleOuterBorderChange(!showOuterBorder)}
              className={`relative w-11 h-6 rounded-full transition-colors ${
                showOuterBorder ? "bg-blue-500" : "bg-gray-300"
              }`}
            >
              <span
                className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform ${
                  showOuterBorder ? "translate-x-5" : ""
                }`}
              />
            </button>
          </div>

          {/* Cell merge/split */}
          <div className="flex items-center gap-3 pt-2 border-t border-gray-200">
            <label className="text-sm text-gray-600 w-28">{t("mergeSplitCells")}</label>
            <div className="flex gap-2">
              <button
                onClick={() => {
                  setMergeMode(!mergeMode);
                  if (mergeMode) {
                    setSelectedCells(new Set());
                    setAnchorCell(null);
                  }
                }}
                className={`flex items-center gap-1 px-3 py-1.5 text-sm rounded-md transition-colors ${
                  mergeMode
                    ? "bg-purple-500 text-white"
                    : "bg-white border border-gray-300 text-gray-600 hover:border-purple-400"
                }`}
              >
                {mergeMode ? t("selectingCells") : t("cellSelection")}
              </button>
              {canMerge && (
                <button
                  onClick={handleMerge}
                  className="flex items-center gap-1 px-3 py-1.5 text-sm bg-purple-50 text-purple-600 rounded-md hover:bg-purple-100 transition-colors"
                >
                  {t("mergeCells")}
                </button>
              )}
              {canSplit && (
                <button
                  onClick={handleSplit}
                  className="flex items-center gap-1 px-3 py-1.5 text-sm bg-orange-50 text-orange-600 rounded-md hover:bg-orange-100 transition-colors"
                >
                  {t("splitCells")}
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Table */}
      <div
        ref={tableRef}
        className="grid bg-white rounded-lg overflow-x-auto"
        style={{
          gridTemplateColumns: `repeat(${columns}, 1fr)`,
          gridTemplateRows: `repeat(${rows}, auto)`,
          border: outerBorderStyle,
          gap: 0,
        }}
      >
        {rowArray.map((row) =>
          colArray.map((col) => {
            // Skip cells covered by a merge
            if (isCoveredByMerge(row, col, merges)) return null;

            const merge = getMergeAt(row, col, merges);
            const colSpan = merge?.colSpan || 1;
            const rowSpan = merge?.rowSpan || 1;
            const cellWidget = getWidgetAtCell(row, col);
            const cellKey = `${row}-${col}`;
            const isSelected = selectedCells.has(cellKey);

            // Border logic: show right border if NOT at the rightmost edge of grid
            const cellRightEdge = col + colSpan;
            const cellBottomEdge = row + rowSpan;
            const showRightBorder = cellRightEdge < columns;
            const showBottomBorder = cellBottomEdge < rows;

            return (
              <div
                key={cellKey}
                className={`min-h-[80px] relative group transition-colors ${
                  mergeMode
                    ? `cursor-pointer ${isSelected ? "bg-blue-100 ring-2 ring-blue-500 ring-inset z-10" : "bg-white hover:bg-blue-50"}`
                    : "bg-white"
                }`}
                style={{
                  gridColumn: `${col + 1} / span ${colSpan}`,
                  gridRow: `${row + 1} / span ${rowSpan}`,
                  padding: `${cellPadding}px`,
                  borderRight: showRightBorder ? cellBorderStyle : "none",
                  borderBottom: showBottomBorder ? cellBorderStyle : "none",
                }}
                onClick={(e) => {
                  if (mergeMode) {
                    e.stopPropagation();
                    handleCellSelect(row, col, e.shiftKey);
                  }
                }}
              >
                {/* Overlay to block interactions in merge mode */}
                {mergeMode && (
                  <div className="absolute inset-0 z-20" />
                )}
                {cellWidget ? (
                  <div className="w-full h-full relative">
                    <LayoutPlaceholder
                      blockId={blockId}
                      row={row}
                      column={col}
                      widget={cellWidget}
                    />
                  </div>
                ) : (
                  <button
                    onClick={(e) => {
                      if (mergeMode) return;
                      e.stopPropagation();
                      handleAddWidgetToCell(row, col);
                    }}
                    className={`w-full h-full min-h-[60px] flex items-center justify-center transition-colors rounded border-2 border-dashed border-gray-200 ${
                      mergeMode ? "pointer-events-none text-gray-300" : "text-gray-400 hover:text-blue-500 hover:bg-blue-50/50"
                    }`}
                  >
                    <FiPlus className="w-6 h-6" />
                  </button>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
