"use client";

import CreateChapterButton from "./CreateChapterButton";
import ChapterCard from "./ChapterCard";
import ChapterCardSkeleton from "./ChapterCardSkeleton";
import { useChaptersStore } from "@/app/store/chaptersStore";
import { deleteChapter } from "@/app/services/chaptersApi";

type ChaptersContainerProps = {
  isLoading: boolean;
  bookId: string;
};

export default function ChaptersContainer({
  isLoading: externalLoading,
  bookId,
}: ChaptersContainerProps) {
  const { chapters, removeChapter } = useChaptersStore();

  const handleDeleteChapter = async (chapterId: string) => {
    try {
      await deleteChapter(chapterId);
      removeChapter(chapterId);
    } catch (err) {
      console.error("Failed to delete chapter:", err);
      throw err;
    }
  };
  return (
    <section className="space-y-4 mx-10">
      <h2 className="text-lg font-semibold text-gray-900">Главы</h2>
      <div className="grid grid-cols-1 gap-4">
        {externalLoading ? (
          <>
            <ChapterCardSkeleton />
            <ChapterCardSkeleton />
            <ChapterCardSkeleton />
            <ChapterCardSkeleton />
          </>
        ) : (
          <>
            {chapters.map((chapter) => (
              <ChapterCard
                key={chapter.id}
                chapterId={String(chapter.id)}
                title={chapter.title}
                bookid={bookId}
                onDelete={handleDeleteChapter}
              />
            ))}
            <CreateChapterButton />
          </>
        )}
      </div>
    </section>
  );
}
