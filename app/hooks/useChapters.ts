import {
  handleCreateChapter,
  handleDeleteChapter,
} from "../services/book/chaptersApi";
import { useChaptersStore } from "../store/chaptersStore";
import { Chapter } from "../types/chapter";
import { ConstructorResponse } from "../types/constructorResponse";

export function useChapters(bookId: string) {
  const { addChapter, removeChapter } = useChaptersStore();

  async function createChapter(title: string) {
    const resData: ConstructorResponse<Chapter> | undefined =
      await handleCreateChapter(bookId, title);
    if (!resData || !resData.success) return;
    addChapter({
      id: resData.data.id,
      title: resData.data.title,
      order: resData.data.order,
    });
    return resData;
  }
  async function deleteChapter(chapterId: string) {
    await handleDeleteChapter(chapterId);
    removeChapter(chapterId);
  }
  return { createChapter, deleteChapter };
}
