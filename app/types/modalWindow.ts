import type { ReactNode } from "react";

export type ModalWindowType = {
  addContent: (content: ReactNode) => void;
  removeContent: () => void;
  content: React.ReactNode | null;
};
