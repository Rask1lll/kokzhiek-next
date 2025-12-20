import { Suspense } from "react";
import EditBookPageClient from "./EditBookPageClient";

export const dynamic = "force-dynamic";

function EditBookPageSkeleton() {
  return (
    <main className="min-h-screen bg-gray-50 px-4 py-6">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white rounded-xl shadow-md p-8 animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-6"></div>
          <div className="space-y-4">
            <div className="h-10 bg-gray-200 rounded"></div>
            <div className="h-10 bg-gray-200 rounded"></div>
            <div className="h-24 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    </main>
  );
}

export default function EditBookPage() {
  return (
    <Suspense fallback={<EditBookPageSkeleton />}>
      <EditBookPageClient />
    </Suspense>
  );
}
