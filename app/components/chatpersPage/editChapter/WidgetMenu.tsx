"use client";

import { ReactNode, useState, useRef, useEffect } from "react";
import {
  FiTrash2,
  FiArrowUp,
  FiArrowDown,
  FiArrowLeft,
  FiArrowRight,
} from "react-icons/fi";
import { CgOptions } from "react-icons/cg";
import { useTranslations } from "next-intl";

type WidgetMenuProps = {
  onDelete: () => void;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
  onMoveLeft?: () => void;
  onMoveRight?: () => void;
  canMoveUp?: boolean;
  canMoveDown?: boolean;
  canMoveLeft?: boolean;
  canMoveRight?: boolean;
  isDeleting?: boolean;
  children?: ReactNode;
};

export default function WidgetMenu({
  onDelete,
  onMoveUp,
  onMoveDown,
  onMoveLeft,
  onMoveRight,
  canMoveUp = false,
  canMoveDown = false,
  canMoveLeft = false,
  canMoveRight = false,
  isDeleting = false,
  children,
}: WidgetMenuProps) {
  const t = useTranslations("blockEditor");
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const hasMoveOptions = canMoveUp || canMoveDown || canMoveLeft || canMoveRight;

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-1.5 bg-white/90 backdrop-blur rounded-md shadow-sm border border-gray-200 hover:bg-gray-100 transition-colors"
        title={t("widgetMenu")}
      >
        <CgOptions className="w-4 h-4 text-gray-500" />
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-1 bg-white rounded-lg shadow-lg border border-gray-200 min-w-[200px] max-h-[80vh] overflow-y-auto z-[100]">
          {/* Move options */}
          {hasMoveOptions && (
            <>
              {canMoveUp && (
                <button
                  onClick={() => {
                    onMoveUp?.();
                    setIsOpen(false);
                  }}
                  className="w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                >
                  <FiArrowUp className="w-4 h-4" />
                  {t("moveWidgetUp")}
                </button>
              )}
              {canMoveDown && (
                <button
                  onClick={() => {
                    onMoveDown?.();
                    setIsOpen(false);
                  }}
                  className="w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                >
                  <FiArrowDown className="w-4 h-4" />
                  {t("moveWidgetDown")}
                </button>
              )}
              {canMoveLeft && (
                <button
                  onClick={() => {
                    onMoveLeft?.();
                    setIsOpen(false);
                  }}
                  className="w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                >
                  <FiArrowLeft className="w-4 h-4" />
                  {t("moveWidgetLeft")}
                </button>
              )}
              {canMoveRight && (
                <button
                  onClick={() => {
                    onMoveRight?.();
                    setIsOpen(false);
                  }}
                  className="w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                >
                  <FiArrowRight className="w-4 h-4" />
                  {t("moveWidgetRight")}
                </button>
              )}

              <div className="border-t border-gray-100 my-1" />
            </>
          )}

          {/* Extra content (task settings etc.) */}
          {children}

          {/* Delete option */}
          <button
            onClick={() => {
              onDelete();
              setIsOpen(false);
            }}
            disabled={isDeleting}
            className="w-full px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 disabled:opacity-50"
          >
            <FiTrash2 className="w-4 h-4" />
            {t("deleteWidget")}
          </button>
        </div>
      )}
    </div>
  );
}
