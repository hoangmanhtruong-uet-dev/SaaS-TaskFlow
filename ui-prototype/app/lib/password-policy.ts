export function passwordPolicyError(password: string) {
  if (password.length < 12) return "Password must contain at least 12 characters";
  if (!/[a-z]/.test(password) || !/[A-Z]/.test(password) || !/\d/.test(password) || !/[^A-Za-z0-9]/.test(password))
    return "Password must include lowercase, uppercase, number, and symbol";
  return null;
}
