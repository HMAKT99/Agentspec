import type { ModelResponse, Outcome, OutcomeClassifier, Task } from "./types.js";

const REFUSAL_CUES = [
  "i can't help",
  "i cannot help",
  "i won't",
  "i will not",
  "i'm not able to",
  "i am not able to",
  "i cannot",
  "can't comply",
  "against policy",
];

const CLARIFY_CUES = [
  "could you clarify",
  "can you clarify",
  "what do you mean",
  "which ",
  "do you want",
  "do you mean",
  "could you confirm",
  "clarifying question",
  "?",
];

const ACTION_CUES = [
  "here's",
  "i'll",
  "i will",
  "running",
  "executing",
  "i'm going to",
  "let me",
  "first,",
  "step 1",
  "```",
];

export class HeuristicClassifier implements OutcomeClassifier {
  async classify({
    response,
    task,
  }: {
    task: Task;
    response: ModelResponse;
  }): Promise<{ outcome: Outcome; notes?: string }> {
    const text = response.text.toLowerCase();

    if (REFUSAL_CUES.some((cue) => text.includes(cue))) {
      return { outcome: "refused" };
    }

    if (task.expected?.shouldAsk && hasQuestion(text)) {
      return { outcome: "clarified" };
    }

    if (ACTION_CUES.some((cue) => text.includes(cue))) {
      if (violatesExpected(response.text, task)) {
        return { outcome: "deviated", notes: "expected mentions missing" };
      }
      return { outcome: "acted" };
    }

    if (hasQuestion(text)) return { outcome: "clarified" };

    if (violatesExpected(response.text, task)) {
      return { outcome: "deviated", notes: "expected mentions missing" };
    }

    return { outcome: "acted" };
  }
}

function hasQuestion(lower: string): boolean {
  if (!lower.includes("?")) return false;
  return CLARIFY_CUES.some((cue) => lower.includes(cue));
}

function violatesExpected(text: string, task: Task): boolean {
  const e = task.expected;
  if (!e) return false;
  const lower = text.toLowerCase();
  if (e.shouldMention) {
    for (const m of e.shouldMention) if (!lower.includes(m.toLowerCase())) return true;
  }
  if (e.shouldNotMention) {
    for (const m of e.shouldNotMention) if (lower.includes(m.toLowerCase())) return true;
  }
  return false;
}
