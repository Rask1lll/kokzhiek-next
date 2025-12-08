"use client";

type SubheadingWidgetProps = {
  value: string;
  onChange: (value: string) => void;
};

export default function SubheadingWidget({
  value,
  onChange,
}: SubheadingWidgetProps) {
  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const target = e.target;
    target.style.height = "auto";
    target.style.height = `${target.scrollHeight}px`;
    onChange(target.value);
  };

  return (
    <textarea
      className="w-full min-h-[32px] text-lg leading-snug font-semibold text-gray-700 bg-transparent border-none outline-none placeholder:text-gray-400 resize-none overflow-hidden"
      placeholder="Введите подзаголовок"
      value={value}
      onChange={handleInput}
    />
  );
}

