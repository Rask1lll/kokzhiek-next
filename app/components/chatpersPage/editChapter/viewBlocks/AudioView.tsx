"use client";

type AudioViewProps = {
  value: string;
  text?: string;
};

export default function AudioView({ value, text }: AudioViewProps) {
  if (!value) {
    return (
      <div className="w-full py-4 bg-gray-100 rounded-lg flex items-center justify-center text-gray-400">
        Аудио не загружено
      </div>
    );
  }

  return (
    <div className="w-full p-2 space-y-2">
      {text && <p className="text-lg font-medium text-gray-800">{text}</p>}
      <audio src={value} controls className="w-full rounded-lg">
        Ваш браузер не поддерживает аудио
      </audio>
    </div>
  );
}
