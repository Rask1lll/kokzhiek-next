"use client";
import { useAuth } from "@/app/hooks/useAuth";
import { useRouter } from "next/navigation";

export default function ProtectorGuard({
  element,
}: {
  element: React.ReactNode;
}) {
  const { user, loading } = useAuth();
  const router = useRouter();

  if (loading) return null;

  if (!user) {
    router.replace("/auth/login");
    return null;
  }

  return element;
}
