"use client";

import { Widget } from "@/app/types/widget";
import { useSearchParams } from "next/navigation";
import LayoutPlaceholder from "./LayoutPlaceholder";
import ViewPlaceholder from "./ViewPlaceholder";
import { getNextRow } from "./layoutUtils";

type ColumnProps = {
  blockId: number;
  columnIndex: number;
  widgets: Widget[];
  className?: string;
};

export default function Column({
  blockId,
  columnIndex,
  widgets,
  className,
}: ColumnProps) {
  const nextRow = getNextRow(widgets);
  const params = useSearchParams();
  const isEdit = params.get("edit");

  if (!isEdit) {
    return (
      <div
        className={`flex flex-col gap-2 ${isEdit ? "w-19/20" : "w-full"} ${
          className || ""
        }`}
      >
        {/* Render existing widgets */}
        {widgets.map((widget) => (
          <ViewPlaceholder key={widget.id} widget={widget} />
        ))}
      </div>
    );
  }

  return (
    <div className={`flex flex-col gap-2 ${className || ""}`}>
      {/* Render existing widgets */}
      {widgets.map((widget) => (
        <LayoutPlaceholder
          key={widget.id}
          className="min-h-[90px]"
          blockId={blockId}
          row={widget.row}
          column={columnIndex}
          widget={widget}
        />
      ))}

      {/* Add new widget button / empty placeholder */}
      <LayoutPlaceholder
        className="min-h-[90px]"
        blockId={blockId}
        row={nextRow}
        column={columnIndex}
        widget={null}
      />
    </div>
  );
}
