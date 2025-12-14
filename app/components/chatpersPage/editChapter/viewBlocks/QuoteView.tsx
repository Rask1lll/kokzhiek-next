"use client";

type QuoteViewProps = {
  value: string;
};

export default function QuoteView({ value }: QuoteViewProps) {
  return (
    <blockquote className="border-l-4 text-wrap wrap-anywhere border-gray-300 pl-4 italic text-gray-700">
      {value || "Цитата"}
    </blockquote>
  );
}
