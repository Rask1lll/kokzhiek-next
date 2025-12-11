import { Widget } from "./widget";

export type Block = {
  id: number;
  layout_type: string;
  order: number;
  widgets: Widget[];
};
