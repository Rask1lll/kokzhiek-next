import { ConstructorResponse } from "@/app/types/constructorResponse";
import { GlossaryWord } from "@/app/types/glossary";
import { getAuthHeaders } from "@/app/libs/auth";
import { API_BASE } from "../constructor/constructorApi";

// Получить все слова глоссария книги
export async function getBookGlossary(
  bookId: number | string
): Promise<ConstructorResponse<GlossaryWord[]>> {
  try {
    const res = await fetch(`${API_BASE}/api/v1/books/${bookId}/glossary`, {
      method: "GET",
      headers: getAuthHeaders(),
    });

    if (!res.ok) {
      const errorText = await res.text();
      console.error("getBookGlossary failed:", res.status, errorText);
      return {
        data: [],
        messages: [`HTTP ${res.status}: ${errorText}`],
        success: false,
      };
    }

    return res.json();
  } catch (error) {
    console.error("Failed to get book glossary:", error);
    return {
      data: [],
      messages: ["Ошибка сети"],
      success: false,
    };
  }
}

// Получить одно слово по ID
export async function getGlossaryWord(
  bookId: number | string,
  wordId: string
): Promise<ConstructorResponse<GlossaryWord>> {
  try {
    const res = await fetch(
      `${API_BASE}/api/v1/books/${bookId}/glossary/${wordId}`,
      {
        method: "GET",
        headers: getAuthHeaders(),
      }
    );

    if (!res.ok) {
      const errorText = await res.text();
      console.error("getGlossaryWord failed:", res.status, errorText);
      return {
        data: null as unknown as GlossaryWord,
        messages: [`HTTP ${res.status}: ${errorText}`],
        success: false,
      };
    }

    return res.json();
  } catch (error) {
    console.error("Failed to get glossary word:", error);
    return {
      data: null as unknown as GlossaryWord,
      messages: ["Ошибка сети"],
      success: false,
    };
  }
}

// Добавить слово в глоссарий
export async function createGlossaryWord(
  bookId: number | string,
  word: string,
  translation: string,
  language?: string
): Promise<ConstructorResponse<GlossaryWord>> {
  try {
    const res = await fetch(`${API_BASE}/api/v1/books/${bookId}/glossary`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify({
        word,
        translation,
        language,
      }),
    });

    if (!res.ok) {
      const errorText = await res.text();
      console.error("createGlossaryWord failed:", res.status, errorText);
      return {
        data: null as unknown as GlossaryWord,
        messages: [`HTTP ${res.status}: ${errorText}`],
        success: false,
      };
    }

    return res.json();
  } catch (error) {
    console.error("Failed to create glossary word:", error);
    return {
      data: null as unknown as GlossaryWord,
      messages: ["Ошибка сети"],
      success: false,
    };
  }
}

// Обновить слово в глоссарии
export async function updateGlossaryWord(
  bookId: number | string,
  wordId: string,
  updates: {
    word?: string;
    translation?: string;
    language?: string;
  }
): Promise<ConstructorResponse<GlossaryWord>> {
  try {
    const res = await fetch(
      `${API_BASE}/api/v1/books/${bookId}/glossary/${wordId}`,
      {
        method: "PUT",
        headers: getAuthHeaders(),
        body: JSON.stringify(updates),
      }
    );

    if (!res.ok) {
      const errorText = await res.text();
      console.error("updateGlossaryWord failed:", res.status, errorText);
      return {
        data: null as unknown as GlossaryWord,
        messages: [`HTTP ${res.status}: ${errorText}`],
        success: false,
      };
    }

    return res.json();
  } catch (error) {
    console.error("Failed to update glossary word:", error);
    return {
      data: null as unknown as GlossaryWord,
      messages: ["Ошибка сети"],
      success: false,
    };
  }
}

// Удалить слово из глоссария
export async function deleteGlossaryWord(
  bookId: number | string,
  wordId: string
): Promise<ConstructorResponse<unknown>> {
  try {
    const res = await fetch(
      `${API_BASE}/api/v1/books/${bookId}/glossary/${wordId}`,
      {
        method: "DELETE",
        headers: getAuthHeaders(),
      }
    );

    if (!res.ok) {
      const errorText = await res.text();
      console.error("deleteGlossaryWord failed:", res.status, errorText);
      return {
        data: null,
        messages: [`HTTP ${res.status}: ${errorText}`],
        success: false,
      };
    }

    return res.json();
  } catch (error) {
    console.error("Failed to delete glossary word:", error);
    return {
      data: null,
      messages: ["Ошибка сети"],
      success: false,
    };
  }
}
