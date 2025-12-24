import { getAuthHeaders } from "@/app/libs/auth";
import { ConstructorResponse } from "@/app/types/constructorResponse";
import { Member, GetMembersParams } from "@/app/types/member";

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
