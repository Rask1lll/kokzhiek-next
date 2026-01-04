import { getAuthHeaders } from "../../libs/auth";
import { ConstructorResponse } from "../../types/constructorResponse";
import { BookHistoryEntry } from "../../types/bookHistory";

const API_BASE = process.env.NEXT_PUBLIC_SERVER_URL;

export async function getBookHistory(
  bookId: number | string
): Promise<ConstructorResponse<BookHistoryEntry[]> | undefined> {
  try {
    const res = await fetch(`${API_BASE}/api/v1/books/${bookId}/history`, {
      headers: getAuthHeaders(),
      method: "GET",
    });

    if (!res.ok) {
      console.error("getBookHistory failed:", res.status);
      return undefined;
    }

    return res.json();
  } catch (error) {
    console.error("Error fetching book history:", error);
    return undefined;
  }
}

export async function revertBookToVersion(
  bookId: number | string,
  versionId: number
): Promise<ConstructorResponse<any> | undefined> {
  try {
    const res = await fetch(
      `${API_BASE}/api/v1/books/${bookId}/history/${versionId}/revert`,
      {
        headers: getAuthHeaders(),
        method: "POST",
      }
    );

    if (!res.ok) {
      const errorText = await res.text();
      console.error("revertBookToVersion failed:", res.status, errorText);
      return undefined;
    }

    return res.json();
  } catch (error) {
    console.error("Error reverting book version:", error);
    return undefined;
  }
}

