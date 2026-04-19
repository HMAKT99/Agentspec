import Link from "next/link";

export function Header() {
  return (
    <header className="border-b border-[color:var(--color-line)]">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-6">
        <Link href="/" className="flex items-center gap-2 font-semibold tracking-tight">
          <span
            aria-hidden
            className="inline-block h-5 w-5 rounded-[4px]"
            style={{ background: "var(--color-accent)" }}
          />
          mdpact
        </Link>
        <nav className="flex items-center gap-6 text-sm text-[color:var(--color-fg-muted)]">
          <Link href="/docs" className="hover:text-[color:var(--color-fg)]">
            Docs
          </Link>
          <Link href="/rules" className="hover:text-[color:var(--color-fg)]">
            Rules
          </Link>
          <Link href="/examples" className="hover:text-[color:var(--color-fg)]">
            Examples
          </Link>
          <Link href="/editor" className="hover:text-[color:var(--color-fg)]">
            Editor
          </Link>
          <Link href="/playground" className="hover:text-[color:var(--color-fg)]">
            Playground
          </Link>
          <a
            href="https://github.com/HMAKT99/Agentspec"
            className="hover:text-[color:var(--color-fg)]"
          >
            GitHub
          </a>
        </nav>
      </div>
    </header>
  );
}
