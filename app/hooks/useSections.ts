import {
  handleCreateSection,
  handleUpdateSection,
  handleDeleteSection,
} from "../services/book/sectionsApi";
import { useChaptersStore } from "../store/chaptersStore";

export function useSections(bookId: string) {
  const { addSection, updateSection: updateSectionInStore, removeSection } =
    useChaptersStore();

  async function createSection(title: string) {
    const resData = await handleCreateSection(bookId, title);
    if (!resData?.success) return null;
    addSection({ ...resData.data, chapters: resData.data.chapters ?? [] });
    return resData;
  }

  async function updateSection(sectionId: string, title: string) {
    const resData = await handleUpdateSection(sectionId, title);
    if (resData?.data) {
      updateSectionInStore(Number(sectionId), { title: resData.data.title });
      return true;
    }
    return false;
  }

  async function deleteSection(sectionId: string) {
    const success = await handleDeleteSection(sectionId);
    if (success) {
      removeSection(Number(sectionId));
    }
    return success;
  }

  return { createSection, updateSection, deleteSection };
}
