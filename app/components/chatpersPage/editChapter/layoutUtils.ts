import { Widget } from "@/app/types/widget";

export function getColumnsCount(layoutCode: string): number {
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

export function getColumnClasses(layoutCode: string, columnIndex: number): string {
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

export function groupWidgetsByColumn(
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

export function getNextRow(columnWidgets: Widget[]): number {
  if (columnWidgets.length === 0) return 0;
  return Math.max(...columnWidgets.map((w) => w.row)) + 1;
}
