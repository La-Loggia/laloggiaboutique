export const normalizeUsername = (value: string) => value.trim().normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/\s+/g, '.');

export const loginAddress = (value: string) => value.includes('@') ? value.trim() : `${normalizeUsername(value)}@staff.laloggia.local`;

export const staffPermissions = (roles: string[]) => {
  const isAdmin = roles.includes('admin');
  const isSubmissionsReader = roles.includes('submissions_reader') && !isAdmin;
  return { isAdmin, isSubmissionsReader, canViewSubmissions: isAdmin || isSubmissionsReader, canEditSubmissions: isAdmin };
};