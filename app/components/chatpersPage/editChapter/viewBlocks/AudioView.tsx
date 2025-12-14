"use client";

type AudioViewProps = {
  value: string;
};

export default function AudioView({ value }: AudioViewProps) {
  if (!value) {
    return (
      <div className="w-full py-4 bg-gray-100 rounded-lg flex items-center justify-center text-gray-400">
        Аудио не загружено
      </div>
    );
  }

  return (
    <audio src={value} controls className="w-full">
      Ваш браузер не поддерживает аудио
    </audio>
  );
}

