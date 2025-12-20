export type CreateBookPayload = {
  title: string;
  description?: string;
  language?: string;
  grade_id?: number;
  subject_id?: number;
  isbn?: string;
  settings: {
    author?: string;
    difficulty?: string | number;
  };
};
