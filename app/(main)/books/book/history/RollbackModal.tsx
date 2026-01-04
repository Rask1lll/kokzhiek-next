"use client";

import { useState, useEffect } from "react";
import { FiX, FiAlertTriangle, FiClock } from "react-icons/fi";
import { useModalWindowStore } from "@/app/store/modalWindowStore";

export type HistoryVersion = {
  id: string;
  date: string;
  author: string;
  authorEmail?: string;
  changes: string[];
  version: string;
  branch?: string;
};

type RollbackModalProps = {
  version: HistoryVersion;
  bookId: string;
};

export default function RollbackModal({ version, bookId }: RollbackModalProps) {
  const { removeContent } = useModalWindowStore();
  const [countdown, setCountdown] = useState(5);
  const [isConfirmEnabled, setIsConfirmEnabled] = useState(false);

  useEffect(() => {
    let timeOut;
    if (countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown(countdown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else {
      timeOut = setTimeout(() => {
        setIsConfirmEnabled(true);
      }, 0);
    }
    return () => {
      clearTimeout(timeOut);
    };
  }, [countdown]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("ru-RU", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleConfirm = () => {
    if (!isConfirmEnabled) return;

    console.log("Rollback to version:", version.id, "Book ID:", bookId);

    removeContent();
  };

  const handleCancel = () => {
    removeContent();
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl w-full max-w-md mx-4 p-6">
      <button
        onClick={handleCancel}
        className="absolute top-4 right-4 p-1 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
        type="button"
      >
        <FiX className="w-5 h-5" />
      </button>

      <div className="flex items-start gap-3 mb-4">
        <div className="p-2 bg-red-100 rounded-lg">
          <FiAlertTriangle className="w-6 h-6 text-red-600" />
        </div>
        <div className="flex-1">
          <h2 className="text-xl font-semibold text-gray-900 mb-1">
            Откатить книгу?
          </h2>
          <p className="text-sm text-gray-500">
            Вы уверены, что хотите откатить книгу до этого периода?
          </p>
        </div>
      </div>

      {/* Информация о версии */}
      <div className="bg-gray-50 rounded-lg p-4 mb-4 border border-gray-200">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700">Версия:</span>
            <span className="inline-flex items-center gap-1 px-2 py-1 bg-purple-100 text-purple-700 rounded-md text-sm font-medium">
              {version.version}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700">Автор:</span>
            <span className="text-sm text-gray-600">{version.author}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700">Дата:</span>
            <div className="flex items-center gap-1 text-sm text-gray-600">
              <FiClock className="w-4 h-4" />
              <span>{formatDate(version.date)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Предупреждение */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
        <p className="text-sm text-yellow-800">
          ⚠️ Все изменения после этой версии будут удалены. Это действие нельзя
          отменить.
        </p>
      </div>

      {/* Таймер */}
      {!isConfirmEnabled && (
        <div className="mb-4 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-lg">
            <FiClock className="w-4 h-4 text-gray-600" />
            <span className="text-sm font-medium text-gray-700">
              Подождите {countdown} секунд{countdown !== 1 ? "" : "у"} для
              подтверждения
            </span>
          </div>
        </div>
      )}

      {/* Кнопки */}
      <div className="flex gap-3">
        <button
          onClick={handleCancel}
          className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
          type="button"
        >
          Отмена
        </button>
        <button
          onClick={handleConfirm}
          disabled={!isConfirmEnabled}
          className="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium flex items-center justify-center gap-2"
          type="button"
        >
          {isConfirmEnabled ? (
            "Подтвердить откат"
          ) : (
            <>
              <FiClock className="w-4 h-4" />
              {countdown}с
            </>
          )}
        </button>
      </div>
    </div>
  );
}
