"use client";
import { usePathname } from "next/navigation";
import Navbar from "../components/navigation/Navigation";
import ModalWindow from "../components/ModalWindow/ModalWindow";
import ProtectorGuard from "../components/security/ProtectorGuard";
import ChapterHeader from "../components/chatpersPage/editChapter/Header";
import AlertContainer from "../components/Alert/AlertContainer";

export default function MainLayOut({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  if (pathname.startsWith("/books/book/chapter")) {
    return (
      <>
        <ModalWindow></ModalWindow>
        <ChapterHeader />
        <AlertContainer />
        {children}
      </>
    );
  }

  return (
    <>
      <ModalWindow></ModalWindow>
      <Navbar />
      <AlertContainer />
      <ProtectorGuard element={children} />
    </>
  );
}
