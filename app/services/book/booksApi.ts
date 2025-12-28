import { getAuthHeaders, getToken } from "../../libs/auth";
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
  const data = JSON.stringify(payload);

  console.log(data);
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_SERVER_URL}/api/v1/books`,
      {
        headers: getAuthHeaders(),
        method: "POST",
        body: data,
      }
    );

    return res.json();
  } catch (error) {
    console.error(error);
  }
}

export type GetBooksParams = {
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

    const token = getToken();

    const res = await fetch(
      `${process.env.NEXT_PUBLIC_SERVER_URL}/api/v1/books/${id}/cover`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
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

export async function handleUpdateBookStatus(
  id: number,
  status: BookStatus
): Promise<ApiResult<Book>> {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_SERVER_URL}/api/v1/books/${id}/status`,
      {
        headers: getAuthHeaders(),
        method: "PATCH",
        body: JSON.stringify({ status }),
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
