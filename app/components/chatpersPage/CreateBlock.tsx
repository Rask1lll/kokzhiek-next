import { BiPlus } from "react-icons/bi";

export default function CreateBlock({ onClick }: { onClick: () => void }) {
  return (
    <div className="w-full">
      <div
        onClick={onClick}
        className="font-bold text-xl lg:h-30 flex items-center gap-3 justify-center bg-gray-100 hover:bg-blue-200 transition-all duration-200 cursor-pointer"
      >
        <BiPlus className="w-10 h-10" />
        <p>Создать новый блок</p>
      </div>
    </div>
  );
}
