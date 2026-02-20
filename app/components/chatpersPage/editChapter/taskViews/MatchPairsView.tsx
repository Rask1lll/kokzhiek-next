"use client";

import {
  forwardRef,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { useQuestions } from "@/app/hooks/useQuestions";
import { useAttempt } from "@/app/hooks/useAttempt";
import TaskViewWrapper from "./TaskViewWrapper";
import {
  getNegativeFeedback,
  getPositiveFeedback,
} from "@/app/libs/feedback";

type MatchPairsViewProps = {
  widgetId: number;
  onChange?: (value: string) => void;
};

type MatchItemData = {
  matchId: string;
  optionId: string;
  text: string;
  imageUrl?: string;
};

const CONNECTION_COLORS = [
  "#3B82F6",
  "#EF4444",
  "#10B981",
  "#F59E0B",
  "#8B5CF6",
  "#EC4899",
  "#06B6D4",
  "#F97316",
  "#14B8A6",
  "#6366F1",
];

function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export default function MatchPairsView({
  widgetId,
  onChange,
}: MatchPairsViewProps) {
  const t = useTranslations();
  const { questions } = useQuestions(widgetId);
  const { loading, error, submit } = useAttempt(widgetId);

  // connections: leftMatchId -> rightMatchId
  const [connections, setConnections] = useState<Map<string, string>>(
    new Map()
  );
  // colorMap: leftMatchId -> color
  const [colorMap, setColorMap] = useState<Map<string, string>>(new Map());
  const [selectedLeftId, setSelectedLeftId] = useState<string | null>(null);
  const [draggedLeftId, setDraggedLeftId] = useState<string | null>(null);
  const [dragOverRightId, setDragOverRightId] = useState<string | null>(null);
  const [result, setResult] = useState<{
    is_correct: boolean;
    points_earned: number;
  } | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [svgPaths, setSvgPaths] = useState<
    { key: string; d: string; color: string }[]
  >([]);
  const nextColorRef = useRef(0);

  const containerRef = useRef<HTMLDivElement>(null);
  const leftRefsMap = useRef<Map<string, HTMLDivElement>>(new Map());
  const rightRefsMap = useRef<Map<string, HTMLDivElement>>(new Map());

  const currentQuestion = questions.length > 0 ? questions[0] : null;
  const options = useMemo(
    () => currentQuestion?.options || [],
    [currentQuestion?.options]
  );

  const qData = currentQuestion?.data as Record<string, unknown> | undefined;
  const pairSizeMode =
    (qData?.pairSizeMode as "small" | "medium" | "large" | "custom") ||
    "medium";
  const customHeight = qData?.pairHeight as number | undefined;

  const pairHeight = useMemo(() => {
    if (pairSizeMode === "custom" && customHeight) return customHeight;
    switch (pairSizeMode) {
      case "small":
        return 80;
      case "large":
        return 300;
      default:
        return 200;
    }
  }, [pairSizeMode, customHeight]);

  // Build left and right items from options
  const { leftItems, rightItems } = useMemo(() => {
    const pairsMap = new Map<
      string,
      { left?: (typeof options)[0]; right?: (typeof options)[0] }
    >();

    options.forEach((opt) => {
      if (opt.match_id) {
        if (!pairsMap.has(opt.match_id)) pairsMap.set(opt.match_id, {});
        const pair = pairsMap.get(opt.match_id)!;
        if (opt.group === "left") pair.left = opt;
        else if (opt.group === "right") pair.right = opt;
      }
    });

    const left: MatchItemData[] = [];
    const right: MatchItemData[] = [];

    Array.from(pairsMap.entries())
      .sort(([, a], [, b]) => {
        const orderA = a.left?.order ?? a.right?.order ?? 0;
        const orderB = b.left?.order ?? b.right?.order ?? 0;
        return orderA - orderB;
      })
      .forEach(([matchId, pair]) => {
        if (pair.left && pair.right) {
          left.push({
            matchId,
            optionId: pair.left.id?.toString() || "",
            text: pair.left.body || "",
            imageUrl: pair.left.image_url || undefined,
          });
          right.push({
            matchId,
            optionId: pair.right.id?.toString() || "",
            text: pair.right.body || "",
            imageUrl: pair.right.image_url || undefined,
          });
        }
      });

    return { leftItems: left, rightItems: right };
  }, [options]);

  // Shuffle left items once
  const shuffledLeft = useMemo(() => shuffleArray(leftItems), [leftItems]);

  const totalPairs = rightItems.length;

  const getColorForRight = useCallback(
    (rightMatchId: string): string | undefined => {
      for (const [leftId, rightId] of connections) {
        if (rightId === rightMatchId) return colorMap.get(leftId);
      }
      return undefined;
    },
    [connections, colorMap]
  );

  const isLeftConnected = useCallback(
    (matchId: string) => connections.has(matchId),
    [connections]
  );

  const isRightConnected = useCallback(
    (matchId: string) => {
      for (const rightId of connections.values()) {
        if (rightId === matchId) return true;
      }
      return false;
    },
    [connections]
  );

  const findLeftForRight = useCallback(
    (rightMatchId: string): string | null => {
      for (const [leftId, rightId] of connections) {
        if (rightId === rightMatchId) return leftId;
      }
      return null;
    },
    [connections]
  );

  // Build option.id-based matches from match_id-based connections
  const buildMatches = useCallback(
    (conns: Map<string, string>): Record<string, string> => {
      const matches: Record<string, string> = {};
      conns.forEach((rightMatchId, leftMatchId) => {
        const leftOpt = options.find(
          (o) => o.match_id === leftMatchId && o.group === "left"
        );
        const rightOpt = options.find(
          (o) => o.match_id === rightMatchId && o.group === "right"
        );
        if (leftOpt?.id && rightOpt?.id) {
          matches[leftOpt.id.toString()] = rightOpt.id.toString();
        }
      });
      return matches;
    },
    [options]
  );

  const addConnection = useCallback(
    (leftMatchId: string, rightMatchId: string) => {
      setConnections((prev) => {
        if (prev.has(leftMatchId)) return prev;
        for (const rightId of prev.values()) {
          if (rightId === rightMatchId) return prev;
        }
        const next = new Map(prev);
        next.set(leftMatchId, rightMatchId);

        // Notify onChange
        if (onChange) {
          onChange(JSON.stringify({ matches: buildMatches(next) }));
        }
        return next;
      });

      const color =
        CONNECTION_COLORS[nextColorRef.current % CONNECTION_COLORS.length];
      nextColorRef.current++;

      setColorMap((prev) => {
        const next = new Map(prev);
        next.set(leftMatchId, color);
        return next;
      });
      setResult(null);
    },
    [onChange, buildMatches]
  );

  const removeConnection = useCallback((leftMatchId: string) => {
    setConnections((prev) => {
      const next = new Map(prev);
      next.delete(leftMatchId);
      return next;
    });
    setColorMap((prev) => {
      const next = new Map(prev);
      next.delete(leftMatchId);
      return next;
    });
    setResult(null);
  }, []);

  // Tap-to-match: click left item
  const handleLeftClick = useCallback(
    (matchId: string) => {
      if (isLeftConnected(matchId)) {
        removeConnection(matchId);
        setSelectedLeftId(null);
        return;
      }
      // Toggle if same, otherwise switch selection
      setSelectedLeftId((prev) => (prev === matchId ? null : matchId));
    },
    [isLeftConnected, removeConnection]
  );

  // Tap-to-match: click right item
  const handleRightClick = useCallback(
    (matchId: string) => {
      const connectedLeft = findLeftForRight(matchId);
      if (connectedLeft) {
        removeConnection(connectedLeft);
        return;
      }
      if (selectedLeftId) {
        addConnection(selectedLeftId, matchId);
        setSelectedLeftId(null);
      }
    },
    [selectedLeftId, findLeftForRight, removeConnection, addConnection]
  );

  // Drag support
  const handleDragStart = useCallback((matchId: string) => {
    setDraggedLeftId(matchId);
    setSelectedLeftId(null);
  }, []);

  const handleDragEnd = useCallback(() => {
    setDraggedLeftId(null);
    setDragOverRightId(null);
  }, []);

  const handleDragOver = useCallback(
    (e: React.DragEvent, rightMatchId: string) => {
      e.preventDefault();
      if (!isRightConnected(rightMatchId)) {
        setDragOverRightId(rightMatchId);
      }
    },
    [isRightConnected]
  );

  const handleDragLeave = useCallback(() => {
    setDragOverRightId(null);
  }, []);

  const handleDrop = useCallback(
    (rightMatchId: string) => {
      if (draggedLeftId && !isRightConnected(rightMatchId)) {
        addConnection(draggedLeftId, rightMatchId);
      }
      setDraggedLeftId(null);
      setDragOverRightId(null);
    },
    [draggedLeftId, isRightConnected, addConnection]
  );

  const handleSubmit = useCallback(async () => {
    if (connections.size === 0 || !currentQuestion?.id) return;
    setSubmitting(true);
    const matches = buildMatches(connections);
    const response = await submit(currentQuestion.id, { matches });
    if (response) setResult(response);
    setSubmitting(false);
  }, [connections, currentQuestion?.id, buildMatches, submit]);

  // Calculate SVG paths for connections
  const recalcPaths = useCallback(() => {
    const container = containerRef.current;
    if (!container) return;

    const containerRect = container.getBoundingClientRect();
    const paths: { key: string; d: string; color: string }[] = [];

    connections.forEach((rightMatchId, leftMatchId) => {
      const leftEl = leftRefsMap.current.get(leftMatchId);
      const rightEl = rightRefsMap.current.get(rightMatchId);
      const color = colorMap.get(leftMatchId) || CONNECTION_COLORS[0];

      if (leftEl && rightEl) {
        const leftRect = leftEl.getBoundingClientRect();
        const rightRect = rightEl.getBoundingClientRect();

        const startX = leftRect.right - containerRect.left;
        const startY = leftRect.top + leftRect.height / 2 - containerRect.top;
        const endX = rightRect.left - containerRect.left;
        const endY = rightRect.top + rightRect.height / 2 - containerRect.top;
        const controlOffset = Math.abs(endX - startX) * 0.4;

        const d = `M ${startX} ${startY} C ${startX + controlOffset} ${startY}, ${endX - controlOffset} ${endY}, ${endX} ${endY}`;
        paths.push({ key: leftMatchId, d, color });
      }
    });

    setSvgPaths(paths);
  }, [connections, colorMap]);

  useEffect(() => {
    recalcPaths();
  }, [recalcPaths]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const observer = new ResizeObserver(() => {
      requestAnimationFrame(recalcPaths);
    });
    observer.observe(container);
    return () => observer.disconnect();
  }, [recalcPaths]);

  if (!currentQuestion || leftItems.length === 0) return null;

  return (
    <TaskViewWrapper widgetId={widgetId}>
      <div className="w-full space-y-4">
        {/* Progress */}
        <div
          className={`text-center text-sm font-medium transition-colors ${
            connections.size === totalPairs && totalPairs > 0
              ? "text-green-600"
              : "text-slate-500"
          }`}
        >
          {connections.size} / {totalPairs}{" "}
          {t("constructor.pairsConnected")}
          {connections.size === totalPairs && totalPairs > 0 && " ✓"}
        </div>

        {/* Two-column matching area */}
        <div ref={containerRef} className="relative w-full">
          {/* SVG overlay for connection lines */}
          <svg
            className="absolute inset-0 w-full h-full pointer-events-none z-10"
            style={{ overflow: "visible" }}
          >
            {svgPaths.map(({ key, d, color }) => (
              <path
                key={key}
                d={d}
                stroke={color}
                strokeWidth={3}
                fill="none"
                strokeLinecap="round"
                className="connection-line"
              />
            ))}
          </svg>

          <div className="grid grid-cols-2 gap-4 md:gap-8">
            {/* Left column — shuffled answers */}
            <div className="space-y-3">
              {shuffledLeft.map((item) => {
                const connected = isLeftConnected(item.matchId);
                const color = colorMap.get(item.matchId);
                return (
                  <MatchItem
                    key={item.matchId}
                    ref={(el) => {
                      if (el) leftRefsMap.current.set(item.matchId, el);
                      else leftRefsMap.current.delete(item.matchId);
                    }}
                    item={item}
                    side="left"
                    isConnected={connected}
                    isSelected={selectedLeftId === item.matchId}
                    isDimmed={!!draggedLeftId && draggedLeftId !== item.matchId}
                    connectionColor={color}
                    pairHeight={pairHeight}
                    onClick={() => handleLeftClick(item.matchId)}
                    draggable={!connected}
                    onDragStart={() => handleDragStart(item.matchId)}
                    onDragEnd={handleDragEnd}
                  />
                );
              })}
            </div>

            {/* Right column — definitions */}
            <div className="space-y-3">
              {rightItems.map((item) => {
                const connected = isRightConnected(item.matchId);
                const color = getColorForRight(item.matchId);
                const isDragHover = dragOverRightId === item.matchId;
                return (
                  <MatchItem
                    key={item.matchId}
                    ref={(el) => {
                      if (el) rightRefsMap.current.set(item.matchId, el);
                      else rightRefsMap.current.delete(item.matchId);
                    }}
                    item={item}
                    side="right"
                    isConnected={connected}
                    isSelected={false}
                    connectionColor={color}
                    pairHeight={pairHeight}
                    onClick={() => handleRightClick(item.matchId)}
                    onDragOver={(e) => handleDragOver(e, item.matchId)}
                    onDragLeave={handleDragLeave}
                    onDrop={() => handleDrop(item.matchId)}
                    isDropTarget={
                      (!!selectedLeftId || !!draggedLeftId) && !connected
                    }
                    isDragHover={isDragHover}
                  />
                );
              })}
            </div>
          </div>
        </div>

        {/* Result feedback */}
        {result && (
          <div
            className={`mt-4 p-4 rounded-lg border-2 ${
              result.is_correct
                ? "bg-green-50 border-green-300 text-green-800"
                : "bg-red-50 border-red-300 text-red-800"
            }`}
          >
            <div className="flex items-center gap-2">
              <span className="text-lg font-semibold">
                {result.is_correct
                  ? getPositiveFeedback()
                  : getNegativeFeedback()}
              </span>
              <span className="text-sm">(+{result.points_earned} балл)</span>
            </div>
          </div>
        )}

        {error && (
          <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            {error}
          </div>
        )}

        <div className="mt-4 flex justify-end">
          <button
            onClick={handleSubmit}
            disabled={connections.size === 0 || submitting || loading}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
          >
            {submitting || loading ? "Отправка..." : "Отправить ответ"}
          </button>
        </div>
      </div>
    </TaskViewWrapper>
  );
}

/** A single item in the matching grid */
const MatchItem = forwardRef<
  HTMLDivElement,
  {
    item: MatchItemData;
    side: "left" | "right";
    isConnected: boolean;
    isSelected: boolean;
    isDimmed?: boolean;
    isDragHover?: boolean;
    connectionColor?: string;
    pairHeight: number;
    onClick: () => void;
    draggable?: boolean;
    onDragStart?: () => void;
    onDragEnd?: () => void;
    onDragOver?: (e: React.DragEvent) => void;
    onDragLeave?: () => void;
    onDrop?: () => void;
    isDropTarget?: boolean;
  }
>(function MatchItemInner(
  {
    item,
    isConnected,
    isSelected,
    isDimmed,
    isDragHover,
    connectionColor,
    pairHeight,
    onClick,
    draggable,
    onDragStart,
    onDragEnd,
    onDragOver,
    onDragLeave,
    onDrop,
    isDropTarget,
  },
  ref
) {
  const baseClasses =
    "relative rounded-xl border-2 p-3 cursor-pointer select-none transition-all duration-200 flex flex-col items-center justify-center text-center";

  const stateClasses = isConnected
    ? ""
    : isDragHover
    ? "bg-blue-100 border-blue-500 shadow-lg scale-[1.03]"
    : isSelected
    ? "bg-blue-50 border-blue-400 shadow-md ring-2 ring-blue-300 ring-offset-1 scale-[1.02]"
    : isDropTarget
    ? "bg-blue-50/50 border-blue-300 border-dashed"
    : isDimmed
    ? "bg-slate-50 border-slate-200 opacity-50"
    : "bg-white border-slate-200 hover:border-slate-400 hover:shadow-sm";

  return (
    <div
      ref={ref}
      onClick={onClick}
      style={{
        minHeight: `${pairHeight}px`,
        borderColor: isConnected ? connectionColor : undefined,
        backgroundColor: isConnected ? `${connectionColor}22` : undefined,
      }}
      className={`${baseClasses} ${stateClasses}`}
      draggable={draggable && !isConnected}
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
    >
      {item.imageUrl && (
        <div className="relative w-full flex-1 min-h-0 mb-2 max-h-[60%]">
          <Image
            src={item.imageUrl}
            alt=""
            fill
            className="object-contain rounded"
            unoptimized
          />
        </div>
      )}
      {isConnected && connectionColor && (
        <div
          className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full flex items-center justify-center"
          style={{ backgroundColor: connectionColor }}
        >
          <svg className="w-3 h-3 text-white" viewBox="0 0 12 12" fill="none">
            <path
              d="M2 6l3 3 5-5"
              stroke="currentColor"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
      )}
      <p className="text-sm md:text-base lg:text-lg text-slate-700">
        {item.text || "\u00A0"}
      </p>
    </div>
  );
});
