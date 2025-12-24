export type RoleType = "student" | "teacher";

export type ActivationKeyUser = {
  id: number;
  name: string;
  email: string;
};

export type ActivationKey = {
  id: number;
  key: string;
  role_type: RoleType;
  is_used: boolean;
  used_at: string | null;
  expires_at: string | null;
  created_at: string;
  user: ActivationKeyUser | null;
};

export type CreateActivationKeyPayload = {
  role_type: RoleType;
  expires_at?: string;
};

export type ActivationKeyStatus = "active" | "used" | "expired";

export type GetActivationKeysParams = {
  role_type?: RoleType;
  status?: ActivationKeyStatus;
};
