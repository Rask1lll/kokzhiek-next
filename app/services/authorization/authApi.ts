import { ConstructorResponse } from "@/app/types/constructorResponse";
import { getAuthHeaders } from "@/app/libs/auth";
import { UserData } from "@/app/types/user";

export async function handleGetMe(): Promise<
  ConstructorResponse<UserData> | undefined
> {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/v1/me`, {
      headers: getAuthHeaders(),
    });
    return res.json();
  } catch (error) {
    console.error(error);
    return undefined;
  }
}

export async function handleLogout(): Promise<boolean> {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_SERVER_URL}/api/v1/logout`,
      {
        method: "POST",
        headers: getAuthHeaders(),
      }
    );
    return res.ok;
  } catch (error) {
    console.error(error);
    return false;
  }
}

export async function handleSendResetCode(
  email: string
): Promise<{ success: boolean; message?: string; expiresIn?: number }> {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_SERVER_URL}/api/v1/password/send-code`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({ email }),
      }
    );
    const data = await res.json();
    return {
      success: res.ok,
      message: data.message,
      expiresIn: data.expires_in,
    };
  } catch (error) {
    console.error(error);
    return { success: false };
  }
}

export async function handleVerifyResetCode(
  email: string,
  code: string
): Promise<{ success: boolean; message?: string; token?: string; expiresIn?: number }> {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_SERVER_URL}/api/v1/password/verify-code`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({ email, code }),
      }
    );
    const data = await res.json();
    return {
      success: res.ok,
      message: data.message,
      token: data.token,
      expiresIn: data.expires_in,
    };
  } catch (error) {
    console.error(error);
    return { success: false };
  }
}

export async function handleResetPassword(
  email: string,
  token: string,
  password: string,
  password_confirmation: string
): Promise<{ success: boolean; message?: string; errors?: Record<string, string[]> }> {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_SERVER_URL}/api/v1/password/reset`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          email,
          token,
          password,
          password_confirmation,
        }),
      }
    );
    const data = await res.json();
    return {
      success: res.ok,
      message: data.message,
      errors: data.errors,
    };
  } catch (error) {
    console.error(error);
    return { success: false };
  }
}
