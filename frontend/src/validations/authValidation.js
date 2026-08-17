// Lightweight client-side validation — mirrors the backend Joi rules in
// backend/src/validation/schemas.js so the user gets instant feedback,
// while the server copy remains the actual source of truth/enforcement.
export function validateEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email || '');
}

export function validatePassword(password) {
  return typeof password === 'string' && password.length >= 8;
}

export function validateRegisterForm({ fullName, email, password }) {
  const errors = {};
  if (!fullName || fullName.trim().length < 2) errors.fullName = 'Name must be at least 2 characters';
  if (!validateEmail(email)) errors.email = 'Enter a valid email address';
  if (!validatePassword(password)) errors.password = 'Password must be at least 8 characters';
  return errors;
}

export function validateResetPasswordForm({ password, confirmPassword }) {
  const errors = {};
  if (!validatePassword(password)) errors.password = 'Password must be at least 8 characters';
  if (password !== confirmPassword) errors.confirmPassword = 'Passwords do not match';
  return errors;
}
