"use client";

interface Props {
  errors: number;
  warnings: number;
  infos: number;
  tokens: number;
  frontmatterMissing: boolean;
  emptySpecFired: boolean;
}

export function ScoreBar({
  errors,
  warnings,
  infos,
  tokens,
  frontmatterMissing,
  emptySpecFired,
}: Props) {
  const raw = 100 - 8 * errors - 3 * warnings - 1 * infos - (frontmatterMissing ? 2 : 0);
  let score = Math.max(0, Math.round(raw));
  if (emptySpecFired) score = Math.min(score, 40);

  const tier = pickTier(score);

  return (
    <div
      className="flex flex-wrap items-center justify-between gap-4 rounded-[var(--radius)] border bg-[color:var(--color-bg-panel)] px-5 py-3.5 text-sm"
      style={{
        borderColor: tier.border,
        boxShadow: `inset 0 0 0 1px ${tier.ring}, 0 8px 24px -16px ${tier.glow}`,
      }}
    >
      <div className="flex items-baseline gap-3">
        <span className="text-xs uppercase tracking-[0.2em] text-[color:var(--color-fg-muted)]">
          Score
        </span>
        <span
          className="font-display text-4xl leading-none"
          style={{ color: tier.fg, textShadow: `0 0 18px ${tier.glow}` }}
        >
          {score}
        </span>
        <span className="text-xs text-[color:var(--color-fg-subtle)]">/ 100</span>
        {emptySpecFired && (
          <span
            className="rounded-full border px-2 py-[2px] text-[10px] font-semibold uppercase tracking-wider"
            style={{ borderColor: tier.border, color: tier.fg }}
          >
            cap · empty-spec
          </span>
        )}
      </div>
      <div className="flex flex-wrap items-center gap-x-5 gap-y-1 text-xs text-[color:var(--color-fg-muted)]">
        <Dot color="var(--color-accent)" />
        <span className="-ml-3">
          {errors} error{errors === 1 ? "" : "s"}
        </span>
        <Dot color="#ffc64a" />
        <span className="-ml-3">
          {warnings} warning{warnings === 1 ? "" : "s"}
        </span>
        <Dot color="#7ab8ff" />
        <span className="-ml-3">{infos} info</span>
        <span className="font-mono text-[color:var(--color-fg-subtle)]">
          ~{tokens.toLocaleString()} tok
        </span>
      </div>
    </div>
  );
}

function Dot({ color }: { color: string }) {
  return (
    <span
      className="inline-block h-1.5 w-1.5 rounded-full"
      style={{ background: color, boxShadow: `0 0 6px ${color}` }}
    />
  );
}

interface Tier {
  fg: string;
  border: string;
  ring: string;
  glow: string;
}

function pickTier(score: number): Tier {
  if (score >= 90) {
    // Cyan — excellent.
    return {
      fg: "#7dfaff",
      border: "rgba(0, 229, 255, 0.35)",
      ring: "rgba(0, 229, 255, 0.15)",
      glow: "rgba(0, 229, 255, 0.25)",
    };
  }
  if (score >= 70) {
    // Warm off-white — passing (default threshold).
    return {
      fg: "var(--color-fg)",
      border: "var(--color-line-strong)",
      ring: "rgba(255, 255, 255, 0.04)",
      glow: "rgba(255, 130, 0, 0.1)",
    };
  }
  if (score >= 50) {
    // Amber — warning territory.
    return {
      fg: "#ffc64a",
      border: "rgba(255, 198, 74, 0.45)",
      ring: "rgba(255, 198, 74, 0.18)",
      glow: "rgba(255, 198, 74, 0.25)",
    };
  }
  // Orange / red — fail territory (likely under default fail-below: 70).
  return {
    fg: "var(--color-accent)",
    border: "rgba(255, 130, 0, 0.55)",
    ring: "rgba(255, 130, 0, 0.22)",
    glow: "rgba(255, 130, 0, 0.35)",
  };
}
