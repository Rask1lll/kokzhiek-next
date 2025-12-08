import LayoutPlaceholder from "./LayoutPlaceholder";

const Layout = (layoutCode: string) => {
  switch (layoutCode) {
    case "full":
      return (
        <div className="w-full bg-gray-100 min-h-64 p-4 rounded-md">
          <div className="w-full h-full">
            <LayoutPlaceholder />
          </div>
        </div>
      );
    case "two_equal":
      return (
        <div className="w-full grid grid-cols-2 gap-4">
          <div className="h-64">
            <LayoutPlaceholder />
          </div>
          <div className="h-64">
            <LayoutPlaceholder />
          </div>
        </div>
      );
    case "left_wide":
      return (
        <div className="w-full flex gap-4">
          <div className="h-64 flex-[1.3]">
            <LayoutPlaceholder />
          </div>
          <div className="h-64 flex-[0.7]">
            <LayoutPlaceholder />
          </div>
        </div>
      );
    case "right_wide":
      return (
        <div className="w-full flex gap-4">
          <div className="h-64 flex-[0.7]">
            <LayoutPlaceholder />
          </div>
          <div className="h-64 flex-[1.3]">
            <LayoutPlaceholder />
          </div>
        </div>
      );
    case "three_cols":
      return (
        <div className="w-full grid grid-cols-3 gap-4">
          <div className="h-64">
            <LayoutPlaceholder />
          </div>
          <div className="h-64">
            <LayoutPlaceholder />
          </div>
          <div className="h-64">
            <LayoutPlaceholder />
          </div>
        </div>
      );
    default:
      return null;
  }
};

export default Layout;
