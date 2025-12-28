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

export function hasRole(user: UserData | null, roles: RoleAlias[]): boolean {
  const userRole = getUserRole(user);
  return userRole !== null && roles.includes(userRole);
}

export function getRoleLabel(user: UserData | null): string {
  const roleData = user?.role;
  if (!roleData) return "Пользователь";

  if (typeof roleData === "object" && roleData !== null) {
    return roleData.label || roleData.name || "Пользователь";
  }

  return String(roleData) || "Пользователь";
}
