import LayoutsList from "@/app/components/chatpersPage/editChapter/LayoutsList";

export default function ChapterPage() {
  return (
    <div className="h-screen w-screen">
      <div className="w-1/3">
        <LayoutsList />
      </div>
      <div className="w-2/3"></div>
    </div>
  );
}
