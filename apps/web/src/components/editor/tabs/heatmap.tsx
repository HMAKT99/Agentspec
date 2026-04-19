"use client";

import { useState } from "react";
import type { EditorTabContext } from "../types";

const ATTENTION_TOKENS = 4000;
const CHARS_PER_TOKEN = 4;

const CHART_HEIGHT = 160;
const CHART_PADDING = { top: 24, right: 16, bottom: 24, left: 16 };
const TOKEN_AXIS_TICKS = [0, 1000, 2000, 3000, 4000, 6000, 8000, 10000];

interface Props {
  ctx: EditorTabContext;
}

export function HeatmapTab({ ctx }: Props) {
  const [hoverIdx, setHoverIdx] = useState<number | null>(null);

  const specTokens = ctx.tokens;
  const bindings = ctx.bindings;

  // X-axis max: at least the attention threshold + headroom, OR the spec's
  // actual token count if it's bigger. Snaps to the next thousand.
  const rawMax = Math.max(specTokens, ATTENTION_TOKENS + 1000);
  const maxTokens = Math.ceil(rawMax / 1000) * 1000;

  const points = bindings.map((b) => ({
    binding: b,
    tokens: b.offset / CHARS_PER_TOKEN,
    buried: b.offset / CHARS_PER_TOKEN > ATTENTION_TOKENS,
  }));

  const buriedCount = points.filter((p) => p.buried).length;

  return (
    <div className="flex h-full flex-col gap-4 p-4">
      <div>
        <h3 className="text-sm font-semibold text-[color:var(--color-fg)]">Attention heatmap</h3>
        <p className="mt-0.5 text-xs text-[color:var(--color-fg-muted)]">
          Each dot is a binding rule. Past the attention wall (~{ATTENTION_TOKENS.toLocaleString()}{" "}
          tokens), models reliably stop following them.
        </p>
      </div>

      <svg
        role="img"
        aria-label="Attention heatmap showing binding rule positions relative to the 4K-token attention threshold"
        viewBox={`0 0 1000 ${CHART_HEIGHT}`}
        className="w-full"
        preserveAspectRatio="none"
      >
        <defs>
          <linearGradient id="buried-zone" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="var(--color-accent)" stopOpacity="0.08" />
            <stop offset="100%" stopColor="var(--color-accent)" stopOpacity="0.18" />
          </linearGradient>
        </defs>

        {/* Buried zone background */}
        <rect
          x={pct(ATTENTION_TOKENS, maxTokens)}
          y={CHART_PADDING.top - 4}
          width={1000 - pct(ATTENTION_TOKENS, maxTokens) - CHART_PADDING.right}
          height={CHART_HEIGHT - CHART_PADDING.top - CHART_PADDING.bottom + 8}
          fill="url(#buried-zone)"
        />

        {/* Axis line */}
        <line
          x1={CHART_PADDING.left}
          x2={1000 - CHART_PADDING.right}
          y1={CHART_HEIGHT / 2}
          y2={CHART_HEIGHT / 2}
          stroke="var(--color-line)"
          strokeWidth="1"
        />

        {/* Attention wall */}
        <line
          x1={pct(ATTENTION_TOKENS, maxTokens)}
          x2={pct(ATTENTION_TOKENS, maxTokens)}
          y1={CHART_PADDING.top - 8}
          y2={CHART_HEIGHT - CHART_PADDING.bottom + 8}
          stroke="var(--color-accent)"
          strokeWidth="1.5"
          strokeDasharray="4 3"
        />
        <text
          x={pct(ATTENTION_TOKENS, maxTokens) + 6}
          y={CHART_PADDING.top - 10}
          fontSize="10"
          fill="var(--color-accent)"
          fontFamily="'JetBrains Mono', monospace"
        >
          attention wall ({ATTENTION_TOKENS.toLocaleString()})
        </text>

        {/* Spec end marker */}
        {specTokens > 0 && specTokens < maxTokens && (
          <line
            x1={pct(specTokens, maxTokens)}
            x2={pct(specTokens, maxTokens)}
            y1={CHART_PADDING.top - 4}
            y2={CHART_HEIGHT - CHART_PADDING.bottom + 4}
            stroke="var(--color-fg-subtle)"
            strokeWidth="1"
            strokeDasharray="2 3"
          />
        )}

        {/* Ticks */}
        {TOKEN_AXIS_TICKS.filter((t) => t <= maxTokens).map((t) => (
          <g key={t}>
            <line
              x1={pct(t, maxTokens)}
              x2={pct(t, maxTokens)}
              y1={CHART_HEIGHT / 2 - 3}
              y2={CHART_HEIGHT / 2 + 3}
              stroke="var(--color-fg-subtle)"
              strokeWidth="1"
            />
            <text
              x={pct(t, maxTokens)}
              y={CHART_HEIGHT - 6}
              fontSize="9"
              textAnchor="middle"
              fill="var(--color-fg-subtle)"
              fontFamily="'JetBrains Mono', monospace"
            >
              {t === 0 ? "0" : `${t / 1000}K`}
            </text>
          </g>
        ))}

        {/* Rule dots */}
        {points.map((p, i) => {
          const hovered = hoverIdx === i;
          const cx = pct(p.tokens, maxTokens);
          const cy = CHART_HEIGHT / 2;
          const fill = p.buried ? "var(--color-accent)" : "var(--color-fg)";
          const r = hovered ? 6 : 4;
          return (
            <g key={`${p.binding.id}-${i}`}>
              <title>
                {`line ${p.binding.line} · ${Math.round(p.tokens).toLocaleString()} tokens\n${p.binding.text}`}
              </title>
              <circle
                cx={cx}
                cy={cy}
                r={r}
                fill={fill}
                opacity={p.buried ? 0.85 : 0.65}
                style={{ cursor: "pointer", transition: "r 120ms ease" }}
                onMouseEnter={() => setHoverIdx(i)}
                onMouseLeave={() => setHoverIdx((cur) => (cur === i ? null : cur))}
                onClick={() => ctx.focusLine(p.binding.line, p.binding.column)}
                onKeyDown={(ev) => {
                  if (ev.key === "Enter" || ev.key === " ") {
                    ev.preventDefault();
                    ctx.focusLine(p.binding.line, p.binding.column);
                  }
                }}
                tabIndex={0}
                role="button"
                aria-label={`Binding rule at line ${p.binding.line}`}
              />
            </g>
          );
        })}
      </svg>

      <div className="rounded-[var(--radius)] border border-[color:var(--color-line)] bg-[color:var(--color-bg-alt)] p-4 text-sm">
        {bindings.length === 0 ? (
          <p className="text-[color:var(--color-fg-muted)]">
            No binding rules extracted yet — add some <code className="font-mono">must</code> /{" "}
            <code className="font-mono">always</code> / <code className="font-mono">never</code>{" "}
            directives and they'll show up here.
          </p>
        ) : (
          <div className="flex flex-wrap items-baseline gap-x-6 gap-y-1">
            <span>
              <span className="font-semibold text-[color:var(--color-fg)]">{bindings.length}</span>{" "}
              <span className="text-[color:var(--color-fg-muted)]">
                binding rule{bindings.length === 1 ? "" : "s"}
              </span>
            </span>
            <span>
              <span
                className={`font-semibold ${
                  buriedCount > 0
                    ? "text-[color:var(--color-accent)]"
                    : "text-[color:var(--color-fg)]"
                }`}
              >
                {buriedCount}
              </span>{" "}
              <span className="text-[color:var(--color-fg-muted)]">past the wall</span>
            </span>
            <span>
              <span className="font-semibold text-[color:var(--color-fg)]">
                {ctx.tokens.toLocaleString()}
              </span>{" "}
              <span className="text-[color:var(--color-fg-muted)]">~tokens total</span>
            </span>
          </div>
        )}
      </div>

      {hoverIdx !== null && points[hoverIdx] && (
        <div className="rounded-[var(--radius)] border border-[color:var(--color-line)] bg-[color:var(--color-bg)] p-3 text-xs">
          <div className="mb-1 flex items-center justify-between font-mono text-[color:var(--color-fg-muted)]">
            <span>line {points[hoverIdx].binding.line}</span>
            <span>~{Math.round(points[hoverIdx].tokens).toLocaleString()} tokens in</span>
          </div>
          <p className="text-sm text-[color:var(--color-fg)]">{points[hoverIdx].binding.text}</p>
          {points[hoverIdx].binding.headingPath.length > 0 && (
            <p className="mt-1 text-xs text-[color:var(--color-fg-subtle)]">
              under {points[hoverIdx].binding.headingPath.join(" › ")}
            </p>
          )}
        </div>
      )}
    </div>
  );
}

function pct(value: number, max: number): number {
  const left = CHART_PADDING.left;
  const right = 1000 - CHART_PADDING.right;
  const clamped = Math.max(0, Math.min(value, max));
  return left + (clamped / max) * (right - left);
}
