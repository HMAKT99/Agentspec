export function TerminalDemo() {
  return (
    <section className="pb-20">
      <div className="rounded-[var(--radius)] border border-[color:var(--color-line)] bg-[color:var(--color-bg-alt)] font-mono text-sm">
        <div className="flex items-center gap-1.5 border-b border-[color:var(--color-line)] px-4 py-2.5">
          <span className="h-2.5 w-2.5 rounded-full bg-[color:var(--color-fg-subtle)] opacity-40" />
          <span className="h-2.5 w-2.5 rounded-full bg-[color:var(--color-fg-subtle)] opacity-40" />
          <span className="h-2.5 w-2.5 rounded-full bg-[color:var(--color-fg-subtle)] opacity-40" />
          <span className="ml-3 text-xs text-[color:var(--color-fg-subtle)]">~/acme/web $</span>
        </div>
        <pre className="overflow-x-auto px-5 py-5 leading-7">
          <code>
            {`$ mdpact lint CLAUDE.md

  13:1   error    conflict/binding         Binding rules contradict.
  41:3   warning  clarity/vague-directive  "best practices" — link the specific doc.
  58:1   warning  tokens/buried-rule       Rule sits past ~4000-token attention wall.

✖ 1 error, 2 warnings (14ms)`}
          </code>
        </pre>
      </div>
    </section>
  );
}
