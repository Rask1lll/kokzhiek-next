import { getAuthHeaders } from "@/app/libs/auth";
import { API_BASE } from "../constructor/constructorApi";
import { Chapter } from "../../types/chapter";
import { ConstructorResponse } from "../../types/constructorResponse";
import { CreateBookPayload } from "../../types/CreateBookPayload";
import { Book } from "../../types/book";

export async function handleDeleteChapter(
  chapterId: number | string
): Promise<void> {
  const res = await fetch(`${API_BASE}/api/v1/chapters/${chapterId}`, {
    method: "DELETE",
    headers: getAuthHeaders(),
  });

  if (!res.ok && res.status !== 204) {
    const errorText = await res.text();
    console.error("deleteChapter failed:", res.status, errorText);
  }
}

export const handleCreateChapter = async (
  bookId: string,
  title: string
): Promise<ConstructorResponse<Chapter> | undefined> => {
  if (!bookId) {
    console.error("Book id is missing in search params");
    return;
  }

  if (!title.trim()) {
    console.error("Chapter title is empty");
    return;
  }

  const data = JSON.stringify({ title: title.trim() });

  console.log("Create chapter payload:", data);

  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_SERVER_URL}/api/v1/books/${bookId}/chapters`,
      {
        headers: getAuthHeaders(),
        method: "POST",
        body: data,
      }
    );

    return res.json();
    //   addChapter({
    //     id: resData.data.id,
    //     title: resData.data.title,
    //     order: resData.data.order,
    //   });
    //   removeContent();
  } catch (error) {
    console.error("Failed to create chapter:", error);
  }
};
