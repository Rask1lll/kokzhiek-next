import {
  handleCreateChapter,
  handleDeleteChapter,
  handleUpdateChapter,
} from "../services/book/chaptersApi";
import { useChaptersStore } from "../store/chaptersStore";
import { Chapter } from "../types/chapter";
import { ConstructorResponse } from "../types/constructorResponse";

export function useChapters(bookId: string) {
  const { addChapter, removeChapter, updateChapter: updateChapterInStore } = useChaptersStore();

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

  async function updateChapter(chapterId: string, title: string) {
    const resData = await handleUpdateChapter(chapterId, title);
    if (resData?.data) {
      updateChapterInStore(Number(chapterId), {
        title: resData.data.title,
      });
      return true;
    }
    return false;
  }

  async function deleteChapter(chapterId: string) {
    const success = await handleDeleteChapter(chapterId);
    if (success) {
      removeChapter(Number(chapterId));
    }
    return success;
  }

  return { createChapter, updateChapter, deleteChapter };
}
