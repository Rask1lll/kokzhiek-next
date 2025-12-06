import CreateChapterButton from "./CreateChapterButton";
import ChapterCard from "./ChapterCard";

const testChapters = [
  { id: "1", name: "Глава 1: Введение в тему" },
  { id: "2", name: "Глава 2: Базовые понятия" },
  { id: "3", name: "Глава 3: Практические задания" },
  { id: "4", name: "Глава 4: Итоговый тест" },
];

export default function ChaptersContainer() {
  return (
    <section className="space-y-4">
      <h2 className="text-lg font-semibold text-gray-900">Главы</h2>
      <div className="grid grid-cols-1 gap-4">
        {testChapters.map((chapter) => (
          <ChapterCard key={chapter.id} id={chapter.id} title={chapter.name} />
        ))}
        <CreateChapterButton />
      </div>
    </section>
  );
}
