type UserRole = {
  id: number;
  alias: string;
  label: string;
  name: string;
};

export type UserData = {
  id: number;
  name: string;
  email: string;
  email_verified_at: string | null;
  publisher_id: number | null;
  role: UserRole;
  created_at: string;
  updated_at: string;
};
