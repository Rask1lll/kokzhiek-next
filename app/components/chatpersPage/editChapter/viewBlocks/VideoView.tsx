"use client";

type VideoViewProps = {
  value: string;
  text?: string;
};

export default function VideoView({ value, text }: VideoViewProps) {
  if (!value) {
    return (
      <div className="w-full h-48 bg-gray-100 rounded-lg flex items-center justify-center text-gray-400">
        Видео не загружено
      </div>
    );
  }

  return (
    <div className="w-full p-2 space-y-2">
      {text && <p className="text-lg font-medium text-gray-800">{text}</p>}
      <video
        src={value}
        controls
        className="w-full max-h-[500px] rounded-lg bg-black"
      >
        Ваш браузер не поддерживает видео
      </video>
    </div>
  );
}
