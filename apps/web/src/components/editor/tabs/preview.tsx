"use client";

import { renderMarkdown } from "@/lib/markdown";
import { useEffect, useState } from "react";
import type { EditorTabContext } from "../types";

interface Props {
  ctx: EditorTabContext;
}

export function PreviewTab({ ctx }: Props) {
  const [html, setHtml] = useState<string>("");

  useEffect(() => {
    let cancelled = false;
    renderMarkdown(ctx.text).then((out) => {
      if (!cancelled) setHtml(out);
    });
    return () => {
      cancelled = true;
    };
  }, [ctx.text]);

  return (
    <div className="p-6">
      {html ? (
        <article
          className="rule-prose"
          // biome-ignore lint/security/noDangerouslySetInnerHtml: markdown is user-owned client-side and piped through remark-rehype
          dangerouslySetInnerHTML={{ __html: html }}
        />
      ) : (
        <div className="text-sm text-[color:var(--color-fg-muted)]">Rendering…</div>
      )}
    </div>
  );
}
