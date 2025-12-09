import type { ChapterBlock } from "@/app/store/blocksStore";
import LayoutPlaceholder from "./LayoutPlaceholder";

type LayoutProps = {
  block: ChapterBlock;
};

const Layout = ({ block }: LayoutProps) => {
  const { layoutCode, widgets } = block;

  const getSlotOrder = (slotIndex: number) => slotIndex;
  const getWidgetForSlot = (slotIndex: number) =>
    widgets.find((w) => w.order === getSlotOrder(slotIndex)) ?? null;

  const id = block.id;

  switch (layoutCode) {
    case "full":
    case "single":
      return (
        <div className="w-full bg-gray-100 rounded-md">
          <LayoutPlaceholder
            className="min-h-[80px] p-2"
            blockId={id}
            order={0}
            widget={getWidgetForSlot(0)}
          />
        </div>
      );

    case "two_equal":
    case "split":
      return (
        <div className="w-full grid grid-cols-2 gap-4">
          <LayoutPlaceholder
            className="min-h-[80px]"
            blockId={id}
            order={0}
            widget={getWidgetForSlot(0)}
          />
          <LayoutPlaceholder
            className="min-h-[80px]"
            blockId={id}
            order={1}
            widget={getWidgetForSlot(1)}
          />
        </div>
      );

    case "left_wide":
    case "hero":
      return (
        <div className="w-full flex gap-4">
          <div className="flex-2">
            <LayoutPlaceholder
              className="min-h-[80px]"
              blockId={id}
              order={0}
              widget={getWidgetForSlot(0)}
            />
          </div>
          <div className="flex-1">
            <LayoutPlaceholder
              className="min-h-[80px]"
              blockId={id}
              order={1}
              widget={getWidgetForSlot(1)}
            />
          </div>
        </div>
      );

    case "right_wide":
      return (
        <div className="w-full flex gap-4">
          <div className="flex-1">
            <LayoutPlaceholder
              className="min-h-[80px]"
              blockId={id}
              order={0}
              widget={getWidgetForSlot(0)}
            />
          </div>
          <div className="flex-2">
            <LayoutPlaceholder
              className="min-h-[80px]"
              blockId={id}
              order={1}
              widget={getWidgetForSlot(1)}
            />
          </div>
        </div>
      );

    case "three_cols":
    case "2-column":
      return (
        <div className="w-full grid grid-cols-3 gap-4">
          <LayoutPlaceholder
            className="min-h-[80px]"
            blockId={id}
            order={0}
            widget={getWidgetForSlot(0)}
          />
          <LayoutPlaceholder
            className="min-h-[80px]"
            blockId={id}
            order={1}
            widget={getWidgetForSlot(1)}
          />
          <LayoutPlaceholder
            className="min-h-[80px]"
            blockId={id}
            order={2}
            widget={getWidgetForSlot(2)}
          />
        </div>
      );

    case "three_center_wide":
      return (
        <div className="w-full flex gap-4">
          <div className="flex-1">
            <LayoutPlaceholder
              className="min-h-[80px]"
              blockId={id}
              order={0}
              widget={getWidgetForSlot(0)}
            />
          </div>
          <div className="flex-2">
            <LayoutPlaceholder
              className="min-h-[80px]"
              blockId={id}
              order={1}
              widget={getWidgetForSlot(1)}
            />
          </div>
          <div className="flex-1">
            <LayoutPlaceholder
              className="min-h-[80px]"
              blockId={id}
              order={2}
              widget={getWidgetForSlot(2)}
            />
          </div>
        </div>
      );

    case "four_cols":
      return (
        <div className="w-full grid grid-cols-4 gap-4">
          <LayoutPlaceholder
            className="min-h-[80px]"
            blockId={id}
            order={0}
            widget={getWidgetForSlot(0)}
          />
          <LayoutPlaceholder
            className="min-h-[80px]"
            blockId={id}
            order={1}
            widget={getWidgetForSlot(1)}
          />
          <LayoutPlaceholder
            className="min-h-[80px]"
            blockId={id}
            order={2}
            widget={getWidgetForSlot(2)}
          />
          <LayoutPlaceholder
            className="min-h-[80px]"
            blockId={id}
            order={3}
            widget={getWidgetForSlot(3)}
          />
        </div>
      );

    case "two_rows":
      return (
        <div className="w-full flex flex-col gap-4">
          <LayoutPlaceholder
            className="min-h-[80px]"
            blockId={id}
            order={0}
            widget={getWidgetForSlot(0)}
          />
          <LayoutPlaceholder
            className="min-h-[80px]"
            blockId={id}
            order={1}
            widget={getWidgetForSlot(1)}
          />
        </div>
      );

    case "grid_2x2":
      return (
        <div className="w-full grid grid-cols-2 grid-rows-2 gap-4">
          <LayoutPlaceholder
            className="min-h-[80px]"
            blockId={id}
            order={0}
            widget={getWidgetForSlot(0)}
          />
          <LayoutPlaceholder
            className="min-h-[80px]"
            blockId={id}
            order={1}
            widget={getWidgetForSlot(1)}
          />
          <LayoutPlaceholder
            className="min-h-[80px]"
            blockId={id}
            order={2}
            widget={getWidgetForSlot(2)}
          />
          <LayoutPlaceholder
            className="min-h-[80px]"
            blockId={id}
            order={3}
            widget={getWidgetForSlot(3)}
          />
        </div>
      );

    case "sidebar_left":
      return (
        <div className="w-full flex gap-4">
          <div className="w-1/4">
            <LayoutPlaceholder
              className="min-h-[120px]"
              blockId={id}
              order={0}
              widget={getWidgetForSlot(0)}
            />
          </div>
          <div className="flex-1">
            <LayoutPlaceholder
              className="min-h-[120px]"
              blockId={id}
              order={1}
              widget={getWidgetForSlot(1)}
            />
          </div>
        </div>
      );

    case "sidebar_right":
      return (
        <div className="w-full flex gap-4">
          <div className="flex-1">
            <LayoutPlaceholder
              className="min-h-[120px]"
              blockId={id}
              order={0}
              widget={getWidgetForSlot(0)}
            />
          </div>
          <div className="w-1/4">
            <LayoutPlaceholder
              className="min-h-[120px]"
              blockId={id}
              order={1}
              widget={getWidgetForSlot(1)}
            />
          </div>
        </div>
      );

    case "main_two_bottom":
      return (
        <div className="w-full flex flex-col gap-4">
          <LayoutPlaceholder
            className="min-h-[120px]"
            blockId={id}
            order={0}
            widget={getWidgetForSlot(0)}
          />
          <div className="flex gap-4">
            <div className="flex-1">
              <LayoutPlaceholder
                className="min-h-[80px]"
                blockId={id}
                order={1}
                widget={getWidgetForSlot(1)}
              />
            </div>
            <div className="flex-1">
              <LayoutPlaceholder
                className="min-h-[80px]"
                blockId={id}
                order={2}
                widget={getWidgetForSlot(2)}
              />
            </div>
          </div>
        </div>
      );

    case "two_top_main":
      return (
        <div className="w-full flex flex-col gap-4">
          <div className="flex gap-4">
            <div className="flex-1">
              <LayoutPlaceholder
                className="min-h-[80px]"
                blockId={id}
                order={0}
                widget={getWidgetForSlot(0)}
              />
            </div>
            <div className="flex-1">
              <LayoutPlaceholder
                className="min-h-[80px]"
                blockId={id}
                order={1}
                widget={getWidgetForSlot(1)}
              />
            </div>
          </div>
          <LayoutPlaceholder
            className="min-h-[120px]"
            blockId={id}
            order={2}
            widget={getWidgetForSlot(2)}
          />
        </div>
      );

    default:
      return null;
  }
};

export default Layout;
