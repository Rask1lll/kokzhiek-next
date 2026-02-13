import {
  handleCreateChapter,
  handleDeleteChapter,
  handleUpdateChapter,
} from "../services/book/chaptersApi";
import { useChaptersStore } from "../store/chaptersStore";
import { Chapter } from "../types/chapter";
import { ConstructorResponse } from "../types/constructorResponse";

export function useChapters(bookId: string) {
  const { addChapter, removeChapter, updateChapter: updateChapterInStore, sections, setSections } = useChaptersStore();

  async function createChapter(title: string, sectionId?: number | null) {
    const resData: ConstructorResponse<Chapter> | undefined =
      await handleCreateChapter(bookId, title, sectionId);
    if (!resData || !resData.success) return;

    const chapter = {
      id: resData.data.id,
      title: resData.data.title,
      order: resData.data.order,
      section_id: resData.data.section_id,
    };

    if (chapter.section_id) {
      // Add to the section's chapters list
      setSections(
        sections.map((s) =>
          s.id === chapter.section_id
            ? { ...s, chapters: [...s.chapters, chapter] }
            : s
        )
      );
    } else {
      addChapter(chapter);
    }

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
      const numId = Number(chapterId);
      removeChapter(numId);
      // Also remove from sections
      setSections(
        sections.map((s) => ({
          ...s,
          chapters: s.chapters.filter((ch) => ch.id !== numId),
        }))
      );
    }
    return success;
  }

  return { createChapter, updateChapter, deleteChapter };
}
