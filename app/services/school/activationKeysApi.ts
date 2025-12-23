import { getAuthHeaders } from "@/app/libs/auth";
import { ConstructorResponse } from "@/app/types/constructorResponse";
import { ValidationErrorResponse } from "@/app/types/validationError";
import {
  ActivationKey,
  CreateActivationKeyPayload,
  GetActivationKeysParams,
} from "@/app/types/activationKey";

export type ApiResult<T> =
  | { success: true; data: T }
  | { success: false; errors: Record<string, string[]>; message: string };

export async function handleGetActivationKeys(
  params?: GetActivationKeysParams
): Promise<ConstructorResponse<ActivationKey[]> | undefined> {
  try {
    const url = new URL(
      `${process.env.NEXT_PUBLIC_SERVER_URL}/api/v1/activation-keys`
    );
    if (params?.role_type) {
      url.searchParams.set("role_type", params.role_type);
    }
    if (params?.status) {
      url.searchParams.set("status", params.status);
    }

    const res = await fetch(url.toString(), {
      headers: getAuthHeaders(),
    });
    return res.json();
  } catch (error) {
    console.error("Error fetching activation keys:", error);
    return undefined;
  }
}

export async function handleCreateActivationKey(
  payload: CreateActivationKeyPayload
): Promise<ApiResult<ActivationKey[]>> {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_SERVER_URL}/api/v1/activation-keys`,
      {
        headers: getAuthHeaders(),
        method: "POST",
        body: JSON.stringify(payload),
      }
    );

    const json = await res.json();

    if (!res.ok) {
      const errorResponse = json as ValidationErrorResponse;
      return {
        success: false,
        errors: errorResponse.errors || {},
        message: errorResponse.message || "Ошибка при создании ключа",
      };
    }

    // API returns array in data
    const keys = Array.isArray(json.data) ? json.data : [json.data];
    return { success: true, data: keys };
  } catch (error) {
    console.error("Error creating activation key:", error);
    return {
      success: false,
      errors: {},
      message: "Ошибка сети при создании ключа",
    };
  }
}

export async function handleDeleteActivationKey(
  id: number
): Promise<ApiResult<void>> {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_SERVER_URL}/api/v1/activation-keys/${id}`,
      {
        headers: getAuthHeaders(),
        method: "DELETE",
      }
    );

    if (!res.ok) {
      if (res.status === 400) {
        return {
          success: false,
          errors: {},
          message: "Нельзя удалить использованный ключ",
        };
      }
      return {
        success: false,
        errors: {},
        message: "Ошибка при удалении ключа",
      };
    }

    return { success: true, data: undefined };
  } catch (error) {
    console.error("Error deleting activation key:", error);
    return {
      success: false,
      errors: {},
      message: "Ошибка сети при удалении ключа",
    };
  }
}
