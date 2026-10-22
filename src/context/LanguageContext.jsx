"use client";

/**
 * Lightweight JSON-based i18n provider.
 *
 * Scope: this is intentionally used ONLY by the vendor dashboard (role === "vendor").
 * No external translation service (e.g. Google Translate) is used — all strings
 * live in src/locales/en.json and src/locales/ar.json and are swapped locally.
 *
 * Usage:
 *   const { t, locale, setLocale, isRtl } = useLanguage();
 *   t("sidebar.products") -> "Products" | "المنتجات"
 *   t("orders.totalOrders", { count: 12 }) -> supports {{placeholder}} interpolation
 */

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import en from "@/locales/en.json";
import ar from "@/locales/ar.json";

const STORAGE_KEY = "hoodz_vendor_locale";
const DEFAULT_LOCALE = "en";
const SUPPORTED_LOCALES = ["en", "ar"];

const dictionaries = { en, ar };

const LanguageContext = createContext(undefined);

function getFromDictionary(dictionary, key) {
  return key
    .split(".")
    .reduce(
      (acc, part) => (acc && typeof acc === "object" ? acc[part] : undefined),
      dictionary,
    );
}

function interpolate(template, params) {
  if (!params) return template;
  return Object.keys(params).reduce(
    (str, paramKey) =>
      str.replace(new RegExp(`{{\\s*${paramKey}\\s*}}`, "g"), params[paramKey]),
    template,
  );
}

export function LanguageProvider({ children }) {
  // Always render "en" on the server / first paint to avoid hydration mismatches,
  // then sync from localStorage once mounted on the client.
  const [locale, setLocaleState] = useState(DEFAULT_LOCALE);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(STORAGE_KEY);
      if (saved && SUPPORTED_LOCALES.includes(saved)) {
        setLocaleState(saved);
      }
    } catch {
      // localStorage may be unavailable (private mode / SSR) — safe to ignore, falls back to "en"
    } finally {
      setHydrated(true);
    }
  }, []);

  const setLocale = useCallback((next) => {
    if (!SUPPORTED_LOCALES.includes(next)) return;
    setLocaleState(next);
    try {
      window.localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // ignore write errors (quota / privacy mode)
    }
  }, []);

  const isRtl = locale === "ar";

  const t = useCallback(
    (key, params) => {
      const dictionary = dictionaries[locale] || dictionaries[DEFAULT_LOCALE];
      const value =
        getFromDictionary(dictionary, key) ??
        getFromDictionary(dictionaries[DEFAULT_LOCALE], key);

      if (value === undefined) {
        // Missing translation key — fail loud in dev, fall back to the key itself in prod
        if (process.env.NODE_ENV !== "production") {
          // eslint-disable-next-line no-console
          console.warn(`[i18n] Missing translation key: "${key}"`);
        }
        return key;
      }

      return typeof value === "string" ? interpolate(value, params) : value;
    },
    [locale],
  );

  const value = useMemo(
    () => ({ locale, setLocale, isRtl, t, hydrated }),
    [locale, setLocale, isRtl, t, hydrated],
  );

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return ctx;
}
