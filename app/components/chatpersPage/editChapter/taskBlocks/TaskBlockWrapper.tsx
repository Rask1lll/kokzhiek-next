"use client";

import { ReactNode, useCallback, useRef, useState, useEffect } from "react";
import { FiImage, FiTrash2, FiHelpCircle, FiType, FiStar } from "react-icons/fi";
import Image from "next/image";
import { useQuestions } from "@/app/hooks/useQuestions";
import { Question } from "@/app/types/question";
import Button from "@/app/components/Button/Button";
import { colors } from "@/app/libs/colors";

type TaskBlockWrapperProps = {
  widgetId: number;
  children: ReactNode;
};

export default function TaskBlockWrapper({
  widgetId,
  children,
}: TaskBlockWrapperProps) {
  const {
    questions,
    loading,
    update,
    uploadQuestionImage,
    removeQuestionImage,
  } = useQuestions(widgetId);

  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(
    Array.isArray(questions) && questions.length > 0 ? questions[0] : null
  );
  const [showHintInput, setShowHintInput] = useState(false);
  const [showPointsInput, setShowPointsInput] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const hintDebounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const pointsDebounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const [showBGModal, setShowBGModal] = useState(false);
  const [showSignModal, setShowSignModal] = useState(false);
  const [colorFilterTimeout, setColorFilterTimeout] =
    useState<ReturnType<typeof setTimeout>>();
  const [colorEnterTimeout, setColorEnterTimeout] =
    useState<ReturnType<typeof setTimeout>>();
  const [signEnterTimeout, setSignEnterTimeout] =
    useState<ReturnType<typeof setTimeout>>();

  // Popular conditional signs
  const popularSigns = [
    "⚠️",
    "⭐",
    "✓",
    "✗",
    "ℹ️",
    "⚡",
    "❓",
    "💡",
    "🔍",
    "📌",
    "❗",
    "❌",
    "✅",
    "➡️",
    "⬅️",
    "⬆️",
    "⬇️",
    "🔴",
    "🟢",
    "🟡",
    "🔵",
    "1️⃣",
    "2️⃣",
    "3️⃣",
    "A",
    "B",
    "C",
    "•",
    "→",
    "←",
  ];

  // Update currentQuestion when questions change
  useEffect(() => {
    if (Array.isArray(questions) && questions.length > 0) {
      const firstQuestion = questions[0];
      if (!currentQuestion || currentQuestion.id !== firstQuestion.id) {
        setCurrentQuestion(firstQuestion);
      } else if (
        currentQuestion.image_url !== firstQuestion.image_url ||
        JSON.stringify(currentQuestion.data) !==
          JSON.stringify(firstQuestion.data)
      ) {
        // Sync image_url and data changes from hook
        setCurrentQuestion(firstQuestion);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [questions]);

  const handleImageUpload = useCallback(
    async (file: File) => {
      if (!currentQuestion?.id) return;

      const imageUrl = await uploadQuestionImage(currentQuestion.id, file);
      if (imageUrl) {
        // Update currentQuestion with image URL from server
        setCurrentQuestion((prev) =>
          prev ? { ...prev, image_url: imageUrl } : null
        );
      }
    },
    [currentQuestion, uploadQuestionImage]
  );

  const handleImageDelete = useCallback(async () => {
    if (!currentQuestion?.id) return;

    const success = await removeQuestionImage(currentQuestion.id);
    if (success) {
      // Update currentQuestion - remove image_url
      setCurrentQuestion((prev) =>
        prev ? { ...prev, image_url: null } : null
      );
    }
  }, [currentQuestion, removeQuestionImage]);

  const handleColorUpload = (code: string) => {
    if (!currentQuestion?.id) return;

    const newData = {
      ...currentQuestion.data,
      bgColor: code,
    };

    setCurrentQuestion((prev) => (prev ? { ...prev, data: newData } : null));

    const questionId = currentQuestion.id;
    if (!questionId) return;

    update(questionId, {
      data: newData,
    });
  };

  const handleColorDelete = () => {
    if (!currentQuestion?.id) return;

    const newData = {
      ...currentQuestion.data,
      bgColor: "",
    };

    setCurrentQuestion((prev) => (prev ? { ...prev, data: newData } : null));

    const questionId = currentQuestion.id;
    if (!questionId) return;

    update(questionId, {
      data: newData,
    });
  };

  const handleSignSelect = (sign: string) => {
    if (!currentQuestion?.id) return;

    const newData = {
      ...currentQuestion.data,
      conditionalSign: sign || undefined,
    };

    // Remove conditionalSign from data if empty
    if (!sign) {
      delete newData.conditionalSign;
    }

    setCurrentQuestion((prev) => (prev ? { ...prev, data: newData } : null));

    const questionId = currentQuestion.id;
    if (!questionId) return;

    update(questionId, {
      data: newData,
    });

    setShowSignModal(false);
  };

  const handleSignModeChange = (mode: "inline" | "absolute") => {
    if (!currentQuestion?.id) return;

    const newData = {
      ...currentQuestion.data,
      conditionalSignMode: mode,
    };

    setCurrentQuestion((prev) => (prev ? { ...prev, data: newData } : null));

    const questionId = currentQuestion.id;
    if (!questionId) return;

    update(questionId, {
      data: newData,
    });
  };

  const handleSignDelete = () => {
    handleSignSelect("");
  };

  const updateHint = useCallback(
    (hint: string) => {
      if (!currentQuestion?.id) return;

      const trimmedHint = hint.trim();
      const newData = {
        ...currentQuestion.data,
        hint: trimmedHint || undefined,
      };

      // Remove hint from data if empty
      if (!trimmedHint) {
        delete newData.hint;
      }

      // Update UI immediately
      setCurrentQuestion((prev) => (prev ? { ...prev, data: newData } : null));

      // Debounce server update
      if (hintDebounceTimerRef.current) {
        clearTimeout(hintDebounceTimerRef.current);
      }

      const questionId = currentQuestion.id;
      hintDebounceTimerRef.current = setTimeout(() => {
        if (!questionId) return;

        update(questionId, {
          data: newData,
        });
      }, 500);
    },
    [currentQuestion, update]
  );

  const updatePoints = useCallback(
    (points: number) => {
      if (!currentQuestion?.id) return;

      const validPoints = Math.max(0, Math.min(100, points));

      // Update UI immediately
      setCurrentQuestion((prev) => (prev ? { ...prev, points: validPoints } : null));

      // Debounce server update
      if (pointsDebounceTimerRef.current) {
        clearTimeout(pointsDebounceTimerRef.current);
      }

      const questionId = currentQuestion.id;
      pointsDebounceTimerRef.current = setTimeout(() => {
        if (!questionId) return;

        update(questionId, {
          points: validPoints,
        });
      }, 500);
    },
    [currentQuestion, update]
  );

  // Cleanup timers on unmount
  useEffect(() => {
    return () => {
      if (hintDebounceTimerRef.current) {
        clearTimeout(hintDebounceTimerRef.current);
      }
      if (pointsDebounceTimerRef.current) {
        clearTimeout(pointsDebounceTimerRef.current);
      }
      if (colorFilterTimeout) {
        clearTimeout(colorFilterTimeout);
      }
      if (colorEnterTimeout) {
        clearTimeout(colorEnterTimeout);
      }
      if (signEnterTimeout) {
        clearTimeout(signEnterTimeout);
      }
    };
  }, [colorFilterTimeout, colorEnterTimeout, signEnterTimeout]);

  if (loading || !currentQuestion) {
    return <>{children}</>;
  }

  const hint = (currentQuestion.data as { hint?: string })?.hint || "";
  const bgColor =
    currentQuestion.data &&
    typeof currentQuestion.data === "object" &&
    "bgColor" in currentQuestion.data &&
    typeof currentQuestion.data.bgColor === "string"
      ? currentQuestion.data.bgColor
      : "#ffffff";
  const conditionalSign =
    currentQuestion.data &&
    typeof currentQuestion.data === "object" &&
    "conditionalSign" in currentQuestion.data &&
    typeof currentQuestion.data.conditionalSign === "string"
      ? currentQuestion.data.conditionalSign
      : "";
  const conditionalSignMode =
    currentQuestion.data &&
    typeof currentQuestion.data === "object" &&
    "conditionalSignMode" in currentQuestion.data &&
    typeof (currentQuestion.data as { conditionalSignMode?: string })
      .conditionalSignMode === "string"
      ? (
          currentQuestion.data as {
            conditionalSignMode?: string;
          }
        ).conditionalSignMode
      : "absolute";

  return (
    <div
      className="w-full p-1"
      style={{
        backgroundColor: bgColor,
      }}
    >
      {/* Background image and hint controls */}
      <div className="flex w-fit mb-2 items-center gap-4 p-3 bg-slate-50 rounded-lg border border-slate-200">
        {/* Background image upload */}
        <div className="flex relative items-center gap-2">
          {showBGModal && (
            <div
              onMouseLeave={() => {
                setColorEnterTimeout(
                  setTimeout(() => {
                    setShowBGModal(false);
                  }, 3000)
                );
                console.log("leave");
              }}
              onMouseEnter={() => {
                clearTimeout(colorEnterTimeout);
              }}
              className="absolute z-10 -bottom-15 p-3 ring rounded-lg ring-gray-300 left-0 bg-white"
            >
              <div className="w-fit flex gap-1 mb-2">
                {colors.map((color) => {
                  return (
                    <div
                      key={color.code}
                      style={{ backgroundColor: color.code }}
                      className="p-4 ring cursor-pointer ring-gray-300 rounded-full"
                      onClick={() => {
                        handleColorUpload(color.code);
                        setShowBGModal(false);
                      }}
                    ></div>
                  );
                })}
              </div>
              <div className="h-fit gap-1 flex items-center">
                <label htmlFor="colorChose">
                  Самостоятельный выбор цвета :{" "}
                </label>
                <label
                  htmlFor="colorChose"
                  className="overflow-hidden ring-1 flex items-center relative h-8 w-8 rounded-full"
                >
                  <input
                    id="colorChose"
                    className="h-10 absolute left-10 ring-0 border-0 outline-0"
                    type="color"
                    defaultValue={bgColor}
                    onInput={() => {
                      clearTimeout(colorEnterTimeout);
                      setColorEnterTimeout(
                        setTimeout(() => {
                          setShowBGModal(false);
                        }, 5000)
                      );
                    }}
                    onChange={(e) => {
                      if (colorFilterTimeout) clearTimeout(colorFilterTimeout);
                      setColorFilterTimeout(
                        setTimeout(() => {
                          handleColorUpload(e.target.value);
                        }, 1000)
                      );
                    }}
                  />
                </label>
              </div>
              <div>
                <Button
                  color="blue"
                  content="Загрузить изоброжение"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                />
              </div>
            </div>
          )}
          <input
            type="file"
            accept="image/*"
            ref={fileInputRef}
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) {
                handleImageUpload(file);
              }
              if (e.target) {
                e.target.value = "";
              }
            }}
            className="hidden"
          />
          <button
            type="button"
            onClick={() => {
              setShowBGModal(!showBGModal);
            }}
            className={`flex items-center gap-2 px-3 py-2 text-sm rounded-lg transition-colors ${
              currentQuestion.image_url
                ? "bg-blue-100 text-blue-700 hover:bg-blue-200"
                : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-300"
            }`}
            title="Загрузить фоновое изображение"
          >
            <FiImage className="w-4 h-4" />
            <span>Фон</span>
          </button>
          {currentQuestion.image_url && (
            <div className="relative">
              <div className="relative w-12 h-12 border border-slate-300 rounded-lg overflow-hidden">
                <Image
                  src={currentQuestion.image_url}
                  alt="Background"
                  fill
                  className="object-cover"
                />
              </div>
              <button
                type="button"
                onClick={handleImageDelete}
                className="absolute -top-1 -right-1 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                title="Удалить изображение"
              >
                <FiTrash2 className="w-2.5 h-2.5" />
              </button>
            </div>
          )}
          {currentQuestion.data && !!currentQuestion.data.bgColor && (
            <div
              className="relative p-5 ring ring-gray-300 rounded-full"
              style={{ backgroundColor: bgColor }}
            >
              <button
                type="button"
                onClick={handleColorDelete}
                className="absolute -top-1 -right-1 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                title="Удалить изображение"
              >
                <FiTrash2 className="w-2.5 h-2.5" />
              </button>
            </div>
          )}
        </div>

        {/* Conditional sign */}
        <div className="flex relative items-center gap-2">
          {showSignModal && (
            <div
              onMouseLeave={() => {
                setSignEnterTimeout(
                  setTimeout(() => {
                    setShowSignModal(false);
                  }, 3000)
                );
              }}
              onMouseEnter={() => {
                if (signEnterTimeout) clearTimeout(signEnterTimeout);
              }}
              className="absolute z-10 -bottom-15 p-3 ring rounded-lg ring-gray-300 left-0 bg-white"
            >
              <div className="w-fit flex flex-wrap gap-2 mb-3 max-w-xs">
                {popularSigns.map((sign) => (
                  <button
                    key={sign}
                    type="button"
                    onClick={() => handleSignSelect(sign)}
                    className="p-2 text-xl hover:bg-gray-100 rounded border border-gray-200 transition-colors"
                    title={sign}
                  >
                    {sign}
                  </button>
                ))}
              </div>
              <div className="h-fit gap-2 flex items-center">
                <label htmlFor="customSign" className="text-sm">
                  Свой символ:
                </label>
                <input
                  id="customSign"
                  type="text"
                  maxLength={5}
                  placeholder="Введите символ"
                  className="px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && e.currentTarget.value) {
                      handleSignSelect(e.currentTarget.value);
                    }
                  }}
                />
              </div>
              {conditionalSign && (
                <div className="mt-2">
                  <Button
                    color="red"
                    content="Удалить символ"
                    size="sm"
                    onClick={handleSignDelete}
                  />
                </div>
              )}
            </div>
          )}
          <button
            type="button"
            onClick={() => {
              setShowSignModal(!showSignModal);
            }}
            className={`flex items-center gap-2 px-3 py-2 text-sm rounded-lg transition-colors ${
              conditionalSign
                ? "bg-green-100 text-green-700 hover:bg-green-200"
                : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-300"
            }`}
            title="Добавить условный знак"
          >
            <FiType className="w-4 h-4" />
            <span>Условный знак</span>
          </button>
          {conditionalSign && (
            <div className="flex items-center gap-2">
              <div className="px-3 py-2 text-lg bg-green-50 text-green-700 rounded-lg border border-green-200">
                {conditionalSign}
              </div>
              <button
                type="button"
                onClick={handleSignDelete}
                className="p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                title="Удалить символ"
              >
                <FiTrash2 className="w-2.5 h-2.5" />
              </button>
            </div>
          )}

          {/* Conditional sign position mode */}
          {conditionalSign && (
            <div className="ml-4 flex flex-col gap-1 text-xs text-slate-600">
              <span>Расположение:</span>
              <div className="flex gap-2">
                <button
                  type="button"
                  className={`px-2 py-1 rounded border text-xs ${
                    conditionalSignMode === "inline"
                      ? "bg-green-100 border-green-300 text-green-800"
                      : "bg-white border-slate-300 text-slate-700 hover:bg-slate-50"
                  }`}
                  onClick={() => handleSignModeChange("inline")}
                >
                  В строке
                </button>
                <button
                  type="button"
                  className={`px-2 py-1 rounded border text-xs ${
                    conditionalSignMode === "absolute"
                      ? "bg-green-100 border-green-300 text-green-800"
                      : "bg-white border-slate-300 text-slate-700 hover:bg-slate-50"
                  }`}
                  onClick={() => handleSignModeChange("absolute")}
                >
                  Слева
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Hint input */}
        <div className="flex items-center gap-2 flex-1">
          <button
            type="button"
            onClick={() => setShowHintInput(!showHintInput)}
            className={`flex items-center gap-2 px-3 py-2 text-sm rounded-lg transition-colors ${
              hint
                ? "bg-purple-100 text-purple-700 hover:bg-purple-200"
                : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-300"
            }`}
            title="Добавить подсказку"
          >
            <FiHelpCircle className="w-4 h-4" />
            <span>Подсказка</span>
          </button>
          {showHintInput && (
            <input
              spellCheck={true}
              type="text"
              value={hint}
              onChange={(e) => updateHint(e.target.value)}
              placeholder="Введите подсказку..."
              className="flex-1 px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              onBlur={() => {
                if (!hint.trim()) {
                  setShowHintInput(false);
                }
              }}
              autoFocus
            />
          )}
          {!showHintInput && hint && (
            <div className="flex-1 px-3 py-2 text-sm bg-purple-50 text-purple-700 rounded-lg border border-purple-200">
              {hint}
            </div>
          )}
        </div>

        {/* Points input */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setShowPointsInput(!showPointsInput)}
            className={`flex items-center gap-2 px-3 py-2 text-sm rounded-lg transition-colors ${
              currentQuestion.points > 0
                ? "bg-amber-100 text-amber-700 hover:bg-amber-200"
                : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-300"
            }`}
            title="Настроить очки"
          >
            <FiStar className="w-4 h-4" />
            <span>{currentQuestion.points > 0 ? `${currentQuestion.points} очков` : "Очки"}</span>
          </button>
          {showPointsInput && (
            <div className="flex items-center gap-2">
              <input
                type="number"
                min="0"
                max="100"
                value={currentQuestion.points}
                onChange={(e) => updatePoints(parseInt(e.target.value) || 0)}
                className="w-20 px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                autoFocus
              />
              <span className="text-xs text-slate-500">макс. 100</span>
            </div>
          )}
        </div>
      </div>

      {/* Task content with conditional sign */}
      {conditionalSignMode === "absolute" ? (
        <div className="relative">
          {conditionalSign && (
            <span className="absolute -left-8 top-0 text-2xl font-semibold text-gray-700">
              {conditionalSign}
            </span>
          )}
          <div>{children}</div>
        </div>
      ) : (
        <div className="flex items-start gap-2">
          {conditionalSign && (
            <span className="text-2xl font-semibold text-gray-700 flex-shrink-0">
              {conditionalSign}
            </span>
          )}
          <div className="flex-1">{children}</div>
        </div>
      )}
    </div>
  );
}
