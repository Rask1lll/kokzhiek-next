"use client";

import { useMemo, useState } from "react";

type SingleChoiceViewProps = {
  value: string;
  onChange?: (value: string) => void;
};

type Option = {
  id: string;
  text: string;
  isCorrect: boolean;
};

type SingleChoiceData = {
  options: Option[];
};

type UserAnswer = {
  selectedId: string | null;
};

function parseData(value: string): SingleChoiceData {
  try {
    const parsed = JSON.parse(value);
    if (parsed && Array.isArray(parsed.options)) {
      return parsed;
    }
  } catch {
    // Invalid JSON
  }
  return { options: [] };
}

export default function SingleChoiceView({
  value,
  onChange,
}: SingleChoiceViewProps) {
  const data = useMemo(() => parseData(value), [value]);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const handleSelect = (id: string) => {
    setSelectedId(id);

    if (onChange) {
      const answer: UserAnswer = { selectedId: id };
      onChange(JSON.stringify(answer));
    }
  };

  if (data.options.length === 0) {
    return <p className="text-gray-400">Нет вариантов ответа</p>;
  }

  return (
    <div className="space-y-2">
      {data.options.map((option) => (
        <label
          key={option.id}
          className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
            selectedId === option.id
              ? "bg-blue-50 border-blue-300"
              : "bg-white border-gray-200 hover:bg-gray-50"
          }`}
        >
          <input
            type="radio"
            name="single-choice"
            checked={selectedId === option.id}
            onChange={() => handleSelect(option.id)}
            className="w-5 h-5 border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          <span className="text-gray-800">{option.text}</span>
        </label>
      ))}
    </div>
  );
}

