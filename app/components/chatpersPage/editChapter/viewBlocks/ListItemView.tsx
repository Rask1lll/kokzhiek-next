"use client";

import { useMemo } from "react";

type ListViewProps = {
  value: string;
};

type ListItem = {
  id: string;
  text: string;
};

function parseItems(value: string): ListItem[] {
  try {
    const parsed = JSON.parse(value || "[]");
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export default function ListView({ value }: ListViewProps) {
  const items = useMemo(() => parseItems(value), [value]);

  if (items.length === 0) {
    return <p className="text-gray-400">Пустой список</p>;
  }

  return (
    <ul className="list-disc list-inside space-y-1 text-gray-800">
      {items.map((item) => (
        <li className="text-wrap wrap-anywhere" key={item.id}>
          {item.text}
        </li>
      ))}
    </ul>
  );
}
