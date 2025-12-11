import { getAuthHeaders } from "../../libs/auth";
import { ConstructorState } from "../../types/constructorState";
import { ConstructorResponse } from "../../types/constructorResponse";

export const API_BASE = process.env.NEXT_PUBLIC_SERVER_URL;

// ========== Constructor State ==========

export async function getConstructorState(
  bookId: string
): Promise<ConstructorResponse<ConstructorState>> {
  const res = await fetch(`${API_BASE}/api/v1/books/${bookId}/constructor`, {
    headers: getAuthHeaders(),
  });
  return res.json();
}

export async function getChapterState(
  bookId: string,
  chapterId: string
): Promise<ConstructorResponse<ConstructorState>> {
  const res = await fetch(
    `${API_BASE}/api/v1/books/${bookId}/constructor/chapters/${chapterId}`,
    {
      headers: getAuthHeaders(),
    }
  );
  return res.json();
}
