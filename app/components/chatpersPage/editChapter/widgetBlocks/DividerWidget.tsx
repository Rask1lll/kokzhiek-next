"use client";

import { useState, useMemo } from "react";

type DividerWidgetProps = {
  value: string; // JSON: { style: "solid" | "dashed" | "dotted", thickness: 1-4 }
  onChange: (value: string) => void;
};

type DividerStyle = "solid" | "dashed" | "dotted";
type DividerThickness = 1 | 2 | 3 | 4;

type DividerData = {
  style: DividerStyle;
  thickness: DividerThickness;
};

const styleLabels: Record<DividerStyle, string> = {
  solid: "Сплошная",
  dashed: "Пунктир",
  dotted: "Точки",
};

const thicknessClasses: Record<DividerThickness, string> = {
  1: "border-t",
  2: "border-t-2",
  3: "border-t-4",
  4: "border-t-8",
};

function parseDividerData(value: string): DividerData {
  try {
    const parsed = JSON.parse(value);
    if (parsed && parsed.style && parsed.thickness) {
      return parsed;
    }
  } catch {
    // Default values
  }
  return { style: "solid", thickness: 1 };
}

export default function DividerWidget({ value, onChange }: DividerWidgetProps) {
  const [isToolbarVisible, setIsToolbarVisible] = useState(false);

  const data = useMemo(() => parseDividerData(value), [value]);

  const updateData = (newData: DividerData) => {
    onChange(JSON.stringify(newData));
  };

  const handleStyleChange = (style: DividerStyle) => {
    updateData({ ...data, style });
  };

  const handleThicknessChange = (thickness: DividerThickness) => {
    updateData({ ...data, thickness });
  };

  const borderStyleClass =
    data.style === "dashed"
      ? "border-dashed"
      : data.style === "dotted"
      ? "border-dotted"
      : "border-solid";

  return (
    <div
      className="w-full py-4"
      onMouseEnter={() => setIsToolbarVisible(true)}
      onMouseLeave={() => setIsToolbarVisible(false)}
    >
      {/* Toolbar */}
      <div
        className={`flex items-center lg:flex-col justify-center gap-4 mb-3 p-2 bg-gray-50 rounded-lg border border-gray-200 transition-opacity ${
          isToolbarVisible ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
      >
        {/* Style selector */}
        <div className="flex items-center gap-1">
          <span className="text-xs text-gray-500 mr-1">Стиль:</span>
          {(["solid", "dashed", "dotted"] as DividerStyle[]).map((style) => (
            <button
              key={style}
              type="button"
              onClick={() => handleStyleChange(style)}
              className={`px-2 py-1 text-xs rounded transition-colors ${
                data.style === style
                  ? "bg-blue-100 text-blue-700"
                  : "text-gray-600 hover:bg-gray-200"
              }`}
            >
              {styleLabels[style]}
            </button>
          ))}
        </div>

        {/* Thickness selector */}
        <div className="flex items-center gap-1">
          <span className="text-xs text-gray-500 mr-1">Толщина:</span>
          {([1, 2, 3, 4] as DividerThickness[]).map((thickness) => (
            <button
              key={thickness}
              type="button"
              onClick={() => handleThicknessChange(thickness)}
              className={`w-6 h-6 flex items-center justify-center text-xs rounded transition-colors ${
                data.thickness === thickness
                  ? "bg-blue-100 text-blue-700"
                  : "text-gray-600 hover:bg-gray-200"
              }`}
            >
              {thickness}
            </button>
          ))}
        </div>
      </div>

      {/* Divider line */}
      <hr
        className={`w-full max-w-[100%] border-gray-400 ${
          thicknessClasses[data.thickness]
        } ${borderStyleClass}`}
      />
    </div>
  );
}
