"use client";

import { useEffect, useState, useCallback } from "react";
import { Alert as AlertType } from "@/app/types/alert";

type AlertProps = {
  alert: AlertType;
  onClose: (id: string) => void;
};

export default function Alert({ alert, onClose }: AlertProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isExiting, setIsExiting] = useState(false);

  const handleClose = useCallback(() => {
    setIsExiting(true);
    setTimeout(() => {
      onClose(alert.id);
    }, 300); // Время для анимации выхода
  }, [alert.id, onClose]);

  useEffect(() => {
    // Анимация появления
    setTimeout(() => setIsVisible(true), 10);

    // Автоматическое закрытие если указана длительность
    if (alert.duration && alert.duration > 0) {
      const timer = setTimeout(() => {
        handleClose();
      }, alert.duration);

      return () => clearTimeout(timer);
    }
  }, [alert.duration, handleClose]);

  const getAlertStyles = () => {
    const baseStyles =
      "flex items-center gap-3 p-4 rounded-lg shadow-lg border min-w-[300px] max-w-[500px] transition-all duration-300";

    const typeStyles = {
      success: "bg-green-50 border-green-200 text-green-800",
      error: "bg-red-50 border-red-200 text-red-800",
      warning: "bg-yellow-50 border-yellow-200 text-yellow-800",
      info: "bg-blue-50 border-blue-200 text-blue-800",
      hint: "bg-purple-50 border-purple-200 text-purple-800",
    };

    return `${baseStyles} ${typeStyles[alert.type]}`;
  };

  const getIconColor = () => {
    const iconColors = {
      success: "text-green-600",
      error: "text-red-600",
      warning: "text-yellow-600",
      info: "text-blue-600",
      hint: "text-purple-600",
    };
    return iconColors[alert.type];
  };

  return (
    <div
      className={`${getAlertStyles()} ${
        isVisible && !isExiting
          ? "opacity-100 translate-x-0"
          : "opacity-0 translate-x-full"
      }`}
    >
      <div className="flex-1">
        <p className="text-sm font-medium">{alert.message}</p>
      </div>
      <button
        onClick={handleClose}
        className={`${getIconColor()} hover:opacity-70 transition-opacity flex-shrink-0`}
        type="button"
        aria-label="Закрыть"
      >
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M6 18L18 6M6 6l12 12"
          />
        </svg>
      </button>
    </div>
  );
}
