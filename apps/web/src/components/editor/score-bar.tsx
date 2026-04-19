"use client";

interface Props {
  errors: number;
  warnings: number;
  infos: number;
  tokens: number;
  frontmatterMissing: boolean;
}

export function ScoreBar({ errors, warnings, infos, tokens, frontmatterMissing }: Props) {
  const raw = 100 - 8 * errors - 3 * warnings - 1 * infos - (frontmatterMissing ? 2 : 0);
  const score = Math.max(0, Math.round(raw));
  const toneClass =
    score >= 80
      ? "border-[color:var(--color-line)] bg-[color:var(--color-bg-alt)]"
      : score >= 60
        ? "border-[#F5D27E] bg-[#FFF8E0]"
        : "border-[color:var(--color-accent)]/40 bg-[color:var(--color-accent-soft)]/40";

  return (
    <div
      className={`flex flex-wrap items-center justify-between gap-4 rounded-[var(--radius)] border px-4 py-3 text-sm ${toneClass}`}
    >
      <div className="flex items-baseline gap-3">
        <span className="text-xs uppercase tracking-wider text-[color:var(--color-fg-muted)]">
          Score
        </span>
        <span className="text-2xl font-semibold text-[color:var(--color-fg)]">{score}</span>
        <span className="text-xs text-[color:var(--color-fg-subtle)]">/ 100</span>
      </div>
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-[color:var(--color-fg-muted)]">
        <span>
          <span className="mr-1 inline-block h-1.5 w-1.5 rounded-full bg-[color:var(--color-accent)]" />
          {errors} error{errors === 1 ? "" : "s"}
        </span>
        <span>
          <span className="mr-1 inline-block h-1.5 w-1.5 rounded-full bg-[#C8A200]" />
          {warnings} warning{warnings === 1 ? "" : "s"}
        </span>
        <span>
          <span className="mr-1 inline-block h-1.5 w-1.5 rounded-full bg-[#4A7CBE]" />
          {infos} info
        </span>
        <span className="font-mono text-[color:var(--color-fg-subtle)]">
          ~{tokens.toLocaleString()} tok
        </span>
      </div>
    </div>
  );
}
