export default function CreateChapterModalWindow() {
  return (
    <div className="p-7 bg-white lg:w-xs rounded-2xl">
      <div className="py-4">
        <input
          type="text"
          placeholder="Название главы"
          className="w-full ring-1 p-4 rounded-md"
        />
      </div>
      <div className="w-full flex justify-end mt-3">
        <button className="bg-sky-500/40 p-4 py-2 rounded-lg border-2 border-blue-400 cursor-pointer">
          Создать
        </button>
      </div>
    </div>
  );
}
