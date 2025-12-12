"use client";

import { widgets } from "@/app/libs/widgets";
import Button from "../../Button/Button";
import { useState } from "react";
import { tasks } from "@/app/libs/tasks";

type WidgetListModalProps = {
  onSelect?: (type: string) => void;
};

export default function WidgetListModal({ onSelect }: WidgetListModalProps) {
  const [listContent, setListContent] = useState(widgets);
  const [isWidget, setIsWidget] = useState(true);
  function typeChangeOnclick(value: string) {
    setListContent(value === "widget" ? widgets : tasks);
    setIsWidget(value === "widget");
  }
  return (
    <div className="w-full max-w-xl bg-white rounded-xl p-4 sm:p-6 space-y-4">
      <h2 className="text-xl sm:text-2xl font-bold text-gray-800">
        Выберите тип виджета
      </h2>
      <p className="text-sm  text-gray-500">
        Выберите элимент который вам подходит. Эти элементы можно добавлять
        внутрь выбранного блока.
      </p>
      <div className="flex gap-4">
        <Button
          color="slate"
          content={"Виджеты"}
          value="widget"
          isActive={isWidget}
          onClick={typeChangeOnclick}
        />
        <Button
          color="slate"
          content={"Задания"}
          value="task"
          isActive={!isWidget}
          onClick={typeChangeOnclick}
        />
      </div>

      <div className="mt-2 w-full space-y-2 max-h-[60vh] overflow-y-auto pr-1">
        {listContent.map((widget) => (
          <div
            key={widget.type}
            onClick={() => onSelect?.(widget.type)}
            className="flex w-full items-start gap-3 rounded-lg border border-gray-200 px-3 py-2 sm:px-4 sm:py-3 hover:border-blue-400 hover:bg-blue-50/60 cursor-pointer transition-colors duration-100"
          >
            <div className="mt-0.5 shrink-0">{widget.icon}</div>
            <div className="flex flex-col gap-1">
              <span className="font-semibold text-gray-800">
                {widget.title}
              </span>
              <span className="text-xs sm:text-sm text-gray-500">
                {widget.description}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
