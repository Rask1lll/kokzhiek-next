"use client";

import { useState, useRef, useEffect } from "react";
import { Widget } from "@/app/types/widget";
import LayoutPlaceholder from "./LayoutPlaceholder";
import { Block } from "@/app/types/block";
import { useSearchParams } from "next/navigation";
import ViewPlaceholder from "./ViewPlaceholder";
import { useBlocks } from "@/app/hooks/useBlocks";
import { FiTrash2, FiDroplet } from "react-icons/fi";
import { CgOptions } from "react-icons/cg";
import { useTranslations } from "next-intl";

// Color keys for translation
const PRESET_COLOR_KEYS = [
  { key: "colorDefault", value: "" },
  { key: "colorWhite", value: "#ffffff" },
  { key: "colorLightGray", value: "#f3f4f6" },
  { key: "colorBlue", value: "#dbeafe" },
  { key: "colorGreen", value: "#dcfce7" },
  { key: "colorYellow", value: "#fef9c3" },
  { key: "colorPink", value: "#fce7f3" },
  { key: "colorPurple", value: "#ede9fe" },
  { key: "colorOrange", value: "#ffedd5" },
];

type LayoutProps = {
  block: Block;
};

function getColumnsCount(layoutCode: string): number {
  switch (layoutCode) {
    case "full":
    case "single":
      return 1;
    case "two_equal":
    case "split":
    case "two_rows":
      return 2;
    case "left_wide":
    case "hero":
    case "right_wide":
    case "sidebar_left":
    case "sidebar_right":
      return 2;
    case "three_cols":
    case "2-column":
    case "three_center_wide":
      return 3;
    case "four_cols":
      return 4;
    default:
      return 1;
  }
}

// Get column flex classes based on layout code and column index
function getColumnClasses(layoutCode: string, columnIndex: number): string {
  switch (layoutCode) {
    case "left_wide":
    case "hero":
      return columnIndex === 0 ? "w-[70%] flex-none" : "w-[30%] flex-none";

    case "right_wide":
      return columnIndex === 0 ? "w-[30%] flex-none" : "w-[70%] flex-none";

    case "sidebar_left":
      return columnIndex === 0 ? "w-[25%] flex-none" : "w-[75%] flex-none";

    case "sidebar_right":
      return columnIndex === 0 ? "w-[75%] flex-none" : "w-[25%] flex-none";

    case "three_center_wide":
      if (columnIndex === 1) return "w-[50%] flex-none";
      return "w-[25%] flex-none";

    default:
      return "w-full";
  }
}

// Group widgets by column and sort by row
function groupWidgetsByColumn(
  widgets: Widget[],
  columnsCount: number
): Map<number, Widget[]> {
  const grouped = new Map<number, Widget[]>();

  // Initialize all columns
  for (let i = 0; i < columnsCount; i++) {
    grouped.set(i, []);
  }

  // Group widgets by column
  widgets.forEach((widget) => {
    const col = widget.column;
    if (col >= 0 && col < columnsCount) {
      const columnWidgets = grouped.get(col) || [];
      columnWidgets.push(widget);
      grouped.set(col, columnWidgets);
    }
  });

  // Sort each column's widgets by row
  grouped.forEach((columnWidgets, col) => {
    grouped.set(
      col,
      columnWidgets.sort((a, b) => a.row - b.row)
    );
  });

  return grouped;
}

// Get the next available row for a column
function getNextRow(columnWidgets: Widget[]): number {
  if (columnWidgets.length === 0) return 0;
  return Math.max(...columnWidgets.map((w) => w.row)) + 1;
}

// Column component
type ColumnProps = {
  blockId: number;
  columnIndex: number;
  widgets: Widget[];
  className?: string;
};

const Column = ({ blockId, columnIndex, widgets, className }: ColumnProps) => {
  const nextRow = getNextRow(widgets);
  const params = useSearchParams();
  const isEdit = params.get("edit");

  if (!isEdit) {
    return (
      <div
        className={`flex flex-col gap-2 ${isEdit ? "w-19/20" : "w-full"} ${
          className || ""
        }`}
      >
        {/* Render existing widgets */}
        {widgets.map((widget) => (
          <ViewPlaceholder key={widget.id} widget={widget} />
        ))}
      </div>
    );
  }

  return (
    <div className={`flex flex-col gap-2 ${className || ""}`}>
      {/* Render existing widgets */}
      {widgets.map((widget) => (
        <LayoutPlaceholder
          key={widget.id}
          className="min-h-[60px]"
          blockId={blockId}
          row={widget.row}
          column={columnIndex}
          widget={widget}
        />
      ))}

      {/* Add new widget button / empty placeholder */}
      <LayoutPlaceholder
        className="min-h-[60px]"
        blockId={blockId}
        row={nextRow}
        column={columnIndex}
        widget={null}
      />
    </div>
  );
};

// Block Menu Component
type BlockMenuProps = {
  currentColor: string;
  onColorChange: (color: string) => void;
  onDelete: () => void;
};

const BlockMenu = ({
  currentColor,
  onColorChange,
  onDelete,
}: BlockMenuProps) => {
  const t = useTranslations("blockEditor");
  const [isOpen, setIsOpen] = useState(false);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [tempColor, setTempColor] = useState<string | null>(null);
  const [isColorPicking, setIsColorPicking] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        // Apply temp color if picking was in progress
        if (isColorPicking && tempColor !== null) {
          onColorChange(tempColor);
          setTempColor(null);
        }
        setIsColorPicking(false);
        setIsOpen(false);
        setShowColorPicker(false);
      }
    };

    const handleMouseUp = () => {
      if (isColorPicking && tempColor !== null) {
        onColorChange(tempColor);
        setTempColor(null);
      }
      setIsColorPicking(false);
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("mouseup", handleMouseUp);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isOpen, isColorPicking, tempColor, onColorChange]);

  return (
    <div className="relative mt-2" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-1.5 hover:bg-gray-200 border border-gray-300 border-l-0 rounded-l-none rounded-md transition-colors"
        title={t("blockMenu")}
      >
        <CgOptions className="w-7 h-7 text-gray-500" />
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-1 bg-white rounded-lg shadow-lg border border-gray-200 min-w-[180px] z-20">
          {/* Color option */}
          <div className="relative">
            <button
              onClick={() => {
                setShowColorPicker(!showColorPicker);
                setTempColor(null);
                setIsColorPicking(false);
              }}
              className="w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
            >
              <FiDroplet className="w-4 h-4" />
              {t("backgroundColor")}
              <div
                className="w-4 h-4 rounded border border-gray-300 ml-auto"
                style={{
                  backgroundColor: currentColor || "#f3f4f6",
                }}
              />
            </button>

            {showColorPicker && (
              <div className="absolute right-full top-0 mr-1 p-2 bg-white rounded-lg shadow-lg border border-gray-200 min-w-[180px] z-30">
                <div className="grid grid-cols-3 gap-1.5">
                  {PRESET_COLOR_KEYS.map((color) => (
                    <button
                      key={color.value || "default"}
                      onClick={() => {
                        onColorChange(color.value);
                        setShowColorPicker(false);
                        setIsOpen(false);
                      }}
                      className={`w-10 h-10 rounded-md border-2 transition-transform hover:scale-105 ${
                        currentColor === color.value
                          ? "border-blue-500 ring-2 ring-blue-200"
                          : "border-gray-200"
                      }`}
                      style={{
                        backgroundColor: color.value || "#f3f4f6",
                      }}
                      title={t(color.key)}
                    />
                  ))}
                </div>
                {/* Custom color */}
                <div className="mt-2 pt-2 border-t border-gray-100">
                  <label className="text-xs text-gray-500 block mb-1">
                    {t("customColor")}
                  </label>
                  <input
                    type="color"
                    value={
                      tempColor !== null ? tempColor : currentColor || "#f3f4f6"
                    }
                    onChange={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setTempColor(e.target.value);
                      if (!isColorPicking) {
                        setIsColorPicking(true);
                      }
                    }}
                    className="w-full h-8 rounded cursor-pointer"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Divider */}
          <div className="border-t border-gray-100 my-1" />

          {/* Delete option */}
          <button
            onClick={() => {
              if (confirm(t("confirmDeleteBlock"))) {
                onDelete();
              }
              setIsOpen(false);
            }}
            className="w-full px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
          >
            <FiTrash2 className="w-4 h-4" />
            {t("deleteBlock")}
          </button>
        </div>
      )}
    </div>
  );
};

const Layout = ({ block }: LayoutProps) => {
  const { layout_type, widgets, id, style } = block;
  const columnsCount = getColumnsCount(layout_type);
  const groupedWidgets = groupWidgetsByColumn(widgets, columnsCount);
  const params = useSearchParams();
  const isEdit = params.get("edit");
  const { remove: removeBlock, updateStyle } = useBlocks();

  const blockColor = style?.color || "";

  const handleColorChange = (color: string) => {
    updateStyle(id, { color });
  };

  const handleDelete = async () => {
    await removeBlock(id);
  };

  console.log(block);

  // Single column layout
  if (columnsCount === 1) {
    const columnWidgets = groupedWidgets.get(0) || [];
    return (
      <div className="flex group/block w-full">
        <div
          className="w-full ring ring-gray-300 rounded-md transition-colors"
          style={{ backgroundColor: blockColor || "#f3f4f6" }}
        >
          <Column
            blockId={id}
            columnIndex={0}
            widgets={columnWidgets}
            className=""
          />
        </div>
        {isEdit && (
          <div className=" top-2 right-[-40px] opacity-100 transition-opacity">
            <BlockMenu
              currentColor={blockColor}
              onColorChange={handleColorChange}
              onDelete={handleDelete}
            />
            <div className="flex flex-col justify-between items-center gap-1">
              <div className="flex flex-col justify-center gap-0 text-gray-400 hover:text-gray-600">
                <p className="h-3 leading-none">::</p>
                <p className="h-3 leading-none">::</p>
                <p className="h-3 leading-none">::</p>
                <p className="leading-none">::</p>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="relative  flex group/block w-full">
      <div
        className="w-full flex gap-4 rounded-md ring ring-gray-300 transition-colors"
        style={{ backgroundColor: blockColor || "#EDEDED" }}
      >
        {Array.from({ length: columnsCount }).map((_, colIndex) => {
          const columnWidgets = groupedWidgets.get(colIndex) || [];
          const columnClass = getColumnClasses(layout_type, colIndex);

          return (
            <div key={colIndex} className={`${columnClass} mb-2`}>
              <Column
                blockId={id}
                columnIndex={colIndex}
                widgets={columnWidgets}
              />
            </div>
          );
        })}
      </div>
      {isEdit && (
        <div className=" top-2 right-[-40px] opacity-100 transition-opacity">
          <BlockMenu
            currentColor={blockColor}
            onColorChange={handleColorChange}
            onDelete={handleDelete}
          />
          <div className="flex flex-col justify-between items-center gap-1">
            <div className="flex flex-col justify-center gap-0 text-gray-400 hover:text-gray-600">
              <p className="h-3 leading-none">::</p>
              <p className="h-3 leading-none">::</p>
              <p className="h-3 leading-none">::</p>
              <p className="leading-none">::</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Layout;
