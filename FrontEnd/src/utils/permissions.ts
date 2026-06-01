export type SystemRole =
  | "EMPLOYEE"
  | "MANAGER"
  | "HR"
  | "HR_MANAGER"
  | "ADMIN"
  | "";

/**
 * Evaluates Role-Based Access Control (RBAC) hierarchy to determine if the
 * current user has permission to edit the target user's profile.
 * * @param currentUserRole - The role of the logged-in user making the request.
 * @param targetUserRole - The role of the employee profile being viewed.
 * @returns boolean - True if editing is permitted, false if view-only.
 */
export const checkEditPermission = (
  currentUserRole?: string,
  targetUserRole?: string,
): boolean => {
  // Failsafe: If data isn't loaded yet, default to strict view-only
  if (!currentUserRole || !targetUserRole) return false;

  // 1. Admins have omnipotent edit access across the entire hierarchy
  if (currentUserRole === "ADMIN") return true;

  // 2. HR Managers can edit subordinates, but CANNOT edit peers (other HR_MANAGERS) or Admins
  if (currentUserRole === "HR_MANAGER") {
    return ["HR", "MANAGER", "EMPLOYEE"].includes(targetUserRole);
  }

  // 3. Standard HR can edit subordinates, but CANNOT edit peers (other HRs), superiors, or Admins
  if (currentUserRole === "HR") {
    return ["MANAGER", "EMPLOYEE"].includes(targetUserRole);
  }

  // 4. Managers and Employees have zero cross-profile edit rights
  return false;
};

/**
 * Determines if a user can globally add a NEW employee to the system.
 */
export const canCreateNewEmployee = (currentUserRole?: string): boolean => {
  if (!currentUserRole) return false;
  return ["ADMIN", "HR_MANAGER", "HR"].includes(currentUserRole);
};
