const db = require('../config/db');

const OrderRepository = {
  /**
   * All writes for a single order happen inside one transaction so
   * order + order_items + order_item_options are always consistent.
   */
  async createOrderWithItems(client, orderData, items) {
    const { orderNumber, userId, tableId, channel, subtotal, taxAmount, totalAmount, queueNumber } = orderData;

    const { rows: orderRows } = await client.query(
      `INSERT INTO orders (order_number, user_id, table_id, channel, subtotal, tax_amount, total_amount, queue_number)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
      [orderNumber, userId, tableId, channel, subtotal, taxAmount, totalAmount, queueNumber]
    );
    const order = orderRows[0];

    for (const item of items) {
      const { rows: itemRows } = await client.query(
        `INSERT INTO order_items (order_id, item_id, quantity, unit_price, line_total)
         VALUES ($1, $2, $3, $4, $5) RETURNING order_item_id`,
        [order.order_id, item.itemId, item.quantity, item.unitPrice, item.lineTotal]
      );
      const orderItemId = itemRows[0].order_item_id;

      for (const optionValueId of item.optionValueIds || []) {
        await client.query(
          'INSERT INTO order_item_options (order_item_id, option_value_id) VALUES ($1, $2)',
          [orderItemId, optionValueId]
        );
      }
    }

    return order;
  },

  async findById(orderId) {
    const { rows } = await db.query('SELECT * FROM orders WHERE order_id = $1', [orderId]);
    return rows[0] || null;
  },

  async findItemsByOrderId(orderId) {
    const { rows } = await db.query(
      `SELECT oi.*, mi.name AS item_name
       FROM order_items oi
       JOIN menu_items mi ON mi.item_id = oi.item_id
       WHERE oi.order_id = $1`,
      [orderId]
    );
    return rows;
  },

  async findQueue({ statuses = ['CONFIRMED', 'PREPARING'] } = {}) {
    const { rows } = await db.query(
      `SELECT order_id, order_number, status, queue_number, placed_at, table_id
       FROM orders WHERE status = ANY($1::order_status[])
       ORDER BY placed_at ASC`,
      [statuses]
    );
    return rows;
  },

  async updateStatus(orderId, status, timestampField = null) {
    const setTimestamp = timestampField ? `, ${timestampField} = NOW()` : '';
    const { rows } = await db.query(
      `UPDATE orders SET status = $2 ${setTimestamp} WHERE order_id = $1 RETURNING *`,
      [orderId, status]
    );
    return rows[0] || null;
  },

  async nextSequenceForToday() {
    const { rows } = await db.query(
      `SELECT COUNT(*)::int + 1 AS seq FROM orders WHERE placed_at::date = CURRENT_DATE`
    );
    return rows[0].seq;
  },

  async salesReport({ from, to }) {
    const { rows } = await db.query(
      `SELECT DATE(placed_at) AS day, COUNT(*)::int AS order_count, SUM(total_amount) AS revenue
       FROM orders
       WHERE status = 'COMPLETED' AND placed_at BETWEEN $1 AND $2
       GROUP BY DATE(placed_at) ORDER BY day`,
      [from, to]
    );
    return rows;
  },
};

module.exports = OrderRepository;
