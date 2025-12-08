"use client";

import CreateChapterButton from "./CreateChapterButton";
import ChapterCard from "./ChapterCard";

type Chapter = {
  id: number | string;
  title: string;
};

type ChaptersContainerProps = {
  chapters: Chapter[];
};

export default function ChaptersContainer({
  chapters,
}: ChaptersContainerProps) {
  return (
    <section className="space-y-4 mx-10">
      <h2 className="text-lg font-semibold text-gray-900">Главы</h2>
      <div className="grid grid-cols-1 gap-4">
        {chapters.map((chapter) => (
          <ChapterCard
            key={chapter.id}
            id={String(chapter.id)}
            title={chapter.title}
          />
        ))}
        <CreateChapterButton />
      </div>
    </section>
  );
}
