import { Suspense } from "react";
import ChapterPageClient, { ChapterPageSkeleton } from "./ChapterPageClient";

export const dynamic = "force-dynamic";

export default function ChapterPage() {
  return (
    <Suspense fallback={<ChapterPageSkeleton />}>
      <ChapterPageClient />
    </Suspense>
  );
}
