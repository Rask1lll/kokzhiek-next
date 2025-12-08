import { Suspense } from "react";
import BookPageClient, { BookPageSkeleton } from "./BookPageClient";

export const dynamic = "force-dynamic";

export default function BookPage() {
  return (
    <Suspense fallback={<BookPageSkeleton />}>
      <BookPageClient />
    </Suspense>
  );
}
