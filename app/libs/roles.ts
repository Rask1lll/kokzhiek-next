import { UserData } from "@/app/types/user";

export type RoleAlias =
  | "admin"
  | "author"
  | "school_admin"
  | "teacher"
  | "student"
  | "moderator";

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

export function isModerator(user: UserData | null): boolean {
  return getUserRole(user) === "moderator";
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
  return hasRole(user, ["school_admin"]);
}

// Может видеть пользователей школы
export function canViewMembers(user: UserData | null): boolean {
  return hasRole(user, ["school_admin", "teacher"]);
}

// Может редактировать книги
export function canEditBooks(user: UserData | null): boolean {
  return hasRole(user, ["author"]);
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

// Dashboard разделы по ролям
export type DashboardSection =
  | "keys"
  | "members"
  | "stats"
  | "admin_users"
  | "admin_settings";

const SECTION_ACCESS: Record<DashboardSection, RoleAlias[]> = {
  keys: ["school_admin"],
  members: ["school_admin", "teacher"],
  stats: ["admin", "school_admin", "teacher"],
  admin_users: ["admin"],
  admin_settings: ["admin"],
};

export function canAccessSection(user: UserData | null, section: DashboardSection): boolean {
  const userRole = getUserRole(user);
  if (!userRole) return false;
  return SECTION_ACCESS[section].includes(userRole);
}

export function getAccessibleSections(user: UserData | null): DashboardSection[] {
  const userRole = getUserRole(user);
  if (!userRole) return [];

  return (Object.keys(SECTION_ACCESS) as DashboardSection[]).filter(
    (section) => SECTION_ACCESS[section].includes(userRole)
  );
}
