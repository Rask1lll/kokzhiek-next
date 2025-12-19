"use client";

import { useMemo, useState } from "react";

type MultipleChoiceViewProps = {
  value: string;
  onChange?: (value: string) => void;
};

type Option = {
  id: string;
  text: string;
  isCorrect: boolean;
};

type MultipleChoiceData = {
  options: Option[];
  question: string;
};

type UserAnswer = {
  selectedIds: string[];
};

function parseData(value: string): MultipleChoiceData {
  try {
    const parsed = JSON.parse(value);
    if (parsed && Array.isArray(parsed.options)) {
      return parsed;
    }
  } catch {
    // Invalid JSON
  }
  return { options: [], question: "" };
}

export default function MultipleChoiceView({
  value,
  onChange,
}: MultipleChoiceViewProps) {
  const data = useMemo(() => parseData(value), [value]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const handleToggle = (id: string) => {
    const newSelected = selectedIds.includes(id)
      ? selectedIds.filter((s) => s !== id)
      : [...selectedIds, id];

    setSelectedIds(newSelected);

    if (onChange) {
      const answer: UserAnswer = { selectedIds: newSelected };
      onChange(JSON.stringify(answer));
    }
  };

  if (data.options.length === 0) {
    return <p className="text-gray-400">Нет вариантов ответа</p>;
  }

  return (
    <div className="space-y-2">
      <div className="text-lg pl-2">{data.question}</div>
      {data.options.map((option) => (
        <label
          key={option.id}
          className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
            selectedIds.includes(option.id)
              ? "bg-blue-50 border-blue-300"
              : "bg-white border-gray-200 hover:bg-gray-50"
          }`}
        >
          <input
            type="checkbox"
            checked={selectedIds.includes(option.id)}
            onChange={() => handleToggle(option.id)}
            className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          <span className="text-gray-800">{option.text}</span>
        </label>
      ))}
    </div>
  );
}
