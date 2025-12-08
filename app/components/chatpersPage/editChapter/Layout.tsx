import type { ChapterBlock } from "@/app/store/blocksStore";
import LayoutPlaceholder from "./LayoutPlaceholder";

type LayoutProps = {
  block: ChapterBlock;
};

const Layout = ({ block }: LayoutProps) => {
  const { layoutCode, widgets } = block;

  // API uses 1-based order, so we add 1 to convert from 0-based index
  const getWidgetOrder = (index: number) => index + 1;
  const getWidgetByOrder = (order: number) =>
    widgets.find((w) => w.order === order) ?? null;

  switch (layoutCode) {
    case "full":
    case "single":
      return (
        <div className="w-full bg-gray-100 p-4 rounded-md">
          <div className="w-full">
            <LayoutPlaceholder
              blockId={block.id}
              order={getWidgetOrder(0)}
              widget={getWidgetByOrder(0)}
            />
          </div>
        </div>
      );
    case "two_equal":
    case "split":
      return (
        <div className="w-full grid grid-cols-2 gap-4">
          <div className="min-h-[80px]">
            <LayoutPlaceholder
              blockId={block.id}
              order={getWidgetOrder(0)}
              widget={getWidgetByOrder(0)}
            />
          </div>
          <div className="min-h-[80px]">
            <LayoutPlaceholder
              blockId={block.id}
              order={getWidgetOrder(1)}
              widget={getWidgetByOrder(1)}
            />
          </div>
        </div>
      );
    case "left_wide":
    case "hero":
      return (
        <div className="w-full flex gap-4">
          <div className="min-h-[80px] flex-[1.3]">
            <LayoutPlaceholder
              blockId={block.id}
              order={getWidgetOrder(0)}
              widget={getWidgetByOrder(0)}
            />
          </div>
          <div className="min-h-[80px] flex-[0.7]">
            <LayoutPlaceholder
              blockId={block.id}
              order={getWidgetOrder(1)}
              widget={getWidgetByOrder(1)}
            />
          </div>
        </div>
      );
    case "right_wide":
      return (
        <div className="w-full flex gap-4">
          <div className="min-h-[80px] flex-[0.7]">
            <LayoutPlaceholder
              blockId={block.id}
              order={getWidgetOrder(0)}
              widget={getWidgetByOrder(0)}
            />
          </div>
          <div className="min-h-[80px] flex-[1.3]">
            <LayoutPlaceholder
              blockId={block.id}
              order={getWidgetOrder(1)}
              widget={getWidgetByOrder(1)}
            />
          </div>
        </div>
      );
    case "three_cols":
    case "2-column":
      return (
        <div className="w-full grid grid-cols-3 gap-4">
          <div className="min-h-[80px]">
            <LayoutPlaceholder
              blockId={block.id}
              order={getWidgetOrder(0)}
              widget={getWidgetByOrder(0)}
            />
          </div>
          <div className="min-h-[80px]">
            <LayoutPlaceholder
              blockId={block.id}
              order={getWidgetOrder(1)}
              widget={getWidgetByOrder(1)}
            />
          </div>
          <div className="min-h-[80px]">
            <LayoutPlaceholder
              blockId={block.id}
              order={getWidgetOrder(2)}
              widget={getWidgetByOrder(2)}
            />
          </div>
        </div>
      );
    default:
      return null;
  }
};

export default Layout;
