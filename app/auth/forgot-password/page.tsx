"use client";

import Loading from "@/app/components/Loading/Loading";
import LanguageSwitcher from "@/app/components/navigation/LanguageSwitcher";
import PasswordStrengthIndicator from "@/app/components/PasswordStrengthIndicator/PasswordStrengthIndicator";
import {
  handleSendResetCode,
  handleResetPassword,
  handleVerifyResetCode,
} from "@/app/services/authorization/authApi";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { FormEvent, useState, useRef, useEffect, useCallback } from "react";

type Step = "email" | "code" | "password" | "success";

export default function ForgotPasswordPage() {
  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState(["", "", "", "", "", ""]);
  const [resetToken, setResetToken] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [resendCountdown, setResendCountdown] = useState(0);
  const [resendLoading, setResendLoading] = useState(false);
  const codeInputsRef = useRef<(HTMLInputElement | null)[]>([]);
  const t = useTranslations("auth");
  const tCommon = useTranslations("common");

  // Countdown timer effect
  useEffect(() => {
    if (resendCountdown <= 0) return;

    const timer = setInterval(() => {
      setResendCountdown((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [resendCountdown]);

  const startResendCountdown = useCallback(() => {
    setResendCountdown(60);
  }, []);

  const handleResendCode = async () => {
    setResendLoading(true);
    setError("");

    try {
      const result = await handleSendResetCode(email);

      if (result.success) {
        startResendCountdown();
        setCode(["", "", "", "", "", ""]);
      } else {
        setError(result.message || tCommon("error"));
      }
    } catch {
      setError(tCommon("error"));
    } finally {
      setResendLoading(false);
    }
  };

  const handleEmailSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      const result = await handleSendResetCode(email);

      if (result.success) {
        setStep("code");
        startResendCountdown();
      } else {
        setError(result.message || tCommon("error"));
      }
    } catch {
      setError(tCommon("error"));
    } finally {
      setLoading(false);
    }
  };

  const handleCodeChange = (index: number, value: string) => {
    if (value.length > 1) {
      value = value.slice(-1);
    }

    if (!/^\d*$/.test(value)) return;

    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);

    if (value && index < 5) {
      codeInputsRef.current[index + 1]?.focus();
    }
  };

  const handleCodeKeyDown = (
    index: number,
    e: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (e.key === "Backspace" && !code[index] && index > 0) {
      codeInputsRef.current[index - 1]?.focus();
    }
  };

  const handleCodePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (pastedData) {
      const newCode = [...code];
      for (let i = 0; i < pastedData.length && i < 6; i++) {
        newCode[i] = pastedData[i];
      }
      setCode(newCode);
      const nextIndex = Math.min(pastedData.length, 5);
      codeInputsRef.current[nextIndex]?.focus();
    }
  };

  const handleCodeSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const fullCode = code.join("");
    
    if (fullCode.length !== 6) {
      setError(t("enterFullCode"));
      return;
    }

    setError("");
    setLoading(true);

    try {
      const result = await handleVerifyResetCode(email, fullCode);

      if (result.success && result.token) {
        setResetToken(result.token);
        setStep("password");
      } else {
        setError(result.message || t("invalidCode"));
      }
    } catch {
      setError(tCommon("error"));
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError(t("passwordsDoNotMatch"));
      return;
    }

    if (password.length < 8) {
      setError(t("passwordTooShort"));
      return;
    }

    setLoading(true);

    try {
      const result = await handleResetPassword(
        email,
        resetToken,
        password,
        confirmPassword
      );

      if (result.success) {
        setStep("success");
      } else {
        setError(result.message || tCommon("error"));
      }
    } catch {
      setError(tCommon("error"));
    } finally {
      setLoading(false);
    }
  };

  const renderStepIndicator = () => {
    const steps = ["email", "code", "password"];
    const currentIndex = steps.indexOf(step);

    return (
      <div className="flex items-center justify-center gap-2 mb-6">
        {steps.map((s, index) => (
          <div key={s} className="flex items-center">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${
                index <= currentIndex
                  ? "bg-indigo-600 text-white"
                  : "bg-gray-200 text-gray-500"
              }`}
            >
              {index + 1}
            </div>
            {index < steps.length - 1 && (
              <div
                className={`w-8 h-0.5 mx-1 transition-colors ${
                  index < currentIndex ? "bg-indigo-600" : "bg-gray-200"
                }`}
              />
            )}
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-indigo-600 via-sky-600 to-sky-800 flex items-center justify-center p-4">
      <div className="fixed top-4 right-4">
        <LanguageSwitcher />
      </div>

      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-white/20 backdrop-blur-lg text-white rounded-full mb-4 shadow-lg">
            <svg
              className="w-10 h-10"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"
              />
            </svg>
          </div>
          <h1 className="text-4xl font-bold text-white mb-2 font-display">
            Көкжиек
          </h1>
        </div>

        <div className="bg-white rounded-2xl shadow-2xl p-8">
          {step === "success" ? (
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-8 h-8 text-green-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                {t("passwordResetSuccess")}
              </h2>
              <p className="text-gray-600 mb-6">
                {t("passwordResetSuccessDescription")}
              </p>
              <Link
                href="/auth/login"
                className="inline-flex items-center justify-center w-full bg-linear-to-r from-indigo-600 to-sky-600 text-white py-3 px-4 rounded-xl hover:from-indigo-700 hover:to-sky-700 transition-all font-semibold"
              >
                {t("login")}
              </Link>
            </div>
          ) : (
            <>
              {renderStepIndicator()}

              {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
                  {error}
                </div>
              )}

              {step === "email" && (
                <>
                  <h2 className="text-2xl font-semibold text-gray-900 mb-2 text-center">
                    {t("forgotPasswordTitle")}
                  </h2>
                  <p className="text-gray-500 text-center mb-6">
                    {t("forgotPasswordDescription")}
                  </p>

                  <form className="space-y-5" onSubmit={handleEmailSubmit}>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">
                        {t("email")}
                      </label>
                      <input
                        spellCheck={true}
                        type="email"
                        placeholder="example@domain.com"
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all outline-none"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                      />
                    </div>

                    <button
                      type="submit"
                      className="w-full bg-linear-to-r flex justify-center from-indigo-600 to-sky-600 text-white py-3.5 px-4 rounded-xl hover:from-indigo-700 hover:to-sky-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-all font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                      disabled={loading}
                    >
                      {loading ? (
                        <div className="w-6">
                          <Loading />
                        </div>
                      ) : (
                        t("sendCode")
                      )}
                    </button>
                  </form>
                </>
              )}

              {step === "code" && (
                <>
                  <h2 className="text-2xl font-semibold text-gray-900 mb-2 text-center">
                    {t("enterCode")}
                  </h2>
                  <p className="text-gray-500 text-center mb-6">
                    {t("codeSentTo")} <span className="font-medium text-gray-700">{email}</span>
                  </p>

                  <form className="space-y-5" onSubmit={handleCodeSubmit}>
                    <div className="flex justify-center gap-2" onPaste={handleCodePaste}>
                      {code.map((digit, index) => (
                        <input
                          key={index}
                          ref={(el) => { codeInputsRef.current[index] = el; }}
                          type="text"
                          inputMode="numeric"
                          maxLength={1}
                          value={digit}
                          onChange={(e) => handleCodeChange(index, e.target.value)}
                          onKeyDown={(e) => handleCodeKeyDown(index, e)}
                          className="w-12 h-14 text-center text-2xl font-semibold border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all outline-none"
                        />
                      ))}
                    </div>

                    <button
                      type="submit"
                      className="w-full bg-linear-to-r flex justify-center from-indigo-600 to-sky-600 text-white py-3.5 px-4 rounded-xl hover:from-indigo-700 hover:to-sky-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-all font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                      disabled={code.join("").length !== 6 || loading}
                    >
                      {loading ? (
                        <div className="w-6">
                          <Loading />
                        </div>
                      ) : (
                        t("verifyCode")
                      )}
                    </button>

                    <div className="flex items-center justify-center gap-1 text-sm">
                      {resendCountdown > 0 ? (
                        <span className="text-gray-500">
                          {t("resendCodeIn", { seconds: resendCountdown })}
                        </span>
                      ) : (
                        <button
                          type="button"
                          onClick={handleResendCode}
                          disabled={resendLoading}
                          className="text-indigo-600 hover:text-indigo-800 font-medium transition-colors disabled:opacity-50"
                        >
                          {resendLoading ? tCommon("loading") : t("resendCode")}
                        </button>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={() => setStep("email")}
                      className="w-full text-sm text-gray-500 hover:text-gray-700 transition-colors"
                    >
                      {t("changeEmail")}
                    </button>
                  </form>
                </>
              )}

              {step === "password" && (
                <>
                  <h2 className="text-2xl font-semibold text-gray-900 mb-2 text-center">
                    {t("resetPasswordTitle")}
                  </h2>
                  <p className="text-gray-500 text-center mb-6">
                    {t("resetPasswordDescription")}
                  </p>

                  <form className="space-y-4" onSubmit={handlePasswordSubmit}>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">
                        {t("newPassword")}
                      </label>
                      <div className="relative">
                        <input
                          spellCheck={true}
                          type={showPassword ? "text" : "password"}
                          placeholder="••••••••"
                          className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all outline-none"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          required
                        />
                        <button
                          type="button"
                          className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                          onClick={() => setShowPassword((prev) => !prev)}
                        >
                          <svg
                            className="h-5 w-5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                            />
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                            />
                          </svg>
                        </button>
                      </div>
                      <PasswordStrengthIndicator password={password} />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">
                        {t("confirmPassword")}
                      </label>
                      <div className="relative">
                        <input
                          spellCheck={true}
                          type={showConfirmPassword ? "text" : "password"}
                          placeholder="••••••••"
                          className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all outline-none"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          required
                        />
                        <button
                          type="button"
                          className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                          onClick={() => setShowConfirmPassword((prev) => !prev)}
                        >
                          <svg
                            className="h-5 w-5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                            />
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                            />
                          </svg>
                        </button>
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="w-full bg-linear-to-r flex justify-center from-indigo-600 to-sky-600 text-white py-3.5 px-4 rounded-xl hover:from-indigo-700 hover:to-sky-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-all font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 mt-2"
                      disabled={loading}
                    >
                      {loading ? (
                        <div className="w-6">
                          <Loading />
                        </div>
                      ) : (
                        t("resetPassword")
                      )}
                    </button>
                  </form>
                </>
              )}

              <p className="text-center text-sm text-gray-600 mt-6">
                <Link
                  href="/auth/login"
                  className="font-semibold text-indigo-600 hover:text-indigo-800 transition-colors"
                >
                  {t("backToLogin")}
                </Link>
              </p>
            </>
          )}
        </div>

        <p className="text-center text-sm text-white/70 mt-8">
          © 2024 Көкжиек-Горизонт
        </p>
      </div>
    </div>
  );
}
