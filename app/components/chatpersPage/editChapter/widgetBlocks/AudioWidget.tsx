"use client";

type AudioWidgetProps = {
  value: string;
  onChange: (value: string) => void;
};

export default function AudioWidget({ value, onChange }: AudioWidgetProps) {
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    onChange(file ? file.name : "");
  };

  return (
    <div className="space-y-1">
      <label className="inline-flex items-center gap-2 rounded-md border border-dashed border-gray-300 px-3 py-2 text-sm text-gray-600 cursor-pointer hover:border-blue-400 hover:bg-blue-50/40 transition-colors duration-100">
        <span className="font-medium">Загрузить аудио</span>
        <input
          type="file"
          accept="audio/*"
          className="hidden"
          onChange={handleFileChange}
        />
      </label>
      {value && <p className="text-xs text-gray-500 truncate">Файл: {value}</p>}
    </div>
  );
}


