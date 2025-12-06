import BookCard from "./BookCard";
import style from "./BooksList.module.css";
const testData = [1, 2, 3, 4, 5, 6, 7, 8, 9, 0, 23, 13, 12, 11];
export default function BooksList() {
  return (
    <div className={`w-full ${style.booksGrid} px-10`}>
      {testData.map((el) => {
        return <BookCard bookId={String(el)} key={el} />;
      })}
    </div>
  );
}
