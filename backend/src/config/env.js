require('dotenv').config();

// Note: there is no JWT_REFRESH_SECRET here on purpose. Refresh tokens are opaque,
// randomly-generated strings hashed and stored in the refresh_tokens table (see
// AuthService.login/refresh) rather than JWTs — that's what makes them revocable
// (logout actually invalidates them; a stateless JWT refresh token can't be).
const required = ['DB_HOST', 'DB_NAME', 'DB_USER', 'JWT_ACCESS_SECRET'];

function validateEnv() {
  const missing = required.filter((key) => !process.env[key]);
  if (missing.length && process.env.NODE_ENV !== 'test') {
    // eslint-disable-next-line no-console
    console.warn(`[env] Missing recommended environment variables: ${missing.join(', ')}`);
  }
}

module.exports = { validateEnv };
