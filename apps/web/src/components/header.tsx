import Link from "next/link";

export function Header() {
  return (
    <header className="border-b border-[color:var(--color-line)]">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-6">
        <Link
          href="/"
          className="flex items-center gap-2 font-mono text-sm uppercase tracking-[0.2em]"
        >
          <span
            aria-hidden
            className="inline-block h-2.5 w-2.5 rounded-full"
            style={{
              background: "var(--color-accent)",
              boxShadow: "0 0 8px var(--color-accent)",
            }}
          />
          mdpact
        </Link>
        <nav className="flex items-center gap-5 text-xs uppercase tracking-wider text-[color:var(--color-fg-muted)]">
          <Link href="/docs" className="hover:text-[color:var(--color-accent)]">
            Docs
          </Link>
          <Link href="/rules" className="hover:text-[color:var(--color-accent)]">
            Rules
          </Link>
          <Link href="/examples" className="hover:text-[color:var(--color-accent)]">
            Examples
          </Link>
          <Link href="/editor" className="hover:text-[color:var(--color-accent)]">
            Editor
          </Link>
          <Link href="/playground" className="hover:text-[color:var(--color-accent)]">
            Playground
          </Link>
          <a
            href="https://github.com/HMAKT99/Agentspec"
            className="hover:text-[color:var(--color-accent)]"
          >
            GitHub
          </a>
        </nav>
      </div>
    </header>
  );
}
