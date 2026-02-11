import { UserData } from "@/app/types/user";
import { RoleAlias, getUserRole, hasRole, isAuthor } from "./roles";

export function canCreateBooks(user: UserData | null): boolean {
  return isAuthor(user);
}

export function canManageKeys(user: UserData | null): boolean {
  return hasRole(user, ["school_admin"]);
}

export function canViewMembers(user: UserData | null): boolean {
  return hasRole(user, ["school_admin", "teacher"]);
}

export function canEditBooks(user: UserData | null): boolean {
  return hasRole(user, ["author"]);
}

// Проверяет что пользователь — владелец книги
export function isBookOwner(user: UserData | null, bookCreatedBy?: number): boolean {
  if (!user || bookCreatedBy === undefined) return false;
  return isAuthor(user) && user.id === bookCreatedBy;
}

// Проверяет что пользователь может редактировать конкретную книгу
// (владелец ИЛИ соавтор)
export function canEditBook(
  user: UserData | null,
  bookCreatedBy?: number,
  collaboratorIds?: number[]
): boolean {
  if (!user) return false;
  if (isBookOwner(user, bookCreatedBy)) return true;
  if (collaboratorIds && collaboratorIds.includes(user.id)) return true;
  return false;
}

export function canAccessDashboard(user: UserData | null): boolean {
  return hasRole(user, ["admin", "school_admin", "teacher"]);
}

export type DashboardSection =
  | "keys"
  | "members"
  | "stats"
  | "admin_users"
  | "admin_settings";

const SECTION_ACCESS: Record<DashboardSection, RoleAlias[]> = {
  keys: ["school_admin"],
  members: ["school_admin", "teacher"],
  stats: ["admin"],
  admin_users: ["admin"],
  admin_settings: ["admin"],
};

export function canAccessSection(
  user: UserData | null,
  section: DashboardSection
): boolean {
  const userRole = getUserRole(user);
  if (!userRole) return false;
  return SECTION_ACCESS[section].includes(userRole);
}

export function getAccessibleSections(user: UserData | null): DashboardSection[] {
  const userRole = getUserRole(user);
  if (!userRole) return [];

  return (Object.keys(SECTION_ACCESS) as DashboardSection[]).filter((section) =>
    SECTION_ACCESS[section].includes(userRole)
  );
}
