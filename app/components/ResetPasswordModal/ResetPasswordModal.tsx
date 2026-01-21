"use client";

import { useState } from "react";
import { FiX, FiCheck, FiKey, FiEye, FiEyeOff } from "react-icons/fi";
import { useTranslations } from "next-intl";
import PasswordStrengthIndicator from "@/app/components/PasswordStrengthIndicator/PasswordStrengthIndicator";

type ResetPasswordModalProps = {
  isOpen: boolean;
  userName: string;
  userEmail: string;
  onClose: () => void;
  onSubmit: (password: string, confirmPassword: string) => Promise<{ success: boolean; message?: string }>;
  translationNamespace?: "membersPage" | "adminUsersPage";
};

export default function ResetPasswordModal({
  isOpen,
  userName,
  userEmail,
  onClose,
  onSubmit,
  translationNamespace = "membersPage",
}: ResetPasswordModalProps) {
  const t = useTranslations(translationNamespace);
  const tCommon = useTranslations("common");

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleClose = () => {
    setNewPassword("");
    setConfirmPassword("");
    setError("");
    onClose();
  };

  const handleSubmit = async () => {
    if (newPassword.length < 8) {
      setError(t("passwordTooShort"));
      return;
    }

    if (newPassword !== confirmPassword) {
      setError(t("passwordsDoNotMatch"));
      return;
    }

    setIsSubmitting(true);
    setError("");

    const result = await onSubmit(newPassword, confirmPassword);

    setIsSubmitting(false);

    if (result.success) {
      handleClose();
    } else {
      setError(result.message || t("resetPasswordError"));
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/50"
        onClick={handleClose}
      />
      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-md mx-4 p-6">
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 p-1 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
        >
          <FiX className="w-5 h-5" />
        </button>

        <div className="flex flex-col items-center mb-6">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center mb-4">
            <FiKey className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900">
            {t("resetPasswordTitle")}
          </h2>
          <p className="text-gray-500 text-center mt-1">
            {t("resetPasswordDescription", {
              name: userName || userEmail,
            })}
          </p>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t("newPassword")}
            </label>
            <div className="relative">
              <input
                type={showNewPassword ? "text" : "password"}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder={t("passwordPlaceholder")}
                className="w-full px-4 py-2.5 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              />
              <button
                type="button"
                onClick={() => setShowNewPassword(!showNewPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showNewPassword ? <FiEyeOff className="w-5 h-5" /> : <FiEye className="w-5 h-5" />}
              </button>
            </div>
            <PasswordStrengthIndicator password={newPassword} />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t("confirmPassword")}
            </label>
            <div className="relative">
              <input
                type={showConfirmPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder={t("confirmPasswordPlaceholder")}
                className="w-full px-4 py-2.5 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showConfirmPassword ? <FiEyeOff className="w-5 h-5" /> : <FiEye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {error && (
            <p className="text-sm text-red-600">{error}</p>
          )}
        </div>

        <div className="flex gap-3 mt-6">
          <button
            onClick={handleClose}
            className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            {tCommon("cancel")}
          </button>
          <button
            onClick={handleSubmit}
            disabled={isSubmitting || !newPassword || !confirmPassword}
            className="flex-1 px-4 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              tCommon("loading")
            ) : (
              <>
                <FiCheck className="w-4 h-4" />
                {tCommon("save")}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

