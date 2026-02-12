"use client";

import { Widget } from "@/app/types/widget";
import { TaskType } from "@/app/types/enums";
import { useTranslations } from "next-intl";

const TASK_WIDGET_TYPES = new Set<string>(Object.values(TaskType));

// View components for widgets
import HeadingView from "./viewBlocks/HeadingView";
import SubheadingView from "./viewBlocks/SubheadingView";
import TextView from "./viewBlocks/TextView";
import GlossaryTextView from "./viewBlocks/GlossaryTextView";
import GlossaryView from "./viewBlocks/GlossaryView";
import QuoteView from "./viewBlocks/QuoteView";
import ListView from "./viewBlocks/ListItemView";
import ImageView from "./viewBlocks/ImageView";
import VideoView from "./viewBlocks/VideoView";
import AudioView from "./viewBlocks/AudioView";
import FormulaView from "./viewBlocks/FormulaView";
import DividerView from "./viewBlocks/DividerView";
import EmbedView from "./viewBlocks/EmbedView";
import BannerView from "./viewBlocks/BannerView";
import TableView from "./viewBlocks/TableView";
import CarouselView from "./viewBlocks/CarouselView";

// View components for tasks
import MultipleChoiceView from "./taskViews/MultipleChoiceView";
import SingleChoiceView from "./taskViews/SingleChoiceView";
import DropDownView from "./taskViews/DropDownView";
import FillBlankView from "./taskViews/FillBlankView";
import CrosswordView from "./taskViews/CrosswordView";
import MatchPairsView from "./taskViews/MatchPairsView";
import SearchWordView from "./taskViews/SearchWordView";
import ConceptMapView from "./taskViews/ConceptMapView";
import SortView from "./taskViews/SortView";
import OrderView from "./taskViews/OrderView";
import SentenceOrderView from "./taskViews/SentenceOrderView";
import DragDropView from "./taskViews/DragDropView";

type ViewPlaceholderProps = {
  widget: Widget;
  onAnswerChange?: (widgetId: number, answer: string) => void;
};

export default function ViewPlaceholder({
  widget,
  onAnswerChange,
}: ViewPlaceholderProps) {
  const t = useTranslations("blockEditor");
  const textValue = (widget.data?.text as string) || "";
  const urlValue = (widget.data?.url as string) || "";

  const handleAnswerChange = (answer: string) => {
    onAnswerChange?.(widget.id, answer);
  };

  let content: React.ReactNode = null;

  switch (widget.type) {
    // Content widgets (no interaction needed)
    case "heading":
      content = <HeadingView value={textValue} />;
      break;
    case "subheading":
      content = <SubheadingView value={textValue} />;
      break;
    case "text":
      content = <TextView value={textValue} />;
      break;
    case "glossary_text":
      const glossaryData = widget.data as { content?: string; wordIds?: string[] } | undefined;
      content = (
        <GlossaryTextView
          value={{
            content: glossaryData?.content || "",
            wordIds: glossaryData?.wordIds || [],
          }}
        />
      );
      break;
    case "glossary":
      content = <GlossaryView value={widget.data} />;
      break;
    case "quote":
      content = <QuoteView value={textValue} />;
      break;
    case "list":
      content = <ListView value={textValue} />;
      break;
    case "image":
      content = <ImageView value={urlValue} text={textValue} />;
      break;
    case "video":
      content = <VideoView value={urlValue} text={textValue} />;
      break;
    case "audio":
      content = <AudioView value={urlValue} text={textValue} />;
      break;
    case "formula":
      content = <FormulaView value={textValue} />;
      break;
    case "divider":
      content = <DividerView value={textValue} />;
      break;
    case "embed":
      content = <EmbedView value={textValue} />;
      break;
    case "banner":
      const bannerData = widget.data as { text?: string; bgColor?: string; textColor?: string; fontSize?: string; height?: number; bgImage?: string } | undefined;
      content = (
        <BannerView
          value={{
            text: bannerData?.text || "",
            bgColor: bannerData?.bgColor || "#1e40af",
            textColor: bannerData?.textColor || "#ffffff",
            fontSize: bannerData?.fontSize || "2xl",
            height: bannerData?.height || 200,
            bgImage: bannerData?.bgImage,
          }}
        />
      );
      break;

    // Task widgets (interactive)
    case "multiple_choice":
      content = <MultipleChoiceView widgetId={widget.id} />;
      break;
    case "single_choice":
      content = (
        <SingleChoiceView widgetId={widget.id} onChange={handleAnswerChange} />
      );
      break;
    case "dropdown":
      content = <DropDownView widgetId={widget.id} />;
      break;
    case "fill_blank":
      content = (
        <FillBlankView widgetId={widget.id} onChange={handleAnswerChange} />
      );
      break;
    case "crossword":
      content = <CrosswordView widgetId={widget.id} />;
      break;
    case "match_pairs":
      content = (
        <MatchPairsView widgetId={widget.id} onChange={handleAnswerChange} />
      );
      break;
    case "word_search":
      content = <SearchWordView widgetId={widget.id} />;
      break;
    case "concept_map":
      content = <ConceptMapView widgetId={widget.id} />;
      break;
    case "sort":
      content = <SortView widgetId={widget.id} />;
      break;
    case "order":
      content = <OrderView widgetId={widget.id} />;
      break;
    case "sentence_order":
      content = <SentenceOrderView widgetId={widget.id} />;
      break;
    case "drag_drop":
      content = <DragDropView widgetId={widget.id} />;
      break;

    // Container widgets
    case "widget_table":
      content = <TableView widget={widget} />;
      break;
    case "widget_carousel":
      content = <CarouselView widget={widget} />;
      break;
    default:
      content = (
        <div className="p-4 bg-gray-100 w-full rounded-lg text-gray-500 text-center">
          {t("unknownWidgetType")} {widget.type}
        </div>
      );
  }

  // Sign display for content widgets
  const wd = widget.data as Record<string, unknown> | undefined;
  const wSignUrl = !TASK_WIDGET_TYPES.has(widget.type) ? (wd?.signUrl as string | undefined) : undefined;
  const wSignSize = (wd?.signSize as string) || "md";
  const wSignMode = (wd?.signMode as string) || "inline";
  const signSizeClass: Record<string, string> = { sm: "w-6 h-6", md: "w-8 h-8", lg: "w-12 h-12", xl: "w-16 h-16" };
  const signImg = wSignUrl ? (
    <img src={wSignUrl} alt="Условный знак" className={`${signSizeClass[wSignSize] || signSizeClass.md} object-contain flex-shrink-0`} />
  ) : null;

  const wrappedContent = signImg ? (
    wSignMode === "absolute" ? (
      <div className="relative">
        <div className="absolute -left-10 top-0">{signImg}</div>
        <div>{content}</div>
      </div>
    ) : (
      <div className="flex items-start gap-2">
        {signImg}
        <div className="flex-1">{content}</div>
      </div>
    )
  ) : content;

  return <div className="w-full">{wrappedContent}</div>;
}
