"use client";

import CreateChapterButton from "./CreateChapterButton";
import ChapterCard from "./ChapterCard";
import ChapterCardSkeleton from "./ChapterCardSkeleton";

type Chapter = {
  id: number | string;
  title: string;
};

type ChaptersContainerProps = {
  chapters: Chapter[];
  isLoading?: boolean;
};

export default function ChaptersContainer({
  chapters,
  bookId,
}: {
  chapters: Chapter[];
  bookId: string;
}) {
  return (
    <section className="space-y-4 mx-10">
      <h2 className="text-lg font-semibold text-gray-900">Главы</h2>
      <div className="grid grid-cols-1 gap-4">
        {chapters.map((chapter) => (
          <ChapterCard
            key={chapter.id}
            chapterId={String(chapter.id)}
            title={chapter.title}
            bookid={bookId}
          />
        ))}
        <CreateChapterButton />
      </div>
    </section>
  );
}
