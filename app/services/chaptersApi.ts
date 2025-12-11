import { getAuthHeaders } from "@/app/libs/auth";
import { API_BASE } from "./constructor/constructorApi";

export async function deleteChapter(chapterId: number | string): Promise<void> {
  const res = await fetch(`${API_BASE}/api/v1/chapters/${chapterId}`, {
    method: "DELETE",
    headers: getAuthHeaders(),
  });

  if (!res.ok && res.status !== 204) {
    const errorText = await res.text();
    console.error("deleteChapter failed:", res.status, errorText);
    throw new Error(`Failed to delete chapter: ${errorText}`);
  }
}
