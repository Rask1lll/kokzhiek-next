import BookCard from "./BookCard";
import style from "./BooksList.module.css";

const testData = [
  { id: 1, name: "Учебник математики 10 класс" },
  { id: 2, name: "Учебник истории 7 класс" },
  { id: 3, name: "Физика. Базовый курс 9 класс" },
  { id: 4, name: "Информатика и ИКТ 8 класс" },
  { id: 5, name: "Литература. Хрестоматия 6 класс" },
  { id: 6, name: "Биология. Подготовка к ЕНТ" },
];

export default function BooksList() {
  return (
    <div className={`w-full ${style.booksGrid} px-10`}>
      {testData.map((el) => {
        return <BookCard bookId={String(el.id)} name={el.name} key={el.id} />;
      })}
    </div>
  );
}
