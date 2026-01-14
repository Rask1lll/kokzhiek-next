import { getAuthHeaders } from "@/app/libs/auth";
import { ValidationErrorResponse } from "@/app/types/validationError";

export type ApiResult<T> =
  | { success: true; data: T }
  | { success: false; errors: Record<string, string[]>; message: string };

export type Role = {
  id: number;
  alias: string;
  name: string;
};

export type AdminUser = {
  id: number;
  name: string;
  email: string;
  role: Role;
  created_at: string;
};

export type GetAdminUsersParams = {
  search?: string;
  role_id?: number;
};

export async function handleGetAdminUsers(
  params?: GetAdminUsersParams
): Promise<AdminUser[]> {
  try {
    const url = new URL(
      `${process.env.NEXT_PUBLIC_SERVER_URL}/api/v1/admin/users`
    );
    if (params?.search) {
      url.searchParams.set("search", params.search);
    }
    if (params?.role_id) {
      url.searchParams.set("role_id", String(params.role_id));
    }

    const res = await fetch(url.toString(), {
      headers: getAuthHeaders(),
    });
    const data = await res.json();

    if (res.ok) {
      return data.data || data || [];
    }
    return [];
  } catch (error) {
    console.error("Error fetching admin users:", error);
    return [];
  }
}

export async function handleGetAdminRoles(): Promise<Role[]> {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_SERVER_URL}/api/v1/admin/roles`,
      { headers: getAuthHeaders() }
    );
    const data = await res.json();

    if (res.ok) {
      return data.data || data || [];
    }
    return [];
  } catch (error) {
    console.error("Error fetching admin roles:", error);
    return [];
  }
}

export async function handleUpdateUserRole(
  userId: number,
  roleId: number
): Promise<ApiResult<AdminUser>> {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_SERVER_URL}/api/v1/admin/users/${userId}/role`,
      {
        method: "PATCH",
        headers: getAuthHeaders(),
        body: JSON.stringify({ role_id: roleId }),
      }
    );
    const json = await res.json();

    if (!res.ok) {
      const errorResponse = json as ValidationErrorResponse;
      return {
        success: false,
        errors: errorResponse.errors || {},
        message: errorResponse.message || "Ошибка при обновлении роли",
      };
    }

    return { success: true, data: json.data || json };
  } catch (error) {
    console.error("Error updating user role:", error);
    return {
      success: false,
      errors: {},
      message: "Ошибка сети при обновлении роли",
    };
  }
}

export type ResetPasswordPayload = {
  password: string;
  password_confirmation: string;
};

export async function handleAdminResetPassword(
  userId: number,
  payload: ResetPasswordPayload
): Promise<ApiResult<{ message: string }>> {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_SERVER_URL}/api/v1/admin/users/${userId}/reset-password`,
      {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify(payload),
      }
    );
    const json = await res.json();

    if (!res.ok) {
      const errorResponse = json as ValidationErrorResponse;
      return {
        success: false,
        errors: errorResponse.errors || {},
        message: errorResponse.message || "Ошибка при сбросе пароля",
      };
    }

    return { success: true, data: json };
  } catch (error) {
    console.error("Error resetting user password:", error);
    return {
      success: false,
      errors: {},
      message: "Ошибка сети при сбросе пароля",
    };
  }
}

