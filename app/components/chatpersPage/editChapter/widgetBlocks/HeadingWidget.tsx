"use client";

import { useMemo } from "react";

type HeadingWidgetProps = {
  value: string; // JSON: { level: 1-6, text: "..." }
  onChange: (value: string) => void;
};

type HeadingLevel = 1 | 2 | 3 | 4 | 5 | 6;

type HeadingData = {
  level: HeadingLevel;
  text: string;
};

const headingStyles: Record<HeadingLevel, string> = {
  1: "text-4xl font-bold",
  2: "text-3xl font-bold",
  3: "text-2xl font-bold",
  4: "text-xl font-semibold",
  5: "text-lg font-semibold",
  6: "text-base font-semibold",
};

function parseHeadingData(value: string): HeadingData {
  try {
    const parsed = JSON.parse(value);
    if (
      parsed &&
      typeof parsed.level === "number" &&
      typeof parsed.text === "string"
    ) {
      return parsed;
    }
  } catch {
    // If not JSON, treat as plain text with default level
  }
  return { level: 1, text: value || "" };
}

export default function HeadingWidget({ value, onChange }: HeadingWidgetProps) {
  const data = useMemo(() => parseHeadingData(value), [value]);

  const updateData = (newData: HeadingData) => {
    onChange(JSON.stringify(newData));
  };

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const target = e.target;
    target.style.height = "auto";
    target.style.height = `${target.scrollHeight}px`;
    updateData({ ...data, text: target.value });
  };

  const handleLevelChange = (level: HeadingLevel) => {
    updateData({ ...data, level });
  };

  return (
    <div className="w-19/20">
      {/* Level selector */}
      <div
        className={`flex items-center gap-1 mb-2 p-1 w-fit bg-gray-50 rounded-lg border border-gray-200 transition-opacity ${"opacity-100"}`}
      >
        <span className="text-xs text-gray-500 px-2">Уровень:</span>
        {([1, 2, 3, 4, 5, 6] as HeadingLevel[]).map((level) => (
          <button
            key={level}
            type="button"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => handleLevelChange(level)}
            className={`px-2 py-1 text-sm font-medium rounded transition-colors ${
              data.level === level
                ? "bg-blue-100 text-blue-700"
                : "text-gray-600 hover:bg-gray-200"
            }`}
          >
            H{level}
          </button>
        ))}
      </div>

      {/* Heading input */}
      <textarea
        className={`w-full min-h-[40px] leading-tight bg-transparent border-none outline-none placeholder:text-gray-400 resize-none overflow-hidden text-gray-900 ${
          headingStyles[data.level]
        }`}
        placeholder="Введите заголовок"
        value={data.text}
        onChange={handleTextChange}
      />
    </div>
  );
}
