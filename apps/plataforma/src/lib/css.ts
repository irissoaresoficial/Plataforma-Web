import type { CSSProperties } from "react";

/**
 * Parses a CSS declaration string ("color:#fff;font-size:12px;") into a
 * React style object. Lets screen components reuse the exact inline-style
 * strings from the original Claude Design prototype (already pixel-specified)
 * without hand-transcribing every property to camelCase.
 */
export function css(s: string | undefined | null): CSSProperties {
  const out: Record<string, string> = {};
  if (!s) return out as CSSProperties;
  s.split(";").forEach((decl) => {
    const i = decl.indexOf(":");
    if (i === -1) return;
    const prop = decl.slice(0, i).trim();
    const val = decl.slice(i + 1).trim();
    if (!prop || !val) return;
    const camel = prop.startsWith("--") ? prop : prop.replace(/-([a-z])/g, (_, c: string) => c.toUpperCase());
    out[camel] = val;
  });
  return out as CSSProperties;
}
