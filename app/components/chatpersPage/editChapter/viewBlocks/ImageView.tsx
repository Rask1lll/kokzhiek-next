"use client";

type ImageViewProps = {
  value: string;
};

export default function ImageView({ value }: ImageViewProps) {
  if (!value) {
    return (
      <div className="w-full h-48 bg-gray-100 rounded-lg flex items-center justify-center text-gray-400">
        Изображение не загружено
      </div>
    );
  }

  return (
    <img
      src={value}
      alt="Image"
      className="w-full h-auto max-h-[500px] object-contain rounded-lg"
    />
  );
}

