"use client";
import { useModalWindowStore } from "@/app/store/modalWindowStore";
import { useAuth } from "@/app/hooks/useAuth";
import { canCreateBooks } from "@/app/libs/roles";
import { BiPlus } from "react-icons/bi";
import CreateBookModal from "./CreateBookModal";

export default function CreateBookSection() {
  const { addContent } = useModalWindowStore();
  const { user } = useAuth();
  const canCreate = canCreateBooks(user);

  return (
    <div className="min-h-[100px] sticky top-0 z-20 w-full items-center justify-center">
      <div className="w-full bg-white px-12 py-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-1">
            Книги
          </h1>
          <p className="text-sm md:text-base text-gray-600">
            {canCreate
              ? "Создавайте и управляйте учебными материалами"
              : "Учебные материалы"}
          </p>
        </div>

        {canCreate && (
          <button
            onClick={() => {
              addContent(<CreateBookModal />);
            }}
            type="button"
            className="w-[180px] h-[45px] flex items-center justify-center rounded-xl bg-blue-500 text-white font-semibold text-sm md:text-base shadow-md hover:shadow-lg hover:from-indigo-700 hover:to-sky-700 transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 cursor-pointer"
          >
            <BiPlus className="text-white w-5 h-5" /> Создать книгу
          </button>
        )}
      </div>
    </div>
  );
}
