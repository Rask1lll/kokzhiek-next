export type UpdateBookPayload = {
  title?: string;
  description?: string;
  cover_image_url?: string;
  language?: string;
  subject_id?: number;
  grade_id?: number;
  isbn?: string;
  year?: number;
  edition?: string;
  settings?: {
    author?: string;
    difficulty?: string | number;
  };
};
