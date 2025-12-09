import type { ChapterBlock } from "@/app/store/blocksStore";
import LayoutPlaceholder from "./LayoutPlaceholder";

type LayoutProps = {
  block: ChapterBlock;
};

const Layout = ({ block }: LayoutProps) => {
  const { layoutCode, widgets } = block;

  // Order starts from 0: slot 0 = order 0, slot 1 = order 1, etc.
  const getSlotOrder = (slotIndex: number) => slotIndex;
  const getWidgetForSlot = (slotIndex: number) => {
    const order = getSlotOrder(slotIndex);
    return widgets.find((w) => w.order === order) ?? null;
  };

  switch (layoutCode) {
    case "full":
    case "single":
      return (
        <div className="w-full bg-gray-100 rounded-md">
          <div className="w-full">
            <LayoutPlaceholder
              className={"min-h-[80px] p-2"}
              blockId={block.id}
              order={getSlotOrder(0)}
              widget={getWidgetForSlot(0)}
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
              order={getSlotOrder(0)}
              widget={getWidgetForSlot(0)}
            />
          </div>
          <div className="min-h-[80px]">
            <LayoutPlaceholder
              blockId={block.id}
              order={getSlotOrder(1)}
              widget={getWidgetForSlot(1)}
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
              order={getSlotOrder(0)}
              widget={getWidgetForSlot(0)}
            />
          </div>
          <div className="min-h-[80px] flex-[0.7]">
            <LayoutPlaceholder
              blockId={block.id}
              order={getSlotOrder(1)}
              widget={getWidgetForSlot(1)}
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
              order={getSlotOrder(0)}
              widget={getWidgetForSlot(0)}
            />
          </div>
          <div className="min-h-[80px] flex-[1.3]">
            <LayoutPlaceholder
              blockId={block.id}
              order={getSlotOrder(1)}
              widget={getWidgetForSlot(1)}
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
              order={getSlotOrder(0)}
              widget={getWidgetForSlot(0)}
            />
          </div>
          <div className="min-h-[80px]">
            <LayoutPlaceholder
              blockId={block.id}
              order={getSlotOrder(1)}
              widget={getWidgetForSlot(1)}
            />
          </div>
          <div className="min-h-[80px]">
            <LayoutPlaceholder
              blockId={block.id}
              order={getSlotOrder(2)}
              widget={getWidgetForSlot(2)}
            />
          </div>
        </div>
      );
    default:
      return null;
  }
};

export default Layout;
