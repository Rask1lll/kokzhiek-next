"use client";

import { useMemo } from "react";
import { useTranslations } from "next-intl";

type PasswordStrength = {
  score: number; // 0-4
  label: string;
  color: string;
  bgColor: string;
};

export function calculatePasswordStrength(password: string): number {
  let score = 0;
  
  if (!password) return 0;
  
  // Length checks
  if (password.length >= 8) score += 1;
  if (password.length >= 12) score += 1;
  
  // Character variety checks
  if (/[a-z]/.test(password)) score += 0.5;
  if (/[A-Z]/.test(password)) score += 0.5;
  if (/[0-9]/.test(password)) score += 0.5;
  if (/[^a-zA-Z0-9]/.test(password)) score += 0.5;
  
  return Math.min(4, Math.floor(score));
}

type PasswordStrengthIndicatorProps = {
  password: string;
  translationNamespace?: string;
};

export default function PasswordStrengthIndicator({
  password,
  translationNamespace = "passwordStrength",
}: PasswordStrengthIndicatorProps) {
  const t = useTranslations(translationNamespace);

  const strength = useMemo((): PasswordStrength => {
    const score = calculatePasswordStrength(password);
    
    const strengthLevels: PasswordStrength[] = [
      { score: 0, label: t("weak"), color: "text-red-600", bgColor: "bg-red-500" },
      { score: 1, label: t("weak"), color: "text-red-600", bgColor: "bg-red-500" },
      { score: 2, label: t("fair"), color: "text-yellow-600", bgColor: "bg-yellow-500" },
      { score: 3, label: t("good"), color: "text-blue-600", bgColor: "bg-blue-500" },
      { score: 4, label: t("strong"), color: "text-green-600", bgColor: "bg-green-500" },
    ];
    
    return strengthLevels[score];
  }, [password, t]);

  if (!password) return null;

  return (
    <div className="mt-2">
      <div className="flex gap-1 mb-1">
        {[0, 1, 2, 3].map((index) => (
          <div
            key={index}
            className={`h-1.5 flex-1 rounded-full transition-colors ${
              index < strength.score
                ? strength.bgColor
                : "bg-gray-200"
            }`}
          />
        ))}
      </div>
      <p className={`text-xs ${strength.color}`}>
        {strength.label}
      </p>
    </div>
  );
}

