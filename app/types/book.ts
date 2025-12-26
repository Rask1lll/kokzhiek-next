import { Subject } from "./subject";

export type BookStatus = "draft" | "pending" | "published" | "archived";

export type Grade = {
  id: number;
  level: number;
  section: string | null;
  label: string;
};

export type BookSettings = {
  author?: string;
  difficulty?: string;
};

export type Book = {
  id: number;
  title: string;
  language: string;
  status?: BookStatus;
  subject?: Subject;
  grade?: Grade;
  description?: string;
  cover_image_url?: string;
  settings?: BookSettings;
  chapters?: unknown[];
  publication?: {
    is_published: boolean;
    publisher_id: number | null;
    year: number | null;
    edition: string | null;
    isbn: string | null;
  };
  created_at?: string;
  updated_at?: string;
  created_by?: number;
  updated_by?: number | null;
};
