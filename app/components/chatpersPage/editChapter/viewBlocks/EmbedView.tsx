"use client";

type EmbedViewProps = {
  value: string;
};

export default function EmbedView({ value }: EmbedViewProps) {
  if (!value) {
    return null;
  }

  return (
    <div
      className="w-full rounded-lg overflow-hidden"
      dangerouslySetInnerHTML={{ __html: value }}
    />
  );
}
