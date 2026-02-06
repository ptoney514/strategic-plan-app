export type OrgRole = "viewer" | "editor" | "admin" | "owner";

const ROLE_HIERARCHY: Record<OrgRole, number> = {
  viewer: 0,
  editor: 1,
  admin: 2,
  owner: 3,
};

export function hasMinimumRole(
  userRole: string,
  requiredRole: OrgRole,
): boolean {
  const userLevel = ROLE_HIERARCHY[userRole as OrgRole];
  const requiredLevel = ROLE_HIERARCHY[requiredRole];
  if (userLevel === undefined || requiredLevel === undefined) return false;
  return userLevel >= requiredLevel;
}
