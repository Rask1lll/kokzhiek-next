"use client";

import { Widget } from "@/app/types/widget";
import { useTranslations } from "next-intl";

// View components for widgets
import HeadingView from "./viewBlocks/HeadingView";
import SubheadingView from "./viewBlocks/SubheadingView";
import TextView from "./viewBlocks/TextView";
import QuoteView from "./viewBlocks/QuoteView";
import ListView from "./viewBlocks/ListItemView";
import ImageView from "./viewBlocks/ImageView";
import VideoView from "./viewBlocks/VideoView";
import AudioView from "./viewBlocks/AudioView";
import FormulaView from "./viewBlocks/FormulaView";
import DividerView from "./viewBlocks/DividerView";

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
      content = <AudioView value={urlValue} />;
      break;
    case "formula":
      content = <FormulaView value={textValue} />;
      break;
    case "divider":
      content = <DividerView value={textValue} />;
      break;

    // Task widgets (interactive)
    case "multiple_choice":
      content = (
        <MultipleChoiceView
          widgetId={widget.id}
          onChange={handleAnswerChange}
        />
      );
      break;
    case "single_choice":
      content = (
        <SingleChoiceView widgetId={widget.id} onChange={handleAnswerChange} />
      );
      break;
    case "dropdown":
      content = (
        <DropDownView widgetId={widget.id} onChange={handleAnswerChange} />
      );
      break;
    case "fill_blank":
      content = (
        <FillBlankView widgetId={widget.id} onChange={handleAnswerChange} />
      );
      break;
    case "crossword":
      content = (
        <CrosswordView widgetId={widget.id} onChange={handleAnswerChange} />
      );
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
      content = <SortView widgetId={widget.id} onChange={handleAnswerChange} />;
      break;
    case "order":
      content = (
        <OrderView widgetId={widget.id} onChange={handleAnswerChange} />
      );
      break;
    case "drag_drop":
      content = <DragDropView widgetId={widget.id} />;
      break;
    default:
      content = (
        <div className="p-4 bg-gray-100 w-full rounded-lg text-gray-500 text-center">
          {t("unknownWidgetType")} {widget.type}
        </div>
      );
  }

  return <div className="w-full">{content}</div>;
}
