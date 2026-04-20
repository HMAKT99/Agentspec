"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { EditorTabContext } from "../types";

interface Props {
  ctx: EditorTabContext;
}

type ModelId = "claude-haiku-4-5" | "claude-sonnet-4-6";

interface ModelSpec {
  id: ModelId;
  label: string;
  provider: "anthropic";
  /** USD per 1M input tokens. */
  inputPrice: number;
  /** USD per 1M output tokens. */
  outputPrice: number;
}

const MODELS: ModelSpec[] = [
  {
    id: "claude-haiku-4-5",
    label: "Claude Haiku 4.5 · fast, cheap",
    provider: "anthropic",
    inputPrice: 0.8,
    outputPrice: 4,
  },
  {
    id: "claude-sonnet-4-6",
    label: "Claude Sonnet 4.6 · balanced",
    provider: "anthropic",
    inputPrice: 3,
    outputPrice: 15,
  },
];

const API_KEY_LS = "mdpact-anthropic-key";
const LAST_TASK_LS = "mdpact-simulate-last-task";
const DEFAULT_TASK =
  "I need to deploy the payments service to production right now. Please proceed.";

export function SimulateTab({ ctx }: Props) {
  const [modelId, setModelId] = useState<ModelId>("claude-haiku-4-5");
  const [apiKey, setApiKey] = useState<string>("");
  const [task, setTask] = useState<string>(DEFAULT_TASK);
  const [running, setRunning] = useState<boolean>(false);
  const [response, setResponse] = useState<string>("");
  const [error, setError] = useState<string | null>(null);

  // Hydrate from localStorage on first mount (never send to server).
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const stored = window.localStorage.getItem(API_KEY_LS);
      if (stored) setApiKey(stored);
      const lastTask = window.localStorage.getItem(LAST_TASK_LS);
      if (lastTask) setTask(lastTask);
    } catch {
      /* no storage */
    }
  }, []);

  const saveKey = useCallback((value: string) => {
    setApiKey(value);
    try {
      if (typeof window === "undefined") return;
      if (value) window.localStorage.setItem(API_KEY_LS, value);
      else window.localStorage.removeItem(API_KEY_LS);
    } catch {
      /* no storage */
    }
  }, []);

  const saveTask = useCallback((value: string) => {
    setTask(value);
    try {
      if (typeof window === "undefined") return;
      window.localStorage.setItem(LAST_TASK_LS, value);
    } catch {
      /* no storage */
    }
  }, []);

  const model = useMemo(() => MODELS.find((m) => m.id === modelId) ?? MODELS[0]!, [modelId]);

  // Rough cost estimate: spec + task = input; assume ~600 output tokens.
  const estInputTokens = ctx.tokens + Math.ceil(task.length / 4);
  const estOutputTokens = 600;
  const estCostUsd =
    (estInputTokens / 1_000_000) * model.inputPrice +
    (estOutputTokens / 1_000_000) * model.outputPrice;

  const run = useCallback(async () => {
    if (!apiKey) {
      setError("Paste your Anthropic API key above. It's stored locally only.");
      return;
    }
    if (!task.trim()) {
      setError("Describe a hypothetical task the agent might be asked to do.");
      return;
    }
    setRunning(true);
    setError(null);
    setResponse("");
    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "x-api-key": apiKey,
          "anthropic-version": "2023-06-01",
          "anthropic-dangerous-direct-browser-access": "true",
        },
        body: JSON.stringify({
          model: model.id,
          max_tokens: 1024,
          system: ctx.text,
          messages: [{ role: "user", content: task }],
        }),
      });
      if (!res.ok) {
        const errBody = await res.text();
        throw new Error(`${res.status} ${res.statusText}: ${errBody.slice(0, 200)}`);
      }
      const json = (await res.json()) as AnthropicMessage;
      const text = (json.content ?? [])
        .map((block) => (block.type === "text" ? block.text : ""))
        .join("");
      setResponse(text.trim());
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setRunning(false);
    }
  }, [apiKey, task, model, ctx.text]);

  const signals = useMemo(() => analyzeResponse(ctx, response), [ctx, response]);

  return (
    <div className="flex h-full flex-col gap-3 p-4">
      <div>
        <h3 className="text-sm font-semibold text-[color:var(--color-fg)]">
          Simulate how an agent reads this spec
        </h3>
        <p className="mt-0.5 text-xs text-[color:var(--color-fg-muted)]">
          Sends your spec + a hypothetical task directly to Anthropic. Your API key is kept in
          localStorage only — never sent to mdpact infrastructure.
        </p>
      </div>

      <div className="flex flex-col gap-2">
        <label className="flex flex-col gap-1 text-xs uppercase tracking-wider text-[color:var(--color-fg-muted)]">
          Model
          <select
            value={modelId}
            onChange={(e) => setModelId(e.target.value as ModelId)}
            className="rounded-md border border-[color:var(--color-line-strong)] bg-[color:var(--color-bg)] px-2 py-1.5 font-mono text-xs text-[color:var(--color-fg)] focus:border-[color:var(--color-accent)] focus:outline-none"
          >
            {MODELS.map((m) => (
              <option key={m.id} value={m.id}>
                {m.label}
              </option>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-1 text-xs uppercase tracking-wider text-[color:var(--color-fg-muted)]">
          Anthropic API key
          <input
            type="password"
            value={apiKey}
            onChange={(e) => saveKey(e.target.value)}
            placeholder="sk-ant-..."
            className="rounded-md border border-[color:var(--color-line-strong)] bg-[color:var(--color-bg)] px-2 py-1.5 font-mono text-xs text-[color:var(--color-fg)] focus:border-[color:var(--color-accent)] focus:outline-none"
            spellCheck={false}
            autoComplete="off"
          />
        </label>

        <label className="flex flex-col gap-1 text-xs uppercase tracking-wider text-[color:var(--color-fg-muted)]">
          Task
          <textarea
            value={task}
            onChange={(e) => saveTask(e.target.value)}
            rows={3}
            className="rounded-md border border-[color:var(--color-line-strong)] bg-[color:var(--color-bg)] px-2 py-1.5 font-mono text-xs text-[color:var(--color-fg)] focus:border-[color:var(--color-accent)] focus:outline-none"
            spellCheck={false}
          />
        </label>
      </div>

      <div className="flex items-center justify-between gap-2">
        <span className="font-mono text-xs text-[color:var(--color-fg-subtle)]">
          ~{estInputTokens.toLocaleString()} in + {estOutputTokens.toLocaleString()} out · est. $
          {estCostUsd.toFixed(4)}
        </span>
        <button
          type="button"
          disabled={running}
          onClick={run}
          className="rounded-md border border-[color:var(--color-accent)]/60 bg-[color:var(--color-accent)] px-4 py-1.5 text-xs font-medium uppercase tracking-wider text-[color:var(--color-bg)] transition hover:bg-[color:var(--color-accent-hot)] disabled:cursor-not-allowed disabled:opacity-50"
        >
          {running ? "running…" : "Run simulation"}
        </button>
      </div>

      {error && (
        <div className="rounded-[var(--radius)] border border-[color:var(--color-accent)]/50 bg-[color:var(--color-accent-soft)]/40 px-3 py-2 text-xs text-[color:var(--color-accent)]">
          {error}
        </div>
      )}

      {response && (
        <div className="flex min-h-0 flex-1 flex-col gap-3 overflow-auto">
          <div>
            <div className="mb-1 text-xs uppercase tracking-wider text-[color:var(--color-fg-muted)]">
              Agent response
            </div>
            <div className="whitespace-pre-wrap rounded-[var(--radius)] border border-[color:var(--color-line)] bg-[color:var(--color-bg)] p-3 text-sm leading-6 text-[color:var(--color-fg)]">
              {response}
            </div>
          </div>

          {signals.length > 0 && (
            <div>
              <div className="mb-1 text-xs uppercase tracking-wider text-[color:var(--color-fg-muted)]">
                Rule-adherence preview
                <span className="ml-2 normal-case tracking-normal text-[color:var(--color-fg-subtle)]">
                  heuristic — check the response yourself
                </span>
              </div>
              <ul className="flex flex-col gap-1.5">
                {signals.map((s, i) => (
                  <li
                    key={`${s.bindingId}-${i}`}
                    className="flex items-start gap-2 rounded-md border border-[color:var(--color-line)] bg-[color:var(--color-bg-alt)] px-3 py-2 text-xs"
                  >
                    <span
                      aria-hidden
                      className={`mt-0.5 h-1.5 w-1.5 shrink-0 rounded-full ${
                        s.verdict === "followed"
                          ? "bg-[#7dfaff]"
                          : s.verdict === "violated"
                            ? "bg-[color:var(--color-accent)]"
                            : "bg-[color:var(--color-fg-subtle)]"
                      }`}
                    />
                    <div className="flex flex-col gap-0.5">
                      <span className="text-[color:var(--color-fg)]">{s.bindingText}</span>
                      <span className="text-[color:var(--color-fg-subtle)]">{s.rationale}</span>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ---------- API types ----------

interface AnthropicMessage {
  content?: Array<{ type: string; text?: string }>;
}

// ---------- Rule-adherence heuristic ----------

interface Signal {
  bindingId: string;
  bindingText: string;
  verdict: "followed" | "violated" | "unclear";
  rationale: string;
}

/**
 * Heuristic adherence scoring — for each binding rule, check whether the
 * response text contains cues that the agent either followed or ignored it.
 * We stem to the verb+polarity; this is intentionally cheap and approximate.
 * The UI surfaces it as "heuristic — check the response yourself."
 */
function analyzeResponse(ctx: EditorTabContext, response: string): Signal[] {
  if (!response) return [];
  const lower = response.toLowerCase();
  return ctx.bindings.map((b) => {
    const text = b.text.toLowerCase();
    const hits = countOverlapWords(text, lower);
    if (hits < 2) {
      return {
        bindingId: b.id,
        bindingText: b.text,
        verdict: "unclear" as const,
        rationale: "Response doesn't clearly reference this rule.",
      };
    }
    const negated = /\b(don'?t|not|never|won'?t|refuse|decline)\b/.test(lower);
    const refusedAction = b.polarity === "negate" && negated;
    const followedAction = b.polarity === "affirm" && !negated;
    if (refusedAction || followedAction) {
      return {
        bindingId: b.id,
        bindingText: b.text,
        verdict: "followed" as const,
        rationale: "Response appears to respect this rule.",
      };
    }
    return {
      bindingId: b.id,
      bindingText: b.text,
      verdict: "violated" as const,
      rationale: "Response may contradict this rule — verify manually.",
    };
  });
}

function countOverlapWords(needle: string, haystack: string): number {
  const words = needle
    .split(/\W+/)
    .filter((w) => w.length > 3)
    .slice(0, 6);
  let count = 0;
  for (const w of words) if (haystack.includes(w)) count += 1;
  return count;
}
