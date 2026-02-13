export type Chapter = {
  id: number;
  title: string;
  order: number;
  section_id?: number | null;
};

export type Section = {
  id: number;
  title: string;
  order: number;
  chapters: Chapter[];
};
