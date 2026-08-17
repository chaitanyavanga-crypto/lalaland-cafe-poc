const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const UserRepository = require('../repositories/user.repository');
const ApiError = require('../utils/ApiError');
const logger = require('../utils/logger');

const SALT_ROUNDS = 10;
const RESET_TOKEN_TTL_MS = 60 * 60 * 1000; // 1 hour

function signAccessToken(user) {
  return jwt.sign(
    { userId: user.user_id, role: user.role, email: user.email },
    process.env.JWT_ACCESS_SECRET,
    { expiresIn: process.env.JWT_ACCESS_EXPIRES_IN || '15m' }
  );
}

function hashToken(token) {
  return crypto.createHash('sha256').update(token).digest('hex');
}

/**
 * ASSUMPTION: no email provider (SES/SendGrid/etc.) is configured for this POC,
 * and none was specified in the requirements. Sending the actual email is out of
 * scope here — this logs the reset link the way a real EmailService would send it,
 * so the flow is fully testable end-to-end without external credentials. Swapping
 * this for a real provider only touches this one function.
 */
function sendPasswordResetEmail(email, resetToken) {
  const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password/${resetToken}`;
  logger.info(`[EmailService STUB] Password reset link for ${email}: ${resetUrl}`);
  return Promise.resolve();
}

const AuthService = {
  async register({ fullName, email, phone, password }) {
    const existing = await UserRepository.findByEmail(email);
    if (existing) throw ApiError.conflict('An account with this email already exists');

    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
    const user = await UserRepository.create({ fullName, email, phone, passwordHash });
    return user;
  },

  async login({ email, password }) {
    const user = await UserRepository.findByEmail(email);
    if (!user || !user.is_active) throw ApiError.unauthorized('Invalid email or password');

    const matches = await bcrypt.compare(password, user.password_hash);
    if (!matches) throw ApiError.unauthorized('Invalid email or password');

    const accessToken = signAccessToken(user);
    const refreshToken = crypto.randomBytes(40).toString('hex');
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    await UserRepository.saveRefreshToken(user.user_id, hashToken(refreshToken), expiresAt);

    return {
      accessToken,
      refreshToken,
      user: { id: user.user_id, fullName: user.full_name, email: user.email, role: user.role },
    };
  },

  async refresh({ userId, refreshToken }) {
    const record = await UserRepository.findRefreshToken(userId, hashToken(refreshToken));
    if (!record) throw ApiError.unauthorized('Refresh token invalid or expired');

    const user = await UserRepository.findById(userId);
    if (!user) throw ApiError.unauthorized();

    return { accessToken: signAccessToken(user) };
  },

  async logout({ userId, refreshToken }) {
    await UserRepository.revokeRefreshToken(userId, hashToken(refreshToken));
  },

  /**
   * Always resolves successfully regardless of whether the email exists —
   * this prevents the endpoint being used to enumerate registered accounts.
   */
  async forgotPassword(email) {
    const user = await UserRepository.findByEmail(email);
    if (!user) return;

    const resetToken = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + RESET_TOKEN_TTL_MS);
    await UserRepository.savePasswordResetToken(user.user_id, hashToken(resetToken), expiresAt);
    await sendPasswordResetEmail(user.email, resetToken);
  },

  async resetPassword({ token, password }) {
    const record = await UserRepository.findValidPasswordResetToken(hashToken(token));
    if (!record) throw ApiError.badRequest('This reset link is invalid or has expired');

    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
    await UserRepository.updatePassword(record.user_id, passwordHash);
    await UserRepository.markPasswordResetTokenUsed(record.reset_token_id);
  },
};

module.exports = AuthService;
