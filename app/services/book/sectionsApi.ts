import { getAuthHeaders } from "@/app/libs/auth";
import { Section } from "@/app/types/chapter";
import { ConstructorResponse } from "@/app/types/constructorResponse";

const API_BASE = process.env.NEXT_PUBLIC_SERVER_URL;

export async function handleGetSections(
  bookId: string
): Promise<ConstructorResponse<Section[]> | null> {
  try {
    const res = await fetch(`${API_BASE}/api/v1/books/${bookId}/sections`, {
      headers: getAuthHeaders(),
    });
    if (!res.ok) return null;
    return res.json();
  } catch (error) {
    console.error("Failed to get sections:", error);
    return null;
  }
}

export async function handleCreateSection(
  bookId: string,
  title: string
): Promise<ConstructorResponse<Section> | null> {
  try {
    const res = await fetch(`${API_BASE}/api/v1/books/${bookId}/sections`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify({ title: title.trim() }),
    });
    if (!res.ok) return null;
    return res.json();
  } catch (error) {
    console.error("Failed to create section:", error);
    return null;
  }
}

export async function handleUpdateSection(
  sectionId: number | string,
  title: string
): Promise<ConstructorResponse<Section> | null> {
  try {
    const res = await fetch(`${API_BASE}/api/v1/sections/${sectionId}`, {
      method: "PUT",
      headers: getAuthHeaders(),
      body: JSON.stringify({ title: title.trim() }),
    });
    if (!res.ok) return null;
    return res.json();
  } catch (error) {
    console.error("Failed to update section:", error);
    return null;
  }
}

export async function handleDeleteSection(
  sectionId: number | string
): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE}/api/v1/sections/${sectionId}`, {
      method: "DELETE",
      headers: getAuthHeaders(),
    });
    return res.ok || res.status === 204;
  } catch (error) {
    console.error("Failed to delete section:", error);
    return false;
  }
}

export async function handleReorderSections(
  bookId: string,
  order: { id: number; order: number }[]
): Promise<boolean> {
  try {
    const res = await fetch(
      `${API_BASE}/api/v1/books/${bookId}/sections/order`,
      {
        method: "PUT",
        headers: getAuthHeaders(),
        body: JSON.stringify(order),
      }
    );
    return res.ok;
  } catch (error) {
    console.error("Failed to reorder sections:", error);
    return false;
  }
}
