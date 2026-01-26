"use client";

import { useState, useCallback, useMemo } from "react";
import { Widget, WidgetData } from "@/app/types/widget";
import { FiPlus, FiTrash2, FiSettings } from "react-icons/fi";
import { useTranslations } from "next-intl";
import { createChildWidget, deleteWidget } from "@/app/services/constructor/widgetApi";
import { useBlocksStore } from "@/app/store/blocksStore";
import WidgetListModal from "../WidgetListModal";
import { useModalWindowStore } from "@/app/store/modalWindowStore";
import LayoutPlaceholder from "../LayoutPlaceholder";

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

export default function TableWidget({
  widget,
  blockId,
  onUpdate,
}: TableWidgetProps) {
  const t = useTranslations("blockEditor");
  const { addChildWidgetLocal, removeChildWidgetLocal } = useBlocksStore();
  const { addContent, removeContent } = useModalWindowStore();
  const [showSettings, setShowSettings] = useState(false);

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

    // Delete all widgets in the last row
    const widgetsInLastRow = children.filter((w) => w.row === rows - 1);
    for (const w of widgetsInLastRow) {
      await deleteWidget(w.id);
      removeChildWidgetLocal(widget.id, w.id);
    }

    onUpdate({
      ...widget.data,
      rows: rows - 1,
    });
  }, [rows, children, widget.id, widget.data, onUpdate, removeChildWidgetLocal]);

  // Remove column
  const handleRemoveColumn = useCallback(async () => {
    if (columns <= 1) return;

    // Delete all widgets in the last column
    const widgetsInLastColumn = children.filter((w) => w.column === columns - 1);
    for (const w of widgetsInLastColumn) {
      await deleteWidget(w.id);
      removeChildWidgetLocal(widget.id, w.id);
    }

    onUpdate({
      ...widget.data,
      columns: columns - 1,
    });
  }, [columns, children, widget.id, widget.data, onUpdate, removeChildWidgetLocal]);

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
        </div>
      )}

      {/* Table */}
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
                className="min-h-[80px] bg-white relative group"
                style={{
                  padding: `${cellPadding}px`,
                  borderRight: isLastCol ? "none" : cellBorderStyle,
                  borderBottom: isLastRow ? "none" : cellBorderStyle,
                }}
              >
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
                    onClick={() => handleAddWidgetToCell(row, col)}
                    className="w-full h-full min-h-[60px] flex items-center justify-center text-gray-400 hover:text-blue-500 hover:bg-blue-50/50 transition-colors rounded border-2 border-dashed border-gray-200"
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
