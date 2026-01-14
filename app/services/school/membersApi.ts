import { getAuthHeaders } from "@/app/libs/auth";
import { ConstructorResponse } from "@/app/types/constructorResponse";
import { Member, GetMembersParams } from "@/app/types/member";
import { ValidationErrorResponse } from "@/app/types/validationError";

export type ApiResult<T> =
  | { success: true; data: T }
  | { success: false; errors: Record<string, string[]>; message: string };

export async function handleGetSchoolMembers(
  params?: GetMembersParams
): Promise<ConstructorResponse<Member[]> | undefined> {
  try {
    const url = new URL(
      `${process.env.NEXT_PUBLIC_SERVER_URL}/api/v1/school/members`
    );
    if (params?.role) {
      url.searchParams.set("role", params.role);
    }

    const res = await fetch(url.toString(), {
      headers: getAuthHeaders(),
    });
    return res.json();
  } catch (error) {
    console.error("Error fetching school members:", error);
    return undefined;
  }
}

export type ResetPasswordPayload = {
  password: string;
  password_confirmation: string;
};

export async function handleResetMemberPassword(
  userId: number,
  payload: ResetPasswordPayload
): Promise<ApiResult<{ message: string }>> {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_SERVER_URL}/api/v1/school/members/${userId}/reset-password`,
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
    console.error("Error resetting member password:", error);
    return {
      success: false,
      errors: {},
      message: "Ошибка сети при сбросе пароля",
    };
  }
}
