import type { Heading, Root } from "mdast";
import { toString as mdToString } from "mdast-util-to-string";
import { visit } from "unist-util-visit";

import type { BindingKind, ExtractedRule, SourcePosition, SourceRange } from "./types.js";

interface RawPoint {
  line: number;
  column: number;
  offset?: number | undefined;
}

function makePos(file: string, p: RawPoint): SourcePosition {
  const pos: SourcePosition = { file, line: p.line, column: p.column };
  if (typeof p.offset === "number") pos.offset = p.offset;
  return pos;
}

const BINDING_CUES = [
  "always",
  "never",
  "must",
  "must not",
  "mustn't",
  "do not",
  "don't",
  "required",
  "required to",
  "shall",
  "shall not",
];

const ADVISORY_CUES = [
  "should",
  "should not",
  "shouldn't",
  "prefer",
  "prefer to",
  "try to",
  "consider",
  "when possible",
  "if possible",
  "avoid",
];

const EXCEPTION_CUES = ["unless", "except", "except when", "except if"];

const NEGATION_TOKENS = new Set([
  "not",
  "never",
  "don't",
  "do not",
  "mustn't",
  "must not",
  "shouldn't",
  "should not",
  "shall not",
  "avoid",
  "no",
]);

interface SentenceLoc {
  text: string;
  range: SourceRange;
  headingPath: string[];
}

export function extractRules(file: string, tree: Root): ExtractedRule[] {
  const sentences = collectSentences(file, tree);
  const out: ExtractedRule[] = [];

  sentences.forEach((s, idx) => {
    const kind = classify(s.text);
    if (kind === "informational") return;

    const { verb, object, polarity } = dissect(s.text);

    out.push({
      id: `${file}#${idx}`,
      kind,
      text: s.text.trim(),
      verb,
      object,
      polarity,
      headingPath: s.headingPath,
      range: s.range,
    });
  });

  return out;
}

function collectSentences(file: string, tree: Root): SentenceLoc[] {
  const sentences: SentenceLoc[] = [];
  const headingStack: { depth: number; text: string }[] = [];

  visit(tree, (node, _index, parent) => {
    if (node.type === "heading") {
      const h = node as Heading;
      const text = mdToString(h);
      while (headingStack.length && headingStack[headingStack.length - 1]!.depth >= h.depth) {
        headingStack.pop();
      }
      headingStack.push({ depth: h.depth, text });
      return;
    }

    if (node.type !== "paragraph" && node.type !== "listItem") return;

    // Avoid double-counting: when a paragraph is the direct child of a listItem,
    // we already pick up the text when visiting the listItem.
    if (node.type === "paragraph" && parent?.type === "listItem") return;

    const text = mdToString(node).trim();
    if (!text) return;

    const pos = node.position;
    if (!pos) return;

    const headingPath = headingStack.map((h) => h.text);

    for (const sentence of splitSentences(text)) {
      if (!sentence.trim()) continue;
      sentences.push({
        text: sentence,
        headingPath,
        range: {
          start: makePos(file, pos.start),
          end: makePos(file, pos.end),
        },
      });
    }
  });

  return sentences;
}

function splitSentences(text: string): string[] {
  return text
    .split(/(?<=[.!?])\s+(?=[A-Z])/)
    .map((s) => s.trim())
    .filter(Boolean);
}

function classify(text: string): BindingKind {
  const lower = text.toLowerCase();
  if (hasCue(lower, EXCEPTION_CUES)) return "exception";
  if (hasCue(lower, BINDING_CUES)) return "binding";
  if (hasCue(lower, ADVISORY_CUES)) return "advisory";
  return "informational";
}

function hasCue(lower: string, cues: string[]): boolean {
  return cues.some((cue) => {
    const pattern = new RegExp(`(?:^|\\W)${escapeRegex(cue)}(?:\\W|$)`, "i");
    return pattern.test(lower);
  });
}

function escapeRegex(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

interface Dissected {
  verb: string | null;
  object: string | null;
  polarity: "affirm" | "negate";
}

// Naive dissection: strip cue words, take the first verb-like token as verb and
// the remainder as object. Good enough to drive conflict/binding in M0.
// Full NLP pass lands in M1 when the extractor gets serious attention.
function dissect(text: string): Dissected {
  const tokens = text
    .toLowerCase()
    .replace(/[.!?,:;]/g, "")
    .split(/\s+/)
    .filter(Boolean);

  let polarity: "affirm" | "negate" = "affirm";

  const cleaned: string[] = [];
  for (let i = 0; i < tokens.length; i++) {
    const t = tokens[i]!;
    const twoWord = i < tokens.length - 1 ? `${t} ${tokens[i + 1]}` : "";

    if (NEGATION_TOKENS.has(twoWord)) {
      polarity = "negate";
      i++;
      continue;
    }
    if (NEGATION_TOKENS.has(t)) {
      polarity = "negate";
      continue;
    }
    if (isCueWord(t)) continue;
    cleaned.push(t);
  }

  if (cleaned.length === 0) return { verb: null, object: null, polarity };

  const verb = normalizeVerb(cleaned[0]!);
  const object = cleaned.slice(1).join(" ").trim() || null;
  return { verb, object, polarity };
}

function isCueWord(tok: string): boolean {
  return (
    BINDING_CUES.includes(tok) ||
    ADVISORY_CUES.includes(tok) ||
    EXCEPTION_CUES.includes(tok) ||
    tok === "you" ||
    tok === "we" ||
    tok === "the" ||
    tok === "a" ||
    tok === "an"
  );
}

function normalizeVerb(v: string): string {
  const stems: Record<string, string> = {
    uses: "use",
    using: "use",
    used: "use",
    commits: "commit",
    committing: "commit",
    committed: "commit",
    runs: "run",
    running: "run",
    ran: "run",
    deploys: "deploy",
    deploying: "deploy",
    deployed: "deploy",
    deletes: "delete",
    deleting: "delete",
    deleted: "delete",
    writes: "write",
    writing: "write",
    wrote: "write",
    reads: "read",
    reading: "read",
    pushes: "push",
    pushing: "push",
    pushed: "push",
  };
  return stems[v] ?? v;
}
