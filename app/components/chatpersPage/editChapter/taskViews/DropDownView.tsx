"use client";

import { useMemo, useState } from "react";

type DropDownViewProps = {
  value: string;
  onChange?: (value: string) => void;
};

type DropdownItem = {
  id: string;
  options: string[];
  correctIndex: number;
};

type DropDownData = {
  text: string;
  dropdowns: DropdownItem[];
};

type UserAnswer = {
  answers: Record<string, number>; // dropdownId -> selectedIndex
};

function parseData(value: string): DropDownData {
  try {
    const parsed = JSON.parse(value);
    if (parsed && typeof parsed.text === "string") {
      return parsed;
    }
  } catch {
    // Invalid JSON
  }
  return { text: "", dropdowns: [] };
}

export default function DropDownView({ value, onChange }: DropDownViewProps) {
  const data = useMemo(() => parseData(value), [value]);
  const [answers, setAnswers] = useState<Record<string, number>>({});

  const handleSelect = (dropdownId: string, selectedIndex: number) => {
    const newAnswers = { ...answers, [dropdownId]: selectedIndex };
    setAnswers(newAnswers);

    if (onChange) {
      const answer: UserAnswer = { answers: newAnswers };
      onChange(JSON.stringify(answer));
    }
  };

  // Render text with inline dropdowns
  const renderContent = () => {
    const parts = data.text.split(/(\{\{[^}]+\}\})/g);

    return parts.map((part, index) => {
      const match = part.match(/\{\{([^}]+)\}\}/);
      if (match) {
        const dropdownId = match[1];
        const dropdown = data.dropdowns.find((d) => d.id === dropdownId);
        if (dropdown) {
          return (
            <select
              key={index}
              value={answers[dropdownId] ?? ""}
              onChange={(e) => handleSelect(dropdownId, Number(e.target.value))}
              className="mx-1 px-2 py-1 text-sm bg-white border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="" disabled>
                Выберите...
              </option>
              {dropdown.options.map((opt, optIndex) => (
                <option key={optIndex} value={optIndex}>
                  {opt}
                </option>
              ))}
            </select>
          );
        }
      }
      return <span key={index}>{part}</span>;
    });
  };

  if (!data.text) {
    return <p className="text-gray-400">Нет содержимого</p>;
  }

  return (
    <div className="text-base text-gray-800 leading-relaxed">
      {renderContent()}
    </div>
  );
}

