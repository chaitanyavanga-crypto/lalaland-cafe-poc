const InventoryRepository = require('../repositories/inventory.repository');
const ApiError = require('../utils/ApiError');

const InventoryService = {
  async listAll() {
    return InventoryRepository.findAll();
  },

  async lowStockAlerts() {
    return InventoryRepository.findLowStock();
  },

  async restock(ingredientId, qty, userId) {
    if (qty <= 0) throw ApiError.badRequest('Restock quantity must be positive');
    await InventoryRepository.restock(ingredientId, qty, userId);
    return { ingredientId, restocked: qty };
  },
};

module.exports = InventoryService;
