import { Widget } from "./widget";

export type BlockStyle = {
  color?: string;
  columnWidths?: number[]; // Проценты ширины для каждой колонки, например [60, 40] или [25, 50, 25]
  columnColors?: string[]; // Цвет фона для каждой колонки, например ["#dbeafe", "#dcfce7"]
  [key: string]: unknown;
};

export type Block = {
  id: number;
  layout_type: string;
  order: number;
  widgets: Widget[];
  style?: BlockStyle;
};
