"use client";

import Loading from "@/app/components/Loading/Loading";
import LanguageSwitcher from "@/app/components/navigation/LanguageSwitcher";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const router = useRouter();

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");

    const data = {
      email,
      password,
      rememberMe,
    };
    setLoading(true);

    const reqData = JSON.stringify({
      email: data.email,
      password: data.password,
    });

    try {
      const userData = await fetch(
        `${process.env.NEXT_PUBLIC_SERVER_URL}/api/v1/login`,
        {
          method: "POST",
          headers: {
            "Content-type": "application/json",
            Accept: "application/json",
          },
          body: reqData,
        }
      );
      const userRes = await userData.json();

      if (!userData.ok || userRes.message) {
        // Обработка ошибок от сервера
        const errorMessage =
          userRes.message ||
          userRes.errors?.email?.[0] ||
          "Произошла ошибка при входе";
        setError(errorMessage);
        setLoading(false);
        return;
      }

      if (userRes.data?.token) {
        localStorage.setItem("token", userRes.data.token);
        console.log(userRes);
        router.push("/books");
      } else {
        setError("Неверные учетные данные");
        setLoading(false);
      }
    } catch (e) {
      console.error(e);
      setError("Произошла ошибка при подключении к серверу");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-indigo-600 via-sky-600 to-sky-800 flex items-center justify-center p-4">
      <div className="fixed top-4 right-4">
        <LanguageSwitcher />
      </div>

      <div className="w-full max-w-md">
        {/* Логотип и заголовок */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-white/20 backdrop-blur-lg text-white rounded-full mb-4 shadow-lg">
            {/* Иконка книги */}
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
                d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
              />
            </svg>
          </div>
          <h1 className="text-4xl font-bold text-white mb-2 font-display">
            Көкжиек
          </h1>
          <p className="text-white/90">Образовательная платформа</p>
        </div>

        {/* Карточка входа */}
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6 text-center">
            Вход в систему
          </h2>

          {/* Блок ошибки */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
              {error}
            </div>
          )}

          <form className="space-y-5" onSubmit={handleSubmit}>
            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Электронная почта
              </label>
              <input
                type="email"
                placeholder="example@domain.com"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all outline-none"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            {/* Пароль */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Пароль
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Введите пароль"
                  className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all outline-none"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                  onClick={() => setShowPassword((prev) => !prev)}
                >
                  {/* Иконка глаза */}
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

            {/* Запомнить меня и Забыли пароль */}
            <div className="flex items-center justify-between">
              <label className="flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded cursor-pointer"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                />
                <span className="ml-2 text-sm text-gray-600">
                  Запомнить меня
                </span>
              </label>
              <a
                href="/forgot-password"
                className="text-sm text-indigo-600 hover:text-indigo-800 font-medium transition-colors"
              >
                Забыли пароль?
              </a>
            </div>

            {/* Кнопка входа */}
            <button
              type="submit"
              className={`w-full bg-linear-to-r flex justify-center from-indigo-600 to-sky-600 text-white py-3.5 px-4 rounded-xl hover:from-indigo-700 hover:to-sky-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-all font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5`}
              disabled={loading}
            >
              {loading ? (
                <div className="w-6">
                  <Loading />
                </div>
              ) : (
                "Войти"
              )}
            </button>

            {/* Разделитель */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white text-gray-500">или</span>
              </div>
            </div>

            {/* Ссылка на регистрацию */}
            <p className="text-center text-sm text-gray-600">
              Нет аккаунта?{" "}
              <Link
                href="/auth/registration"
                className="font-semibold text-indigo-600 hover:text-indigo-800 transition-colors"
              >
                Зарегистрироваться
              </Link>
            </p>
          </form>
        </div>

        {/* Copyright */}
        <p className="text-center text-sm text-white/70 mt-8">
          © 2024 Көкжиек-Горизонт. Все права защищены.
        </p>
      </div>
    </div>
  );
}
