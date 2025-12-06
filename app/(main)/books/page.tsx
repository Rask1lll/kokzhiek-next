import CreateBookSection from "@/app/components/booksPage/bookCreating/CreateBookSection";
import BooksList from "@/app/components/booksPage/booksSection/booksList/BooksList";
import BooksFilterBar from "@/app/components/booksPage/booksSection/filters/BooksFilterBar";
import ModalWindow from "@/app/components/ModalWindow/ModalWindow";

export default function BooksPage() {
  return (
    <>
      <ModalWindow />
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
