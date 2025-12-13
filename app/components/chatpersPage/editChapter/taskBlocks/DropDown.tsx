"use client";

import Button from "@/app/components/Button/Button";
import { useMemo, useState } from "react";
import { FiX, FiChevronDown } from "react-icons/fi";

type DropDownProps = {
  value: string;
  onChange: (value: string) => void;
};

type DropdownItem = {
  id: string;
  options: string[];
  correctIndex: number;
};

type DropDownData = {
  // Text with placeholders like: "Самая большая страна {{0}} и она {{1}} лидером"
  text: string;
  dropdowns: DropdownItem[];
};

function parseData(value: string): DropDownData | undefined {
  try {
    const parsed = JSON.parse(value);
    if (parsed && typeof parsed.text === "string") {
      return parsed;
    }
  } catch {
    return;
  }
}

function generateId(): string {
  return Math.random().toString(36).substring(2, 9);
}

export default function DropDown({ value, onChange }: DropDownProps) {
  const validateData = useMemo(() => parseData(value), [value]);
  const [editingDropdown, setEditingDropdown] = useState<string | null>(null);

  const data: DropDownData = validateData ?? {
    text: "",
    dropdowns: [],
  };

  const updateData = (newData: DropDownData) => {
    onChange(JSON.stringify(newData));
  };

  // Insert dropdown placeholder at cursor position in text
  const insertDropdown = () => {
    const newDropdown: DropdownItem = {
      id: generateId(),
      options: ["Вариант 1", "Вариант 2"],
      correctIndex: 0,
    };

    const placeholder = `{{${newDropdown.id}}}`;
    const newText = data.text + placeholder;

    updateData({
      text: newText,
      dropdowns: [...data.dropdowns, newDropdown],
    });
  };

  const updateDropdown = (id: string, updates: Partial<DropdownItem>) => {
    const newDropdowns = data.dropdowns.map((d) =>
      d.id === id ? { ...d, ...updates } : d
    );
    updateData({ ...data, dropdowns: newDropdowns });
  };

  const removeDropdown = (id: string) => {
    const placeholder = `{{${id}}}`;
    const newText = data.text.replace(placeholder, "");
    const newDropdowns = data.dropdowns.filter((d) => d.id !== id);
    updateData({ text: newText, dropdowns: newDropdowns });
    setEditingDropdown(null);
  };

  const addOptionToDropdown = (dropdownId: string) => {
    const dropdown = data.dropdowns.find((d) => d.id === dropdownId);
    if (dropdown) {
      updateDropdown(dropdownId, {
        options: [
          ...dropdown.options,
          `Вариант ${dropdown.options.length + 1}`,
        ],
      });
    }
  };

  const updateOptionText = (
    dropdownId: string,
    optionIndex: number,
    text: string
  ) => {
    const dropdown = data.dropdowns.find((d) => d.id === dropdownId);
    if (dropdown) {
      const newOptions = [...dropdown.options];
      newOptions[optionIndex] = text;
      updateDropdown(dropdownId, { options: newOptions });
    }
  };

  const removeOption = (dropdownId: string, optionIndex: number) => {
    const dropdown = data.dropdowns.find((d) => d.id === dropdownId);
    if (dropdown && dropdown.options.length > 2) {
      const newOptions = dropdown.options.filter((_, i) => i !== optionIndex);
      const newCorrectIndex =
        dropdown.correctIndex >= newOptions.length
          ? newOptions.length - 1
          : dropdown.correctIndex;
      updateDropdown(dropdownId, {
        options: newOptions,
        correctIndex: newCorrectIndex,
      });
    }
  };

  // Render text with inline dropdowns
  const renderPreview = () => {
    const parts = data.text.split(/(\{\{[^}]+\}\})/g);

    return parts.map((part, index) => {
      const match = part.match(/\{\{([^}]+)\}\}/);
      if (match) {
        const dropdownId = match[1];
        const dropdown = data.dropdowns.find((d) => d.id === dropdownId);
        if (dropdown) {
          return (
            <span key={index} className="inline-block mx-1">
              <button
                type="button"
                onClick={() =>
                  setEditingDropdown(
                    editingDropdown === dropdownId ? null : dropdownId
                  )
                }
                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded border text-sm transition-colors ${
                  editingDropdown === dropdownId
                    ? "bg-blue-100 border-blue-400 text-blue-700"
                    : "bg-slate-100 border-slate-300 text-slate-700 hover:bg-slate-200"
                }`}
              >
                {dropdown.options[dropdown.correctIndex] || "..."}
                <FiChevronDown className="w-3 h-3" />
              </button>
            </span>
          );
        }
      }
      return <span key={index}>{part}</span>;
    });
  };

  // Get dropdown being edited
  const currentDropdown = editingDropdown
    ? data.dropdowns.find((d) => d.id === editingDropdown)
    : null;

  return (
    <div className="w-full space-y-4">
      {/* Text editor */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-slate-700">
            Текст задания:
          </span>
          <Button
            content="+ Вставить список"
            color="blue"
            size="sm"
            onClick={insertDropdown}
          />
        </div>

        <textarea
          value={data.text}
          onChange={(e) => updateData({ ...data, text: e.target.value })}
          placeholder="Введите текст задания. Используйте кнопку 'Вставить список' чтобы добавить выпадающий список."
          className="w-full min-h-[100px] px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-y"
        />

        <p className="text-xs text-slate-400">
          Подсказка: {"{{id}}"} в тексте — это место для выпадающего списка
        </p>
      </div>

      {/* Preview */}
      {data.text && (
        <div className="p-4 bg-white rounded-lg border border-dashed border-slate-300">
          <span className="text-xs text-slate-400 mb-2 block">
            Предпросмотр (нажмите на список для редактирования):
          </span>
          <div className="text-base text-slate-800 leading-relaxed">
            {renderPreview()}
          </div>
        </div>
      )}

      {/* Dropdown editor */}
      {currentDropdown && (
        <div className="p-4 bg-blue-50 rounded-lg border border-blue-200 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-blue-800">
              Редактирование списка:
            </span>
            <div className="flex gap-2">
              <Button
                content="Удалить список"
                color="red"
                size="sm"
                onClick={() => removeDropdown(currentDropdown.id)}
              />
              <button
                type="button"
                onClick={() => setEditingDropdown(null)}
                className="p-1 text-slate-400 hover:text-slate-600"
              >
                <FiX className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Options */}
          <div className="space-y-2">
            <span className="text-xs text-blue-600">
              Варианты (◉ = правильный):
            </span>
            {currentDropdown.options.map((option, index) => (
              <div key={index} className="flex items-center gap-2">
                <input
                  type="radio"
                  name={`correct-${currentDropdown.id}`}
                  checked={currentDropdown.correctIndex === index}
                  onChange={() =>
                    updateDropdown(currentDropdown.id, { correctIndex: index })
                  }
                  className="w-4 h-4 text-blue-600 cursor-pointer"
                />
                <input
                  type="text"
                  value={option}
                  onChange={(e) =>
                    updateOptionText(currentDropdown.id, index, e.target.value)
                  }
                  className="flex-1 px-2 py-1 text-sm bg-white border border-slate-200 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  type="button"
                  onClick={() => removeOption(currentDropdown.id, index)}
                  disabled={currentDropdown.options.length <= 2}
                  className="p-1 text-slate-400 hover:text-red-500 disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  <FiX className="w-4 h-4" />
                </button>
              </div>
            ))}
            <Button
              content="+ Добавить вариант"
              color="slate"
              size="sm"
              onClick={() => addOptionToDropdown(currentDropdown.id)}
            />
          </div>
        </div>
      )}

      {/* List of all dropdowns */}
      {data.dropdowns.length > 0 && !editingDropdown && (
        <div className="space-y-2">
          <span className="text-sm font-medium text-slate-700">
            Все списки в задании:
          </span>
          {data.dropdowns.map((dropdown, index) => (
            <div
              key={dropdown.id}
              onClick={() => setEditingDropdown(dropdown.id)}
              className="flex items-center justify-between p-2 bg-white rounded-lg border border-slate-200 hover:border-blue-400 cursor-pointer transition-colors"
            >
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400">#{index + 1}</span>
                <span className="text-sm text-slate-700">
                  {dropdown.options.join(" / ")}
                </span>
              </div>
              <span className="text-xs text-green-600">
                ✓ {dropdown.options[dropdown.correctIndex]}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
