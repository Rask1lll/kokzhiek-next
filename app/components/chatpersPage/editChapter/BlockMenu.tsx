"use client";

import { useState, useRef, useEffect } from "react";
import { Block } from "@/app/types/block";
import { FiTrash2, FiDroplet, FiMaximize2, FiSquare } from "react-icons/fi";
import { CgOptions } from "react-icons/cg";
import { useTranslations } from "next-intl";

// Color keys for translation
const PRESET_COLOR_KEYS = [
  { key: "colorDefault", value: "" },
  { key: "colorWhite", value: "#ffffff" },
  { key: "colorLightGray", value: "#f3f4f6" },
  { key: "colorBlue", value: "#dbeafe" },
  { key: "colorGreen", value: "#dcfce7" },
  { key: "colorYellow", value: "#fef9c3" },
  { key: "colorPink", value: "#fce7f3" },
  { key: "colorPurple", value: "#ede9fe" },
  { key: "colorOrange", value: "#ffedd5" },
];

type BlockMenuProps = {
  currentColor: string;
  currentStyle: Block["style"];
  onColorChange: (color: string) => void;
  onStyleChange: (style: Block["style"]) => void;
  onDelete: () => void;
};

export default function BlockMenu({
  currentColor,
  currentStyle,
  onColorChange,
  onStyleChange,
  onDelete,
}: BlockMenuProps) {
  const t = useTranslations("blockEditor");
  const [isOpen, setIsOpen] = useState(false);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showSizeControls, setShowSizeControls] = useState(false);
  const [showBorderControls, setShowBorderControls] = useState(false);
  const [tempColor, setTempColor] = useState<string | null>(null);
  const [tempBorderColor, setTempBorderColor] = useState<string | null>(null);
  const [isColorPicking, setIsColorPicking] = useState(false);
  const [isBorderColorPicking, setIsBorderColorPicking] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const padding = (currentStyle?.padding && typeof currentStyle.padding === 'object' && 'top' in currentStyle.padding)
    ? currentStyle.padding as { top: number; right: number; bottom: number; left: number }
    : { top: 0, right: 0, bottom: 0, left: 0 };
  
  const margin = (currentStyle?.margin && typeof currentStyle.margin === 'object' && 'top' in currentStyle.margin)
    ? currentStyle.margin as { top: number; right: number; bottom: number; left: number }
    : { top: 0, right: 0, bottom: 0, left: 0 };
  
  const border = (currentStyle?.border && typeof currentStyle.border === 'object' && 'width' in currentStyle.border)
    ? currentStyle.border as { width: number; color: string; radius: { topLeft: number; topRight: number; bottomRight: number; bottomLeft: number }; style: string }
    : {
        width: 0,
        color: "#000000",
        radius: { topLeft: 0, topRight: 0, bottomRight: 0, bottomLeft: 0 },
        style: "solid",
      };

  const handleSizeChange = (
    type: "padding" | "margin",
    side: "top" | "right" | "bottom" | "left",
    value: number
  ) => {
    const newStyle = {
      ...currentStyle,
      [type]: {
        ...(currentStyle?.[type] || { top: 0, right: 0, bottom: 0, left: 0 }),
        [side]: Math.max(0, value),
      },
    };
    onStyleChange(newStyle);
  };

  const handleResetSize = () => {
    const newStyle = {
      ...currentStyle,
      padding: { top: 0, right: 0, bottom: 0, left: 0 },
      margin: { top: 0, right: 0, bottom: 0, left: 0 },
    };
    onStyleChange(newStyle);
  };

  const handleBorderChange = (
    field: "width" | "color" | "style",
    value: number | string
  ) => {
    const newStyle = {
      ...currentStyle,
      border: {
        ...border,
        [field]: value,
      },
    };
    onStyleChange(newStyle);
  };

  const handleBorderRadiusChange = (
    corner: "topLeft" | "topRight" | "bottomRight" | "bottomLeft",
    value: number
  ) => {
    const newStyle = {
      ...currentStyle,
      border: {
        ...border,
        radius: {
          ...border.radius,
          [corner]: Math.max(0, value),
        },
      },
    };
    onStyleChange(newStyle);
  };

  const handleResetBorder = () => {
    const newStyle = {
      ...currentStyle,
      border: {
        width: 0,
        color: "#000000",
        radius: { topLeft: 0, topRight: 0, bottomRight: 0, bottomLeft: 0 },
        style: "solid",
      },
    };
    onStyleChange(newStyle);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        // Apply temp color if picking was in progress
        if (isColorPicking && tempColor !== null) {
          onColorChange(tempColor);
          setTempColor(null);
        }
        setIsColorPicking(false);
        setIsBorderColorPicking(false);
        setIsOpen(false);
        setShowColorPicker(false);
        setShowSizeControls(false);
        setShowBorderControls(false);
        if (tempBorderColor !== null) {
          handleBorderChange("color", tempBorderColor);
          setTempBorderColor(null);
        }
      }
    };

    const handleMouseUp = () => {
      if (isColorPicking && tempColor !== null) {
        onColorChange(tempColor);
        setTempColor(null);
      }
      if (isBorderColorPicking && tempBorderColor !== null) {
        handleBorderChange("color", tempBorderColor);
        setTempBorderColor(null);
      }
      setIsColorPicking(false);
      setIsBorderColorPicking(false);
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("mouseup", handleMouseUp);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [
    isOpen,
    isColorPicking,
    isBorderColorPicking,
    tempColor,
    tempBorderColor,
    onColorChange,
  ]);

  return (
    <div className="relative mt-2" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-1.5 hover:bg-gray-200 rounded-md transition-colors"
        title={t("blockMenu")}
      >
        <CgOptions className="w-6 h-6 text-gray-500" />
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-1 bg-white rounded-lg shadow-lg border border-gray-200 min-w-[180px] z-20">
          {/* Color option */}
          <div className="relative">
            <button
              onClick={() => {
                setShowColorPicker(!showColorPicker);
                setTempColor(null);
                setIsColorPicking(false);
              }}
              className="w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
            >
              <FiDroplet className="w-4 h-4" />
              {t("backgroundColor")}
              <div
                className="w-4 h-4 rounded border border-gray-300 ml-auto"
                style={{
                  backgroundColor: currentColor || "#f3f4f6",
                }}
              />
            </button>

            {showColorPicker && (
              <div className="absolute right-full top-0 mr-1 p-2 bg-white rounded-lg shadow-lg border border-gray-200 min-w-[180px] z-30">
                <div className="grid grid-cols-3 gap-1.5">
                  {PRESET_COLOR_KEYS.map((color) => (
                    <button
                      key={color.value || "default"}
                      onClick={() => {
                        onColorChange(color.value);
                        setShowColorPicker(false);
                        setIsOpen(false);
                      }}
                      className={`w-10 h-10 rounded-md border-2 transition-transform hover:scale-105 ${
                        currentColor === color.value
                          ? "border-blue-500 ring-2 ring-blue-200"
                          : "border-gray-200"
                      }`}
                      style={{
                        backgroundColor: color.value || "#f3f4f6",
                      }}
                      title={t(color.key)}
                    />
                  ))}
                </div>
                {/* Custom color */}
                <div className="mt-2 pt-2 border-t border-gray-100">
                  <label className="text-xs text-gray-500 block mb-1">
                    {t("customColor")}
                  </label>
                  <input
                    type="color"
                    value={
                      tempColor !== null ? tempColor : currentColor || "#f3f4f6"
                    }
                    onChange={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setTempColor(e.target.value);
                      if (!isColorPicking) {
                        setIsColorPicking(true);
                      }
                    }}
                    className="w-full h-8 rounded cursor-pointer"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Size option */}
          <div className="relative">
            <button
              onClick={() => {
                setShowSizeControls(!showSizeControls);
              }}
              className="w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
            >
              <FiMaximize2 className="w-4 h-4" />
              {t("blockSize")}
            </button>

            {showSizeControls && (
              <div className="absolute right-full top-0 mr-1 p-3 bg-white rounded-lg shadow-lg border border-gray-200 min-w-[280px] z-30 max-h-[400px] overflow-y-auto">
                {/* Padding */}
                <div className="mb-4">
                  <label className="text-xs font-semibold text-gray-700 block mb-2">
                    {t("padding")}
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-xs text-gray-500 block mb-1">
                        {t("paddingTop")}
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={padding.top}
                        onChange={(e) =>
                          handleSizeChange("padding", "top", Number(e.target.value))
                        }
                        className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-gray-500 block mb-1">
                        {t("paddingRight")}
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={padding.right}
                        onChange={(e) =>
                          handleSizeChange("padding", "right", Number(e.target.value))
                        }
                        className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-gray-500 block mb-1">
                        {t("paddingBottom")}
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={padding.bottom}
                        onChange={(e) =>
                          handleSizeChange("padding", "bottom", Number(e.target.value))
                        }
                        className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-gray-500 block mb-1">
                        {t("paddingLeft")}
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={padding.left}
                        onChange={(e) =>
                          handleSizeChange("padding", "left", Number(e.target.value))
                        }
                        className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
                      />
                    </div>
                  </div>
                </div>

                {/* Margin */}
                <div className="mb-4">
                  <label className="text-xs font-semibold text-gray-700 block mb-2">
                    {t("margin")}
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-xs text-gray-500 block mb-1">
                        {t("marginTop")}
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={margin.top}
                        onChange={(e) =>
                          handleSizeChange("margin", "top", Number(e.target.value))
                        }
                        className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-gray-500 block mb-1">
                        {t("marginRight")}
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={margin.right}
                        onChange={(e) =>
                          handleSizeChange("margin", "right", Number(e.target.value))
                        }
                        className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-gray-500 block mb-1">
                        {t("marginBottom")}
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={margin.bottom}
                        onChange={(e) =>
                          handleSizeChange("margin", "bottom", Number(e.target.value))
                        }
                        className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-gray-500 block mb-1">
                        {t("marginLeft")}
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={margin.left}
                        onChange={(e) =>
                          handleSizeChange("margin", "left", Number(e.target.value))
                        }
                        className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
                      />
                    </div>
                  </div>
                </div>

                {/* Reset button */}
                <button
                  onClick={handleResetSize}
                  className="w-full px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 border border-gray-200 rounded"
                >
                  {t("resetSize")}
                </button>
              </div>
            )}
          </div>

          {/* Border option */}
          <div className="relative">
            <button
              onClick={() => {
                setShowBorderControls(!showBorderControls);
              }}
              className="w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
            >
              <FiSquare className="w-4 h-4" />
              {t("border")}
            </button>

            {showBorderControls && (
              <div className="absolute right-full top-0 mr-1 p-3 bg-white rounded-lg shadow-lg border border-gray-200 min-w-[280px] z-30 max-h-[500px] overflow-y-auto">
                {/* Border Width */}
                <div className="mb-4">
                  <label className="text-xs font-semibold text-gray-700 block mb-2">
                    {t("borderWidth")}
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={border.width}
                    onChange={(e) =>
                      handleBorderChange("width", Number(e.target.value))
                    }
                    className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
                  />
                </div>

                {/* Border Color */}
                <div className="mb-4">
                  <label className="text-xs font-semibold text-gray-700 block mb-2">
                    {t("borderColor")}
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={
                        tempBorderColor !== null
                          ? tempBorderColor
                          : border.color || "#000000"
                      }
                      onChange={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setTempBorderColor(e.target.value);
                        if (!isBorderColorPicking) {
                          setIsBorderColorPicking(true);
                        }
                      }}
                      className="w-16 h-8 rounded cursor-pointer"
                    />
                    <input
                      type="text"
                      value={border.color || "#000000"}
                      onChange={(e) => handleBorderChange("color", e.target.value)}
                      className="flex-1 px-2 py-1 text-sm border border-gray-300 rounded"
                      placeholder="#000000"
                    />
                  </div>
                </div>

                {/* Border Style */}
                <div className="mb-4">
                  <label className="text-xs font-semibold text-gray-700 block mb-2">
                    {t("borderStyle")}
                  </label>
                  <select
                    value={border.style || "solid"}
                    onChange={(e) => handleBorderChange("style", e.target.value)}
                    className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
                  >
                    <option value="solid">{t("borderStyleSolid")}</option>
                    <option value="dashed">{t("borderStyleDashed")}</option>
                    <option value="dotted">{t("borderStyleDotted")}</option>
                    <option value="none">{t("borderStyleNone")}</option>
                  </select>
                </div>

                {/* Border Radius */}
                <div className="mb-4">
                  <label className="text-xs font-semibold text-gray-700 block mb-2">
                    {t("borderRadius")}
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-xs text-gray-500 block mb-1">
                        {t("borderRadiusTopLeft")}
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={border.radius.topLeft}
                        onChange={(e) =>
                          handleBorderRadiusChange(
                            "topLeft",
                            Number(e.target.value)
                          )
                        }
                        className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-gray-500 block mb-1">
                        {t("borderRadiusTopRight")}
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={border.radius.topRight}
                        onChange={(e) =>
                          handleBorderRadiusChange(
                            "topRight",
                            Number(e.target.value)
                          )
                        }
                        className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-gray-500 block mb-1">
                        {t("borderRadiusBottomRight")}
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={border.radius.bottomRight}
                        onChange={(e) =>
                          handleBorderRadiusChange(
                            "bottomRight",
                            Number(e.target.value)
                          )
                        }
                        className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-gray-500 block mb-1">
                        {t("borderRadiusBottomLeft")}
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={border.radius.bottomLeft}
                        onChange={(e) =>
                          handleBorderRadiusChange(
                            "bottomLeft",
                            Number(e.target.value)
                          )
                        }
                        className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
                      />
                    </div>
                  </div>
                </div>

                {/* Reset button */}
                <button
                  onClick={handleResetBorder}
                  className="w-full px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 border border-gray-200 rounded"
                >
                  {t("resetBorder")}
                </button>
              </div>
            )}
          </div>

          {/* Divider */}
          <div className="border-t border-gray-100 my-1" />

          {/* Delete option */}
          <button
            onClick={() => {
              if (confirm(t("confirmDeleteBlock"))) {
                onDelete();
              }
              setIsOpen(false);
            }}
            className="w-full px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
          >
            <FiTrash2 className="w-4 h-4" />
            {t("deleteBlock")}
          </button>
        </div>
      )}
    </div>
  );
}
