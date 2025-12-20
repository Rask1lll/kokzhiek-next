export type Subject = {
  id: number;
  alias: string;
  name_ru: string;
  name_kz: string;
  name_en: string;
};

export type SubjectsResponse = {
  data: Subject[];
  errors: string[];
};
