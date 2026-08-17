const db = require('../config/db');

/**
 * Repository layer: ONLY talks to the database. No business logic here.
 */
const UserRepository = {
  async findByEmail(email) {
    const { rows } = await db.query('SELECT * FROM users WHERE email = $1', [email]);
    return rows[0] || null;
  },

  async findById(userId) {
    const { rows } = await db.query(
      'SELECT user_id, full_name, email, phone, role, is_active, created_at FROM users WHERE user_id = $1',
      [userId]
    );
    return rows[0] || null;
  },

  async create({ fullName, email, phone, passwordHash, role = 'CUSTOMER' }) {
    const { rows } = await db.query(
      `INSERT INTO users (full_name, email, phone, password_hash, role)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING user_id, full_name, email, phone, role, created_at`,
      [fullName, email, phone, passwordHash, role]
    );
    return rows[0];
  },

  async saveRefreshToken(userId, tokenHash, expiresAt) {
    await db.query(
      'INSERT INTO refresh_tokens (user_id, token_hash, expires_at) VALUES ($1, $2, $3)',
      [userId, tokenHash, expiresAt]
    );
  },

  async findRefreshToken(userId, tokenHash) {
    const { rows } = await db.query(
      'SELECT * FROM refresh_tokens WHERE user_id = $1 AND token_hash = $2 AND expires_at > NOW()',
      [userId, tokenHash]
    );
    return rows[0] || null;
  },

  async revokeRefreshToken(userId, tokenHash) {
    await db.query('DELETE FROM refresh_tokens WHERE user_id = $1 AND token_hash = $2', [userId, tokenHash]);
  },

  async savePasswordResetToken(userId, tokenHash, expiresAt) {
    await db.query(
      'INSERT INTO password_reset_tokens (user_id, token_hash, expires_at) VALUES ($1, $2, $3)',
      [userId, tokenHash, expiresAt]
    );
  },

  async findValidPasswordResetToken(tokenHash) {
    const { rows } = await db.query(
      `SELECT * FROM password_reset_tokens
       WHERE token_hash = $1 AND expires_at > NOW() AND used_at IS NULL`,
      [tokenHash]
    );
    return rows[0] || null;
  },

  async markPasswordResetTokenUsed(resetTokenId) {
    await db.query('UPDATE password_reset_tokens SET used_at = NOW() WHERE reset_token_id = $1', [resetTokenId]);
  },

  async updatePassword(userId, passwordHash) {
    await db.query('UPDATE users SET password_hash = $2, updated_at = NOW() WHERE user_id = $1', [
      userId,
      passwordHash,
    ]);
  },
};

module.exports = UserRepository;
