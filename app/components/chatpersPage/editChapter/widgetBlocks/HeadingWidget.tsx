"use client";

type HeadingWidgetProps = {
  value: string;
  onChange: (value: string) => void;
};

export default function HeadingWidget({ value, onChange }: HeadingWidgetProps) {
  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const target = e.target;
    target.style.height = "auto";
    target.style.height = `${target.scrollHeight}px`;
    onChange(target.value);
  };

  return (
    <textarea
      className="w-full  min-h-[40px] text-2xl leading-tight font-bold bg-transparent border-none outline-none placeholder:text-gray-400 resize-none overflow-hidden"
      placeholder="Введите заголовок"
      value={value}
      onChange={handleInput}
    />
  );
}
