"use client";

type BannerData = {
  text: string;
  bgColor: string;
  textColor: string;
  fontSize: string;
  height: number;
};

type BannerViewProps = {
  value: BannerData;
};

const FONT_CLASS: Record<string, string> = {
  sm: "text-sm",
  base: "text-base",
  lg: "text-lg",
  xl: "text-xl",
  "2xl": "text-2xl",
  "3xl": "text-3xl",
};

export default function BannerView({ value }: BannerViewProps) {
  return (
    <div
      className={`w-full font-bold text-center break-words ${FONT_CLASS[value.fontSize] || "text-2xl"}`}
      style={{
        backgroundColor: value.bgColor,
        color: value.textColor,
        height: `${value.height}px`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {value.text}
    </div>
  );
}
