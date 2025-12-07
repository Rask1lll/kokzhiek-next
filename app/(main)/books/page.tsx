import CreateBookSection from "@/app/components/booksPage/bookCreating/CreateBookSection";
import BooksList from "@/app/components/booksPage/booksSection/booksList/BooksList";
import BooksFilterBar from "@/app/components/booksPage/booksSection/filters/BooksFilterBar";

export default function BooksPage() {
  return (
    <>
      <CreateBookSection />
      <div className="bg-gray-100">
        <div className="mx-auto">
          <BooksFilterBar />
          <BooksList />
        </div>
      </div>
    </>
  );
}
