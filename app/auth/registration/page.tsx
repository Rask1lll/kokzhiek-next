"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { setToken } from "@/app/libs/auth";
import { useTranslations } from "next-intl";
import LanguageSwitcher from "@/app/components/navigation/LanguageSwitcher";

export default function RegisterPage() {
  const router = useRouter();
  const t = useTranslations("auth");
  const tCommon = useTranslations("common");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [registrationKey, setRegistrationKey] = useState("");
  const [publisher, setPublisher] = useState("");
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    setLoading(true);
    setError(null);
    setFieldErrors({});
    event.preventDefault();

    try {
      const userData = await fetch(
        `${process.env.NEXT_PUBLIC_SERVER_URL}/api/v1/register`,
        {
          method: "POST",
          headers: {
            Accept: "application/json",
            "Content-type": "application/json",
          },
          body: JSON.stringify({
            name: firstName,
            email,
            password,
            password_confirmation: confirmPassword,
            ...(registrationKey && { activation_key: registrationKey }),
          }),
        }
      );

      const res = await userData.json();

      if (!userData.ok) {
        if (res.errors) {
          setFieldErrors(res.errors);
        }
        if (res.message) {
          setError(res.message);
        } else {
          setError(tCommon("error"));
        }
        setLoading(false);
        return;
      }

      setToken(res.data.token);
      router.push("/books");
    } catch {
      setError(tCommon("error"));
      setLoading(false);
    }
  };

  const getInputClassName = (fieldName: string, hasRightPadding = false) => {
    const hasError = fieldErrors[fieldName];
    const baseClass = `w-full px-4 py-3 ${
      hasRightPadding ? "pr-12" : ""
    } border rounded-xl focus:ring-2 focus:border-transparent transition-all outline-none`;
    return hasError
      ? `${baseClass} border-red-500 focus:ring-red-500 bg-red-50`
      : `${baseClass} border-gray-300 focus:ring-indigo-500`;
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-indigo-600 via-sky-600 to-sky-800 flex items-center justify-center p-4 py-8">
      <div className="fixed top-4 right-4">
        <LanguageSwitcher />
      </div>

      <div className="w-full max-w-md">
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-white/20 backdrop-blur-lg text-white rounded-full mb-3 shadow-lg">
            <svg
              className="w-8 h-8"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
              />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-white mb-1 font-display">
            Көкжиек
          </h1>
        </div>

        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6 text-center">
            {t("register")}
          </h2>

          <form className="space-y-4" onSubmit={handleSubmit}>
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
                {error}
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  {t("name")}
                </label>
                <input
                  spellCheck
                  type="text"
                  className={`${getInputClassName("name")} text-sm`}
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                />
                {fieldErrors.name && (
                  <p className="mt-1.5 text-xs text-red-600">
                    {fieldErrors.name[0]}
                  </p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  {t("surname")}
                </label>
                <input
                  spellCheck
                  type="text"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all outline-none text-sm"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                {t("email")}
              </label>
              <input
                spellCheck
                type="email"
                placeholder="example@domain.com"
                className={getInputClassName("email")}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              {fieldErrors.email && (
                <p className="mt-1.5 text-xs text-red-600">
                  {fieldErrors.email[0]}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                {t("password")}
              </label>
              <div className="relative">
                <input
                  spellCheck
                  type={showPassword ? "text" : "password"}
                  className={getInputClassName("password", true)}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
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
              {fieldErrors.password && (
                <p className="mt-1.5 text-xs text-red-600">
                  {fieldErrors.password[0]}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                {t("confirmPassword")}
              </label>
              <div className="relative">
                <input
                  spellCheck
                  type={showConfirmPassword ? "text" : "password"}
                  className={getInputClassName("password_confirmation", true)}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
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
              {fieldErrors.password_confirmation && (
                <p className="mt-1.5 text-xs text-red-600">
                  {fieldErrors.password_confirmation[0]}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                {t("registrationKey")}{" "}
                <span className="text-gray-400 font-normal">
                  ({t("optional")})
                </span>
              </label>
              <input
                spellCheck
                type="text"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all outline-none"
                value={registrationKey}
                onChange={(e) => setRegistrationKey(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                {t("publisher")}{" "}
                <span className="text-gray-400 font-normal">
                  ({t("optional")})
                </span>
              </label>
              <div className="relative">
                <select
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all outline-none appearance-none bg-white cursor-pointer"
                  value={publisher}
                  onChange={(e) => setPublisher(e.target.value)}
                >
                  <option value="">{t("selectPublisher")}</option>
                  <option value="1">Атамұра</option>
                  <option value="2">Мектеп</option>
                  <option value="3">Алматыкітап баспасы</option>
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none text-gray-400">
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
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </div>
              </div>
            </div>

            <div className="flex items-start gap-3 pt-2">
              <input
                type="checkbox"
                id="terms"
                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded cursor-pointer mt-0.5"
                checked={acceptTerms}
                onChange={(e) => setAcceptTerms(e.target.checked)}
              />
              <label
                htmlFor="terms"
                className="text-sm text-gray-600 cursor-pointer leading-tight"
              >
                {t("acceptTerms")}
              </label>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-linear-to-r from-indigo-600 to-sky-600 text-white py-3.5 px-4 rounded-xl hover:from-indigo-700 hover:to-sky-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-all font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 mt-2 disabled:opacity-50"
            >
              {loading ? tCommon("loading") : t("register")}
            </button>

            <div className="relative my-4">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200"></div>
              </div>
            </div>

            <p className="text-center text-sm text-gray-600">
              {t("hasAccount")}{" "}
              <a
                href="/auth/login"
                className="font-semibold text-indigo-600 hover:text-indigo-800 transition-colors"
              >
                {t("login")}
              </a>
            </p>
          </form>
        </div>

        <p className="text-center text-sm text-white/70 mt-6">
          © 2024 Көкжиек-Горизонт
        </p>
      </div>
    </div>
  );
}
