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
