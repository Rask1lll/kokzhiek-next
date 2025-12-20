import CreateBookSection from "@/app/components/booksPage/bookCreating/CreateBookSection";
import BooksPageClient from "./BooksPageClient";

export default function BooksPage() {
  return (
    <>
      <CreateBookSection />
      <div className="bg-gray-100">
        <div className="mx-auto">
          <BooksPageClient />
        </div>
      </div>
    </>
  );
}
