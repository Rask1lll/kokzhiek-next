"use client";

import { widgets, containers } from "@/app/libs/widgets";
import Button from "../../Button/Button";
import { useState } from "react";
import { tasks } from "@/app/libs/tasks";
import { useTranslations } from "next-intl";

type Category = "widget" | "task" | "container";

type WidgetListModalProps = {
  onSelect?: (type: string) => void;
};

export default function WidgetListModal({ onSelect }: WidgetListModalProps) {
  const t = useTranslations("widgetModal");
  const tWidgets = useTranslations("widgetTypes");
  const tTasks = useTranslations("taskTypes");
  const tContainers = useTranslations("containerTypes");
  const [activeCategory, setActiveCategory] = useState<Category>("widget");

  const getListContent = () => {
    switch (activeCategory) {
      case "widget":
        return widgets;
      case "task":
        return tasks;
      case "container":
        return containers;
    }
  };

  const getTitle = (type: string) => {
    switch (activeCategory) {
      case "widget":
        return tWidgets(type);
      case "task":
        return tTasks(type);
      case "container":
        return tContainers(type);
    }
  };

  const getDescription = (type: string) => {
    switch (activeCategory) {
      case "widget":
        return tWidgets(`${type}Desc`);
      case "task":
        return tTasks(`${type}Desc`);
      case "container":
        return tContainers(`${type}Desc`);
    }
  };

  return (
    <div className="w-full max-w-xl bg-white rounded-xl p-4 sm:p-6 space-y-4">
      <h2 className="text-xl sm:text-2xl font-bold text-gray-800">
        {t("title")}
      </h2>
      <p className="text-sm text-gray-500">{t("description")}</p>
      <div className="flex gap-2 flex-wrap">
        <Button
          color="slate"
          content={t("widgets")}
          value="widget"
          isActive={activeCategory === "widget"}
          onClick={() => setActiveCategory("widget")}
        />
        <Button
          color="slate"
          content={t("tasks")}
          value="task"
          isActive={activeCategory === "task"}
          onClick={() => setActiveCategory("task")}
        />
        <Button
          color="slate"
          content={t("containers")}
          value="container"
          isActive={activeCategory === "container"}
          onClick={() => setActiveCategory("container")}
        />
      </div>

      <div className="mt-2 w-full space-y-2 max-h-[60vh] overflow-y-auto pr-1">
        {getListContent().map((item) => (
          <div
            key={item.type}
            onClick={() => onSelect?.(item.type)}
            className="flex w-full items-start gap-3 rounded-lg border border-gray-200 px-3 py-2 sm:px-4 sm:py-3 hover:border-blue-400 hover:bg-blue-50/60 cursor-pointer transition-colors duration-100"
          >
            <div className="mt-0.5 shrink-0">{item.icon}</div>
            <div className="flex flex-col gap-1">
              <span className="font-semibold text-gray-800">
                {getTitle(item.type)}
              </span>
              <span className="text-xs sm:text-sm text-gray-500">
                {getDescription(item.type)}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
