/**
 * Minimal migration runner: applies database/schema.sql then database/seed.sql
 * against the configured database. This is intentionally simple (no migration
 * history table / rollback support) — for a production system this would be
 * replaced by a proper migration tool (node-pg-migrate, Knex, Prisma Migrate).
 */
const fs = require('fs');
const path = require('path');
require('dotenv').config();
const db = require('../config/db');
const logger = require('../utils/logger');

async function runFile(filePath) {
  const sql = fs.readFileSync(filePath, 'utf8');
  await db.query(sql);
  logger.info(`Applied ${path.basename(filePath)}`);
}

async function main() {
  const dbDir = path.join(__dirname, '..', '..', '..', 'database');
  try {
    await runFile(path.join(dbDir, 'schema.sql'));
    const withSeed = process.argv.includes('--seed');
    if (withSeed) await runFile(path.join(dbDir, 'seed.sql'));
    logger.info('Migration complete.');
    process.exit(0);
  } catch (err) {
    logger.error('Migration failed:', err);
    process.exit(1);
  }
}

main();
