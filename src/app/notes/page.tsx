import type { Metadata } from "next";

import { NotesExplorer, type ExplorerNoteSection } from "@/components/NotesExplorer";
import { getNoteSearchBlob, getNoteSections } from "@/content/notes/loader";

export const metadata: Metadata = {
  title: "Конспект",
  description:
    "Стислий іспитовий конспект з неврології для КРОК 3: ключові теми, топіка, маркери тестів і типові пастки."
};

export const dynamic = "force-static";

export default function NotesPage() {
  const sections: ExplorerNoteSection[] = getNoteSections().map((section) => ({
    ...section,
    search: getNoteSearchBlob(section)
  }));

  return <NotesExplorer sections={sections} />;
}
