const db = require('../config/db');

const MenuRepository = {
  async findCategories() {
    const { rows } = await db.query(
      'SELECT * FROM categories WHERE is_active = TRUE ORDER BY display_order'
    );
    return rows;
  },

  async findItems({ categoryId, search, page = 1, limit = 20 } = {}) {
    const conditions = ['is_available = TRUE'];
    const params = [];

    if (categoryId) {
      params.push(categoryId);
      conditions.push(`category_id = $${params.length}`);
    }
    if (search) {
      params.push(`%${search}%`);
      conditions.push(`name ILIKE $${params.length}`);
    }

    const offset = (page - 1) * limit;
    params.push(limit, offset);

    const { rows } = await db.query(
      `SELECT * FROM menu_items WHERE ${conditions.join(' AND ')}
       ORDER BY item_id
       LIMIT $${params.length - 1} OFFSET $${params.length}`,
      params
    );

    const { rows: countRows } = await db.query(
      `SELECT COUNT(*)::int AS total FROM menu_items WHERE ${conditions.join(' AND ')}`,
      params.slice(0, params.length - 2)
    );

    return { items: rows, total: countRows[0].total };
  },

  async findItemById(itemId) {
    const { rows } = await db.query('SELECT * FROM menu_items WHERE item_id = $1', [itemId]);
    return rows[0] || null;
  },

  async findOptionGroupsForItem(itemId) {
    const { rows } = await db.query(
      `SELECT og.option_group_id, og.name, og.is_required, og.max_selectable,
              ov.option_value_id, ov.label, ov.price_delta
       FROM menu_item_option_groups miog
       JOIN option_groups og ON og.option_group_id = miog.option_group_id
       JOIN option_values ov ON ov.option_group_id = og.option_group_id
       WHERE miog.item_id = $1
       ORDER BY og.option_group_id, ov.display_order`,
      [itemId]
    );
    return rows;
  },

  async createItem(data) {
    const { categoryId, name, description, basePrice, imageUrl, isCustomizable } = data;
    const { rows } = await db.query(
      `INSERT INTO menu_items (category_id, name, description, base_price, image_url, is_customizable)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [categoryId, name, description, basePrice, imageUrl, isCustomizable]
    );
    return rows[0];
  },

  async updateItem(itemId, fields) {
    const keys = Object.keys(fields);
    if (keys.length === 0) return this.findItemById(itemId);
    const setClause = keys.map((k, i) => `${k} = $${i + 2}`).join(', ');
    const { rows } = await db.query(
      `UPDATE menu_items SET ${setClause}, updated_at = NOW() WHERE item_id = $1 RETURNING *`,
      [itemId, ...keys.map((k) => fields[k])]
    );
    return rows[0] || null;
  },
};

module.exports = MenuRepository;
