const db = require('../config/db');
const OrderRepository = require('../repositories/order.repository');
const MenuRepository = require('../repositories/menu.repository');
const InventoryRepository = require('../repositories/inventory.repository');
const ApiError = require('../utils/ApiError');
const { generateOrderNumber } = require('../utils/orderNumber');

const TAX_RATE = 0.05; // 5% - configurable per business requirement

// Legal status transitions. Prevents e.g. jumping straight from
// PENDING to COMPLETED, or "un-cancelling" an order.
const ALLOWED_TRANSITIONS = {
  PENDING: ['CONFIRMED', 'CANCELLED'],
  CONFIRMED: ['PREPARING', 'CANCELLED'],
  PREPARING: ['READY', 'CANCELLED'],
  READY: ['COMPLETED'],
  COMPLETED: [],
  CANCELLED: [],
};

const OrderService = {
  /**
   * Places a new order:
   *  1. Validates each item + its selected options and computes authoritative pricing
   *     (never trusts client-sent prices).
   *  2. Confirms enough ingredient stock exists for every item in the cart.
   *  3. Persists order + order_items + order_item_options in a single transaction.
   *  4. Decrements ingredient stock and logs the stock movement, same transaction.
   */
  async placeOrder({ userId, tableId, channel, items }) {
    if (!items || items.length === 0) throw ApiError.badRequest('Order must contain at least one item');

    let subtotal = 0;
    const pricedItems = [];
    const stockRequirements = new Map(); // ingredientId -> total qty needed

    for (const cartItem of items) {
      const menuItem = await MenuRepository.findItemById(cartItem.itemId);
      if (!menuItem || !menuItem.is_available) {
        throw ApiError.badRequest(`Item ${cartItem.itemId} is not available`);
      }

      const optionRows = await MenuRepository.findOptionGroupsForItem(cartItem.itemId);
      let unitPrice = Number(menuItem.base_price);

      for (const optionValueId of cartItem.optionValueIds || []) {
        const match = optionRows.find((o) => o.option_value_id === optionValueId);
        if (!match) throw ApiError.badRequest(`Invalid option selected for item ${cartItem.itemId}`);
        unitPrice += Number(match.price_delta);
      }

      const lineTotal = Number((unitPrice * cartItem.quantity).toFixed(2));
      subtotal += lineTotal;
      pricedItems.push({ ...cartItem, unitPrice, lineTotal });

      const recipe = await InventoryRepository.findRecipeForItem(cartItem.itemId);
      for (const ing of recipe) {
        const needed = Number(ing.quantity) * cartItem.quantity;
        stockRequirements.set(ing.ingredient_id, (stockRequirements.get(ing.ingredient_id) || 0) + needed);
        if (Number(ing.stock_qty) < needed) {
          throw ApiError.conflict(`Insufficient stock for ingredient: ${ing.name}`);
        }
      }
    }

    const taxAmount = Number((subtotal * TAX_RATE).toFixed(2));
    const totalAmount = Number((subtotal + taxAmount).toFixed(2));
    const sequence = await OrderRepository.nextSequenceForToday();
    const orderNumber = generateOrderNumber(sequence);

    const client = await db.getClient();
    try {
      await client.query('BEGIN');

      const order = await OrderRepository.createOrderWithItems(
        client,
        { orderNumber, userId, tableId, channel, subtotal, taxAmount, totalAmount, queueNumber: sequence },
        pricedItems
      );

      for (const [ingredientId, qty] of stockRequirements.entries()) {
        await InventoryRepository.decrementStock(client, ingredientId, qty);
        await InventoryRepository.recordMovement(client, {
          ingredientId,
          changeQty: -qty,
          reason: 'ORDER_CONSUMPTION',
          referenceOrder: order.order_id,
          createdBy: userId,
        });
      }

      await client.query('COMMIT');
      return order;
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  },

  async getOrderDetail(orderId) {
    const order = await OrderRepository.findById(orderId);
    if (!order) throw ApiError.notFound('Order not found');
    const items = await OrderRepository.findItemsByOrderId(orderId);
    return { ...order, items };
  },

  async getQueue() {
    return OrderRepository.findQueue({ statuses: ['CONFIRMED', 'PREPARING'] });
  },

  async transitionStatus(orderId, nextStatus) {
    const order = await OrderRepository.findById(orderId);
    if (!order) throw ApiError.notFound('Order not found');

    const allowed = ALLOWED_TRANSITIONS[order.status] || [];
    if (!allowed.includes(nextStatus)) {
      throw ApiError.badRequest(`Cannot move order from ${order.status} to ${nextStatus}`);
    }

    const timestampField = nextStatus === 'READY' ? 'ready_at' : nextStatus === 'COMPLETED' ? 'completed_at' : null;
    return OrderRepository.updateStatus(orderId, nextStatus, timestampField);
  },

  async salesReport(from, to) {
    return OrderRepository.salesReport({ from, to });
  },
};

module.exports = OrderService;
