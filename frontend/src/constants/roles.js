// Central source of truth for role strings — mirrors the backend's user_role enum.
// Import this instead of hardcoding role strings anywhere in the app.
export const ROLES = Object.freeze({
  CUSTOMER: 'CUSTOMER',
  BARISTA: 'BARISTA',
  MANAGER: 'MANAGER',
  ADMIN: 'ADMIN',
});

export const STAFF_ROLES = [ROLES.BARISTA, ROLES.MANAGER, ROLES.ADMIN];
export const MANAGEMENT_ROLES = [ROLES.MANAGER, ROLES.ADMIN];
