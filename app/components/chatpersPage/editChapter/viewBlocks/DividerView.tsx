"use client";

import { useMemo } from "react";

type DividerViewProps = {
  value: string;
};

type DividerStyle = "solid" | "dashed" | "dotted";
type DividerThickness = 1 | 2 | 3 | 4;

type DividerData = {
  style: DividerStyle;
  thickness: DividerThickness;
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

export default function DividerView({ value }: DividerViewProps) {
  const data = useMemo(() => parseDividerData(value), [value]);

  const borderStyleClass =
    data.style === "dashed"
      ? "border-dashed"
      : data.style === "dotted"
      ? "border-dotted"
      : "border-solid";

  return (
    <hr
      className={`w-full max-w-[100%] border-gray-400 ${
        thicknessClasses[data.thickness]
      } ${borderStyleClass}`}
    />
  );
}
