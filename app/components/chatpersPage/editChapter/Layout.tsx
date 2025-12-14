import { Widget } from "@/app/types/widget";
import LayoutPlaceholder from "./LayoutPlaceholder";
import { Block } from "@/app/types/block";
import { useSearchParams } from "next/navigation";
import ViewPlaceholder from "./ViewPlaceholder";

type LayoutProps = {
  block: Block;
};

function getColumnsCount(layoutCode: string): number {
  switch (layoutCode) {
    case "full":
    case "single":
      return 1;
    case "two_equal":
    case "split":
    case "two_rows":
      return 2;
    case "left_wide":
    case "hero":
    case "right_wide":
    case "sidebar_left":
    case "sidebar_right":
      return 2;
    case "three_cols":
    case "2-column":
    case "three_center_wide":
      return 3;
    case "four_cols":
      return 4;
    default:
      return 1;
  }
}

// Get column flex classes based on layout code and column index
function getColumnClasses(layoutCode: string, columnIndex: number): string {
  switch (layoutCode) {
    case "left_wide":
    case "hero":
      return columnIndex === 0 ? "w-[70%] flex-none" : "w-[30%] flex-none";

    case "right_wide":
      return columnIndex === 0 ? "w-[30%] flex-none" : "w-[70%] flex-none";

    case "sidebar_left":
      return columnIndex === 0 ? "w-[25%] flex-none" : "w-[75%] flex-none";

    case "sidebar_right":
      return columnIndex === 0 ? "w-[75%] flex-none" : "w-[25%] flex-none";

    case "three_center_wide":
      if (columnIndex === 1) return "w-[50%] flex-none";
      return "w-[25%] flex-none";

    default:
      return "w-full";
  }
}

// Group widgets by column and sort by row
function groupWidgetsByColumn(
  widgets: Widget[],
  columnsCount: number
): Map<number, Widget[]> {
  const grouped = new Map<number, Widget[]>();

  // Initialize all columns
  for (let i = 0; i < columnsCount; i++) {
    grouped.set(i, []);
  }

  // Group widgets by column
  widgets.forEach((widget) => {
    const col = widget.column;
    if (col >= 0 && col < columnsCount) {
      const columnWidgets = grouped.get(col) || [];
      columnWidgets.push(widget);
      grouped.set(col, columnWidgets);
    }
  });

  // Sort each column's widgets by row
  grouped.forEach((columnWidgets, col) => {
    grouped.set(
      col,
      columnWidgets.sort((a, b) => a.row - b.row)
    );
  });

  return grouped;
}

// Get the next available row for a column
function getNextRow(columnWidgets: Widget[]): number {
  if (columnWidgets.length === 0) return 0;
  return Math.max(...columnWidgets.map((w) => w.row)) + 1;
}

// Column component
type ColumnProps = {
  blockId: number;
  columnIndex: number;
  widgets: Widget[];
  className?: string;
};

const Column = ({ blockId, columnIndex, widgets, className }: ColumnProps) => {
  const nextRow = getNextRow(widgets);
  const params = useSearchParams();
  const isEdit = params.get("edit");

  if (!isEdit) {
    return (
      <div className={`flex flex-col gap-2 ${className || ""}`}>
        {/* Render existing widgets */}
        {widgets.map((widget) => (
          <ViewPlaceholder key={widget.id} widget={widget} />
        ))}

        {/* Add new widget button / empty placeholder */}
        <LayoutPlaceholder
          className="min-h-[60px]"
          blockId={blockId}
          row={nextRow}
          column={columnIndex}
          widget={null}
        />
      </div>
    );
  }

  return (
    <div className={`flex flex-col gap-2 ${className || ""}`}>
      {/* Render existing widgets */}
      {widgets.map((widget) => (
        <LayoutPlaceholder
          key={widget.id}
          className="min-h-[60px]"
          blockId={blockId}
          row={widget.row}
          column={columnIndex}
          widget={widget}
        />
      ))}

      {/* Add new widget button / empty placeholder */}
      <LayoutPlaceholder
        className="min-h-[60px]"
        blockId={blockId}
        row={nextRow}
        column={columnIndex}
        widget={null}
      />
    </div>
  );
};

const Layout = ({ block }: LayoutProps) => {
  const { layout_type, widgets, id } = block;
  const columnsCount = getColumnsCount(layout_type);
  const groupedWidgets = groupWidgetsByColumn(widgets, columnsCount);

  // Single column layout
  if (columnsCount === 1) {
    const columnWidgets = groupedWidgets.get(0) || [];
    return (
      <div className="w-full bg-gray-100 rounded-md p-2">
        <Column
          blockId={id}
          columnIndex={0}
          widgets={columnWidgets}
          className=""
        />
      </div>
    );
  }

  return (
    <div className="w-full flex gap-4">
      {Array.from({ length: columnsCount }).map((_, colIndex) => {
        const columnWidgets = groupedWidgets.get(colIndex) || [];
        const columnClass = getColumnClasses(layout_type, colIndex);

        return (
          <div
            key={colIndex}
            className={`${columnClass} bg-gray-50 rounded-md p-2`}
          >
            <Column
              blockId={id}
              columnIndex={colIndex}
              widgets={columnWidgets}
            />
          </div>
        );
      })}
    </div>
  );
};

export default Layout;
