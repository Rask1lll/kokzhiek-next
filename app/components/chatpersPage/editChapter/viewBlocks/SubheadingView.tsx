"use client";

type SubheadingViewProps = {
  value: string;
};

export default function SubheadingView({ value }: SubheadingViewProps) {
  return (
    <h3 className="text-lg text-wrap wrap-anywhere font-semibold text-gray-700">
      {value || "Подзаголовок"}
    </h3>
  );
}
