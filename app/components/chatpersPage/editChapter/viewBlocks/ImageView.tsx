"use client";

type ImageViewProps = {
  value: string;
  text?: string;
};

export default function ImageView({ value, text }: ImageViewProps) {
  if (!value) {
    return (
      <div className="w-full h-48 bg-gray-100 rounded-lg flex items-center justify-center text-gray-400">
        Изображение не загружено
      </div>
    );
  }

  return (
    <div className="w-full p-2 space-y-2">
      {text && <p className="text-lg font-medium text-gray-800">{text}</p>}
      <img
        src={value}
        alt={text || "Image"}
        className="w-full h-auto max-h-[500px] object-contain rounded-lg"
      />
    </div>
  );
}
