import type { Metadata } from "next";

import { NoteReader } from "@/components/NoteReader";
import { getAvailableNoteSections, getNoteBlockBySlug, getNoteSections } from "@/content/notes/loader";

interface NotePageProps {
  params: Promise<{ slug: string }>;
}

export const dynamic = "force-static";

export function generateStaticParams() {
  return getAvailableNoteSections().map((section) => ({ slug: section.slug }));
}

export async function generateMetadata({ params }: NotePageProps): Promise<Metadata> {
  const { slug } = await params;
  const { section, block } = getNoteBlockBySlug(slug);

  return {
    title: section.title,
    description: block.summary
  };
}

export default async function NotePage({ params }: NotePageProps) {
  const { slug } = await params;
  const { section, block } = getNoteBlockBySlug(slug);

  return <NoteReader block={block} section={section} sections={getNoteSections()} />;
}
