"use client";

import Button from "@/app/components/Button/Button";
import { useMemo } from "react";
import { FiPlus, FiX, FiChevronUp, FiChevronDown } from "react-icons/fi";

type MultipleChoiceProps = {
  value: string;
  onChange: (value: string) => void;
};

type Option = {
  id: string;
  text: string;
  isCorrect: boolean;
};

type MultipleChoiceData = {
  options: Option[];
};

function parseData(value: string): MultipleChoiceData | undefined {
  try {
    const parsed = JSON.parse(value);
    if (parsed && Array.isArray(parsed.options)) {
      return parsed;
    }
  } catch {
    return;
  }
}

export default function SingleChoice({ value, onChange }: MultipleChoiceProps) {
  const validateData = useMemo(() => parseData(value), [value]);
  let data;
  if (!validateData) {
    data = {
      options: [],
    };
  } else {
    data = validateData;
  }

  const updateData = (newData: MultipleChoiceData) => {
    onChange(JSON.stringify(newData));
  };

  const addOption = () => {
    const newOption: Option = {
      id: String(data.options.length),
      isCorrect: false,
      text: "",
    };

    const newOptions = [...data.options, newOption];

    updateData({ ...data, options: newOptions });
  };

  const removeOption = (id: string) => {
    if (data.options.length <= 2) return;
    const newOptions = data.options.filter((opt) => opt.id !== id);
    updateData({ ...data, options: newOptions });
  };

  const moveOption = (id: string, direction: "up" | "down") => {
    const index = data.options.findIndex((opt) => opt.id === id);
    if (
      (direction === "up" && index === 0) ||
      (direction === "down" && index === data.options.length - 1)
    ) {
      return;
    }

    const newOptions = [...data.options];
    const swapIndex = direction === "up" ? index - 1 : index + 1;
    [newOptions[index], newOptions[swapIndex]] = [
      newOptions[swapIndex],
      newOptions[index],
    ];
    updateData({ ...data, options: newOptions });
  };

  const updateOption = (id: string, updates: Partial<Option>) => {
    const newOptions = data.options.map((opt) =>
      opt.id === id ? { ...opt, ...updates } : opt
    );
    updateData({ ...data, options: newOptions });
  };

  return (
    <div className="w-full space-y-4">
      <div className="flex flex-wrap items-center gap-4 p-3 bg-slate-50 rounded-lg border border-slate-200"></div>

      <div className="space-y-2">
        <span className="text-sm font-medium flex justify-between text-slate-700">
          Варианты ответа:
          <Button
            content="Добавить +"
            color="green"
            onClick={() => addOption()}
          ></Button>
        </span>

        {data.options.map((option, index) => (
          <div
            key={option.id}
            className="flex items-center gap-2 p-2 bg-white rounded-lg border border-slate-200 hover:border-slate-300 transition-colors"
          >
            <label className="flex items-center cursor-pointer">
              <input
                type="radio"
                checked={option.isCorrect}
                onChange={(e) =>
                  updateOption(option.id, { isCorrect: e.target.checked })
                }
                className="w-5 h-5 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
              />
            </label>

            <input
              type="text"
              value={option.text}
              onChange={(e) =>
                updateOption(option.id, { text: e.target.value })
              }
              placeholder={`Вариант ${index + 1}`}
              className="flex-1 px-3 py-1.5 text-sm bg-slate-50 border border-slate-200 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />

            {/* Move up */}
            <button
              type="button"
              onClick={() => moveOption(option.id, "up")}
              disabled={index === 0}
              className="p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 rounded transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
              title="Переместить вверх"
            >
              <FiChevronUp className="w-4 h-4" />
            </button>

            {/* Move down */}
            <button
              type="button"
              onClick={() => moveOption(option.id, "down")}
              disabled={index === data.options.length - 1}
              className="p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 rounded transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
              title="Переместить вниз"
            >
              <FiChevronDown className="w-4 h-4" />
            </button>

            {/* Remove option */}
            <button
              type="button"
              onClick={() => removeOption(option.id)}
              disabled={data.options.length <= 2}
              className="p-1.5 text-slate-400 hover:bg-red-100 hover:text-red-600 rounded transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
              title="Удалить вариант"
            >
              <FiX className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
