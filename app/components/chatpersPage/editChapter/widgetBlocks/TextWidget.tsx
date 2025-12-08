"use client";

type TextWidgetProps = {
  value: string;
  onChange: (value: string) => void;
};

export default function TextWidget({ value, onChange }: TextWidgetProps) {
  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const target = e.target;
    target.style.height = "auto";
    target.style.height = `${target.scrollHeight}px`;
    onChange(target.value);
  };

  return (
    <textarea
      className="w-full min-h-[80px] bg-gray-50 border-none outline-none resize-none overflow-hidden text-gray-800 placeholder:text-gray-400"
      placeholder="Введите текст"
      value={value}
      onChange={handleInput}
    />
  );
}
