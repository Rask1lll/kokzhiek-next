"use client";
import { usePathname } from "next/navigation";
import Navbar from "../components/navigation/Navigation";

export default function MainLayOut({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  if (pathname.startsWith("/books/chapter")) {
    return children;
  }

  return (
    <>
      <Navbar />
      {children}
    </>
  );
}
