"use client";

type GenericWidgetProps = {
  type: string;
};

export default function GenericWidget({ type }: GenericWidgetProps) {
  return (
    <div className="w-full h-full flex items-center justify-center text-xs text-gray-400 border border-dashed border-gray-300 rounded-md">
      {type} (редактирование добавим позже)
    </div>
  );
}
