export function initials(firstName: string, lastName: string | null) {
  return `${firstName.charAt(0)}${lastName?.charAt(0) ?? ''}`.toUpperCase();
}

export function fullName(firstName: string, lastName: string | null) {
  return `${firstName} ${lastName ?? ''}`.trim();
}
