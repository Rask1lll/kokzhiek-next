"use client";

import dynamic from "next/dynamic";

type FormulaWidgetProps = {
  value: string;
  onChange: (value: string) => void;
};

const BlockMath = dynamic(
  () => import("react-katex").then((mod) => mod.BlockMath),
  { ssr: false }
);

export default function FormulaWidget({ value, onChange }: FormulaWidgetProps) {
  return (
    <div className="space-y-3">
      <textarea
        spellCheck
        className="w-full min-h-[60px] bg-transparent border border-gray-200 rounded-md px-2 py-1 text-sm font-mono outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-300 placeholder:text-gray-400"
        placeholder="Введите формулу в формате LaTeX, например: \int_0^1 x^2 dx"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
      {value && (
        <div className="border-t border-gray-200 pt-2 text-lg overflow-x-auto">
          {/* @ts-expect-error: react-katex types may not be installed */}
          <BlockMath math={value} />
        </div>
      )}
    </div>
  );
}
