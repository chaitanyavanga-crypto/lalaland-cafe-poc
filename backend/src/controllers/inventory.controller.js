const InventoryService = require('../services/inventory.service');
const asyncHandler = require('../utils/asyncHandler');

exports.list = asyncHandler(async (req, res) => {
  const items = await InventoryService.listAll();
  res.json({ success: true, data: items });
});

exports.lowStock = asyncHandler(async (req, res) => {
  const items = await InventoryService.lowStockAlerts();
  res.json({ success: true, data: items });
});

exports.restock = asyncHandler(async (req, res) => {
  const result = await InventoryService.restock(
    Number(req.params.ingredientId),
    Number(req.body.quantity),
    req.user.userId
  );
  res.json({ success: true, data: result });
});
