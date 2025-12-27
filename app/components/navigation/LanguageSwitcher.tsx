"use client";

import { useLocale } from "next-intl";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import Cookies from "js-cookie";

export default function LanguageSwitcher() {
  const locale = useLocale();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const setLocale = (newLocale: string) => {
    Cookies.set("locale", newLocale, { expires: 365 });
    startTransition(() => {
      router.refresh();
    });
  };

  return (
    <div className="z-50 flex gap-1 bg-white rounded-lg shadow-md p-1">
      <div className="relative">
        <div
          className={`w-1/2 h-full bg-sky-200 rounded-lg absolute transition-all duration-300 ${
            locale === "kk" ? "left-0" : "left-[50%]"
          } ${isPending ? "opacity-50" : ""}`}
        />
        <button
          className="px-3 py-1.5 text-sm font-medium rounded text-gray-600 transition-all"
          onClick={() => setLocale("kk")}
          disabled={isPending}
        >
          <span className="relative z-50">ҚАЗ</span>
        </button>
        <button
          onClick={() => setLocale("ru")}
          disabled={isPending}
          className="px-3 py-1.5 text-sm font-medium rounded bg-transparent text-gray-600 hover:bg-gray-100 transition-all"
        >
          <span className="relative z-50">РУС</span>
        </button>
      </div>
    </div>
  );
}
