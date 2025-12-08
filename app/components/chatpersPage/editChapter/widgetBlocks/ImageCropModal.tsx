"use client";

import React, { useState, useRef } from "react";
import ReactCrop, {
  Crop,
  PixelCrop,
  PercentCrop,
  makeAspectCrop,
  centerCrop,
} from "react-image-crop";
import "react-image-crop/dist/ReactCrop.css";
import { CgClose } from "react-icons/cg";

interface ImageCropModalProps {
  imageFile: File;
  onCrop: (croppedFile: File) => void;
  onCancel: () => void;
  aspectRatio?: number; // width/height, undefined for free crop
}

export default function ImageCropModal({
  imageFile,
  onCrop,
  onCancel,
  aspectRatio,
}: ImageCropModalProps) {
  const [imageSrc, setImageSrc] = useState<string>("");
  const [crop, setCrop] = useState<Crop>();
  const [completedCrop, setCompletedCrop] = useState<PixelCrop>();
  const imgRef = useRef<HTMLImageElement>(null);

  // Загружаем изображение
  React.useEffect(() => {
    const reader = new FileReader();
    reader.onload = (e) => {
      setImageSrc(e.target?.result as string);
    };
    reader.readAsDataURL(imageFile);
  }, [imageFile]);

  // Инициализируем область обрезки при загрузке изображения
  const onImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const { naturalWidth, naturalHeight } = e.currentTarget;

    let initialCrop: PercentCrop;

    if (aspectRatio) {
      // Если задано соотношение сторон, создаем обрезку с этим соотношением
      initialCrop = makeAspectCrop(
        {
          unit: "%",
          width: 80,
        },
        aspectRatio,
        naturalWidth,
        naturalHeight
      ) as PercentCrop;
    } else {
      // Свободная обрезка - 80% от изображения по центру
      initialCrop = {
        unit: "%",
        x: 10,
        y: 10,
        width: 80,
        height: 80,
      };
    }

    const centeredCrop = centerCrop(initialCrop, naturalWidth, naturalHeight);
    setCrop(centeredCrop);
  };

  // Функция для обрезки изображения
  const handleCrop = async () => {
    if (!completedCrop || !imgRef.current) return;

    const image = imgRef.current;
    const canvas = document.createElement("canvas");
    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;
    const pixelRatio = window.devicePixelRatio;

    canvas.width = completedCrop.width * scaleX * pixelRatio;
    canvas.height = completedCrop.height * scaleY * pixelRatio;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
    ctx.imageSmoothingQuality = "high";

    const cropX = completedCrop.x * scaleX;
    const cropY = completedCrop.y * scaleY;

    ctx.drawImage(
      image,
      cropX,
      cropY,
      completedCrop.width * scaleX,
      completedCrop.height * scaleY,
      0,
      0,
      completedCrop.width * scaleX,
      completedCrop.height * scaleY
    );

    canvas.toBlob((blob) => {
      if (blob) {
        const croppedFile = new File([blob], imageFile.name, {
          type: imageFile.type,
        });
        onCrop(croppedFile);
      }
    }, imageFile.type);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-xl font-semibold text-gray-900">
            Обрезка изображения
          </h2>
          <button
            onClick={onCancel}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            type="button"
          >
            <CgClose className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Image container */}
        <div className="flex-1 overflow-auto p-5 flex items-center justify-center bg-gray-50">
          <div className="max-w-full">
            {imageSrc && (
              <ReactCrop
                crop={crop}
                onChange={(_, percentCrop) => setCrop(percentCrop)}
                onComplete={(c) => setCompletedCrop(c)}
                aspect={aspectRatio}
                minWidth={50}
                minHeight={50}
              >
                <img
                  ref={imgRef}
                  src={imageSrc}
                  alt="Crop preview"
                  style={{
                    maxWidth: "100%",
                    maxHeight: "60vh",
                    display: "block",
                  }}
                  onLoad={onImageLoad}
                />
              </ReactCrop>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-4 border-t">
          <button
            onClick={onCancel}
            className="px-4 py-2 rounded-lg border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 transition-colors"
            type="button"
          >
            Отмена
          </button>
          <button
            onClick={handleCrop}
            disabled={!completedCrop}
            className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            type="button"
          >
            Применить обрезку
          </button>
        </div>
      </div>
    </div>
  );
}
