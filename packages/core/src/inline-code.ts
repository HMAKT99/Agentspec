import type { Heading, InlineCode, Parent, Root } from "mdast";
import { toString as mdToString } from "mdast-util-to-string";
import { visit } from "unist-util-visit";

import type { SourcePosition, SourceRange } from "./types.js";

export interface InlineCodeRef {
  text: string;
  range: SourceRange;
  headingPath: string[];
  surroundingText: string;
}

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

export function extractInlineCode(file: string, tree: Root): InlineCodeRef[] {
  const refs: InlineCodeRef[] = [];
  const headingStack: { depth: number; text: string }[] = [];
  const surroundStack: Parent[] = [];

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

    if (node.type === "paragraph" || node.type === "listItem") {
      surroundStack.push(node as Parent);
    }

    if (node.type === "inlineCode") {
      const ic = node as InlineCode;
      const pos = ic.position;
      if (!pos) return;

      const surroundingNode = surroundStack[surroundStack.length - 1] ?? parent;
      const surroundingText = surroundingNode ? mdToString(surroundingNode) : ic.value;

      refs.push({
        text: ic.value,
        range: {
          start: makePos(file, pos.start),
          end: makePos(file, pos.end),
        },
        headingPath: headingStack.map((h) => h.text),
        surroundingText,
      });
    }
  });

  return refs;
}
