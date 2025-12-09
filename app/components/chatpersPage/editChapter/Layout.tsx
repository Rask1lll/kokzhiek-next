import type { ChapterBlock, BlockWidget } from "@/app/store/blocksStore";
import LayoutPlaceholder from "./LayoutPlaceholder";

type LayoutProps = {
  block: ChapterBlock;
};

// Get number of columns based on layout code
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
    case "grid_2x2":
      return 2;
    default:
      return 1;
  }
}

// Get column flex classes based on layout code and column index
function getColumnClasses(layoutCode: string, columnIndex: number): string {
  switch (layoutCode) {
    case "left_wide":
    case "hero":
      return columnIndex === 0 ? "flex-2" : "flex-1";
    case "right_wide":
      return columnIndex === 0 ? "flex-1" : "flex-2";
    case "sidebar_left":
      return columnIndex === 0 ? "w-1/4" : "flex-1";
    case "sidebar_right":
      return columnIndex === 0 ? "flex-1" : "w-1/4";
    case "three_center_wide":
      return columnIndex === 1 ? "flex-2" : "flex-1";
    default:
      return "flex-1";
  }
}

// Group widgets by column and sort by row
function groupWidgetsByColumn(
  widgets: BlockWidget[],
  columnsCount: number
): Map<number, BlockWidget[]> {
  const grouped = new Map<number, BlockWidget[]>();

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
function getNextRow(columnWidgets: BlockWidget[]): number {
  if (columnWidgets.length === 0) return 0;
  return Math.max(...columnWidgets.map((w) => w.row)) + 1;
}

// Column component
type ColumnProps = {
  blockId: number;
  columnIndex: number;
  widgets: BlockWidget[];
  className?: string;
};

const Column = ({ blockId, columnIndex, widgets, className }: ColumnProps) => {
  const nextRow = getNextRow(widgets);

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
  const { layoutCode, widgets, id } = block;
  const columnsCount = getColumnsCount(layoutCode);
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

  // Multi-column layout
  return (
    <div className="w-full flex gap-4">
      {Array.from({ length: columnsCount }).map((_, colIndex) => {
        const columnWidgets = groupedWidgets.get(colIndex) || [];
        const columnClass = getColumnClasses(layoutCode, colIndex);

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
