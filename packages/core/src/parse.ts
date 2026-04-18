import type { Root, Yaml } from "mdast";
import remarkFrontmatter from "remark-frontmatter";
import remarkParse from "remark-parse";
import { unified } from "unified";
import { parse as parseYaml } from "yaml";

import { extractRules } from "./extract.js";
import type { Frontmatter, ParsedSpec } from "./types.js";

const processor = unified().use(remarkParse).use(remarkFrontmatter, ["yaml"]);

export function parseSpec(file: string, raw: string): ParsedSpec {
  const tree = processor.parse(raw) as Root;
  const frontmatter = extractFrontmatter(tree);
  const extractedRules = extractRules(file, tree);
  const tokens = approxTokenCount(raw);

  return { file, raw, tree, frontmatter, extractedRules, tokens };
}

function extractFrontmatter(tree: Root): Frontmatter {
  const first = tree.children[0];
  if (!first || first.type !== "yaml") return {};
  const node = first as Yaml;
  try {
    const parsed = parseYaml(node.value);
    if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
      return parsed as Frontmatter;
    }
    return {};
  } catch {
    return {};
  }
}

// Placeholder token counter — 4 chars per token is a rough heuristic that holds
// within ~15% for English prose. Real tokenizer lands with the engine in M2.
function approxTokenCount(text: string): number {
  return Math.ceil(text.length / 4);
}
