"use client";

import { useLanguage } from "@/context/LanguageContext";
import { Languages } from "lucide-react";

/**
 * Simple EN / AR toggle. Only rendered for the vendor role — see HeaderContainer.
 */
export default function LanguageSwitcher() {
  const { locale, setLocale, t } = useLanguage();

  return (
    <div
      className="flex items-center gap-1 rounded-full border border-slate-200 bg-white p-1"
      role="group"
      aria-label={t("header.language")}
    >
      <Languages size={16} className="ml-1.5 text-slate-400" />
      {["en", "ar"].map((code) => (
        <button
          key={code}
          type="button"
          onClick={() => setLocale(code)}
          aria-pressed={locale === code}
          className={`rounded-full px-2.5 py-1 text-xs font-semibold uppercase transition ${
            locale === code
              ? "bg-[#1B70A6] text-white"
              : "text-slate-500 hover:bg-slate-100"
          }`}
        >
          {code}
        </button>
      ))}
    </div>
  );
}
