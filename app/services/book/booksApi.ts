import { getAuthHeaders, getAuthHeadersFormdata } from "../../libs/auth";
import { Book, BookStatus } from "../../types/book";
import { ConstructorResponse } from "../../types/constructorResponse";
import { CreateBookPayload } from "../../types/CreateBookPayload";
import { UpdateBookPayload } from "../../types/UpdateBookPayload";
import { ValidationErrorResponse } from "../../types/validationError";

export type ApiResult<T> =
  | { success: true; data: T }
  | { success: false; errors: Record<string, string[]>; message: string };

export async function handleCreateBook(
  payload: CreateBookPayload
): Promise<ConstructorResponse<Book> | undefined> {
  try {
    const formData = new FormData();
    formData.append("title", payload.title);

    if (payload.description) {
      formData.append("description", payload.description);
    }
    if (payload.language) {
      formData.append("language", payload.language);
    }
    if (payload.grade_id) {
      formData.append("grade_id", String(payload.grade_id));
    }
    if (payload.subject_id) {
      formData.append("subject_id", String(payload.subject_id));
    }
    if (payload.isbn) {
      formData.append("isbn", payload.isbn);
    }
    if (payload.cover) {
      formData.append("cover", payload.cover);
    }
    // if (payload.settings) {
    //   formData.append("settings", JSON.stringify(payload.settings));
    // }

    const res = await fetch(
      `${process.env.NEXT_PUBLIC_SERVER_URL}/api/v1/books`,
      {
        method: "POST",
        headers: getAuthHeadersFormdata(),
        body: formData,
      }
    );

    return res.json();
  } catch (error) {
    console.error(error);
  }
}

export type GetBooksParams = {
  search?: string;
  grade_id?: number;
  subject_id?: number;
  status?: BookStatus;
  sort_by?: "recent" | "title";
  sort_order?: "asc" | "desc";
};

export async function handleGetBooks(
  params?: GetBooksParams
): Promise<ConstructorResponse<Book[]> | undefined> {
  try {
    const url = new URL(
      `${process.env.NEXT_PUBLIC_SERVER_URL}/api/v1/books`
    );
    if (params?.search) {
      url.searchParams.set("search", params.search);
    }
    if (params?.grade_id) {
      url.searchParams.set("grade_id", String(params.grade_id));
    }
    if (params?.subject_id) {
      url.searchParams.set("subject_id", String(params.subject_id));
    }
    if (params?.status) {
      url.searchParams.set("status", params.status);
    }
    if (params?.sort_by) {
      url.searchParams.set("sort_by", params.sort_by);
    }
    if (params?.sort_order) {
      url.searchParams.set("sort_order", params.sort_order);
    }

    const data = await fetch(url.toString(), {
      headers: getAuthHeaders(),
    });
    return data.json();
  } catch (error) {
    console.error("Error fetching books:", error);
  }
}

export async function handleDeleteBook(id: number): Promise<void> {
  try {
    await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/v1/books/${id}`, {
      headers: getAuthHeaders(),
      method: "DELETE",
    });
  } catch (error) {
    console.error("Error deleting book:", error);
  }
}

export async function handleUpdateBook(
  id: number,
  payload: UpdateBookPayload
): Promise<ApiResult<Book>> {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_SERVER_URL}/api/v1/books/${id}`,
      {
        headers: getAuthHeaders(),
        method: "PUT",
        body: JSON.stringify(payload),
      }
    );
    const json = await res.json();

    if (!res.ok) {
      const errorResponse = json as ValidationErrorResponse;
      return {
        success: false,
        errors: errorResponse.errors || {},
        message: errorResponse.message || "Ошибка при обновлении книги",
      };
    }

    return { success: true, data: json.data };
  } catch (error) {
    console.error("Error updating book:", error);
    return {
      success: false,
      errors: {},
      message: "Ошибка сети при обновлении книги",
    };
  }
}

export async function handleGetBook(
  id: number
): Promise<ConstructorResponse<Book> | undefined> {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_SERVER_URL}/api/v1/books/${id}`,
      {
        headers: getAuthHeaders(),
      }
    );
    return res.json();
  } catch (error) {
    console.error("Error fetching book:", error);
  }
}

export async function handleUploadBookCover(
  id: number,
  file: File
): Promise<ApiResult<Book>> {
  try {
    const formData = new FormData();
    formData.append("cover", file);

    const res = await fetch(
      `${process.env.NEXT_PUBLIC_SERVER_URL}/api/v1/books/${id}/cover`,
      {
        method: "POST",
        headers: getAuthHeadersFormdata(),
        body: formData,
      }
    );
    const json = await res.json();

    if (!res.ok) {
      const errorResponse = json as ValidationErrorResponse;
      return {
        success: false,
        errors: errorResponse.errors || {},
        message: errorResponse.message || "Ошибка при загрузке обложки",
      };
    }

    return { success: true, data: json.data };
  } catch (error) {
    console.error("Error uploading book cover:", error);
    return {
      success: false,
      errors: {},
      message: "Ошибка сети при загрузке обложки",
    };
  }
}

export async function handleDeleteBookCover(
  id: number
): Promise<ApiResult<Book>> {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_SERVER_URL}/api/v1/books/${id}/cover`,
      {
        headers: getAuthHeaders(),
        method: "DELETE",
      }
    );
    const json = await res.json();

    if (!res.ok) {
      const errorResponse = json as ValidationErrorResponse;
      return {
        success: false,
        errors: errorResponse.errors || {},
        message: errorResponse.message || "Ошибка при удалении обложки",
      };
    }

    return { success: true, data: json.data };
  } catch (error) {
    console.error("Error deleting book cover:", error);
    return {
      success: false,
      errors: {},
      message: "Ошибка сети при удалении обложки",
    };
  }
}

export type UpdateBookStatusPayload = {
  status: BookStatus;
  reason?: string;
};

export async function handleUpdateBookStatus(
  id: number,
  payload: UpdateBookStatusPayload
): Promise<ApiResult<Book>> {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_SERVER_URL}/api/v1/books/${id}/status`,
      {
        headers: getAuthHeaders(),
        method: "PATCH",
        body: JSON.stringify(payload),
      }
    );
    const json = await res.json();

    if (!res.ok) {
      const errorResponse = json as ValidationErrorResponse;
      return {
        success: false,
        errors: errorResponse.errors || {},
        message: errorResponse.message || "Ошибка при обновлении статуса",
      };
    }

    return { success: true, data: json.data };
  } catch (error) {
    console.error("Error updating book status:", error);
    return {
      success: false,
      errors: {},
      message: "Ошибка сети при обновлении статуса",
    };
  }
}
