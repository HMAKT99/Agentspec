export function Footer() {
  return (
    <footer className="border-t border-[color:var(--color-line)]">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-6 py-10 text-sm text-[color:var(--color-fg-muted)] sm:flex-row sm:items-center sm:justify-between">
        <div>
          <span className="font-semibold text-[color:var(--color-fg)]">agentspec</span>
          <span className="ml-2">
            — MIT licensed. Your spec never leaves your machine unless you run `agentspec test`.
          </span>
        </div>
        <div className="flex gap-5">
          <a
            href="https://github.com/HMAKT99/Agentspec"
            className="hover:text-[color:var(--color-fg)]"
          >
            GitHub
          </a>
          <a href="/docs" className="hover:text-[color:var(--color-fg)]">
            Docs
          </a>
          <a
            href="https://github.com/HMAKT99/Agentspec/issues"
            className="hover:text-[color:var(--color-fg)]"
          >
            Issues
          </a>
        </div>
      </div>
    </footer>
  );
}
