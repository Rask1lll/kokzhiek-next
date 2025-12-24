export type MemberRole = "teacher" | "student";

export type Member = {
  id: number;
  name: string;
  email: string;
  role: {
    id: number;
    alias: MemberRole;
    label: string;
    name: string;
  };
  created_at: string;
  updated_at: string;
};

export type GetMembersParams = {
  role?: MemberRole;
};
