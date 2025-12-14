"use client";

type TextViewProps = {
  value: string;
};

export default function TextView({ value }: TextViewProps) {
  return (
    <div
      className="text-wrap wrap-anywhere max-w-none text-gray-800 [&_ul]:list-disc [&_ul]:ml-5 [&_ol]:list-decimal [&_ol]:ml-5"
      dangerouslySetInnerHTML={{ __html: value || "" }}
    />
  );
}
