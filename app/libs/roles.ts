import { UserData } from "@/app/types/user";

export type RoleAlias =
  | "admin"
  | "author"
  | "school_admin"
  | "teacher"
  | "student";

export function getUserRole(user: UserData | null): RoleAlias | null {
  return (user?.role?.alias as RoleAlias) || null;
}

export function isAdmin(user: UserData | null): boolean {
  return getUserRole(user) === "admin";
}

export function isAuthor(user: UserData | null): boolean {
  return getUserRole(user) === "author";
}

export function isSchool(user: UserData | null): boolean {
  return getUserRole(user) === "school_admin";
}

export function isTeacher(user: UserData | null): boolean {
  return getUserRole(user) === "teacher";
}

export function isStudent(user: UserData | null): boolean {
  return getUserRole(user) === "student";
}

// Проверка нескольких ролей
export function hasRole(user: UserData | null, roles: RoleAlias[]): boolean {
  const userRole = getUserRole(user);
  return userRole !== null && roles.includes(userRole);
}

// Может создавать книги
export function canCreateBooks(user: UserData | null): boolean {
  return isAuthor(user);
}

// Может управлять ключами
export function canManageKeys(user: UserData | null): boolean {
  return hasRole(user, ["school_admin", "teacher"]);
}

// Может видеть пользователей школы
export function canViewMembers(user: UserData | null): boolean {
  return hasRole(user, ["school_admin", "teacher"]);
}

// Может редактировать книги
export function canEditBooks(user: UserData | null): boolean {
  return isAuthor(user);
}

// Получить отображаемое имя роли
export function getRoleLabel(user: UserData | null): string {
  const roleData = user?.role;
  if (!roleData) return "Пользователь";

  if (typeof roleData === "object" && roleData !== null) {
    return roleData.label || roleData.name || "Пользователь";
  }

  return String(roleData) || "Пользователь";
}
