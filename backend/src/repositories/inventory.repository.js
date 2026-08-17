const db = require('../config/db');

const InventoryRepository = {
  async findAll() {
    const { rows } = await db.query('SELECT * FROM ingredients ORDER BY name');
    return rows;
  },

  async findLowStock() {
    const { rows } = await db.query('SELECT * FROM ingredients WHERE stock_qty <= reorder_level ORDER BY stock_qty');
    return rows;
  },

  async findRecipeForItem(itemId) {
    const { rows } = await db.query(
      `SELECT ri.ingredient_id, ri.quantity, i.name, i.unit, i.stock_qty
       FROM recipe_items ri JOIN ingredients i ON i.ingredient_id = ri.ingredient_id
       WHERE ri.item_id = $1`,
      [itemId]
    );
    return rows;
  },

  async decrementStock(client, ingredientId, qty) {
    await client.query(
      'UPDATE ingredients SET stock_qty = stock_qty - $2, updated_at = NOW() WHERE ingredient_id = $1',
      [ingredientId, qty]
    );
  },

  async recordMovement(client, { ingredientId, changeQty, reason, referenceOrder = null, createdBy = null }) {
    await client.query(
      `INSERT INTO stock_movements (ingredient_id, change_qty, reason, reference_order, created_by)
       VALUES ($1, $2, $3, $4, $5)`,
      [ingredientId, changeQty, reason, referenceOrder, createdBy]
    );
  },

  async restock(ingredientId, qty, userId) {
    const client = await db.getClient();
    try {
      await client.query('BEGIN');
      await client.query('UPDATE ingredients SET stock_qty = stock_qty + $2, updated_at = NOW() WHERE ingredient_id = $1', [ingredientId, qty]);
      await this.recordMovement(client, { ingredientId, changeQty: qty, reason: 'RESTOCK', createdBy: userId });
      await client.query('COMMIT');
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  },
};

module.exports = InventoryRepository;
