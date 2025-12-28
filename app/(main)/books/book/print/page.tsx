import { Suspense } from "react";
import BookPrintClient from "./BookPrintClient";

export const dynamic = "force-dynamic";

export default function BookPrintPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent" />
        </div>
      }
    >
      <BookPrintClient />
    </Suspense>
  );
}
