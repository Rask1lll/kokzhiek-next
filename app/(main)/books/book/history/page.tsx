import { Suspense } from "react";
import BookHistoryClient, {
  BookHistorySkeleton,
} from "./BookHistoryClient";

export default function BookHistoryPage() {
  return (
    <Suspense fallback={<BookHistorySkeleton />}>
      <BookHistoryClient />
    </Suspense>
  );
}

