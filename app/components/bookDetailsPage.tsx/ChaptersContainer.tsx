"use client";

import { useTranslations } from "next-intl";
import CreateChapterButton from "./CreateChapterButton";
import ChapterCard from "./ChapterCard";
import ChapterCardSkeleton from "./ChapterCardSkeleton";
import { useChaptersStore } from "@/app/store/chaptersStore";
import { useChapters } from "@/app/hooks/useChapters";
import { PresenceUser } from "@/app/hooks/useChapterPresence";

type ChaptersContainerProps = {
  isLoading: boolean;
  bookId: string;
  isBookOwner?: boolean;
  isChapterOccupied?: (chapterId: string) => boolean;
  getChapterUsers?: (chapterId: string) => PresenceUser[];
};

export default function ChaptersContainer({
  isLoading: externalLoading,
  bookId,
  isBookOwner = false,
  isChapterOccupied,
  getChapterUsers,
}: ChaptersContainerProps) {
  const { chapters } = useChaptersStore();
  const { deleteChapter } = useChapters(bookId);
  const t = useTranslations("chapters");

  const handleDeleteChapter = async (chapterId: string) => {
    try {
      await deleteChapter(chapterId);
    } catch (err) {
      console.error("Failed to delete chapter:", err);
      throw err;
    }
  };
  return (
    <section className="space-y-4 mx-10">
      <h2 className="text-lg font-semibold text-gray-900">{t("title")}</h2>
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
            {chapters.map((chapter) => {
              const chapterId = String(chapter.id);
              const occupied = isChapterOccupied?.(chapterId) ?? false;
              const users = getChapterUsers?.(chapterId) ?? [];
              return (
                <ChapterCard
                  key={chapter.id}
                  chapterId={chapterId}
                  title={chapter.title}
                  bookid={bookId}
                  onDelete={isBookOwner ? handleDeleteChapter : undefined}
                  isOccupied={occupied}
                  occupiedBy={users}
                  canEdit={isBookOwner}
                />
              );
            })}
            {isBookOwner && <CreateChapterButton />}
          </>
        )}
      </div>
    </section>
  );
}
