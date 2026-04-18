import { DocsLayout } from "@/components/docs-layout";
import { getDocContent } from "@/lib/docs-content";
import { allSlugs, getNavItem } from "@/lib/docs-nav";
import { renderMarkdown } from "@/lib/markdown";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

interface PageParams {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return allSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: PageParams): Promise<Metadata> {
  const { slug } = await params;
  const nav = getNavItem(slug);
  return {
    title: nav?.title ?? "Docs",
    description: nav?.description,
  };
}

export default async function DocsPage({ params }: PageParams) {
  const { slug } = await params;
  const nav = getNavItem(slug);
  const body = getDocContent(slug);
  if (!nav || !body) notFound();

  const html = await renderMarkdown(body);

  return (
    <DocsLayout slug={slug} title={nav.title}>
      {/* biome-ignore lint/security/noDangerouslySetInnerHtml: content is project-authored and piped through remark-rehype */}
      <div dangerouslySetInnerHTML={{ __html: html }} />
    </DocsLayout>
  );
}
