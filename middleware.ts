import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const AUTH_PAGES = ["/auth/login", "/auth/registration"];
const PUBLIC_PAGES = ["/", ...AUTH_PAGES];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get("token")?.value;

  const isAuthPage = AUTH_PAGES.some((page) => pathname.startsWith(page));
  const isPublicPage = PUBLIC_PAGES.some((page) => pathname === page || pathname.startsWith(page));

  // Авторизованный пользователь на странице авторизации -> редирект на /books
  if (token && isAuthPage) {
    console.log('qweqweqweqw');
    return NextResponse.redirect(new URL("/books", request.url));
  }

  // Неавторизованный пользователь на защищённой странице -> редирект на /auth/login
  if (!token && !isPublicPage) {
    return NextResponse.redirect(new URL("/auth/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)"],
};
