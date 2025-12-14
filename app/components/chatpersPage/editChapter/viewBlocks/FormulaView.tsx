"use client";

import dynamic from "next/dynamic";

type FormulaViewProps = {
  value: string;
};

const BlockMath = dynamic(
  () => import("react-katex").then((mod) => mod.BlockMath),
  { ssr: false }
);

export default function FormulaView({ value }: FormulaViewProps) {
  if (!value) {
    return <p className="text-gray-400">Формула не введена</p>;
  }

  return (
    <div className="text-lg overflow-x-auto">
      {/* @ts-expect-error: react-katex types may not be installed */}
      <BlockMath math={value} />
    </div>
  );
}

