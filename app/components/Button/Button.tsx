"use client";

type ButtonColor = "indigo" | "blue" | "green" | "red" | "orange" | "slate";

type ButtonProps = {
  size?: "xl" | "lg" | "md" | "sm";
  color?: ButtonColor;
  isActive?: boolean;
  onClick: (value: string) => void;
  content: string;
  value: string;
};

const colorStyles: Record<ButtonColor, { active: string; inactive: string }> = {
  indigo: {
    active: "bg-indigo-600 text-white",
    inactive: "bg-indigo-100 text-indigo-700 hover:bg-indigo-200",
  },
  blue: {
    active: "bg-blue-600 text-white",
    inactive: "bg-blue-100 text-blue-700 hover:bg-blue-200",
  },
  green: {
    active: "bg-green-600 text-white",
    inactive: "bg-green-100 text-green-700 hover:bg-green-200",
  },
  red: {
    active: "bg-red-600 text-white",
    inactive: "bg-red-100 text-red-700 hover:bg-red-200",
  },
  orange: {
    active: "bg-orange-600 text-white",
    inactive: "bg-orange-100 text-orange-700 hover:bg-orange-200",
  },
  slate: {
    active: "bg-slate-600 text-white",
    inactive: "bg-slate-100 text-slate-700 hover:bg-slate-200",
  },
};

const sizeStyles = {
  xl: "px-6 py-3 text-lg",
  lg: "px-5 py-2.5 text-base",
  md: "px-4 py-2 text-sm",
  sm: "px-3 py-1.5 text-xs",
};

export default function Button({
  size = "md",
  color = "indigo",
  isActive = false,
  onClick,
  content,
  value,
}: ButtonProps) {
  return (
    <button
      className={`
        rounded-lg font-medium transition-colors
        ${sizeStyles[size]}
        ${isActive ? colorStyles[color].active : colorStyles[color].inactive}
      `}
      onClick={() => {
        onClick(value);
      }}
    >
      {content}
    </button>
  );
}
