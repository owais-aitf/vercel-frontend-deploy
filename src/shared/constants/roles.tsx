export enum UserRole {
  ENGINEER = 'ENGINEER',
  SALES = 'SALES',
  ADMIN = 'ADMIN',
}

export const ROLE_PERMISSIONS = {
  [UserRole.ENGINEER]: ['attendance:read', 'attendance:write'],
  [UserRole.SALES]: ['attendance:read', 'projects:write', 'reports:generate'],
  [UserRole.ADMIN]: ['*'],
} as const;
