export type BookHistoryEntry = {
  id: number;
  book_id: number;
  version: number;
  title: string;
  description?: string;
  status: string;
  changed_by?: {
    id: number;
    name: string;
    email: string;
  };
  created_at: string;
  changes?: string;
};

