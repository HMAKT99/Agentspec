import { DOCS_NAV } from "@/lib/docs-nav";
import Link from "next/link";
import type { ReactNode } from "react";
import { Footer } from "./footer";
import { Header } from "./header";

interface Props {
  slug: string;
  title: string;
  children: ReactNode;
}

export function DocsLayout({ slug, title, children }: Props) {
  return (
    <>
      <Header />
      <div className="mx-auto grid max-w-6xl grid-cols-1 gap-10 px-6 py-10 lg:grid-cols-[220px_minmax(0,1fr)]">
        <aside className="top-20 hidden h-fit self-start lg:sticky lg:block">
          <nav className="flex flex-col gap-6 text-sm">
            {DOCS_NAV.map((group) => (
              <div key={group.label}>
                <div className="mb-2 text-xs font-medium uppercase tracking-wider text-[color:var(--color-fg-subtle)]">
                  {group.label}
                </div>
                <ul className="flex flex-col gap-1.5">
                  {group.items.map((item) => {
                    const active = item.slug === slug;
                    return (
                      <li key={item.slug}>
                        <Link
                          href={`/docs/${item.slug}`}
                          className={`block rounded-md px-2 py-1 ${
                            active
                              ? "bg-[color:var(--color-bg-alt)] font-medium text-[color:var(--color-fg)]"
                              : "text-[color:var(--color-fg-muted)] hover:text-[color:var(--color-fg)]"
                          }`}
                        >
                          {item.title}
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}
          </nav>
        </aside>

        <main className="min-w-0">
          <header className="mb-8">
            <h1 className="text-3xl font-semibold tracking-tight">{title}</h1>
          </header>
          <article className="rule-prose">{children}</article>
        </main>
      </div>
      <Footer />
    </>
  );
}
