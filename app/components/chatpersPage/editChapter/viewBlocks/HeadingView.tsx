"use client";

import { JSX, useMemo } from "react";

type HeadingViewProps = {
  value: string;
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

export default function HeadingView({ value }: HeadingViewProps) {
  const data = useMemo(() => parseHeadingData(value), [value]);
  const Tag = `h${data.level}` as keyof JSX.IntrinsicElements;

  return (
    <Tag
      className={`text-gray-900 text-wrap wrap-anywhere ${
        headingStyles[data.level]
      }`}
    >
      {data.text || "Заголовок"}
    </Tag>
  );
}
