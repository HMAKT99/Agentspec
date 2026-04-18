export interface DocsNavItem {
  slug: string;
  title: string;
  description?: string;
}

export interface DocsNavGroup {
  label: string;
  items: DocsNavItem[];
}

export const DOCS_NAV: DocsNavGroup[] = [
  {
    label: "Introduction",
    items: [
      {
        slug: "getting-started",
        title: "Getting started",
        description: "Install → first passing lint in 5 minutes",
      },
    ],
  },
  {
    label: "Reference",
    items: [
      { slug: "cli", title: "CLI reference" },
      { slug: "config", title: "Configuration" },
      { slug: "engine", title: "Behavior engine" },
      { slug: "action", title: "GitHub Action" },
    ],
  },
];

export function allSlugs(): string[] {
  return DOCS_NAV.flatMap((g) => g.items.map((i) => i.slug));
}

export function getNavItem(slug: string): DocsNavItem | null {
  for (const g of DOCS_NAV) {
    const item = g.items.find((i) => i.slug === slug);
    if (item) return item;
  }
  return null;
}
