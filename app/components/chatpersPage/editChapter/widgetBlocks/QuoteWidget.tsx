"use client";

type QuoteWidgetProps = {
  value: string;
  onChange: (value: string) => void;
};

export default function QuoteWidget({ value, onChange }: QuoteWidgetProps) {
  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const target = e.target;
    target.style.height = "auto";
    target.style.height = `${target.scrollHeight}px`;
    onChange(target.value);
  };

  return (
    <div className="border-l-4 border-gray-300 pl-3 italic text-gray-700">
      <textarea
        className="w-full bg-transparent ring-gray-300 ring rounded-lg border-none outline-none resize-none overflow-hidden placeholder:text-gray-400"
        placeholder="Введите цитату"
        value={value}
        onChange={handleInput}
      />
    </div>
  );
}
