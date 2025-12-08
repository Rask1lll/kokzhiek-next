"use client";

import { useState, useRef } from "react";
import ImageCropModal from "./ImageCropModal";

type ImageWidgetProps = {
  value: string; // URL of the image
  onChange: (value: string) => void;
  onFileUpload?: (file: File) => Promise<string | null>; // Returns new URL or null on error
};

export default function ImageWidget({
  value,
  onChange,
  onFileUpload,
}: ImageWidgetProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [showCrop, setShowCrop] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Открываем модалку обрезки вместо прямой загрузки
    setSelectedFile(file);
    setShowCrop(true);
    
    // Сбрасываем input, чтобы можно было выбрать тот же файл снова
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleCropComplete = async (croppedFile: File) => {
    setShowCrop(false);
    
    if (onFileUpload) {
      setIsUploading(true);
      try {
        const newUrl = await onFileUpload(croppedFile);
        if (newUrl) {
          onChange(newUrl);
        }
      } catch (err) {
        console.error("Error uploading image:", err);
      } finally {
        setIsUploading(false);
        setSelectedFile(null);
      }
    } else {
      // Fallback: create object URL for preview
      const url = URL.createObjectURL(croppedFile);
      onChange(url);
      setSelectedFile(null);
    }
  };

  const handleCropCancel = () => {
    setShowCrop(false);
    setSelectedFile(null);
  };

  return (
    <div className="w-full space-y-3">
      {/* Image preview */}
      {value && (
        <div className="relative w-full">
          <img
            src={value}
            alt="Uploaded image"
            className="w-full h-auto max-h-[400px] object-contain rounded-lg border border-gray-200"
          />
        </div>
      )}

      {/* Upload button */}
      <label
        className={`inline-flex items-center gap-2 rounded-md border border-dashed border-gray-300 px-4 py-3 text-sm text-gray-600 cursor-pointer hover:border-blue-400 hover:bg-blue-50/40 transition-colors duration-100 ${
          isUploading ? "opacity-50 pointer-events-none" : ""
        }`}
      >
        {isUploading ? (
          <>
            <svg
              className="animate-spin h-4 w-4 text-blue-500"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            <span className="font-medium">Загрузка...</span>
          </>
        ) : (
          <>
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            <span className="font-medium">
              {value ? "Заменить фото" : "Загрузить фото"}
            </span>
          </>
        )}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileChange}
          disabled={isUploading}
        />
      </label>

      {showCrop && selectedFile && (
        <ImageCropModal
          imageFile={selectedFile}
          onCrop={handleCropComplete}
          onCancel={handleCropCancel}
        />
      )}
    </div>
  );
}
