"use client";

type VideoViewProps = {
  value: string;
};

export default function VideoView({ value }: VideoViewProps) {
  if (!value) {
    return (
      <div className="w-full h-48 bg-gray-100 rounded-lg flex items-center justify-center text-gray-400">
        Видео не загружено
      </div>
    );
  }

  return (
    <video
      src={value}
      controls
      className="w-full max-h-[500px] rounded-lg bg-black"
    >
      Ваш браузер не поддерживает видео
    </video>
  );
}

