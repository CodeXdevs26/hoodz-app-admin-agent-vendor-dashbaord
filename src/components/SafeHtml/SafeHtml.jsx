"use client";

import { useMemo } from "react";
import DOMPurify from "dompurify";

/**
 * Safe replacement for `dangerouslySetInnerHTML`.
 *
 * Any HTML coming back from the API (rich-text editor output such as privacy
 * policy / terms / product descriptions) must be sanitized before it is
 * injected into the DOM — otherwise a malicious <script>, onerror=, or
 * javascript: URL stored by any user with edit access becomes a stored-XSS
 * vector for every visitor who views that content.
 */
export default function SafeHtml({ html, className }) {
  const clean = useMemo(() => {
    if (!html) return "";
    // DOMPurify relies on the browser DOM, so it only runs client-side.
    if (typeof window === "undefined") return "";
    return DOMPurify.sanitize(html, {
      USE_PROFILES: { html: true },
      ADD_ATTR: ["target", "rel"],
    });
  }, [html]);

  if (!clean) return null;

  return (
    <div className={className} dangerouslySetInnerHTML={{ __html: clean }} />
  );
}
