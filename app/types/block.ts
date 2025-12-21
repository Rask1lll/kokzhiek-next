import { Widget } from "./widget";

export type BlockStyle = {
  color?: string;
  [key: string]: unknown;
};

export type Block = {
  id: number;
  layout_type: string;
  order: number;
  widgets: Widget[];
  style?: BlockStyle;
};
