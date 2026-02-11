"use client";

import { useState, useEffect, useCallback } from "react";
import { FiX, FiUserPlus, FiUsers } from "react-icons/fi";
import { useTranslations } from "next-intl";
import { Collaborator } from "@/app/types/book";
import {
  handleGetCollaborators,
  handleAddCollaborator,
  handleRemoveCollaborator,
} from "@/app/services/book/collaboratorsApi";

type CollaboratorsSectionProps = {
  bookId: number;
  isOwner: boolean;
};

export default function CollaboratorsSection({
  bookId,
  isOwner,
}: CollaboratorsSectionProps) {
  const t = useTranslations("collaborators");
  const [collaborators, setCollaborators] = useState<Collaborator[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [email, setEmail] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCollaborators = useCallback(async () => {
    const result = await handleGetCollaborators(bookId);
    if (result.success) {
      setCollaborators(result.data);
    }
  }, [bookId]);

  useEffect(() => {
    fetchCollaborators();
  }, [fetchCollaborators]);

  const handleAdd = async () => {
    if (!email.trim()) return;
    setIsAdding(true);
    setError(null);

    const result = await handleAddCollaborator(bookId, email.trim());
    setIsAdding(false);

    if (result.success) {
      setEmail("");
      await fetchCollaborators();
    } else {
      setError(result.message);
    }
  };

  const handleRemove = async (userId: number) => {
    const result = await handleRemoveCollaborator(bookId, userId);
    if (result.success) {
      setCollaborators((prev) => prev.filter((c) => c.id !== userId));
    }
  };

  if (!isOwner) return null;

  return (
    <>
      {/* Inline: список соавторов + кнопка управления */}
      <div className="flex flex-wrap items-center gap-2 mt-2">
        {collaborators.length > 0 && (
          <>
            <FiUsers className="w-4 h-4 text-gray-500" />
            {collaborators.map((c) => (
              <span
                key={c.id}
                title={`${c.name}\n${c.email}`}
                className="group relative inline-flex items-center rounded-full bg-blue-50 text-blue-700 px-3 py-1 text-xs md:text-sm cursor-default"
              >
                {c.name}
                <div className="pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block z-10">
                  <div className="bg-gray-900 text-white text-xs rounded-lg px-3 py-2 shadow-lg whitespace-nowrap">
                    <div className="font-medium">{c.name}</div>
                    <div className="text-gray-300">{c.email}</div>
                  </div>
                  <div className="w-2 h-2 bg-gray-900 rotate-45 mx-auto -mt-1" />
                </div>
              </span>
            ))}
          </>
        )}

        <button
          onClick={() => setShowModal(true)}
          className="inline-flex items-center gap-1 px-3 py-1 text-xs md:text-sm font-medium text-gray-600 border border-gray-300 rounded-full hover:bg-gray-100 transition-colors"
        >
          <FiUserPlus className="w-3.5 h-3.5" />
          {t("title")}
        </button>
      </div>

      {/* Модалка управления соавторами */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setShowModal(false)}
          />
          <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-md mx-4 p-6">
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-4 right-4 p-1 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
            >
              <FiX className="w-5 h-5" />
            </button>

            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <FiUsers className="w-5 h-5" />
              {t("title")}
            </h2>

            {/* Список */}
            {collaborators.length > 0 ? (
              <ul className="space-y-2 mb-4">
                {collaborators.map((c) => (
                  <li
                    key={c.id}
                    className="flex items-center justify-between py-2 px-3 bg-gray-50 rounded-lg"
                  >
                    <div className="text-sm">
                      <span className="font-medium text-gray-800">
                        {c.name}
                      </span>
                      <span className="text-gray-400 ml-2">{c.email}</span>
                    </div>
                    <button
                      onClick={() => handleRemove(c.id)}
                      className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                    >
                      <FiX className="w-4 h-4" />
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-gray-400 mb-4">{t("empty")}</p>
            )}

            {/* Добавить */}
            <div className="flex gap-2">
              <input
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setError(null);
                }}
                placeholder={t("emailPlaceholder")}
                className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                onKeyDown={(e) => e.key === "Enter" && handleAdd()}
              />
              <button
                onClick={handleAdd}
                disabled={isAdding || !email.trim()}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
              >
                <FiUserPlus className="w-4 h-4" />
                {t("add")}
              </button>
            </div>

            {error && <p className="mt-2 text-sm text-red-500">{error}</p>}
          </div>
        </div>
      )}
    </>
  );
}
