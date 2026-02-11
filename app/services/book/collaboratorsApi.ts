import { getAuthHeaders } from "../../libs/auth";
import { Collaborator } from "../../types/book";

const API_BASE = process.env.NEXT_PUBLIC_SERVER_URL;

export type CollaboratorResult<T> =
  | { success: true; data: T }
  | { success: false; message: string };

export async function handleGetCollaborators(
  bookId: number
): Promise<CollaboratorResult<Collaborator[]>> {
  try {
    const res = await fetch(
      `${API_BASE}/api/v1/books/${bookId}/collaborators`,
      { headers: getAuthHeaders() }
    );
    const json = await res.json();

    if (!res.ok) {
      return { success: false, message: json.message || "Ошибка загрузки соавторов" };
    }

    return { success: true, data: json.data ?? [] };
  } catch {
    return { success: false, message: "Ошибка сети" };
  }
}

export async function handleAddCollaborator(
  bookId: number,
  email: string
): Promise<CollaboratorResult<Collaborator>> {
  try {
    const res = await fetch(
      `${API_BASE}/api/v1/books/${bookId}/collaborators`,
      {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify({ email }),
      }
    );
    const json = await res.json();

    if (!res.ok) {
      return { success: false, message: json.message || "Ошибка добавления соавтора" };
    }

    return { success: true, data: json.data };
  } catch {
    return { success: false, message: "Ошибка сети" };
  }
}

export async function handleRemoveCollaborator(
  bookId: number,
  userId: number
): Promise<CollaboratorResult<void>> {
  try {
    const res = await fetch(
      `${API_BASE}/api/v1/books/${bookId}/collaborators/${userId}`,
      {
        method: "DELETE",
        headers: getAuthHeaders(),
      }
    );

    if (!res.ok) {
      const json = await res.json();
      return { success: false, message: json.message || "Ошибка удаления соавтора" };
    }

    return { success: true, data: undefined };
  } catch {
    return { success: false, message: "Ошибка сети" };
  }
}
