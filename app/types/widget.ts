export type WidgetData = Record<string, unknown>;

export type Widget = {
  id: number;
  type: string;
  row: number;
  column: number;
  data: WidgetData;
  parent_id?: number | null;
  children?: Widget[];
};
