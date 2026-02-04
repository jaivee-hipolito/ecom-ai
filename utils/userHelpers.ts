/**
 * Helper function to get full name from user object
 */
export function getUserFullName(user: { firstName?: string; lastName?: string; name?: string } | null | undefined): string {
  if (!user) return '';
  
  // If firstName and lastName exist, use them
  if (user.firstName && user.lastName) {
    return `${user.firstName} ${user.lastName}`;
  }
  
  // Fallback to name if it exists (for backward compatibility)
  if (user.name) {
    return user.name;
  }
  
  // Fallback to firstName or lastName if only one exists
  if (user.firstName) return user.firstName;
  if (user.lastName) return user.lastName;
  
  return '';
}

/**
 * Helper function to get user initials
 */
export function getUserInitials(user: { firstName?: string; lastName?: string; name?: string; email?: string } | null | undefined): string {
  if (!user) return '';
  
  // Try to get initials from firstName and lastName
  if (user.firstName && user.lastName) {
    return `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`.toUpperCase();
  }
  
  // Fallback to name
  if (user.name) {
    const parts = user.name.trim().split(' ');
    if (parts.length >= 2) {
      return `${parts[0].charAt(0)}${parts[parts.length - 1].charAt(0)}`.toUpperCase();
    }
    return user.name.charAt(0).toUpperCase();
  }
  
  // Fallback to firstName or lastName
  if (user.firstName) return user.firstName.charAt(0).toUpperCase();
  if (user.lastName) return user.lastName.charAt(0).toUpperCase();
  
  // Last resort: use email
  if (user.email) return user.email.charAt(0).toUpperCase();
  
  return '';
}
