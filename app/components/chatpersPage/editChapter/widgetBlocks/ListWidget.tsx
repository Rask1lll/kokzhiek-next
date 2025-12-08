"use client";

import { useState } from "react";
import { FiPlus, FiTrash2 } from "react-icons/fi";

type ListWidgetProps = {
  value: string; // JSON string of items array
  onChange: (value: string) => void;
};

type ListItem = {
  id: string;
  text: string;
};

export default function ListWidget({ value, onChange }: ListWidgetProps) {
  // Parse items from JSON string or default to empty array
  const parseItems = (): ListItem[] => {
    try {
      const parsed = JSON.parse(value || "[]");
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  };

  const [items, setItems] = useState<ListItem[]>(() => {
    const parsed = parseItems();
    return parsed.length > 0 ? parsed : [{ id: crypto.randomUUID(), text: "" }];
  });

  const [listType, setListType] = useState<"bullet" | "number">("bullet");

  const updateItems = (newItems: ListItem[]) => {
    setItems(newItems);
    onChange(JSON.stringify(newItems));
  };

  const handleItemChange = (id: string, text: string) => {
    const newItems = items.map((item) =>
      item.id === id ? { ...item, text } : item
    );
    updateItems(newItems);
  };

  const addItem = () => {
    const newItems = [...items, { id: crypto.randomUUID(), text: "" }];
    updateItems(newItems);
  };

  const removeItem = (id: string) => {
    if (items.length <= 1) return;
    const newItems = items.filter((item) => item.id !== id);
    updateItems(newItems);
  };

  const handleKeyDown = (e: React.KeyboardEvent, id: string, index: number) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addItem();
      // Focus will be handled by React re-render
    } else if (e.key === "Backspace" && items[index].text === "" && items.length > 1) {
      e.preventDefault();
      removeItem(id);
    }
  };

  return (
    <div className="w-full space-y-2">
      {/* List type toggle */}
      <div className="flex gap-2 mb-3">
        <button
          type="button"
          onClick={() => setListType("bullet")}
          className={`px-3 py-1 text-xs rounded-md transition-colors ${
            listType === "bullet"
              ? "bg-blue-100 text-blue-700"
              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
          }`}
        >
          • Маркеры
        </button>
        <button
          type="button"
          onClick={() => setListType("number")}
          className={`px-3 py-1 text-xs rounded-md transition-colors ${
            listType === "number"
              ? "bg-blue-100 text-blue-700"
              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
          }`}
        >
          1. Нумерация
        </button>
      </div>

      {/* List items */}
      <ul className="space-y-1">
        {items.map((item, index) => (
          <li key={item.id} className="flex items-start gap-2 group">
            <span className="text-gray-500 mt-1.5 min-w-[20px] text-sm">
              {listType === "bullet" ? "•" : `${index + 1}.`}
            </span>
            <input
              type="text"
              value={item.text}
              onChange={(e) => handleItemChange(item.id, e.target.value)}
              onKeyDown={(e) => handleKeyDown(e, item.id, index)}
              placeholder="Введите пункт списка..."
              className="flex-1 bg-transparent border-none outline-none text-gray-800 placeholder:text-gray-400 py-1"
              autoFocus={index === items.length - 1 && item.text === ""}
            />
            {items.length > 1 && (
              <button
                type="button"
                onClick={() => removeItem(item.id)}
                className="opacity-0 group-hover:opacity-100 transition-opacity p-1 text-gray-400 hover:text-red-500"
              >
                <FiTrash2 className="w-4 h-4" />
              </button>
            )}
          </li>
        ))}
      </ul>

      {/* Add item button */}
      <button
        type="button"
        onClick={addItem}
        className="flex items-center gap-1 text-sm text-gray-500 hover:text-blue-500 transition-colors mt-2"
      >
        <FiPlus className="w-4 h-4" />
        Добавить пункт
      </button>
    </div>
  );
}

