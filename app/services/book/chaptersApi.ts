import { getAuthHeaders } from "@/app/libs/auth";
import { API_BASE } from "../constructor/constructorApi";
import { Chapter } from "../../types/chapter";
import { ConstructorResponse } from "../../types/constructorResponse";
import { CreateBookPayload } from "../../types/CreateBookPayload";
import { Book } from "../../types/book";

export async function handleUpdateChapter(
  chapterId: number | string,
  title: string,
  sectionId?: number | null
): Promise<ConstructorResponse<Chapter> | null> {
  try {
    const body: Record<string, unknown> = {};
    if (title.trim()) body.title = title.trim();
    if (sectionId !== undefined) body.section_id = sectionId;
    const res = await fetch(`${API_BASE}/api/v1/chapters/${chapterId}`, {
      method: "PUT",
      headers: getAuthHeaders(),
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      console.error("updateChapter failed:", res.status);
      return null;
    }

    return res.json();
  } catch (error) {
    console.error("Failed to update chapter:", error);
    return null;
  }
}

export async function handleDeleteChapter(
  chapterId: number | string
): Promise<boolean> {
  const res = await fetch(`${API_BASE}/api/v1/chapters/${chapterId}`, {
    method: "DELETE",
    headers: getAuthHeaders(),
  });

  if (!res.ok && res.status !== 204) {
    const errorText = await res.text();
    console.error("deleteChapter failed:", res.status, errorText);
    return false;
  }
  return true;
}

export const handleCreateChapter = async (
  bookId: string,
  title: string,
  sectionId?: number | null
): Promise<ConstructorResponse<Chapter> | undefined> => {
  if (!bookId) {
    console.error("Book id is missing in search params");
    return;
  }

  if (!title.trim()) {
    console.error("Chapter title is empty");
    return;
  }

  const body: Record<string, unknown> = { title: title.trim() };
  if (sectionId) body.section_id = sectionId;

  try {
    const res = await fetch(
      `${API_BASE}/api/v1/books/${bookId}/chapters`,
      {
        headers: getAuthHeaders(),
        method: "POST",
        body: JSON.stringify(body),
      }
    );

    return res.json();
  } catch (error) {
    console.error("Failed to create chapter:", error);
  }
};

type ContentOrderItem =
  | { type: "section"; id: number; order: number; chapters?: { id: number; order: number }[] }
  | { type: "chapter"; id: number; order: number };

export async function handleReorderContent(
  bookId: string,
  order: ContentOrderItem[]
): Promise<boolean> {
  try {
    const res = await fetch(
      `${API_BASE}/api/v1/books/${bookId}/content/order`,
      {
        method: "PUT",
        headers: getAuthHeaders(),
        body: JSON.stringify(order),
      }
    );
    return res.ok;
  } catch (error) {
    console.error("Failed to reorder content:", error);
    return false;
  }
}

export async function handleReorderChapters(
  bookId: string,
  order: { id: number; order: number }[]
): Promise<boolean> {
  try {
    const res = await fetch(
      `${API_BASE}/api/v1/books/${bookId}/chapters/order`,
      {
        method: "PUT",
        headers: getAuthHeaders(),
        body: JSON.stringify(order),
      }
    );
    return res.ok;
  } catch (error) {
    console.error("Failed to reorder chapters:", error);
    return false;
  }
}

export async function handleReorderSectionChapters(
  sectionId: number | string,
  order: { id: number; order: number }[]
): Promise<boolean> {
  try {
    const res = await fetch(
      `${API_BASE}/api/v1/sections/${sectionId}/chapters/order`,
      {
        method: "PUT",
        headers: getAuthHeaders(),
        body: JSON.stringify(order),
      }
    );
    return res.ok;
  } catch (error) {
    console.error("Failed to reorder section chapters:", error);
    return false;
  }
}
