import type { Fix } from "./types.js";

export interface ApplyFixesResult {
  text: string;
  applied: Fix[];
  skipped: Array<{ fix: Fix; reason: string }>;
}

/**
 * Applies a set of Fix edits to a source string.
 * Fixes that overlap with an already-applied fix are skipped with a reason.
 * Fixes without offset information on both endpoints are skipped.
 */
export function applyFixes(raw: string, fixes: Fix[]): ApplyFixesResult {
  const withOffsets = fixes
    .map((fix) => ({
      fix,
      startOffset: fix.range.start.offset,
      endOffset: fix.range.end.offset,
    }))
    .filter(
      (f): f is { fix: Fix; startOffset: number; endOffset: number } =>
        typeof f.startOffset === "number" && typeof f.endOffset === "number",
    );

  const skipped: Array<{ fix: Fix; reason: string }> = [];
  for (const f of fixes) {
    const ok = withOffsets.some((wf) => wf.fix === f);
    if (!ok) skipped.push({ fix: f, reason: "fix range missing byte offsets" });
  }

  withOffsets.sort((a, b) => a.startOffset - b.startOffset);

  const applied: Fix[] = [];
  let cursor = 0;
  let out = "";
  let lastEnd = -1;

  for (const { fix, startOffset, endOffset } of withOffsets) {
    if (startOffset < lastEnd) {
      skipped.push({ fix, reason: "overlaps previously applied fix" });
      continue;
    }
    if (startOffset < cursor) {
      skipped.push({ fix, reason: "range precedes cursor (likely unsorted input)" });
      continue;
    }
    out += raw.slice(cursor, startOffset);
    out += fix.replacement;
    cursor = endOffset;
    lastEnd = endOffset;
    applied.push(fix);
  }

  out += raw.slice(cursor);

  return { text: out, applied, skipped };
}
